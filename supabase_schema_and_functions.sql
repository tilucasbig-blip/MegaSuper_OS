-- ====================================================================
-- MEGA OS REDE MEGA — SCRIPT SQL COMPLETO PARA SUPABASE / POSTGRESQL
-- Executar no SQL Editor do Supabase Dashboard
-- ====================================================================

-- 1. SEQUÊNCIA DE NUMERAÇÃO GLOBAL DE OS
CREATE SEQUENCE IF NOT EXISTS public.os_id_seq START WITH 1001;

-- 2. FUNÇÃO RPC PARA GERAÇÃO ATÔMICA E SEQUENCIAL DO NÚMERO DA OS (ex: 'OS-1001')
CREATE OR REPLACE FUNCTION public.get_next_os_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    next_val bigint;
BEGIN
    SELECT nextval('public.os_id_seq') INTO next_val;
    RETURN 'OS-' || next_val;
END;
$$;

-- Permissões de execução para roles do Supabase
GRANT EXECUTE ON FUNCTION public.get_next_os_id() TO anon, authenticated, service_role;

-- 3. ESTRUTURA DAS TABELAS
CREATE TABLE IF NOT EXISTS public.users (
    id text PRIMARY KEY,
    nome text NOT NULL,
    email text UNIQUE NOT NULL,
    usuario text UNIQUE NOT NULL,
    role text NOT NULL DEFAULT 'usuario',
    cargo text,
    loja text,
    ativo boolean DEFAULT true,
    data_criacao timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lojas (
    id text PRIMARY KEY,
    nome text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.estoque (
    id text PRIMARY KEY,
    nome_material text NOT NULL,
    quantidade_atual integer NOT NULL DEFAULT 0,
    estoque_minimo integer NOT NULL DEFAULT 0,
    valor_unitario numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.equipamentos (
    id text PRIMARY KEY,
    nome_equipamento text NOT NULL,
    codigo_patrimonio text,
    loja_id text,
    loja text,
    dono text,
    usuario text,
    marca text,
    modelo text,
    numero_serie text,
    numero_lote text,
    valor_estimado numeric(10,2),
    status text DEFAULT 'ativo'
);

CREATE TABLE IF NOT EXISTS public.os (
    id text PRIMARY KEY,
    titulo text NOT NULL,
    descricao text,
    equipamento text,
    categoria text,
    equipamento_id text,
    status text NOT NULL DEFAULT 'Aberta',
    prioridade text NOT NULL DEFAULT 'Média',
    criado_por text NOT NULL,
    tecnico_responsavel text,
    loja_unidade text NOT NULL,
    data_criacao timestamp with time zone DEFAULT now(),
    data_finalizacao timestamp with time zone,
    material_aprovado boolean,
    motivo_rejeicao text,
    relatorio_url text,
    custo_total_materiais numeric(10,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.os_mensagens (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id text NOT NULL REFERENCES public.os(id) ON DELETE CASCADE,
    mensagem_texto text,
    midia_url text,
    tipo_midia text DEFAULT 'nenhum',
    enviado_por text NOT NULL,
    data_envio timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.os_materiais (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id text NOT NULL REFERENCES public.os(id) ON DELETE CASCADE,
    nome_material text NOT NULL,
    quantidade integer NOT NULL DEFAULT 1,
    valor_unitario numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.notificacoes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false,
    data timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    acao text NOT NULL,
    feito_por text NOT NULL,
    os_id text,
    data timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id text,
    acao text NOT NULL,
    descricao text,
    ip text,
    dispositivo text,
    data timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_material text NOT NULL,
    quantidade integer NOT NULL,
    tipo text NOT NULL,
    data timestamp with time zone DEFAULT now(),
    os_id text
);

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL,
    solicitante text NOT NULL,
    setor text NOT NULL,
    observacao text,
    status text DEFAULT 'pendente',
    solicitado_em timestamp with time zone DEFAULT now()
);

-- 4. FUNÇÃO RPC TRANSACIONAL DE CRIAÇÃO COMPLETA DE OS (ATÔMICA)
CREATE OR REPLACE FUNCTION public.criar_nova_os_completa(
    p_titulo text,
    p_descricao text,
    p_equipamento text,
    p_equipamento_id text,
    p_prioridade text,
    p_criado_por text,
    p_loja_unidade text,
    p_mensagem_inicial text DEFAULT NULL,
    p_midia_url text DEFAULT NULL,
    p_tipo_midia text DEFAULT 'nenhum'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_os_id text;
    v_count int;
    v_result jsonb;
BEGIN
    -- Validação de Rate Limit (máximo 3 chamados ativos criados nas últimas 12 horas por usuário comum)
    SELECT COUNT(*) INTO v_count
    FROM public.os
    WHERE criado_por = p_criado_por
      AND data_criacao > (NOW() - INTERVAL '12 hours')
      AND status != 'Cancelada';

    IF v_count >= 3 THEN
        RAISE EXCEPTION 'Bloqueio de Segurança: Limite de abertura de chamados excedido (máximo 3 chamados ativos a cada 12 horas).';
    END IF;

    -- Gera o ID sequencial de forma atômica
    v_os_id := public.get_next_os_id();

    -- Insere o cabeçalho da OS
    INSERT INTO public.os (
        id, titulo, descricao, equipamento, categoria, equipamento_id,
        status, prioridade, criado_por, loja_unidade, data_criacao,
        tecnico_responsavel, custo_total_materiais
    ) VALUES (
        v_os_id, p_titulo, p_descricao, p_equipamento, p_equipamento, p_equipamento_id,
        'Aberta', p_prioridade, p_criado_por, p_loja_unidade, NOW(),
        NULL, 0
    );

    -- Insere a mensagem/anexo inicial se fornecida
    IF (p_mensagem_inicial IS NOT NULL AND p_mensagem_inicial <> '') OR (p_midia_url IS NOT NULL AND p_midia_url <> '') THEN
        INSERT INTO public.os_mensagens (
            os_id, mensagem_texto, midia_url, tipo_midia, enviado_por, data_envio
        ) VALUES (
            v_os_id, COALESCE(p_mensagem_inicial, 'Anexou mídia na abertura do ticket.'),
            p_midia_url, COALESCE(p_tipo_midia, 'nenhum'), p_criado_por, NOW()
        );
    END IF;

    v_result := jsonb_build_object(
        'success', true,
        'id', v_os_id,
        'message', 'Ordem de Serviço criada com sucesso'
    );
    RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.criar_nova_os_completa TO anon, authenticated, service_role;

-- 5. POLÍTICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE public.os ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.os_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Concede permissões para tabelas públicas
DROP POLICY IF EXISTS "Acesso total publico OS" ON public.os;
CREATE POLICY "Acesso total publico OS" ON public.os FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico Mensagens" ON public.os_mensagens;
CREATE POLICY "Acesso total publico Mensagens" ON public.os_mensagens FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico Materiais" ON public.os_materiais;
CREATE POLICY "Acesso total publico Materiais" ON public.os_materiais FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico Users" ON public.users;
CREATE POLICY "Acesso total publico Users" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico Estoque" ON public.estoque;
CREATE POLICY "Acesso total publico Estoque" ON public.estoque FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total publico Notificacoes" ON public.notificacoes;
CREATE POLICY "Acesso total publico Notificacoes" ON public.notificacoes FOR ALL USING (true) WITH CHECK (true);

-- Permissões de tabela para roles anon e authenticated
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
