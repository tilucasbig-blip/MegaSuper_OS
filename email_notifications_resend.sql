-- ====================================================================
-- AUTOMAÇÃO DE NOTIFICAÇÕES POR E-MAIL VIA RESEND NO SUPABASE
-- Dispara e-mails profissionais para o usuário comum quando:
-- 1. Uma OS é aberta (INSERT)
-- 2. O status de uma OS é alterado (UPDATE de status)
-- ====================================================================

-- 1. Habilitar a extensão pg_net (requisições HTTP assíncronas do PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Tabela para configurações de integração (para guardar a chave do Resend de forma segura)
CREATE TABLE IF NOT EXISTS public.app_config (
    chave TEXT PRIMARY KEY,
    valor TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Inserir ou atualizar a chave do Resend (Cole sua chave do Resend no lugar de COLE_SUA_CHAVE_RESEND_AQUI no Supabase SQL Editor)
INSERT INTO public.app_config (chave, valor)
VALUES ('resend_api_key', 'COLE_SUA_CHAVE_RESEND_AQUI')
ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor;

-- 3. Função que monta o e-mail HTML e envia via API do Resend
CREATE OR REPLACE FUNCTION public.fn_enviar_email_status_os()
RETURNS TRIGGER AS $$
DECLARE
    v_api_key TEXT;
    v_destinatario_email TEXT;
    v_destinatario_nome TEXT;
    v_assunto TEXT;
    v_cor_status TEXT;
    v_status_texto TEXT;
    v_mensagem_status TEXT;
    v_corpo_html TEXT;
BEGIN
    -- Obter a chave da API do Resend da tabela de configurações
    SELECT valor INTO v_api_key FROM public.app_config WHERE chave = 'resend_api_key' LIMIT 1;
    
    -- Se a chave não estiver configurada ou for o placeholder padrão, não faz o disparo
    IF v_api_key IS NULL OR v_api_key = 'SUA_CHAVE_RESEND_AQUI' OR TRIM(v_api_key) = '' THEN
        RETURN NEW;
    END IF;

    -- Se for um UPDATE e o status não mudou, não envia e-mail
    IF (TG_OP = 'UPDATE' AND OLD.status = NEW.status) THEN
        RETURN NEW;
    END IF;

    -- Buscar dados do usuário que abriu a OS
    SELECT email, nome INTO v_destinatario_email, v_destinatario_nome 
    FROM public.users 
    WHERE id = NEW.criado_por OR usuario = NEW.criado_por OR email = NEW.criado_por
    LIMIT 1;

    -- Se não encontrar o e-mail do usuário, encerra sem erro
    IF v_destinatario_email IS NULL OR TRIM(v_destinatario_email) = '' THEN
        RETURN NEW;
    END IF;

    -- Definir cores, mensagens e assuntos de acordo com o status da OS
    v_status_texto := COALESCE(NEW.status, 'Pendente');
    
    IF TG_OP = 'INSERT' OR v_status_texto IN ('Pendente', 'Aberta') THEN
        v_assunto := '🎉 OS #' || NEW.id || ' Aberta com Sucesso - Mega Super';
        v_cor_status := '#6366f1'; -- Indigo
        v_mensagem_status := 'Sua Ordem de Serviço foi registrada no sistema e a equipe de TI já foi notificada.';
    ELSIF v_status_texto = 'Em Andamento' THEN
        v_assunto := '⚙️ OS #' || NEW.id || ' em Atendimento Técnico - Mega Super';
        v_cor_status := '#3b82f6'; -- Azul
        v_mensagem_status := 'Um técnico de TI iniciou o atendimento da sua solicitação.';
    ELSIF v_status_texto IN ('Aguardando Peças', 'Aprovação de Materiais') THEN
        v_assunto := '📦 OS #' || NEW.id || ' Aguardando Peças/Materiais - Mega Super';
        v_cor_status := '#f59e0b'; -- Âmbar
        v_mensagem_status := 'O atendimento identificou a necessidade de peças ou materiais e está em fase de suprimentos/aprovação.';
    ELSIF v_status_texto = 'Concluída' THEN
        v_assunto := '✅ OS #' || NEW.id || ' Concluída com Sucesso! - Mega Super';
        v_cor_status := '#10b981'; -- Verde
        v_mensagem_status := 'Sua solicitação foi finalizada com sucesso! O relatório técnico já está disponível no sistema.';
    ELSIF v_status_texto = 'Cancelada' THEN
        v_assunto := '❌ OS #' || NEW.id || ' foi Cancelada - Mega Super';
        v_cor_status := '#ef4444'; -- Vermelho
        v_mensagem_status := 'Esta Ordem de Serviço foi cancelada. Caso necessário, entre em contato com a equipe de TI.';
    ELSE
        v_assunto := '🔔 Atualização na OS #' || NEW.id || ' - Mega Super';
        v_cor_status := '#8b5cf6'; -- Roxo
        v_mensagem_status := 'O status da sua Ordem de Serviço foi atualizado para: ' || v_status_texto;
    END IF;

    -- Montagem do Template HTML Elegante
    v_corpo_html := '
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; color: #e2e8f0; }
        .card { max-width: 580px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 28px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 28px 24px; }
        .status-badge { display: inline-block; background-color: ' || v_cor_status || '; color: #ffffff; font-weight: bold; font-size: 13px; padding: 6px 14px; border-radius: 20px; margin-bottom: 16px; text-transform: uppercase; }
        .info-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; margin: 20px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
        .info-label { color: #94a3b8; }
        .info-value { font-weight: 600; color: #f8fafc; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #64748b; border-top: 1px solid #334155; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1>REDE MEGA SUPERMERCADOS</h1>
          <p>Sistema de Gestão de Ordens de Serviço (TI)</p>
        </div>
        <div class="content">
          <p style="font-size: 16px; margin-top: 0;">Olá, <strong>' || COALESCE(v_destinatario_nome, 'Colaborador') || '</strong>!</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge">' || v_status_texto || '</span>
            <p style="color: #cbd5e1; font-size: 14px; margin-top: 8px;">' || v_mensagem_status || '</p>
          </div>

          <div class="info-box">
            <div style="border-bottom: 1px solid #1e293b; padding-bottom: 8px; margin-bottom: 10px; font-weight: bold; color: #38bdf8;">
              Detalhes do Chamado:
            </div>
            <p style="margin: 6px 0; font-size: 13px;"><span style="color:#94a3b8;">Nº da OS:</span> <strong style="color:#fff;">#' || NEW.id || '</strong></p>
            <p style="margin: 6px 0; font-size: 13px;"><span style="color:#94a3b8;">Título:</span> <strong style="color:#fff;">' || COALESCE(NEW.titulo, 'Chamado Técnico') || '</strong></p>
            <p style="margin: 6px 0; font-size: 13px;"><span style="color:#94a3b8;">Loja / Unidade:</span> <strong style="color:#fff;">' || COALESCE(NEW.loja, 'Corporativo') || '</strong></p>
            <p style="margin: 6px 0; font-size: 13px;"><span style="color:#94a3b8;">Equipamento:</span> <strong style="color:#fff;">' || COALESCE(NEW.equipamento, 'Equipamento TI') || '</strong></p>
            <p style="margin: 6px 0; font-size: 13px;"><span style="color:#94a3b8;">Prioridade:</span> <strong style="color:#fff;">' || COALESCE(NEW.prioridade, 'Média') || '</strong></p>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center;">
            Você pode acompanhar o andamento em tempo real acessando o sistema.
          </p>
        </div>
        <div class="footer">
          E-mail enviado automaticamente pelo Sistema de OS - Rede Mega Supermercados.<br>
          Por favor, não responda diretamente a este e-mail.
        </div>
      </div>
    </body>
    </html>';

    -- Realizar o envio via API do Resend usando pg_net
    PERFORM net.http_post(
        url := 'https://api.resend.com/emails',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || v_api_key,
            'User-Agent', 'MegaSuperOS/1.0'
        ),
        body := jsonb_build_object(
            'from', 'Mega Super TI <onboarding@resend.dev>',
            'to', jsonb_build_array(v_destinatario_email),
            'subject', v_assunto,
            'html', v_corpo_html
        )
    );

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Garante que falhas no envio de e-mail nunca travem a gravação da OS
    RAISE WARNING 'Falha ao disparar e-mail de notificação de OS: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar o Trigger na tabela `public.os`
DROP TRIGGER IF EXISTS trg_os_enviar_email ON public.os;

CREATE TRIGGER trg_os_enviar_email
AFTER INSERT OR UPDATE OF status ON public.os
FOR EACH ROW
EXECUTE FUNCTION public.fn_enviar_email_status_os();
