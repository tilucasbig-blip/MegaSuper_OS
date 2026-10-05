-- ====================================================================
-- BANCO DE DADOS COMPLETO DO SISTEMA DE ORDEM DE SERVIÇO (TI CORPORATIVO)
-- PROJETO: OS-REDE MEGA
-- ARQUITETURA: PostgreSQL / Supabase
-- VERSÃO: 2.0 (Reconstruído do Zero para Suporte Integral ao App)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. LIMPEZA SEGURA DE ESTRUTURAS ANTERIORES
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS password_reset_requests CASCADE;
DROP TABLE IF EXISTS logs CASCADE;
DROP TABLE IF EXISTS notificacoes CASCADE;
DROP TABLE IF EXISTS movimentacoes_estoque CASCADE;
DROP TABLE IF EXISTS os_mensagens CASCADE;
DROP TABLE IF EXISTS os_materiais CASCADE;
DROP TABLE IF EXISTS os CASCADE;
DROP TABLE IF EXISTS equipamentos CASCADE;
DROP TABLE IF EXISTS estoque CASCADE;
DROP TABLE IF EXISTS lojas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS fn_atualizar_custo_total_os() CASCADE;
DROP FUNCTION IF EXISTS get_next_os_id() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(TEXT) CASCADE;
DROP SEQUENCE IF EXISTS os_number_seq CASCADE;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- --------------------------------------------------------------------
-- 2. TABELA: `users` (Perfis e Autenticação Corporativa)
-- --------------------------------------------------------------------
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- UID vinculado ao Supabase Auth ou identificador de sistema
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    usuario TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL DEFAULT 'empresa123',
    role TEXT NOT NULL CHECK (role IN ('usuario', 'ti', 'diretor')),
    cargo TEXT NOT NULL DEFAULT 'Funcionário',
    loja TEXT DEFAULT 'Corporativo / TI',
    tipos_equipamentos TEXT[] DEFAULT '{}'::TEXT[],
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    ultimo_login TIMESTAMP WITH TIME ZONE,
    tentativas_falhas INTEGER NOT NULL DEFAULT 0,
    bloqueado_ate TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 3. TABELA: `lojas` (Unidades e Filiais da Rede)
-- --------------------------------------------------------------------
CREATE TABLE lojas (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL UNIQUE,
    cidade TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 4. TABELA: `estoque` (Almoxarifado e Peças de TI)
-- --------------------------------------------------------------------
CREATE TABLE estoque (
    id TEXT PRIMARY KEY,
    nome_material TEXT NOT NULL UNIQUE,
    quantidade_atual INTEGER NOT NULL DEFAULT 0 CHECK (quantidade_atual >= 0),
    estoque_minimo INTEGER NOT NULL DEFAULT 0 CHECK (estoque_minimo >= 0),
    valor_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (valor_unitario >= 0),
    categoria TEXT DEFAULT 'Geral',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 5. TABELA: `equipamentos` (Parque de Máquinas e Patrimônio com QR Code)
-- --------------------------------------------------------------------
CREATE TABLE equipamentos (
    id TEXT PRIMARY KEY,
    nome_equipamento TEXT NOT NULL,
    codigo_patrimonio TEXT UNIQUE NOT NULL,
    loja_id TEXT REFERENCES lojas(id) ON DELETE SET NULL,
    loja TEXT,
    dono TEXT,
    usuario TEXT,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    numero_lote TEXT,
    valor_estimado NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (valor_estimado >= 0),
    status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'descartado', 'reserva')),
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 6. TABELA: `os` (Ordens de Serviço e Chamados Técnicos)
-- --------------------------------------------------------------------
CREATE TABLE os (
    id TEXT PRIMARY KEY, -- Ex: 'OS-1001'
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    equipamento TEXT NOT NULL,
    categoria TEXT NOT NULL,
    equipamento_id TEXT REFERENCES equipamentos(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Aberta' CHECK (status IN ('Aberta', 'Em andamento', 'Finalizada', 'Cancelada', 'Rejeitada por Diretor')),
    prioridade TEXT NOT NULL DEFAULT 'Baixa' CHECK (prioridade IN ('Baixa', 'Média', 'Alta')),
    criado_por TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    usuarios_envolvidos TEXT[] NOT NULL DEFAULT '{}'::TEXT[],
    tecnico_responsavel TEXT REFERENCES users(id) ON DELETE SET NULL,
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    data_finalizacao TIMESTAMP WITH TIME ZONE,
    loja_unidade TEXT NOT NULL,
    material_aprovado BOOLEAN,
    motivo_rejeicao TEXT,
    relatorio_url TEXT,
    solucao_tecnica TEXT,
    avaliacao_usuario INTEGER CHECK (avaliacao_usuario BETWEEN 1 AND 5),
    custo_total_materiais NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (custo_total_materiais >= 0)
);

-- --------------------------------------------------------------------
-- 7. TABELA: `os_materiais` (Itens/Peças Utilizados na OS)
-- --------------------------------------------------------------------
CREATE TABLE os_materiais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id TEXT NOT NULL REFERENCES os(id) ON DELETE CASCADE,
    nome_material TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    valor_unitario NUMERIC(10, 2) NOT NULL CHECK (valor_unitario >= 0),
    valor_total NUMERIC(10, 2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED
);

-- --------------------------------------------------------------------
-- 8. TABELA: `os_mensagens` (Chat e Linha do Tempo da OS com Mídias)
-- --------------------------------------------------------------------
CREATE TABLE os_mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id TEXT NOT NULL REFERENCES os(id) ON DELETE CASCADE,
    mensagem_texto TEXT NOT NULL,
    midia_url TEXT,
    tipo_midia TEXT NOT NULL DEFAULT 'nenhum' CHECK (tipo_midia IN ('foto', 'video', 'nenhum')),
    enviado_por TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    data_envio TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 9. TABELA: `movimentacoes_estoque` (Auditoria de Entradas e Saídas)
-- --------------------------------------------------------------------
CREATE TABLE movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_material TEXT NOT NULL,
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
    origem TEXT DEFAULT 'Ajuste Manual',
    feito_por TEXT REFERENCES users(id) ON DELETE SET NULL,
    os_id TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 10. TABELA: `notificacoes` (Alertas em Tempo Real para Usuários)
-- --------------------------------------------------------------------
CREATE TABLE notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mensagem TEXT NOT NULL,
    link TEXT,
    lida BOOLEAN NOT NULL DEFAULT FALSE,
    data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 11. TABELA: `logs` (Histórico de Atividades Operacionais)
-- --------------------------------------------------------------------
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    acao TEXT NOT NULL,
    feito_por TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    os_id TEXT,
    data TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 12. TABELA: `audit_logs` (Auditoria de Segurança, IP e Dispositivo)
-- --------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    acao TEXT NOT NULL,
    descricao TEXT NOT NULL,
    ip TEXT,
    dispositivo TEXT,
    data_hora TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- --------------------------------------------------------------------
-- 13. TABELA: `password_reset_requests` (Recuperação e Reset de Senha)
-- --------------------------------------------------------------------
CREATE TABLE password_reset_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    solicitante TEXT NOT NULL,
    setor TEXT NOT NULL,
    observacao TEXT,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'usado')),
    solicitado_em TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    aprovado_por TEXT REFERENCES users(id) ON DELETE SET NULL,
    senha_temporaria TEXT,
    expira_em TIMESTAMP WITH TIME ZONE
);

-- --------------------------------------------------------------------
-- 14. SEQUÊNCIA E FUNÇÕES RPC (RPC / TRIGGER / HELPER)
-- --------------------------------------------------------------------

-- Sequência para numeração legível de OS (OS-1001, OS-1002, ...)
CREATE SEQUENCE os_number_seq START 1001;

-- Função RPC para gerar o próximo ID sequencial único da OS
CREATE OR REPLACE FUNCTION get_next_os_id()
RETURNS TEXT AS $$
DECLARE
    next_val BIGINT;
    generated_id TEXT;
BEGIN
    next_val := nextval('os_number_seq');
    generated_id := 'OS-' || next_val;
    -- Se porventura o ID já existir, busca o próximo livre
    WHILE EXISTS (SELECT 1 FROM os WHERE id = generated_id) LOOP
        next_val := nextval('os_number_seq');
        generated_id := 'OS-' || next_val;
    END LOOP;
    RETURN generated_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função auxiliar para recuperar o cargo (role) sem recursão de RLS
CREATE OR REPLACE FUNCTION get_user_role(uid_param TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE id = uid_param LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para recalcular automaticamente o custo total da OS na tabela `os`
CREATE OR REPLACE FUNCTION fn_atualizar_custo_total_os()
RETURNS TRIGGER AS $$
DECLARE
    target_os_id TEXT;
    novo_total NUMERIC(10, 2);
BEGIN
    IF (TG_OP = 'DELETE') THEN
        target_os_id := OLD.os_id;
    ELSE
        target_os_id := NEW.os_id;
    END IF;

    SELECT COALESCE(SUM(quantidade * valor_unitario), 0.00)
    INTO novo_total
    FROM os_materiais
    WHERE os_id = target_os_id;

    UPDATE os
    SET custo_total_materiais = novo_total
    WHERE id = target_os_id;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_atualizar_custo_os
AFTER INSERT OR UPDATE OR DELETE ON os_materiais
FOR EACH ROW EXECUTE FUNCTION fn_atualizar_custo_total_os();

-- --------------------------------------------------------------------
-- 15. POLÍTICAS DE SEGURANÇA RLS (ROW LEVEL SECURITY)
-- --------------------------------------------------------------------

-- Habilita RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lojas ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE os ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_mensagens ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Regras: `users`
CREATE POLICY "users_select_all" ON users FOR SELECT USING (true);
CREATE POLICY "users_insert_admin" ON users FOR INSERT WITH CHECK (
    get_user_role(auth.uid()::text) = 'diretor' OR 
    (get_user_role(auth.uid()::text) = 'ti' AND role = 'usuario') OR
    auth.role() = 'anon' OR
    auth.role() = 'service_role'
);
CREATE POLICY "users_update_all" ON users FOR UPDATE USING (
    auth.uid()::text = id OR 
    get_user_role(auth.uid()::text) IN ('diretor', 'ti') OR
    auth.role() = 'anon' OR
    auth.role() = 'service_role'
);
CREATE POLICY "users_delete_admin" ON users FOR DELETE USING (
    get_user_role(auth.uid()::text) = 'diretor' OR 
    (get_user_role(auth.uid()::text) = 'ti' AND role = 'usuario') OR
    auth.role() = 'service_role'
);

-- Regras: `lojas`
CREATE POLICY "lojas_select_all" ON lojas FOR SELECT USING (true);
CREATE POLICY "lojas_write_staff" ON lojas FOR ALL USING (
    get_user_role(auth.uid()::text) IN ('diretor', 'ti') OR 
    auth.role() = 'service_role'
);

-- Regras: `estoque`
CREATE POLICY "estoque_select_all" ON estoque FOR SELECT USING (true);
CREATE POLICY "estoque_write_staff" ON estoque FOR ALL USING (
    get_user_role(auth.uid()::text) IN ('diretor', 'ti') OR 
    auth.role() = 'service_role'
);

-- Regras: `equipamentos`
CREATE POLICY "equipamentos_select_all" ON equipamentos FOR SELECT USING (true);
CREATE POLICY "equipamentos_write_staff" ON equipamentos FOR ALL USING (
    get_user_role(auth.uid()::text) IN ('diretor', 'ti') OR 
    auth.role() = 'service_role'
);

-- Regras: `os`
CREATE POLICY "os_select_permission" ON os FOR SELECT USING (
    get_user_role(auth.uid()::text) IN ('ti', 'diretor') OR 
    criado_por = auth.uid()::text OR 
    auth.uid()::text = ANY(usuarios_envolvidos) OR
    auth.role() = 'anon' OR
    auth.role() = 'service_role'
);
CREATE POLICY "os_insert_permission" ON os FOR INSERT WITH CHECK (true);
CREATE POLICY "os_update_permission" ON os FOR UPDATE USING (
    get_user_role(auth.uid()::text) IN ('ti', 'diretor') OR 
    criado_por = auth.uid()::text OR
    auth.role() = 'anon' OR
    auth.role() = 'service_role'
);
CREATE POLICY "os_delete_admin" ON os FOR DELETE USING (
    get_user_role(auth.uid()::text) = 'diretor' OR 
    auth.role() = 'service_role'
);

-- Regras: `os_materiais`
CREATE POLICY "os_materiais_select" ON os_materiais FOR SELECT USING (true);
CREATE POLICY "os_materiais_write" ON os_materiais FOR ALL USING (true);

-- Regras: `os_mensagens`
CREATE POLICY "os_mensagens_select" ON os_mensagens FOR SELECT USING (true);
CREATE POLICY "os_mensagens_insert" ON os_mensagens FOR INSERT WITH CHECK (true);

-- Regras: `movimentacoes_estoque`
CREATE POLICY "movimentacoes_select" ON movimentacoes_estoque FOR SELECT USING (true);
CREATE POLICY "movimentacoes_insert" ON movimentacoes_estoque FOR INSERT WITH CHECK (true);

-- Regras: `notificacoes`
CREATE POLICY "notificacoes_select" ON notificacoes FOR SELECT USING (
    auth.uid()::text = user_id OR 
    auth.role() = 'anon' OR 
    auth.role() = 'service_role'
);
CREATE POLICY "notificacoes_insert" ON notificacoes FOR INSERT WITH CHECK (true);
CREATE POLICY "notificacoes_update" ON notificacoes FOR UPDATE USING (true);
CREATE POLICY "notificacoes_delete" ON notificacoes FOR DELETE USING (true);

-- Regras: `logs`
CREATE POLICY "logs_select" ON logs FOR SELECT USING (true);
CREATE POLICY "logs_insert" ON logs FOR INSERT WITH CHECK (true);

-- Regras: `audit_logs`
CREATE POLICY "audit_logs_select" ON audit_logs FOR SELECT USING (true);
CREATE POLICY "audit_logs_insert" ON audit_logs FOR INSERT WITH CHECK (true);

-- Regras: `password_reset_requests`
CREATE POLICY "pwd_reset_select" ON password_reset_requests FOR SELECT USING (true);
CREATE POLICY "pwd_reset_insert" ON password_reset_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "pwd_reset_update" ON password_reset_requests FOR UPDATE USING (true);

-- --------------------------------------------------------------------
-- 16. ÍNDICES DE PERFORMANCE E OTIMIZAÇÃO
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_os_criador_data ON os(criado_por, data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_os_status_data ON os(status, data_criacao DESC);
CREATE INDEX IF NOT EXISTS idx_os_tecnico_status ON os(tecnico_responsavel, status);
CREATE INDEX IF NOT EXISTS idx_os_equipamento_id ON os(equipamento_id);
CREATE INDEX IF NOT EXISTS idx_os_mensagens_os ON os_mensagens(os_id, data_envio ASC);
CREATE INDEX IF NOT EXISTS idx_os_materiais_os ON os_materiais(os_id);
CREATE INDEX IF NOT EXISTS idx_equipamentos_patrimonio ON equipamentos(codigo_patrimonio);
CREATE INDEX IF NOT EXISTS idx_notificacoes_user ON notificacoes(user_id, lida, data DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_data ON audit_logs(usuario_id, data_hora DESC);

-- --------------------------------------------------------------------
-- 17. SEED INICIAL DE DADOS (POPULAÇÃO COMPLETA PARA TESTES)
-- --------------------------------------------------------------------

-- 17.1. Lojas da Rede
INSERT INTO lojas (id, nome, cidade) VALUES
('loj_mega_maurilandia', 'Mega Maurilândia', 'Maurilândia - GO'),
('loj_mega_turvelandia', 'Mega Turvelândia', 'Turvelândia - GO'),
('loj_mega_porteirao', 'Mega Porteirão', 'Porteirão - GO'),
('loj_mega_santa_helena', 'Mega Santa Helena', 'Santa Helena de Goiás - GO'),
('loj_big_maurilandia', 'Big Maurilândia', 'Maurilândia - GO')
ON CONFLICT (id) DO NOTHING;

-- 17.2. Usuários Principais
INSERT INTO users (id, nome, email, usuario, senha, role, cargo, loja, tipos_equipamentos, ativo) VALUES
('usr_diretor', 'Diretor Carlos Silva', 'diretor@empresa.com', 'diretor', 'empresa123', 'diretor', 'Diretor', 'Corporativo / TI', ARRAY['Computador/PC', 'Notebook', 'Servidor', 'Impressora laser', 'DVR'], TRUE),
('usr_tecnico', 'Técnico Lucas Nunes', 'tecnico@empresa.com', 'tecnico', 'empresa123', 'ti', 'Técnico de TI', 'Corporativo / TI', ARRAY['Computador/PC', 'Notebook', 'Servidor', 'Impressora laser', 'Impressora térmica', 'Balança de checkout', 'PDV/CPU', 'Switch', 'Roteador', 'DVR', 'NVR'], TRUE)
ON CONFLICT (id) DO UPDATE SET
    nome = EXCLUDED.nome,
    email = EXCLUDED.email,
    usuario = EXCLUDED.usuario,
    senha = EXCLUDED.senha,
    role = EXCLUDED.role,
    cargo = EXCLUDED.cargo,
    loja = EXCLUDED.loja,
    tipos_equipamentos = EXCLUDED.tipos_equipamentos,
    ativo = EXCLUDED.ativo;

-- 17.3. Estoque Inicial
INSERT INTO estoque (id, nome_material, quantidade_atual, estoque_minimo, valor_unitario, categoria) VALUES
('est_ssd', 'SSD 240GB Kingston', 15, 5, 180.00, 'Armazenamento'),
('est_ram', 'Memória RAM DDR4 8GB', 8, 4, 220.00, 'Memória'),
('est_cabo', 'Cabo de Rede Cat6 (metros)', 120, 50, 2.50, 'Rede e Cabos'),
('est_mouse', 'Mouse USB Básico', 25, 8, 35.00, 'Periféricos'),
('est_teclado', 'Teclado USB ABNT2', 18, 6, 55.00, 'Periféricos'),
('est_roteador', 'Roteador Wireless Gigabit TP-Link', 4, 3, 249.90, 'Rede'),
('est_fonte', 'Fonte ATX 500W 80 Plus', 7, 3, 195.00, 'Energia'),
('est_cabopower', 'Cabo de Força Tripolar 1.5m', 40, 15, 12.00, 'Cabos')
ON CONFLICT (id) DO UPDATE SET
    quantidade_atual = EXCLUDED.quantidade_atual,
    estoque_minimo = EXCLUDED.estoque_minimo,
    valor_unitario = EXCLUDED.valor_unitario,
    categoria = EXCLUDED.categoria;

-- 17.4. Equipamentos Cadastrados com Códigos de Patrimônio
INSERT INTO equipamentos (id, nome_equipamento, codigo_patrimonio, loja_id, loja, dono, usuario, marca, modelo, numero_serie, numero_lote, valor_estimado, status) VALUES
('eq_comp_checkout_01', 'Computador Checkout 01', 'PAT-COMP-01', 'loj_mega_maurilandia', 'Mega Maurilândia', 'Frente de Caixa 01', 'tecnico', 'Dell', 'OptiPlex 3080', 'DELL-SER-992', 'Lote Caixa 2024', 3500.00, 'ativo'),
('eq_hp_p1102_01', 'Impressora HP P1102', 'PAT-HP1102-01', 'loj_mega_porteirao', 'Mega Porteirão', 'Faturamento / João Silva', 'tecnico', 'HP', 'LaserJet P1102', 'HP-77698536', 'Lote Faturamento', 1200.00, 'ativo'),
('eq_balanca_01', 'Balança Checkout 02', 'PAT-BAL-01', 'loj_mega_maurilandia', 'Mega Maurilândia', 'Frente de Caixa 02', 'tecnico', 'Toledo', 'Prix 3 Fit', 'TOL-SER-771', 'Lote Balanças 2023', 1850.00, 'ativo'),
('eq_servidor_01', 'Servidor de Banco e Aplicação', 'PAT-SRV-01', 'loj_mega_maurilandia', 'Corporativo / TI', 'TI Central', 'tecnico', 'Dell', 'PowerEdge R440', 'DELL-SRV-2022', 'Lote Datacenter', 18500.00, 'ativo')
ON CONFLICT (id) DO UPDATE SET
    nome_equipamento = EXCLUDED.nome_equipamento,
    codigo_patrimonio = EXCLUDED.codigo_patrimonio,
    loja_id = EXCLUDED.loja_id,
    loja = EXCLUDED.loja,
    dono = EXCLUDED.dono,
    usuario = EXCLUDED.usuario,
    marca = EXCLUDED.marca,
    modelo = EXCLUDED.modelo,
    numero_serie = EXCLUDED.numero_serie,
    numero_lote = EXCLUDED.numero_lote,
    valor_estimado = EXCLUDED.valor_estimado,
    status = EXCLUDED.status;

-- 17.5. Ordens de Serviço Demonstrativas
INSERT INTO os (id, titulo, descricao, equipamento, categoria, equipamento_id, status, prioridade, criado_por, usuarios_envolvidos, tecnico_responsavel, loja_unidade, data_criacao, custo_total_materiais) VALUES
('OS-1001', 'Lentidão e travamento no PDV 01', 'Computador do caixa 01 está demorando para inicializar o sistema de vendas.', 'Computador/PC', 'Computador/PC', 'eq_comp_checkout_01', 'Em andamento', 'Alta', 'usr_tecnico', ARRAY['usr_tecnico'], 'usr_tecnico', 'Mega Maurilândia', NOW() - INTERVAL '2 hours', 180.00),
('OS-1002', 'Impressora térmica não imprime cupom fiscal', 'Equipamento não responde aos comandos do PDV.', 'Impressora térmica', 'Impressora térmica', NULL, 'Aberta', 'Média', 'usr_tecnico', ARRAY['usr_tecnico'], NULL, 'Mega Maurilândia', NOW() - INTERVAL '30 minutes', 0.00)
ON CONFLICT (id) DO UPDATE SET
    titulo = EXCLUDED.titulo,
    descricao = EXCLUDED.descricao,
    equipamento = EXCLUDED.equipamento,
    categoria = EXCLUDED.categoria,
    equipamento_id = EXCLUDED.equipamento_id,
    status = EXCLUDED.status,
    prioridade = EXCLUDED.prioridade,
    criado_por = EXCLUDED.criado_por,
    usuarios_envolvidos = EXCLUDED.usuarios_envolvidos,
    tecnico_responsavel = EXCLUDED.tecnico_responsavel,
    loja_unidade = EXCLUDED.loja_unidade,
    custo_total_materiais = EXCLUDED.custo_total_materiais;

-- 17.6. Materiais da OS de Demonstração
INSERT INTO os_materiais (os_id, nome_material, quantidade, valor_unitario) VALUES
('OS-1001', 'SSD 240GB Kingston', 1, 180.00);

-- 17.7. Mensagens de Chat da OS de Demonstração
INSERT INTO os_mensagens (os_id, mensagem_texto, enviado_por, tipo_midia, data_envio) VALUES
('OS-1001', 'Ticket aberto pelo suporte técnico.', 'usr_tecnico', 'nenhum', NOW() - INTERVAL '2 hours'),
('OS-1001', 'Chamado assumido pela equipe técnica. Realizando diagnóstico no HD.', 'usr_tecnico', 'nenhum', NOW() - INTERVAL '1 hour 45 minutes'),
('OS-1001', 'Detectado setor defeituoso no disco. Foi instalado um SSD novo de 240GB.', 'usr_tecnico', 'nenhum', NOW() - INTERVAL '30 minutes');

-- 17.8. Notificação Inicial
INSERT INTO notificacoes (user_id, mensagem, lida, data) VALUES
('usr_tecnico', 'Sistema de OS configurado e pronto para atendimento.', FALSE, NOW()),
('usr_diretor', 'Painel executivo pronto com auditoria e relatórios.', FALSE, NOW());

-- Ajusta a sequência para não colidir com os registros de seed
SELECT setval('os_number_seq', COALESCE((SELECT MAX(NULLIF(regexp_replace(id, '\D', '', 'g'), '')::BIGINT) FROM os), 1002));
