-- =====================================================================
-- MIGRATION: CRIAÇÃO DA TABELA DE EQUIPAMENTOS E ASSOCIAÇÃO ÀS OS
-- =====================================================================

-- 1. Cria a tabela de equipamentos
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id TEXT PRIMARY KEY,
    usuario TEXT,
    nome_equipamento TEXT NOT NULL,
    codigo_patrimonio TEXT UNIQUE NOT NULL,
    loja_id TEXT REFERENCES public.lojas(id),
    dono TEXT,
    marca TEXT,
    modelo TEXT,
    numero_serie TEXT,
    numero_lote TEXT,
    valor_estimado NUMERIC DEFAULT 0.00,
    data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Adiciona as colunas 'dono' e 'usuario' caso a tabela já tenha sido criada anteriormente
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='equipamentos' AND column_name='dono'
    ) THEN
        ALTER TABLE public.equipamentos ADD COLUMN dono TEXT;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='equipamentos' AND column_name='usuario'
    ) THEN
        ALTER TABLE public.equipamentos ADD COLUMN usuario TEXT;
    END IF;
END $$;

-- Habilita RLS na tabela de equipamentos
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

-- Permite que usuários autenticados leiam os dados dos equipamentos
CREATE POLICY "Permitir leitura de equipamentos para todos" 
ON public.equipamentos FOR SELECT 
TO authenticated 
USING (true);

-- Permite que técnicos e diretores gerenciem os equipamentos
CREATE POLICY "Permitir escrita de equipamentos para TI e Diretor" 
ON public.equipamentos FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid()::text AND (users.role = 'ti' OR users.role = 'diretor')
  )
);

-- 2. Modifica a tabela de ordens de serviço (os)
-- Adiciona a coluna equipamento_id referenciando equipamentos(id) caso não exista
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='public' AND table_name='os' AND column_name='equipamento_id'
    ) THEN
        ALTER TABLE public.os ADD COLUMN equipamento_id TEXT REFERENCES public.equipamentos(id);
    END IF;
END $$;


-- =====================================================================
-- INSERÇÃO DE MOCKS DE EQUIPAMENTOS PARA TESTE
-- =====================================================================

-- Lojas existentes no banco:
-- 'loj_mega_porteirao', 'loj_mega_maurilandia', etc.

INSERT INTO public.equipamentos (id, nome_equipamento, codigo_patrimonio, loja_id, marca, modelo, numero_serie, numero_lote, valor_estimado)
VALUES 
('eq_hp_p1102_01', 'Impressora HP P1102', 'PAT-HP1102-01', 'loj_mega_porteirao', 'HP', 'LaserJet P1102', '77698536', 'faturamento', 1200.00),
('eq_comp_checkout_01', 'Computador Checkout 01', 'PAT-COMP-01', 'loj_mega_maurilandia', 'Dell', 'OptiPlex 3080', 'DELL-SER-992', 'lote faturamento', 3500.00),
('eq_balanca_01', 'Balança Checkout 02', 'PAT-BAL-01', 'loj_mega_porteirao', 'Toledo', 'Prix 3 Fit', 'TOL-SER-771', 'lote frente', 1800.00)
ON CONFLICT (id) DO UPDATE SET 
    nome_equipamento = EXCLUDED.nome_equipamento,
    codigo_patrimonio = EXCLUDED.codigo_patrimonio,
    numero_serie = EXCLUDED.numero_serie,
    numero_lote = EXCLUDED.numero_lote,
    valor_estimado = EXCLUDED.valor_estimado,
    loja_id = EXCLUDED.loja_id;
