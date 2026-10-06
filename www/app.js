/**
 * app.js - Lógica principal da aplicação do Sistema de OS (TI Corporativo).
 * Controla roteamento, renderização de dashboards, simulação de roles,
 * chat com mídias, controle de estoque e geração de relatórios com QR.
 */

// Estado Global da Aplicação
let currentRoute = 'dashboard';
let currentUser = null;
let activeUserManagementTab = 'usuarios';

// Mapeamento de cargos e suas respectivas permissões (roles) no banco de dados
const CARGOS = [
  { cargo: "Faturista", role: "usuario" },
  { cargo: "Frente de Caixa", role: "usuario" },
  { cargo: "Conferente", role: "usuario" },
  { cargo: "Financeiro", role: "usuario" },
  { cargo: "RH", role: "usuario" },
  { cargo: "Administrativo", role: "usuario" },
  { cargo: "Monitoramento", role: "usuario" },
  { cargo: "Compras", role: "usuario" },
  { cargo: "Técnico de TI", role: "ti" },
  { cargo: "Diretor", role: "diretor" },
  { cargo: "Diretoria", role: "diretor" }
];

const LISTA_TIPOS_EQUIPAMENTOS = [
  // --- Informática Geral ---
  { id: "Computador/PC", nome: "Computador / PC" },
  { id: "Notebook", nome: "Notebook" },
  { id: "Monitor", nome: "Monitor" },
  { id: "Monitor touch", nome: "Monitor Touch" },
  { id: "Teclado", nome: "Teclado" },
  { id: "Mouse", nome: "Mouse" },
  { id: "Servidor", nome: "Computador Servidor" },
  { id: "Tablet", nome: "Tablet" },
  { id: "Celular corporativo", nome: "Celular Corporativo" },
  // --- Impressão e Digitalização ---
  { id: "Impressora laser", nome: "Impressora Laser" },
  { id: "Impressora térmica", nome: "Impressora Térmica" },
  { id: "Impressora multifuncional", nome: "Impressora Multifuncional" },
  { id: "Impressora", nome: "Impressora (Geral)" },
  { id: "Impressora fiscal", nome: "Impressora Fiscal / NFC-e" },
  { id: "Impressora não fiscal", nome: "Impressora Não Fiscal" },
  { id: "Scanner", nome: "Scanner" },
  { id: "Etiquetadora", nome: "Etiquetadora" },
  { id: "Leitor de documentos", nome: "Leitor de Documentos" },
  // --- Leitores e Periféricos ---
  { id: "Leitor de código de barras", nome: "Leitor de Código de Barras" },
  { id: "Coletor de dados", nome: "Coletor de Dados" },
  { id: "Leitor biométrico", nome: "Leitor Biométrico" },
  { id: "Leitor de cartão/proximidade", nome: "Leitor de Cartão / Proximidade" },
  { id: "Token/leitora", nome: "Token / Leitora" },
  // --- Energia e Proteção ---
  { id: "Nobreak", nome: "Nobreak" },
  { id: "Estabilizador", nome: "Estabilizador" },
  { id: "Fonte 12V", nome: "Fonte 12V" },
  // --- Telefonia e Comunicação ---
  { id: "Telefone", nome: "Telefone" },
  { id: "Ramal", nome: "Ramal" },
  { id: "Headset", nome: "Headset" },
  { id: "Webcam", nome: "Webcam" },
  { id: "Caixa de som", nome: "Caixa de Som" },
  { id: "Projetor", nome: "Projetor" },
  { id: "TV/monitor", nome: "TV / Monitor de Apresentação" },
  { id: "Equipamentos para videoconferência", nome: "Equip. Videoconferência" },
  { id: "Interfone/porteiro eletrônico", nome: "Interfone / Porteiro Eletrônico" },
  // --- Frente de Caixa / PDV ---
  { id: "PDV/CPU", nome: "PDV / CPU" },
  { id: "Balança de checkout", nome: "Balança de Checkout" },
  { id: "Pin Pad", nome: "Pin Pad" },
  { id: "TEF", nome: "TEF" },
  { id: "Gaveta de dinheiro", nome: "Gaveta de Dinheiro" },
  { id: "Display de cliente", nome: "Display de Cliente" },
  { id: "SAT/MFE", nome: "SAT / MFE" },
  { id: "Caixa reserva", nome: "Caixa Reserva" },
  { id: "PDV reserva", nome: "PDV Reserva" },
  // --- Conferência e Pesagem ---
  { id: "Balança", nome: "Balança (Pesagem)" },
  { id: "Terminal de consulta", nome: "Terminal de Consulta" },
  // --- RH / Ponto ---
  { id: "Relógio de ponto", nome: "Relógio de Ponto" },
  { id: "Tablet de Ponto", nome: "Tablet de Ponto" },
  // --- Rede e Infraestrutura ---
  { id: "Roteador", nome: "Roteador" },
  { id: "Switch", nome: "Switch" },
  { id: "Switch PoE", nome: "Switch PoE" },
  { id: "Access point", nome: "Access Point" },
  { id: "Rack", nome: "Rack" },
  { id: "Patch panel", nome: "Patch Panel" },
  { id: "Conversor de mídia", nome: "Conversor de Mídia" },
  { id: "Cabos de rede", nome: "Cabos de Rede" },
  { id: "Cabos coaxiais", nome: "Cabos Coaxiais" },
  { id: "Baluns", nome: "Baluns" },
  { id: "Conectores BNC", nome: "Conectores BNC" },
  // --- CFTV / Segurança ---
  { id: "DVR", nome: "DVR" },
  { id: "NVR", nome: "NVR" },
  { id: "Câmeras IP", nome: "Câmeras IP" },
  { id: "Câmeras analógicas", nome: "Câmeras Analógicas" },
  { id: "Câmeras dome", nome: "Câmeras Dome" },
  { id: "Câmeras bullet", nome: "Câmeras Bullet" },
  { id: "HD para DVR/NVR", nome: "HD para DVR/NVR" },
  { id: "Computador de monitoramento", nome: "Computador de Monitoramento" },
  // --- Alarme e Controle de Acesso ---
  { id: "Central de alarme", nome: "Central de Alarme" },
  { id: "Teclado de alarme", nome: "Teclado de Alarme" },
  { id: "Sensores", nome: "Sensores" },
  { id: "Sirene", nome: "Sirene" },
  { id: "Módulo de comunicação", nome: "Módulo de Comunicação" },
  { id: "Controle remoto", nome: "Controle Remoto" },
  { id: "Cerca elétrica", nome: "Cerca Elétrica / Central" },
];

const SUGESTOES_EQUIPAMENTOS_POR_CARGO = {
  "Faturista": [
    "Computador/PC", "Monitor", "Teclado", "Mouse", "Impressora laser",
    "Impressora térmica", "Leitor de código de barras", "Nobreak", "Estabilizador",
    "Telefone", "Ramal", "Impressora multifuncional", "Scanner", "Servidor",
    "Etiquetadora", "Leitor de documentos"
  ],
  "Frente de Caixa": [
    "PDV/CPU", "Monitor", "Teclado", "Mouse", "Leitor de código de barras",
    "Balança de checkout", "Impressora fiscal", "Impressora não fiscal",
    "Pin Pad", "TEF", "Gaveta de dinheiro", "Display de cliente", "Nobreak",
    "Scanner", "SAT/MFE", "Roteador", "Monitor touch", "Caixa reserva", "PDV reserva"
  ],
  "Conferente": [
    "Computador/PC", "Monitor", "Notebook", "Coletor de dados",
    "Leitor de código de barras", "Impressora", "Impressora térmica",
    "Balança", "Etiquetadora", "Nobreak", "Tablet", "Celular corporativo",
    "Scanner", "Terminal de consulta"
  ],
  "Financeiro": [
    "Computador/PC", "Monitor", "Notebook", "Teclado", "Mouse",
    "Impressora", "Impressora multifuncional", "Scanner", "Nobreak",
    "Telefone", "Ramal", "Leitor de documentos", "Token/leitora", "Webcam", "Headset"
  ],
  "RH": [
    "Computador/PC", "Monitor", "Notebook", "Teclado", "Mouse",
    "Impressora", "Impressora multifuncional", "Scanner", "Nobreak",
    "Telefone", "Headset", "Webcam", "Leitor biométrico", "Relógio de ponto",
    "Leitor de cartão/proximidade", "Tablet"
  ],
  "Administrativo": [
    "Computador/PC", "Monitor", "Notebook", "Teclado", "Mouse",
    "Impressora", "Impressora multifuncional", "Scanner", "Nobreak",
    "Telefone", "Ramal", "Headset", "Webcam", "Projetor", "TV/monitor",
    "Tablet", "Celular corporativo", "Caixa de som", "Equipamentos para videoconferência"
  ],
  "Monitoramento": [
    "DVR", "NVR", "Câmeras IP", "Câmeras analógicas", "Câmeras dome",
    "Câmeras bullet", "Monitor", "TV/monitor", "Computador de monitoramento",
    "Mouse", "Teclado", "Nobreak", "HD para DVR/NVR", "Switch", "Switch PoE",
    "Roteador", "Rack", "Patch panel", "Conversor de mídia", "Fonte 12V",
    "Central de alarme", "Teclado de alarme", "Sensores", "Sirene",
    "Módulo de comunicação", "Controle remoto", "Cerca elétrica",
    "Interfone/porteiro eletrônico", "Access point", "Cabos de rede",
    "Cabos coaxiais", "Baluns", "Conectores BNC"
  ],
  "Compras": [
    "Computador/PC", "Monitor", "Notebook", "Teclado", "Mouse",
    "Impressora", "Impressora multifuncional", "Scanner", "Nobreak",
    "Telefone", "Ramal", "Headset", "Webcam", "Celular corporativo", "Tablet de Ponto"
  ],
  "Técnico de TI": LISTA_TIPOS_EQUIPAMENTOS.map(e => e.id),
  "Diretor": LISTA_TIPOS_EQUIPAMENTOS.map(e => e.id),
  "Diretoria": LISTA_TIPOS_EQUIPAMENTOS.map(e => e.id)
};

function renderCheckboxesTiposEquipamentos(containerId, selecionados = []) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = LISTA_TIPOS_EQUIPAMENTOS.map(item => {
    const isChecked = Array.isArray(selecionados) && selecionados.includes(item.id);
    return `
      <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: normal; cursor: pointer; color: var(--text-primary);">
        <input type="checkbox" name="${containerId}_item" value="${item.id}" ${isChecked ? 'checked' : ''} style="cursor: pointer; accent-color: var(--primary-color);">
        <span>${item.nome}</span>
      </label>
    `;
  }).join("");
}

function aoMudarCargoNovoUsuario(cargo) {
  const padroes = SUGESTOES_EQUIPAMENTOS_POR_CARGO[cargo] || ["Computador/PC", "Monitor", "Teclado", "Mouse"];
  renderCheckboxesTiposEquipamentos("user-new-tipos-equipamentos", padroes);
}

let selectedOSId = null;
let currentOSChatInterval = null;
let tempAnexoBase64 = "";
let tempAnexoTipo = "nenhum";
let chatAnexoBase64 = "";
let chatAnexoTipo = "nenhum";

function injetarEstilosLayout() {
  const styleId = "antigravity-layout-overrides";
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    /* Forçar layout de viewport fixo para o app */
    #app {
      display: flex !important;
      flex-direction: column !important;
      height: 100vh !important;
      overflow: hidden !important;
    }
    
    .app-container {
      display: flex !important;
      flex: 1 !important;
      overflow: hidden !important;
      min-height: 0 !important;
    }
    
    .sidebar {
      height: 100% !important;
      overflow-y: auto !important;
    }
    
    .content-body {
      height: 100% !important;
    }
    
    @media (min-width: 1025px) {
      .content-body.dashboard-layout {
        overflow-y: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        height: 100% !important;
      }

      .content-body.dashboard-layout .view-header-sticky {
        position: relative !important;
        top: 0 !important;
        flex-shrink: 0 !important;
      }

      .content-body.dashboard-layout .dashboard-row {
        flex: 1 !important;
        min-height: 0 !important;
        display: grid !important;
        grid-template-columns: 1.5fr 1fr !important;
        grid-template-rows: 1fr !important;
        gap: 24px !important;
        margin-bottom: 0 !important;
        overflow: hidden !important;
      }

      .content-body.dashboard-layout > .panel {
        flex: 1 !important;
        min-height: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
      }

      .content-body.dashboard-layout .panel {
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        height: 100% !important;
        min-height: 0 !important;
      }

      .content-body.dashboard-layout .panel-header {
        flex-shrink: 0 !important;
      }

      .content-body.dashboard-layout .os-cards-list {
        flex: 1 !important;
        overflow-y: auto !important;
        min-height: 0 !important;
        padding-right: 4px !important;
      }
    }
  `;
  document.head.appendChild(style);
}

// Inicialização da Aplicação
document.addEventListener("DOMContentLoaded", async () => {
  injetarEstilosLayout();
  
  // 1. Inicializa o banco com o cache local prévio (síncrono e instantâneo)
  AppDatabase.init();
  
  // 2. Verifica se há sessão ativa salva no navegador
  const savedUid = localStorage.getItem("app_os_session_uid");
  if (savedUid) {
    // Procura o usuário imediatamente no cache local para não piscar tela de login nem deslogar
    const userCached = AppDatabase.getCollection("users").find(u => 
      String(u.uid) === String(savedUid) || 
      String(u.id) === String(savedUid)
    );
    
    if (userCached && userCached.ativo !== false) {
      // Aplica login imediatamente com os dados locais salvos (sem esperar rede)
      await loginComSucesso(userCached.uid || userCached.id, false);
      
      // Em segundo plano (assíncrono), sincroniza dados atualizados com o Supabase
      AppDatabase.load().then(async () => {
        const userFresh = AppDatabase.getCollection("users").find(u => 
          String(u.uid) === String(savedUid) || 
          String(u.id) === String(savedUid)
        );
        if (!userFresh || userFresh.ativo === false) {
          console.warn("Usuário da sessão foi desativado ou excluído no servidor.");
          alert("Sua sessão expirou ou o usuário foi desativado. Redirecionando para login...");
          await executarLimpezaSessao();
          exibirTelaLogin();
        } else {
          currentUser = userFresh;
          await definirUsuarioAtual(userFresh.uid || userFresh.id);
          atualizarContadorNotificacoes();
        }
      }).catch(err => {
        console.warn("Aviso na sincronização em segundo plano:", err);
      });
    } else {
      // Se não encontrou no cache local, tenta carregar do Supabase
      try {
        await AppDatabase.load(['users']);
        const userExists = AppDatabase.getCollection("users").find(u => 
          String(u.uid) === String(savedUid) || 
          String(u.id) === String(savedUid)
        );
        if (userExists && userExists.ativo !== false) {
          await loginComSucesso(userExists.uid || userExists.id, false);
        } else {
          await executarLimpezaSessao();
          exibirTelaLogin();
          return;
        }
      } catch (err) {
        await executarLimpezaSessao();
        exibirTelaLogin();
        return;
      }
    }
  } else {
    exibirTelaLogin();
  }
  
  // Renderiza a view inicial
  await navegarPara(currentRoute);
  
  // Atualiza contador de notificações
  atualizarContadorNotificacoes();
  
  // Registra eventos globais de fechamento ao clicar fora
  window.onclick = (event) => {
    const notifPanel = document.getElementById("notification-panel");
    if (notifPanel && notifPanel.classList.contains("active") && !event.target.closest(".btn-icon-wrapper") && !event.target.closest("#notification-panel")) {
      notifPanel.classList.remove("active");
    }
  };

  // Fecha modais ao clicar no fundo escuro (backdrop)
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  // Fecha modais ao pressionar a tecla Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
    }
  });
  
  // Inicia o monitoramento de inatividade do usuário (auto logout)
  iniciarMonitoramentoInatividade();

  // Inicia o Auto-Refresh a cada 30 segundos
  iniciarAutoRefresh30s();
});

// ================= SISTEMA DE AUTO-REFRESH A CADA 30 SEGUNDOS =================
let autoRefreshTimer = null;

function iniciarAutoRefresh30s() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }
  
  console.log("⏱️ Auto Refresh a cada 30 segundos ativado.");
  
  autoRefreshTimer = setInterval(async () => {
    // Só atualiza se o usuário estiver logado e a aba do navegador estiver visível
    if (!currentUser || document.hidden) return;
    
    try {
      console.log("🔄 [30s] Sincronizando e atualizando dados do sistema...");
      
      // 1. Sincroniza os dados mais recentes do banco (sempre incluindo usuários para validar sessão ativa)
      let targetCols = ["users", "os", "os_materiais", "os_mensagens", "notificacoes"];
      if (currentRoute === 'estoque') targetCols.push("estoque", "movimentacoes_estoque");
      else if (currentRoute === 'logs') targetCols.push("logs", "audit_logs");
      else if (currentRoute === 'usuarios') targetCols.push("password_reset_requests");
      else if (currentRoute === 'equipamentos') targetCols.push("equipamentos", "lojas");
      else if (currentRoute === 'dashboard') targetCols.push("estoque");
      
      await AppDatabase.load(targetCols);

      // 2. Valida se o usuário atualmente logado ainda existe no banco e está ativo
      if (currentUser) {
        const myUid = currentUser.uid || currentUser.id;
        const userCheck = AppDatabase.getCollection("users").find(u => 
          String(u.uid) === String(myUid) || 
          String(u.id) === String(myUid) || 
          String(u.usuario) === String(currentUser.usuario) || 
          String(u.email) === String(currentUser.email)
        );
        
        if (!userCheck || userCheck.ativo === false) {
          console.warn("Conta excluída ou desativada no banco. Encerrando sessão automaticamente.");
          alert("Sua conta foi desativada ou excluída pelo administrador. A sessão foi finalizada.");
          await executarLimpezaSessao();
          exibirTelaLogin();
          return;
        } else {
          currentUser = userCheck;
        }
      }
      
      // 2. Atualiza badge e lista de notificações
      atualizarContadorNotificacoes();
      
      // 3. Verifica se o usuário não está com formulário ou modal aberto
      const modalAberto = document.querySelector(".modal-overlay.active");
      const elementoFocado = document.activeElement;
      const digitando = elementoFocado && (elementoFocado.tagName === "INPUT" || elementoFocado.tagName === "TEXTAREA" || elementoFocado.tagName === "SELECT");
      
      if (!modalAberto && !digitando) {
        const contentBody = document.getElementById("content-body");
        if (contentBody) {
          switch(currentRoute) {
            case 'dashboard':
              renderDashboard();
              break;
            case 'os':
              renderOSList();
              break;
            case 'estoque':
              renderEstoque();
              break;
            case 'logs':
              renderLogs();
              break;
            case 'usuarios':
              renderUsuarios();
              break;
            case 'equipamentos':
              renderEquipamentos();
              break;
          }
          lucide.createIcons();
        }
      }
      
      // 4. Se a gaveta de detalhes da OS estiver aberta, atualiza chat e materiais
      if (selectedOSId) {
        const osAtualizada = AppDatabase.getDoc("os", selectedOSId, "id");
        if (osAtualizada) {
          renderChatMessages(osAtualizada, false);
          renderMaterialsList(osAtualizada);
        }
      }
    } catch (err) {
      console.warn("Aviso no ciclo de auto refresh de 30s:", err);
    }
  }, 30000); // 30 segundos
}

// ================= SISTEMA DE AUTENTICAÇÃO E ROLE SIMULADA =================

async function loginComSucesso(uid, registrarLogs = true) {
  currentUser = AppDatabase.getDoc("users", uid, "uid") || AppDatabase.getDoc("users", uid, "id");
  if (!currentUser) return;

  // Marca no HTML para evitar qualquer oscilação visual
  document.documentElement.classList.add("has-saved-session");

  // Exibe a tela principal do app e esconde a tela de login
  const loginContainer = document.getElementById("login-container");
  const appContainer = document.getElementById("app");
  if (loginContainer) loginContainer.style.display = "none";
  if (appContainer) appContainer.style.display = "flex";

  // Salva na sessão
  localStorage.setItem("app_os_session_uid", currentUser.uid || currentUser.id);

  await definirUsuarioAtual(currentUser.uid || currentUser.id);

  if (registrarLogs) {
    // Registra auditoria de login apenas em logins explícitos
    await AppDatabase.registrarAuditLog(currentUser.uid || currentUser.id, "login", `Login efetuado com sucesso (Matrícula/Usuário: ${currentUser.usuario || 'N/A'}, Cargo: ${currentUser.cargo || currentUser.role})`);
    AppDatabase.registrarLog("Efetuou login no sistema", currentUser.uid || currentUser.id);
  }
  
  // Sincroniza dados e navega para recarregar
  await navegarPara(currentRoute);
}

async function executarLimpezaSessao() {
  console.log("Iniciando limpeza completa da sessão e cache local...");
  document.documentElement.classList.remove("has-saved-session");
  // Limpa o cache do banco de dados e desloga do Supabase Auth
  await AppDatabase.logout();
  
  // Limpa variáveis globais de estado do app.js
  currentUser = null;
  selectedOSId = null;
  tempAnexoBase64 = "";
  tempAnexoTipo = "nenhum";
  chatAnexoBase64 = "";
  chatAnexoTipo = "nenhum";
  activeStatusFilter = 'todos';
  activeUserManagementTab = 'usuarios';
  currentRoute = 'dashboard';
  
  // Limpa timers de inatividade
  if (tempoInatividadeTimer) {
    clearTimeout(tempoInatividadeTimer);
    tempoInatividadeTimer = null;
  }
  
  // Limpa conteúdo renderizado para não mostrar lixo de outro usuário
  const contentBody = document.getElementById("content-body");
  if (contentBody) contentBody.innerHTML = "";
  
  // Esconde o bottom sheet se estiver aberto e limpa intervalos
  fecharOSDetails();
  
  // Limpa uploads de arquivos pendentes na interface
  const fileInputOS = document.getElementById("os-foto");
  if (fileInputOS) fileInputOS.value = "";
  const previewOS = document.getElementById("os-midia-preview");
  if (previewOS) {
    previewOS.style.display = "none";
    previewOS.innerHTML = "";
  }
  const fileInputChat = document.getElementById("chat-file-input");
  if (fileInputChat) fileInputChat.value = "";
  const uploadBarChat = document.getElementById("chat-upload-bar");
  if (uploadBarChat) uploadBarChat.style.display = "none";
}

function exibirTelaLogin() {
  document.documentElement.classList.remove("has-saved-session");
  const loginContainer = document.getElementById("login-container");
  const appContainer = document.getElementById("app");
  if (loginContainer) loginContainer.style.display = "flex";
  if (appContainer) appContainer.style.display = "none";

  localStorage.removeItem("app_os_session_uid");

  // Preenche usuário lembrado
  const usernameInput = document.getElementById("login-username");
  const lembrarCheckbox = document.getElementById("login-lembrar-usuario");
  if (usernameInput) {
    const remembered = localStorage.getItem("app_os_remembered_user");
    if (remembered) {
      usernameInput.value = remembered;
      if (lembrarCheckbox) lembrarCheckbox.checked = true;
    } else {
      usernameInput.value = "";
    }
  }
  
  const passwordInput = document.getElementById("login-password");
  if (passwordInput) passwordInput.value = "";
  
  // Oculta e reseta o captcha
  const captchaContainer = document.getElementById("login-captcha-container");
  if (captchaContainer) {
    captchaContainer.style.display = "none";
    captchaContainer.innerHTML = "";
  }
  captchaValido = false;
  pageLoadTime = Date.now();
  
  // Configura ícones Lucide no login
  lucide.createIcons();
}

async function definirUsuarioAtual(uid) {
  currentUser = AppDatabase.getDoc("users", uid, "uid") || AppDatabase.getDoc("users", uid, "id");
  if (!currentUser) return;
  
  // Atualiza elementos visuais do header imediatamente
  const avatar = document.getElementById("user-avatar");
  const name = document.getElementById("user-name");
  const role = document.getElementById("user-role");
  
  if (avatar) avatar.textContent = (currentUser.nome || "US").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  if (name) name.textContent = currentUser.nome || currentUser.usuario || "Usuário";
  if (role) role.textContent = (currentUser.cargo || currentUser.role || "").toUpperCase();
  
  // Ajusta visibilidade de abas na sidebar conforme a role
  ajustarPermissoesSidebar();

  // Efetua login no Supabase Auth para RLS funcionar com o usuário atual (em background com tratamento)
  try {
    await AppDatabase.login(uid);
  } catch (err) {
    console.warn("Supabase auth login aviso:", err.message);
  }
}


async function logoutSimulado() {
  if (currentUser) {
    AppDatabase.registrarLog("Efetuou logout do sistema", currentUser.uid);
    AppDatabase.registrarAuditLog(currentUser.uid, "logout", `Logout efetuado com sucesso`);
  }
  
  // Aguarda os logs serem gravados no Supabase enquanto a sessão ainda está ativa (evita violação RLS)
  if (AppDatabase.pendingWrites && AppDatabase.pendingWrites.length > 0) {
    try {
      await Promise.all(AppDatabase.pendingWrites);
    } catch (err) {
      console.warn("Erro ao aguardar gravação dos logs de logout:", err);
    }
  }
  
  alert("Efetuando logout do sistema...");
  await executarLimpezaSessao();
  exibirTelaLogin();
}

function ajustarPermissoesSidebar() {
  const navEstoque = document.getElementById("nav-estoque");
  const navLogs = document.getElementById("nav-logs");
  const navUsuarios = document.getElementById("nav-usuarios");
  const navEquipamentos = document.getElementById("nav-equipamentos");
  
  if (!currentUser) return;
  
  // Esconde/mostra abas da sidebar conforme regras
  if (currentUser.role === 'usuario') {
    if (navEstoque) navEstoque.style.display = "none";
    if (navLogs) navLogs.style.display = "none";
    if (navUsuarios) navUsuarios.style.display = "none";
    if (navEquipamentos) navEquipamentos.style.display = "none";
  } else if (currentUser.role === 'ti') {
    if (navEstoque) navEstoque.style.display = "flex";
    if (navLogs) navLogs.style.display = "flex";
    if (navUsuarios) navUsuarios.style.display = "flex";
    if (navEquipamentos) navEquipamentos.style.display = "flex";
  } else if (currentUser.role === 'diretor') {
    if (navEstoque) navEstoque.style.display = "flex";
    if (navLogs) navLogs.style.display = "flex";
    if (navUsuarios) navUsuarios.style.display = "flex";
    if (navEquipamentos) navEquipamentos.style.display = "flex";
  }
}

// ================= ROTAS E NAVEGAÇÃO =================

async function navegarPara(route) {
  if (!currentUser) return;

  // Valida se a conta do usuário ainda existe no sistema e está ativa
  const myUid = currentUser.uid || currentUser.id;
  const userCheck = AppDatabase.getCollection("users").find(u => 
    String(u.uid) === String(myUid) || 
    String(u.id) === String(myUid) || 
    String(u.usuario) === String(currentUser.usuario) || 
    String(u.email) === String(currentUser.email)
  );
  if (!userCheck || userCheck.ativo === false) {
    alert("Sua conta foi excluída ou desativada pelo administrador.");
    await executarLimpezaSessao();
    exibirTelaLogin();
    return;
  }
  
  // Garante o fechamento de detalhes e limpeza de intervalos de chat
  fecharOSDetails();
  fecharSidebarDrawer();
  
  // Guardas de Rota baseados na Role do Usuário (Evita acessos não autorizados)
  if (currentUser.role === 'usuario') {
    if (route === 'estoque' || route === 'logs' || route === 'usuarios' || route === 'equipamentos') {
      route = 'dashboard';
    }
  }
  
  currentRoute = route;
  
  // Atualiza classes ativas da sidebar
  document.querySelectorAll(".sidebar-nav .nav-link").forEach(link => {
    link.classList.remove("active");
  });
  
  const activeLink = document.getElementById(`nav-${route}`);
  if (activeLink) activeLink.classList.add("active");
  
  const contentBody = document.getElementById("content-body");
  if (!contentBody) return;

  // Função interna para renderizar a tela ativa com os dados locais
  function executarRenderizacaoView() {
    // Controla o layout específico para o Dashboard
    if (currentRoute === 'dashboard') {
      contentBody.classList.add("dashboard-layout");
    } else {
      contentBody.classList.remove("dashboard-layout");
    }
    
    // Limpa animações antigas aplicando nova entrada
    contentBody.style.animation = 'none';
    contentBody.offsetHeight; // trigger reflow
    contentBody.style.animation = 'fadeIn var(--transition-fast)';
    
    switch(currentRoute) {
      case 'dashboard':
        renderDashboard();
        break;
      case 'os':
        renderOSList();
        break;
      case 'estoque':
        renderEstoque();
        break;
      case 'logs':
        renderLogs();
        break;
      case 'usuarios':
        renderUsuarios();
        break;
      case 'equipamentos':
        renderEquipamentos();
        break;
      default:
        contentBody.innerHTML = `<h2>Página não encontrada</h2>`;
    }
    
    // Re-inicia os ícones Lucide inseridos dinamicamente
    lucide.createIcons();
  }

  // 1. RENDERIZA A VIEW IMEDIATAMENTE (Latência zero, instantâneo!)
  executarRenderizacaoView();
  
  // 2. BUSCA OS DADOS MAIS RECENTES EM SEGUNDO PLANO E ATUALIZA A VIEW SE A ROTA AINDA FOR A MESMA
  let targetCols = ["os", "os_materiais", "os_mensagens", "notificacoes"];
  if (route === 'estoque') {
    targetCols.push("estoque", "movimentacoes_estoque");
  } else if (route === 'logs') {
    targetCols.push("logs", "audit_logs");
  } else if (route === 'usuarios') {
    targetCols.push("users", "password_reset_requests");
  } else if (route === 'equipamentos') {
    targetCols.push("equipamentos", "lojas");
  } else if (route === 'dashboard') {
    targetCols.push("estoque", "users");
  }
  
  AppDatabase.load(targetCols).then(() => {
    // Só re-renderiza se o usuário ainda estiver na mesma rota quando a resposta chegar
    if (currentRoute === route) {
      executarRenderizacaoView();
    }
  }).catch(err => {
    console.error("Erro na carga em segundo plano:", err);
  });
}

function irParaDashboard() {
  navegarPara('dashboard');
}

// ================= RENDERIZADORES DE TELA =================

function renderDashboard() {
  const contentBody = document.getElementById("content-body");
  if (!currentUser) return;
  
  if (currentUser.role === 'usuario') {
    renderDashboardUsuario(contentBody);
  } else if (currentUser.role === 'ti') {
    renderDashboardTI(contentBody);
  } else if (currentUser.role === 'diretor') {
    renderDashboardDiretor(contentBody);
  }
}

// 👤 DASHBOARD USUÁRIO
function renderDashboardUsuario(container) {
  const myUid = currentUser.uid || currentUser.id;
  const osList = AppDatabase.getCollection("os").filter(o => 
    String(o.criado_por) === String(myUid) || 
    String(o.criado_por) === String(currentUser.id) ||
    String(o.criado_por) === String(currentUser.usuario) ||
    String(o.criado_por) === String(currentUser.email)
  );
  
  container.innerHTML = `
    <div class="view-header-sticky">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Painel de Solicitações</h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Gerencie suas solicitações de TI</p>
        </div>
        <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-os')">
          <i data-lucide="plus-circle"></i> Abrir Nova OS
        </button>
      </div>

      <!-- Cards de Resumo -->
      <div class="dashboard-grid" style="margin-bottom: 0;">
        <div class="stat-card" onclick="filtrarStatusOS('Aberta'); navegarPara('os');">
          <div class="stat-icon pending"><i data-lucide="clock"></i></div>
          <div class="stat-details">
            <h3 id="usr-cnt-abertas">${osList.filter(o => o.status === 'Aberta').length}</h3>
            <p>Pendentes / Abertas</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Em andamento'); navegarPara('os');">
          <div class="stat-icon progress"><i data-lucide="activity"></i></div>
          <div class="stat-details">
            <h3 id="usr-cnt-andamento">${osList.filter(o => o.status === 'Em andamento').length}</h3>
            <p>Em Andamento</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Finalizada'); navegarPara('os');">
          <div class="stat-icon done"><i data-lucide="check-circle2"></i></div>
          <div class="stat-details">
            <h3 id="usr-cnt-finalizadas">${osList.filter(o => o.status === 'Finalizada').length}</h3>
            <p>Concluídas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Lista de OS do Usuário -->
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title"><i data-lucide="list"></i> Minhas Ordens de Serviço</div>
      </div>
      <div class="os-cards-list" id="user-os-list">
        ${renderOSCardsListHTML(osList)}
      </div>
    </div>
  `;
  
  // Popular lojas no modal de criação
  popularLojasDropdown();
}

// 🧑‍💻 DASHBOARD TI
function renderDashboardTI(container) {
  const osAll = AppDatabase.getCollection("os");
  const osAbertas = osAll.filter(o => o.status === 'Aberta');
  const osEmAndamento = osAll.filter(o => o.status === 'Em andamento');
  const osFinalizadas = osAll.filter(o => o.status === 'Finalizada');
  const estoqueList = AppDatabase.getCollection("estoque");
  const estoqueBaixo = estoqueList.filter(e => e.quantidade_atual <= e.estoque_minimo).length;
  
  container.innerHTML = `
    <div class="view-header-sticky">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Painel do Técnico / Suporte TI</h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Gerenciamento completo de chamados e infraestrutura</p>
        </div>
        <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-os')">
          <i data-lucide="plus-circle"></i> Registrar OS de TI
        </button>
      </div>

      <!-- Estatísticas -->
      <div class="dashboard-grid" style="margin-bottom: 0;">
        <div class="stat-card" onclick="filtrarStatusOS('Aberta'); navegarPara('os');">
          <div class="stat-icon pending"><i data-lucide="inbox"></i></div>
          <div class="stat-details">
            <h3>${osAbertas.length}</h3>
            <p>Tickets Abertos (Fila)</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Em andamento'); navegarPara('os');">
          <div class="stat-icon progress"><i data-lucide="wrench"></i></div>
          <div class="stat-details">
            <h3>${osEmAndamento.length}</h3>
            <p>Tickets Em Andamento</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Finalizada'); navegarPara('os');">
          <div class="stat-icon done"><i data-lucide="check-square"></i></div>
          <div class="stat-details">
            <h3>${osFinalizadas.length}</h3>
            <p>Tickets Finalizados</p>
          </div>
        </div>
        <div class="stat-card" onclick="navegarPara('estoque');">
          <div class="stat-icon danger"><i data-lucide="alert-triangle"></i></div>
          <div class="stat-details">
            <h3 style="color: ${estoqueBaixo > 0 ? 'var(--status-cancelada)' : 'inherit'}">${estoqueBaixo}</h3>
            <p>Itens de Estoque Baixo</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <!-- Fila Geral de Atendimento (Abertas) -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="inbox"></i> Fila de Chamados Abertos</div>
        </div>
        <div class="os-cards-list">
          ${renderOSCardsListHTML(osAbertas)}
        </div>
      </div>

      <!-- Chamados Em Andamento -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="wrench"></i> Chamados Em Andamento</div>
        </div>
        <div class="os-cards-list">
          ${renderOSCardsListHTML(osEmAndamento)}
        </div>
      </div>
    </div>
  `;
  
  popularLojasDropdown();
}

// 👔 DASHBOARD DIRETOR
function renderDashboardDiretor(container) {
  const osAll = AppDatabase.getCollection("os");
  const logs = AppDatabase.getCollection("logs");
  const estoqueList = AppDatabase.getCollection("estoque");
  
  // Cálculos financeiros e de status
  const finalizadasMes = osAll.filter(o => o.status === 'Finalizada');
  const totalGasto = finalizadasMes.reduce((acc, current) => acc + (current.custo_total_materiais || 0), 0);
  const estoqueBaixo = estoqueList.filter(e => e.quantidade_atual <= e.estoque_minimo).length;
  
  // Contagens para gráfico donut
  const countAberta = osAll.filter(o => o.status === 'Aberta').length;
  const countAndamento = osAll.filter(o => o.status === 'Em andamento').length;
  const countFinalizada = osAll.filter(o => o.status === 'Finalizada').length;
  const countCancelada = osAll.filter(o => o.status === 'Cancelada' || o.status === 'Rejeitada por Diretor').length;
  
  const totalOS = osAll.length || 1;
  
  const pctAberta = ((countAberta / totalOS) * 100).toFixed(0);
  const pctAndamento = ((countAndamento / totalOS) * 100).toFixed(0);
  const pctFinalizada = ((countFinalizada / totalOS) * 100).toFixed(0);
  const pctCancelada = (100 - parseFloat(pctAberta) - parseFloat(pctAndamento) - parseFloat(pctFinalizada)).toFixed(0);

  container.innerHTML = `
    <div class="view-header-sticky">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Dashboard Corporativo</h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Visão executiva do estoque e custos de OS</p>
        </div>
        <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-os')">
          <i data-lucide="plus-circle"></i> Abrir Nova OS
        </button>
      </div>

      <!-- KPI Cards -->
      <div class="dashboard-grid" style="margin-bottom: 0;">
        <div class="stat-card" onclick="filtrarStatusOS('Aberta'); navegarPara('os');">
          <div class="stat-icon pending"><i data-lucide="clock"></i></div>
          <div class="stat-details">
            <h3>${osAll.filter(o => o.status === 'Aberta').length}</h3>
            <p>OS em Fila / Abertas</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Em andamento'); navegarPara('os');">
          <div class="stat-icon progress"><i data-lucide="briefcase"></i></div>
          <div class="stat-details">
            <h3>${osAll.filter(o => o.status === 'Em andamento').length}</h3>
            <p>OS Em Andamento</p>
          </div>
        </div>
        <div class="stat-card" onclick="filtrarStatusOS('Finalizada'); navegarPara('os');">
          <div class="stat-icon done"><i data-lucide="dollar-sign"></i></div>
          <div class="stat-details">
            <h3>R$ ${totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p>Gasto com Materiais (Mês)</p>
          </div>
        </div>
        <div class="stat-card" onclick="navegarPara('estoque');">
          <div class="stat-icon danger"><i data-lucide="package-x"></i></div>
          <div class="stat-details">
            <h3 style="color: ${estoqueBaixo > 0 ? 'var(--status-cancelada)' : 'inherit'}">${estoqueBaixo}</h3>
            <p>Estoques Críticos</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-row">
      <!-- Donut Chart & Metrics -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="pie-chart"></i> Estatísticas de Status (Em tempo real)</div>
        </div>
        <div class="chart-container">
          <!-- Donut renderizado usando CSS Conic Gradient -->
          <div id="donut-chart" style="
            width: 160px;
            height: 160px;
            border-radius: 50%;
            background: conic-gradient(
              var(--status-aberta) 0% ${pctAberta}%,
              var(--status-andamento) ${pctAberta}% ${(parseFloat(pctAberta) + parseFloat(pctAndamento)) }%,
              var(--status-finalizada) ${(parseFloat(pctAberta) + parseFloat(pctAndamento))}% ${(parseFloat(pctAberta) + parseFloat(pctAndamento) + parseFloat(pctFinalizada)) }%,
              var(--status-cancelada) ${(parseFloat(pctAberta) + parseFloat(pctAndamento) + parseFloat(pctFinalizada))}% 100%
            );
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: inset 0 0 10px rgba(0,0,0,0.5), var(--shadow-sm);
            position: relative;
          ">
            <div style="
              width: 110px;
              height: 110px;
              border-radius: 50%;
              background-color: var(--bg-secondary);
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            ">
              <span style="font-size: 26px; font-weight: 800; color: #fff;">${osAll.length}</span>
              <span style="font-size: 10px; color: var(--text-secondary); text-transform: uppercase;">Total OS</span>
            </div>
          </div>
          
          <!-- Legendas com dados -->
          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color" style="background: var(--status-aberta)"></div>
              <span>Abertas (${countAberta} - ${pctAberta}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: var(--status-andamento)"></div>
              <span>Em Andamento (${countAndamento} - ${pctAndamento}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: var(--status-finalizada)"></div>
              <span>Finalizadas (${countFinalizada} - ${pctFinalizada}%)</span>
            </div>
            <div class="legend-item">
              <div class="legend-color" style="background: var(--status-cancelada)"></div>
              <span>Canceladas (${countCancelada} - ${pctCancelada}%)</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ordens de Serviço Recentes -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="clock"></i> Últimas Solicitações</div>
        </div>
        <div class="os-cards-list">
          ${renderOSCardsListHTML(osAll.sort((a,b) => new Date(b.data_criacao) - new Date(a.data_criacao)).slice(0, 4))}
        </div>
      </div>
    </div>
  `;
}

// Renderizar cards de OS com cores
function renderOSCardsListHTML(list) {
  if (list.length === 0) {
    return `<div style="text-align: center; color: var(--text-muted); padding: 32px 0; font-size: 13px;">
              Nenhuma Ordem de Serviço encontrada.
            </div>`;
  }
  
  return list.map(o => {
    const dataFormatada = new Date(o.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    const badgeClass = o.status.toLowerCase().replace(/ /g, "-");
    
    return `
      <div class="os-card-row" onclick="abrirOSDetails('${o.id}')">
        <div class="os-card-left">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="os-id-cell">${o.id}</span>
            <span class="badge status-${badgeClass}">${o.status}</span>
          </div>
          <span class="os-card-title">${o.titulo}</span>
          <div class="os-card-meta">
            <span><i data-lucide="map-pin" style="width: 12px; height: 12px; display: inline; vertical-align: text-bottom;"></i> ${o.loja_unidade}</span>
            <span><i data-lucide="tag" style="width: 12px; height: 12px; display: inline; vertical-align: text-bottom;"></i> ${o.equipamento}</span>
            <span><i data-lucide="clock" style="width: 12px; height: 12px; display: inline; vertical-align: text-bottom;"></i> ${dataFormatada}</span>
          </div>
        </div>
        <div>
          <span class="badge priority-${o.prioridade.toLowerCase()}">${o.prioridade}</span>
        </div>
      </div>
    `;
  }).join("");
}

// LISTA GERAL DE OS (TELA COMPLETA COM FILTROS)
function renderOSList() {
  const contentBody = document.getElementById("content-body");
  const osList = AppDatabase.getCollection("os");
  
  // Filtros aplicados baseados no perfil do usuário
  let ticketsFiltrados = [...osList];
  if (currentUser.role === 'usuario') {
    const myUid = currentUser.uid || currentUser.id;
    ticketsFiltrados = ticketsFiltrados.filter(o => 
      String(o.criado_por) === String(myUid) || 
      String(o.criado_por) === String(currentUser.id) ||
      String(o.criado_por) === String(currentUser.usuario) ||
      String(o.criado_por) === String(currentUser.email) ||
      (Array.isArray(o.usuarios_envolvidos) && o.usuarios_envolvidos.some(u => String(u) === String(myUid) || String(u) === String(currentUser.id)))
    );
  }
  
  contentBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Ordens de Serviço</h1>
        <p style="color: var(--text-secondary); font-size: 14px;">Histórico de solicitações e acompanhamento em tempo real</p>
      </div>
      <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-os')">
        <i data-lucide="plus-circle"></i> Abrir Nova OS
      </button>
    </div>

    <!-- Barra de busca e filtros -->
    <div class="panel" style="margin-bottom: 24px;">
      <div style="display: flex; gap: 16px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 250px; position: relative;">
          <input type="text" id="os-search" class="input-control" placeholder="Buscar por número da OS ou título..." oninput="filtrarListaOS()" style="padding-left: 40px;">
          <i data-lucide="search" style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: var(--text-muted);"></i>
        </div>
        <div style="width: 180px;">
          <select id="filter-prioridade" class="input-control" onchange="filtrarListaOS()">
            <option value="">Todas Prioridades</option>
            <option value="Baixa">Prioridade Baixa</option>
            <option value="Média">Prioridade Média</option>
            <option value="Alta">Prioridade Alta</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tab de status -->
    <div class="tab-bar">
      <button class="tab-btn ${activeStatusFilter === 'todos' ? 'active' : ''}" id="tab-all" onclick="filtrarStatusOS('todos')">Todas (${ticketsFiltrados.length})</button>
      <button class="tab-btn ${activeStatusFilter === 'Aberta' ? 'active' : ''}" id="tab-aberta" onclick="filtrarStatusOS('Aberta')">Abertas (${ticketsFiltrados.filter(o => o.status === 'Aberta').length})</button>
      <button class="tab-btn ${activeStatusFilter === 'Em andamento' ? 'active' : ''}" id="tab-andamento" onclick="filtrarStatusOS('Em andamento')">Em Andamento (${ticketsFiltrados.filter(o => o.status === 'Em andamento').length})</button>
      <button class="tab-btn ${activeStatusFilter === 'Finalizada' ? 'active' : ''}" id="tab-finalizada" onclick="filtrarStatusOS('Finalizada')">Finalizadas (${ticketsFiltrados.filter(o => o.status === 'Finalizada').length})</button>
    </div>

    <!-- Container da tabela de OS -->
    <div class="panel">
      <div class="table-container">
        <table class="os-table">
          <thead>
            <tr>
              <th>Cód. OS</th>
              <th>Título</th>
              <th>Loja / Unidade</th>
              <th>Equipamento</th>
              <th>Abertura</th>
              <th>Prioridade</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody id="os-table-rows">
            <!-- Rendered dynamically -->
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  filtrarListaOS();
  popularLojasDropdown();
}

function popularTabelaOS(list) {
  const tbody = document.getElementById("os-table-rows");
  if (!tbody) return;
  
  if (list.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px 0;">
          Nenhuma Ordem de Serviço encontrada para os filtros aplicados.
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = list.map(o => {
    const dataFormatada = new Date(o.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    const badgeClass = o.status.toLowerCase().replace(/ /g, "-");
    
    return `
      <tr onclick="abrirOSDetails('${o.id}')" style="cursor: pointer;">
        <td class="os-id-cell">${o.id}</td>
        <td class="os-title-cell">${o.titulo}</td>
        <td>${o.loja_unidade}</td>
        <td>${o.equipamento}</td>
        <td>${dataFormatada}</td>
        <td><span class="badge priority-${o.prioridade.toLowerCase()}">${o.prioridade}</span></td>
        <td><span class="badge status-${badgeClass}">${o.status}</span></td>
      </tr>
    `;
  }).join("");
}

let activeStatusFilter = 'todos';
function filtrarStatusOS(status) {
  activeStatusFilter = status;
  
  document.querySelectorAll(".tab-bar .tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  
  const idMapeado = {
    'todos': 'tab-all',
    'Aberta': 'tab-aberta',
    'Em andamento': 'tab-andamento',
    'Finalizada': 'tab-finalizada'
  };
  
  const activeBtn = document.getElementById(idMapeado[status]);
  if (activeBtn) activeBtn.classList.add("active");
  
  filtrarListaOS();
}

function filtrarListaOS() {
  const searchEl = document.getElementById("os-search");
  const filterPrioridadeEl = document.getElementById("filter-prioridade");
  
  // Se os elementos de busca não existem na tela atual, retorna silenciosamente
  if (!searchEl || !filterPrioridadeEl) return;
  
  const searchVal = searchEl.value.toLowerCase();
  const prioridadeVal = filterPrioridadeEl.value;
  
  let list = AppDatabase.getCollection("os");
  
  // Regra de perfil
  if (currentUser.role === 'usuario') {
    const myUid = currentUser.uid || currentUser.id;
    list = list.filter(o => 
      String(o.criado_por) === String(myUid) || 
      String(o.criado_por) === String(currentUser.id) ||
      String(o.criado_por) === String(currentUser.usuario) ||
      String(o.criado_por) === String(currentUser.email)
    );
  }
  
  // Filtro por texto
  if (searchVal) {
    list = list.filter(o => o.id.toLowerCase().includes(searchVal) || o.titulo.toLowerCase().includes(searchVal) || o.descricao.toLowerCase().includes(searchVal));
  }
  
  // Filtro por prioridade
  if (prioridadeVal) {
    list = list.filter(o => o.prioridade === prioridadeVal);
  }
  
  // Filtro por tab de status
  if (activeStatusFilter !== 'todos') {
    list = list.filter(o => o.status === activeStatusFilter);
  }
  
  popularTabelaOS(list);
}

// 📦 TELA DE ESTOQUE
function renderEstoque() {
  const contentBody = document.getElementById("content-body");
  const estoqueList = AppDatabase.getCollection("estoque");
  const movList = AppDatabase.getCollection("movimentacoes_estoque");
  
  contentBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Controle de Estoque</h1>
        <p style="color: var(--text-secondary); font-size: 14px;">Monitoramento de peças, consumíveis de TI e logs de movimentações</p>
      </div>
      <button class="btn" style="width: auto;" onclick="abrirModalAdicionarEstoque()">
        <i data-lucide="plus-circle"></i> Entrada de Estoque
      </button>
    </div>

    <div class="dashboard-row" style="grid-template-columns: 1.5fr 1fr;">
      <!-- Tabela de estoque de materiais -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="boxes"></i> Inventário de Peças</div>
        </div>
        <div class="table-container">
          <table class="os-table">
            <thead>
              <tr>
                <th>Nome do Material</th>
                <th style="text-align: center;">Qtd Atual</th>
                <th style="text-align: center;">Min. Crítico</th>
                <th style="text-align: right;">Preço Unitário</th>
                <th style="text-align: center;">Status</th>
                <th style="text-align: center; width: 80px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${estoqueList.map(e => {
                const estoqueBaixo = e.quantidade_atual <= e.estoque_minimo;
                const statusTexto = estoqueBaixo ? "ESTOQUE BAIXO" : "OK";
                const badgeClass = estoqueBaixo ? "status-cancelada" : "status-finalizada";
                
                return `
                  <tr>
                    <td class="os-title-cell">${e.nome_material}</td>
                    <td style="text-align: center; font-weight: 700; color: ${estoqueBaixo ? 'var(--status-cancelada)' : 'inherit'}">${e.quantidade_atual}</td>
                    <td style="text-align: center; color: var(--text-muted);">${e.estoque_minimo}</td>
                    <td style="text-align: right;">R$ ${e.valor_unitario.toFixed(2)}</td>
                    <td style="text-align: center;"><span class="badge ${badgeClass}">${statusTexto}</span></td>
                    <td style="text-align: center;">
                      <button style="background: none; border: none; color: var(--status-cancelada); cursor: pointer; padding: 4px; display: inline-flex; align-items: center; justify-content: center; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" onclick="excluirMaterialEstoque('${e.id}', '${e.nome_material}')" title="Excluir Material do Estoque">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
                      </button>
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Logs de Movimentações de Estoque -->
      <div class="panel">
        <div class="panel-header">
          <div class="panel-title"><i data-lucide="history"></i> Movimentações de Saída/Entrada</div>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto;">
          ${movList.length === 0 ? `
            <div style="text-align: center; color: var(--text-muted); padding: 32px 0;">Nenhuma movimentação registrada.</div>
          ` : movList.map(m => {
            const dataF = new Date(m.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            return `
              <div style="background-color: var(--bg-tertiary); padding: 12px; border-radius: var(--radius-sm); border-left: 3px solid ${m.tipo === 'entrada' ? 'var(--status-finalizada)' : 'var(--status-cancelada)'};">
                <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700;">
                  <span>${m.nome_material}</span>
                  <span style="color: ${m.tipo === 'entrada' ? 'var(--status-finalizada)' : 'var(--status-cancelada)'}">${m.tipo === 'entrada' ? '+' : '-'}${m.quantidade}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px;">
                  <span>OS: ${m.os_id || 'Ajuste manual'}</span>
                  <span>${dataF}</span>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  `;
}

// 📜 TELA DE LOGS (AUDITORIA DO SISTEMA)
async function recarregarLogsManual() {
  const btn = document.getElementById("btn-refresh-logs");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px;"></i> Atualizando...`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
  try {
    await AppDatabase.load(["audit_logs", "users", "os"]);
    renderLogs();
  } catch (e) {
    console.error("Erro ao recarregar logs de auditoria:", e);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> Atualizar Logs`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

async function limparHistoricoAuditLogs() {
  if (!currentUser || currentUser.role !== 'diretor') {
    alert("Apenas Diretores têm permissão para limpar o histórico de logs.");
    return;
  }
  
  const confirmacao = confirm("⚠️ ATENÇÃO: Deseja realmente APAGAR TODO O HISTÓRICO de logs de auditoria?\n\nEsta ação irá zerar todos os registros de auditoria anteriores no banco de dados e não poderá ser desfeita.");
  if (!confirmacao) return;

  const btn = document.getElementById("btn-limpar-logs");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px;"></i> Limpando...`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  try {
    await AppDatabase.limparLogs();
    
    // Registra a ação de limpeza como o primeiro log novo
    const currentUserId = currentUser.uid || currentUser.id;
    await AppDatabase.registrarAuditLog(currentUserId, "logs_limpos", `O Diretor ${currentUser.nome} realizou a limpeza de todo o histórico anterior de auditoria.`);
    
    alert("Histórico de auditoria limpo com sucesso! Apenas as novas atividades serão registradas a partir de agora.");
    renderLogs();
  } catch (err) {
    console.error("Erro ao limpar histórico de auditoria:", err);
    alert("Erro ao limpar histórico: " + err.message);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `<i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Limpar Histórico`;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

function filtrarLogsNaTela(termo) {
  const clean = (termo || "").toLowerCase().trim();
  const items = document.querySelectorAll(".logs-list .log-item");
  let countVisible = 0;
  items.forEach(el => {
    const text = el.textContent.toLowerCase();
    if (!clean || text.includes(clean)) {
      el.style.display = "flex";
      countVisible++;
    } else {
      el.style.display = "none";
    }
  });
  const countEl = document.getElementById("logs-count-badge");
  if (countEl) {
    countEl.textContent = clean ? `(${countVisible} filtrados)` : `(${items.length})`;
  }
}

function renderLogs() {
  const contentBody = document.getElementById("content-body");
  if (!contentBody) return;

  const auditCol = AppDatabase.getCollection("audit_logs") || [];
  const users = AppDatabase.getCollection("users") || [];

  // Filtra e prepara logs de auditoria
  const allLogs = auditCol
    .filter(l => {
      if (!l || !l.acao) return false;
      const acaoLower = String(l.acao).toLowerCase();
      
      // Oculta estritamente logs de teste ou ruído irrelevante
      if (acaoLower === 'teste') return false;
      return true;
    })
    .map(l => {
      const rawTime = l.data_hora || l.data || l.created_at || "";
      const timeMs = rawTime ? new Date(rawTime).getTime() : 0;
      
      // Tenta extrair ID da OS se não tiver l.os_id explícito
      let osId = l.os_id;
      if (!osId && l.descricao) {
        const match = l.descricao.match(/#([a-zA-Z0-9_\-]+)/);
        if (match) osId = match[1];
      }
      return { ...l, os_id: osId, _time: timeMs };
    })
    .sort((a, b) => (b._time || 0) - (a._time || 0));

  let logsHTML = "";
  if (allLogs.length === 0) {
    logsHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 48px 0;">
        <i data-lucide="shield-check" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.4; display: block; margin: 0 auto 12px;"></i>
        <p style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">Nenhum registro de auditoria encontrado</p>
        <p style="font-size: 12px; opacity: 0.7;">As atividades operacionais de usuários e chamados serão registradas aqui em tempo real.</p>
      </div>
    `;
  } else {
    logsHTML = allLogs.map(l => {
      const authorId = l.usuario_id || l.feito_por;
      const userObj = users.find(u => 
        String(u.uid) === String(authorId) || 
        String(u.id) === String(authorId) || 
        (u.usuario && u.usuario.toLowerCase() === String(authorId).toLowerCase()) ||
        (u.email && u.email.toLowerCase() === String(authorId).toLowerCase())
      );
      
      const userName = userObj ? userObj.nome : (authorId ? "Usuário / " + authorId : "Sistema / Operação");
      const userRole = userObj ? (userObj.cargo || userObj.role || "USR").toUpperCase() : "AUDITORIA";
      const rawDate = l.data_hora || l.data || l.created_at;
      const dateObj = rawDate ? new Date(rawDate) : null;
      const dataF = (dateObj && !isNaN(dateObj)) ? dateObj.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : "Data N/A";
      const esc = (v) => String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
      
      const rotulosAcao = {
        login: "Login no Sistema",
        logout: "Logout do Sistema",
        login_falha: "Tentativa de Login Falhou",
        login_bloqueado: "Tentativa de Login Bloqueada",
        conta_bloqueada_temp: "Conta Bloqueada Temporariamente",
        usuario_criado: "Criação de Usuário",
        usuario_excluido: "Exclusão de Usuário",
        usuario_editado: "Edição de Usuário",
        excluir_estoque: "Exclusão de Item no Estoque",
        entrada_estoque: "Entrada de Estoque",
        solicitacao_senha: "Solicitação de Senha",
        senha_alterada_obrigatoria: "Redefinição de Senha Obrigatória",
        senha_aprovada: "Aprovação de Redefinição de Senha",
        senha_rejeitada: "Rejeição de Solicitação de Senha",
        equipamento_cadastrado: "Cadastro de Equipamento",
        equipamento_editado: "Edição de Equipamento",
        logs_limpos: "Limpeza de Histórico de Auditoria"
      };
      
      const acaoTexto = rotulosAcao[l.acao] || l.acao;
      const descricaoTexto = l.descricao && l.descricao !== l.acao ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px; line-height: 1.4;">${esc(l.descricao)}</div>` : '';

      return `
        <div class="log-item" style="padding: 14px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <span class="log-action" style="font-weight: 700; color: var(--text-primary); font-size: 13px;">${esc(acaoTexto)}</span>
              ${l.os_id ? `<span class="os-id-cell" style="cursor: pointer; font-size: 11px; padding: 2px 6px; border-radius: 4px; background: rgba(99, 102, 241, 0.1); color: var(--accent-color);" onclick="abrirOSDetails('${l.os_id}')">#${esc(l.os_id.replace(/^#/, ''))}</span>` : ''}
            </div>
            ${descricaoTexto}
          </div>
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
            <span class="log-user" style="font-size: 11px; font-weight: 600; color: var(--text-secondary);">${esc(userName)} (${esc(userRole)})</span>
            <span class="log-time" style="font-size: 11px; color: var(--text-muted);">${dataF}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  const isDiretor = currentUser && currentUser.role === 'diretor';

  contentBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Logs de Auditoria</h1>
        <p style="color: var(--text-secondary); font-size: 14px;">Trilha completa de auditoria e atividades operacionais de todos os usuários</p>
      </div>
      <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
        <input type="text" id="input-filtro-logs" class="input-control" placeholder="🔍 Filtrar logs por usuário, ação..." style="width: 240px; padding: 8px 12px; font-size: 13px;" oninput="filtrarLogsNaTela(this.value)">
        <button id="btn-refresh-logs" class="btn btn-secondary" style="width: auto; padding: 8px 16px;" onclick="recarregarLogsManual()">
          <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i> Atualizar Logs
        </button>
        ${isDiretor ? `
          <button id="btn-limpar-logs" class="btn" style="width: auto; padding: 8px 16px; background-color: #ef4444; color: white; border: none; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;" onclick="limparHistoricoAuditLogs()">
            <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Limpar Histórico
          </button>
        ` : ''}
      </div>
    </div>

    <div class="panel">
      <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
        <div class="panel-title"><i data-lucide="shield-check"></i> Trilha de Ações Executadas <span id="logs-count-badge">(${allLogs.length})</span></div>
      </div>
      <div class="logs-list" style="max-height: 70vh; overflow-y: auto;">
        ${logsHTML}
      </div>
    </div>
  `;

  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

// 👥 TELA DE USUÁRIOS
function renderUsuarios() {
  const contentBody = document.getElementById("content-body");
  const users = AppDatabase.getCollection("users");
  const pendingRequests = AppDatabase.getCollection("password_reset_requests").filter(r => r.status === 'pendente');
  const countPending = pendingRequests.length;
  
  contentBody.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Gerenciar Usuários</h1>
        <p style="color: var(--text-secondary); font-size: 14px;">Cadastro, cargos e redefinição de senhas com auditoria</p>
      </div>
      <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-usuario')">
        <i data-lucide="user-plus"></i> Novo Usuário
      </button>
    </div>

    <!-- Abas de Gerenciamento -->
    <div class="tab-bar" style="margin-bottom: 24px; display: flex; gap: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
      <button class="tab-btn ${activeUserManagementTab === 'usuarios' ? 'active' : ''}" onclick="alterarAbaGerenciamento('usuarios')">
        Usuários Cadastrados (${users.length})
      </button>
      <button class="tab-btn ${activeUserManagementTab === 'solicitacoes' ? 'active' : ''}" onclick="alterarAbaGerenciamento('solicitacoes')" style="position: relative;">
        Solicitações de Senha
        ${countPending > 0 ? `<span class="badge status-cancelada" style="margin-left: 6px; font-size: 10px; padding: 2px 6px; border-radius: 9px; line-height: 1; display: inline-block;">${countPending}</span>` : ''}
      </button>
    </div>

    <div id="user-management-tab-content">
      ${activeUserManagementTab === 'usuarios' ? renderTabelaUsuariosHTML(users) : renderTabelaSolicitacoesHTML(pendingRequests)}
    </div>
  `;
}

function alterarAbaGerenciamento(aba) {
  activeUserManagementTab = aba;
  renderUsuarios();
  lucide.createIcons();
}

function renderTabelaUsuariosHTML(users) {
  return `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title"><i data-lucide="users"></i> Usuários Cadastrados</div>
      </div>
      <div class="table-container">
        <table class="os-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Loja / Unidade</th>
              <th>Cargo</th>
              <th>Status</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const avatarIniciais = u.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
              
              const isSelf = u.uid === currentUser.uid;
              const isPrimaryAdmin = u.uid === 'usr_diretor';
              let acaoHTML = '<span style="font-size: 11px; color: var(--text-muted);">-</span>';
              
              if (isSelf) {
                acaoHTML = '<span style="font-size: 11px; color: var(--text-muted);">Você</span>';
              } else if (isPrimaryAdmin) {
                acaoHTML = '<span style="font-size: 11px; color: var(--text-muted);">Administrador</span>';
              } else if (
                currentUser.role === 'diretor' || 
                (currentUser.role === 'ti' && u.role === 'usuario')
              ) {
                const targetUserId = u.uid || u.id;
                acaoHTML = `
                  <div style="display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn btn-secondary" style="width: auto; padding: 6px 12px; color: var(--accent-color); border-color: rgba(99, 102, 241, 0.2);" onclick="abrirEditarUsuario('${targetUserId}')">
                      <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i> Editar
                    </button>
                    <button class="btn btn-secondary" style="width: auto; padding: 6px 12px; color: var(--status-cancelada); border-color: rgba(239, 68, 68, 0.2);" onclick="excluirUsuarioSimulado('${targetUserId}')">
                      <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i> Excluir
                    </button>
                  </div>
                `;
              }
              
              return `
                <tr>
                  <td class="os-title-cell" style="display: flex; align-items: center; gap: 10px; border-bottom: none; padding-top: 20px;">
                    <div class="user-avatar" style="width: 32px; height: 32px;">${avatarIniciais}</div>
                    <span>${u.nome}</span>
                  </td>
                  <td>${u.email}</td>
                  <td>${u.loja || '<span style="color: var(--text-muted); font-size: 11px;">Corporativo / TI</span>'}</td>
                  <td><span class="role-badge ${u.role}">${u.cargo || u.role}</span></td>
                  <td><span class="badge ${u.ativo ? 'status-finalizada' : 'status-cancelada'}">${u.ativo ? 'Ativo' : 'Inativo'}</span></td>
                  <td style="text-align: right;">
                    ${acaoHTML}
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderTabelaSolicitacoesHTML(requests) {
  if (requests.length === 0) {
    return `
      <div class="panel" style="padding: 40px; text-align: center; color: var(--text-muted);">
        <i data-lucide="shield-check" style="width: 48px; height: 48px; margin-bottom: 12px; opacity: 0.5; display: block; margin: 0 auto 12px;"></i>
        <p>Nenhuma solicitação de redefinição de senha pendente.</p>
      </div>
    `;
  }
  
  return `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title"><i data-lucide="key-round"></i> Solicitações Pendentes</div>
      </div>
      <div class="table-container">
        <table class="os-table">
          <thead>
            <tr>
              <th>Solicitante</th>
              <th>Matrícula/Usuário</th>
              <th>Setor</th>
              <th>Observação</th>
              <th>Data/Hora</th>
              <th style="text-align: right;">Ações</th>
            </tr>
          </thead>
          <tbody>
            ${requests.map(r => {
              const u = AppDatabase.getDoc("users", r.user_id, "uid");
              const dataF = new Date(r.solicitado_em).toLocaleString('pt-BR');
              return `
                <tr>
                  <td class="os-title-cell" style="font-weight: 700;">${r.solicitante}</td>
                  <td>${u ? u.usuario || 'N/A' : 'Excluído'}</td>
                  <td>${r.setor}</td>
                  <td style="color: var(--text-secondary); max-width: 200px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                    ${r.observacao || 'Nenhuma'}
                  </td>
                  <td>${dataF}</td>
                  <td style="text-align: right; display: flex; gap: 8px; justify-content: flex-end;">
                    <button class="btn btn-success" style="width: auto; padding: 6px 12px; font-size: 11px;" onclick="aprovarSolicitacaoSenha('${r.id}')">
                      <i data-lucide="check" style="width: 12px; height: 12px; display: inline-block; vertical-align: text-bottom;"></i> Aprovar & Gerar
                    </button>
                    <button class="btn btn-secondary" style="width: auto; padding: 6px 12px; font-size: 11px; color: var(--status-cancelada); border-color: rgba(239, 68, 68, 0.2);" onclick="rejeitarSolicitacaoSenha('${r.id}')">
                      <i data-lucide="x" style="width: 12px; height: 12px; display: inline-block; vertical-align: text-bottom;"></i> Rejeitar
                    </button>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ================= MODALS CONTROLLERS =================

function abrirModal(id) {
  try {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (id === 'modal-criar-usuario') {
      popularLojasDropdown();
      const cargoSelect = document.getElementById("user-new-cargo");
      if (cargoSelect) {
        let filteredCargos = CARGOS;
        if (currentUser && currentUser.role === 'ti') {
          filteredCargos = CARGOS.filter(c => c.role === 'usuario');
        }
        cargoSelect.innerHTML = filteredCargos.map(c => `
          <option value="${c.cargo}">${c.cargo}</option>
        `).join("");
        
        if (filteredCargos.length > 0) {
          aoMudarCargoNovoUsuario(filteredCargos[0].cargo);
        }
      }
    }
    
    if (id === 'modal-criar-equipamento') {
      popularLojasDropdown();
    }
    
    if (id === 'modal-criar-os') {
      popularLojasDropdown();
      popularEquipamentosCadastradosDropdown();
      atualizarPrioridadeAutomatica();
      const osLojaGroup = document.getElementById("os-loja-group");
      const osLojaSelect = document.getElementById("os-loja");
      if (currentUser && currentUser.role === 'usuario') {
        if (osLojaGroup) osLojaGroup.style.display = "none";
        if (osLojaSelect) {
          osLojaSelect.value = currentUser.loja || "Corporativo / TI";
          osLojaSelect.removeAttribute("required");
        }
      } else {
        if (osLojaGroup) osLojaGroup.style.display = "block";
        if (osLojaSelect) osLojaSelect.setAttribute("required", "required");
      }
    }
    
    modal.classList.add("active");
    modal.style.display = "flex";
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
      lucide.createIcons();
    }
  } catch (err) {
    console.error("Erro ao abrir modal:", err);
  }
}

function fecharModal(id) {
  try {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("active");
      modal.style.display = "none";
    }
    
    // Reseta formulários de forma segura
    if (id === 'modal-criar-os') {
      const formOS = document.getElementById("form-criar-os");
      if (formOS) formOS.reset();
      
      const mediaPreview = document.getElementById("os-midia-preview");
      if (mediaPreview) {
        mediaPreview.style.display = "none";
        mediaPreview.innerHTML = "";
      }
      desativarWebcamScanner();
      tempAnexoBase64 = "";
      tempAnexoTipo = "nenhum";
      
      const codPatrimonioInput = document.getElementById("os-codigo-patrimonio");
      if (codPatrimonioInput) codPatrimonioInput.value = "";
      const eqCadastroHidden = document.getElementById("os-equipamento-cadastro");
      if (eqCadastroHidden) eqCadastroHidden.value = "";
      const feedbackEl = document.getElementById("os-equipamento-feedback");
      if (feedbackEl) {
        feedbackEl.style.display = "none";
        feedbackEl.innerHTML = "";
      }
      atualizarPrioridadeAutomatica();
    }
  } catch (err) {
    console.error("Erro ao fechar modal:", err);
  }
}

// Popular Lojas no modal de criação
function popularLojasDropdown() {
  const dropdown = document.getElementById("os-loja");
  const userLojaDropdown = document.getElementById("user-new-loja");
  const userEditLojaDropdown = document.getElementById("user-edit-loja");
  const eqLojaDropdown = document.getElementById("eq-loja");
  const editEqLojaDropdown = document.getElementById("edit-eq-loja");
  const userDatalist = document.getElementById("datalist-usuarios-cadastrados");
  
  const lojas = AppDatabase.getCollection("lojas") || [];
  const optionsHTML = lojas.map(l => `<option value="${l.nome}">${l.nome}</option>`).join("");
  const optionsIdHTML = lojas.map(l => `<option value="${l.id}">${l.nome}</option>`).join("");
  
  if (dropdown) {
    dropdown.innerHTML = `<option value="Corporativo / TI">Corporativo / TI</option>` + optionsHTML;
  }
  if (userLojaDropdown) {
    userLojaDropdown.innerHTML = `<option value="">Nenhuma (Corporativo / TI)</option>` + optionsHTML;
  }
  if (userEditLojaDropdown) {
    userEditLojaDropdown.innerHTML = `<option value="">Nenhuma (Corporativo / TI)</option>` + optionsHTML;
  }
  if (eqLojaDropdown) {
    eqLojaDropdown.innerHTML = `<option value="">-- Selecione a Loja --</option>` + optionsIdHTML;
  }
  if (editEqLojaDropdown) {
    editEqLojaDropdown.innerHTML = `<option value="">-- Selecione a Loja --</option>` + optionsIdHTML;
  }
  
  if (userDatalist) {
    const users = AppDatabase.getCollection("users") || [];
    userDatalist.innerHTML = users.map(u => `<option value="${u.nome} (${u.cargo || 'Funcionário'}${u.loja ? ' - ' + u.loja : ''})"></option>`).join("");
  }
}

// ================= CRIAÇÃO DE OS =================

// Processar upload de arquivo na OS (Base64 simulation)
function carregarMidiaInput(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    tempAnexoBase64 = e.target.result;
    tempAnexoTipo = file.type.startsWith("image/") ? "foto" : "video";
    
    const preview = document.getElementById("os-midia-preview");
    if (preview) {
      preview.style.display = "block";
      if (tempAnexoTipo === "foto") {
        preview.innerHTML = `<img src="${tempAnexoBase64}" style="max-height: 100px; width: auto; border-radius: 4px;">`;
      } else {
        preview.innerHTML = `<video src="${tempAnexoBase64}" controls style="max-height: 100px; width: auto; border-radius: 4px;"></video>`;
      }
    }
  };
  reader.readAsDataURL(file);
}

async function criarNovaOS(e) {
  try {
    e.preventDefault();
    
    if (!currentUser) {
      throw new Error("Usuário simulado atual não definido!");
    }
    
    // Verificação de Rate Limit baseada nos chamados reais ativos do banco
    const currentUserId = currentUser.uid || currentUser.id;
    
    // Usuários comuns possuem limite de no máximo 3 chamados ativos abertos nas últimas 12 horas (Técnicos e Diretores não têm essa limitação)
    if (currentUser.role === 'usuario') {
      const osList = AppDatabase.getCollection("os") || [];
      const nowMs = Date.now();
      const chamadosRecentes = osList.filter(o => {
        const eMeu = String(o.criado_por) === String(currentUserId) || 
                     String(o.criado_por) === String(currentUser.id) || 
                     String(o.criado_por) === String(currentUser.usuario) || 
                     String(o.criado_por) === String(currentUser.email);
        const tempoCriacao = new Date(o.data_criacao).getTime();
        const nasUltimas12h = !isNaN(tempoCriacao) && (nowMs - tempoCriacao) < (12 * 60 * 60 * 1000);
        return eMeu && nasUltimas12h && o.status !== 'Cancelada';
      });
      
      if (chamadosRecentes.length >= 3) {
        alert("Bloqueio de Segurança: Limite de abertura de chamados excedido (você possui 3 chamados ativos abertos nas últimas 12 horas).");
        return;
      }
    }
    
    const titulo = document.getElementById("os-titulo").value;
    const loja = document.getElementById("os-loja").value;
    const codPatrimonioInput = document.getElementById("os-codigo-patrimonio");
    const eqHidden = document.getElementById("os-equipamento");
    const equipamento = (eqHidden && eqHidden.value) ? eqHidden.value : ((codPatrimonioInput && codPatrimonioInput.value) ? codPatrimonioInput.value : "Computador");
    const prioridade = calcularPrioridadePorEquipamento(equipamento);
    const descricao = document.getElementById("os-descricao").value;
    const equipamentoId = document.getElementById("os-equipamento-cadastro").value || null;
    
    // Obter ID sequencial global único do Supabase via RPC ou fallback inteligente
    let novoId = "";
    if (typeof AppDatabase.generateNextOSId === "function") {
      novoId = await AppDatabase.generateNextOSId();
    } else {
      const osList = AppDatabase.getCollection("os") || [];
      let maxNum = 1000;
      osList.forEach(o => {
        if (o.id && typeof o.id === 'string') {
          const match = o.id.match(/\d+/);
          if (match) {
            const num = parseInt(match[0], 10);
            if (!isNaN(num) && num > maxNum) maxNum = num;
          }
        }
      });
      novoId = `OS-${maxNum + 1}`;
    }
    
    // Cria documento de OS
    const novaOS = {
      id: novoId,
      titulo: titulo,
      descricao: descricao,
      equipamento: equipamento,
      categoria: equipamento, // equivalentes
      equipamento_id: equipamentoId,
      status: "Aberta",
      prioridade: prioridade,
      criado_por: currentUserId,
      usuarios_envolvidos: [],
      tecnico_responsavel: "",
      data_criacao: new Date().toISOString(),
      data_finalizacao: null,
      loja_unidade: loja,
      material_aprovado: null,
      motivo_rejeicao: "",
      relatorio_url: "",
      custo_total_materiais: 0,
      materiais: [],
      mensagens: []
    };
    
    // Se houver anexo, adiciona como mensagem inicial
    if (tempAnexoBase64) {
      novaOS.mensagens.push({
        mensagem_texto: "Anexou mídia na abertura do ticket.",
        midia_url: tempAnexoBase64,
        tipo_midia: tempAnexoTipo,
        enviado_por: currentUserId,
        data_envio: new Date().toISOString()
      });
    }
    
    // Gravação confirmada no Supabase: se falhar, o erro sobe para o catch e o usuário é avisado (sem fingir sucesso)
    await AppDatabase.insertDocConfirmed("os", novaOS);
    AppDatabase.registrarLog("Ordem de Serviço criada", currentUserId, novoId, `Abriu a OS #${novoId} para ${equipamento} em ${loja} - "${titulo}"`);
    
    // Notifica técnicos de TI e diretores
    const staff = AppDatabase.getCollection("users").filter(u => u.role === 'ti' || u.role === 'diretor');
    staff.forEach(s => {
      AppDatabase.criarNotificacao(s.uid || s.id, `Nova OS #${novoId} foi aberta em ${loja} - Categoria ${equipamento}`);
    });
    
    fecharModal("modal-criar-os");
    alert(`Ordem de Serviço #${novoId} aberta com sucesso!`);
    
    // Redireciona
    if (currentUser.role === 'usuario') {
      navegarPara('dashboard');
    } else {
      navegarPara('os');
    }
  } catch (error) {
    console.error("Erro ao criar OS:", error);
    alert("Não foi possível confirmar a abertura do chamado.\n\n" + error.message + "\n\nConfira sua conexão e tente novamente. Se o banco retornou erro após inserir a OS, verifique a lista antes de reenviar para evitar duplicidade.");
  }
}

// ================= DETALHES DA OS & INTERAÇÕES DA OS =================

function abrirOSDetails(osId) {
  selectedOSId = osId;
  const os = AppDatabase.getDoc("os", osId, "id");
  if (!os) return;
  
  // Popular campos no Bottom Sheet
  document.getElementById("sheet-os-id").textContent = os.id;
  document.getElementById("sheet-os-titulo").textContent = os.titulo;
  
  const statusEl = document.getElementById("sheet-os-status");
  const badgeClass = os.status.toLowerCase().replace(/ /g, "-");
  statusEl.innerHTML = `<span class="badge status-${badgeClass}">${os.status}</span>`;
  
  const priorityEl = document.getElementById("sheet-os-prioridade");
  priorityEl.innerHTML = `<span class="badge priority-${os.prioridade.toLowerCase()}">${os.prioridade}</span>`;
  
  document.getElementById("sheet-os-loja").textContent = os.loja_unidade;
  document.getElementById("sheet-os-equipamento").textContent = os.equipamento;
  
  // Nome Criador
  const criador = AppDatabase.getDoc("users", os.criado_por, "uid");
  document.getElementById("sheet-os-criador").textContent = criador ? criador.nome : "Desconhecido";
  
  // Nome Técnico
  const tecnico = AppDatabase.getDoc("users", os.tecnico_responsavel, "uid");
  document.getElementById("sheet-os-tecnico").textContent = tecnico ? tecnico.nome : "Fila de Atendimento (Não Assumido)";
  
  document.getElementById("sheet-os-descricao").textContent = os.descricao;
  
  // Renderiza Materiais
  renderMaterialsList(os);
  
  // Renderiza botões de ações com base nas permissões
  renderOSActionsButtons(os);
  
  // Renderiza histórico do chat com rolagem forçada ao abrir
  renderChatMessages(os, true);
  
  // Limpa qualquer interval anterior para segurança
  if (currentOSChatInterval) {
    clearTimeout(currentOSChatInterval);
    currentOSChatInterval = null;
  }
  
  // Função recursiva de sincronização em tempo real (polling sequencial)
  async function sincronizarOSDetailsLoop() {
    if (!selectedOSId) return;
    
    try {
      await AppDatabase.load(['os', 'os_materiais', 'os_mensagens', 'notificacoes']);
      const osAtualizada = AppDatabase.getDoc("os", selectedOSId, "id");
      if (osAtualizada && selectedOSId === osAtualizada.id) {
        renderChatMessages(osAtualizada, false);
        renderMaterialsList(osAtualizada);
        renderOSActionsButtons(osAtualizada);
        atualizarContadorNotificacoes();
        
        // Atualiza status no cabeçalho se mudou
        const statusEl = document.getElementById("sheet-os-status");
        if (statusEl) {
          const badgeClass = osAtualizada.status.toLowerCase().replace(/ /g, "-");
          statusEl.innerHTML = `<span class="badge status-${badgeClass}">${osAtualizada.status}</span>`;
        }
        
        // Atualiza técnico no cabeçalho se mudou
        const tecObj = AppDatabase.getDoc("users", osAtualizada.tecnico_responsavel, "uid");
        const tecText = tecObj ? tecObj.nome : "Fila de Atendimento (Não Assumido)";
        const tecEl = document.getElementById("sheet-os-tecnico");
        if (tecEl && tecEl.textContent !== tecText) {
          tecEl.textContent = tecText;
        }
      }
    } catch (err) {
      console.error("Erro na sincronização automática da OS:", err);
    }
    
    // Agenda o próximo ciclo se esta OS ainda for a selecionada
    if (selectedOSId) {
      currentOSChatInterval = setTimeout(sincronizarOSDetailsLoop, 3000);
    }
  }
  
  // Inicia o loop de sincronização
  currentOSChatInterval = setTimeout(sincronizarOSDetailsLoop, 3000);
  
  // Ativa o bottom sheet
  document.getElementById("os-details-sheet").classList.add("active");
  lucide.createIcons();
}

function fecharOSDetails() {
  document.getElementById("os-details-sheet").classList.remove("active");
  selectedOSId = null;
  
  if (currentOSChatInterval) {
    clearTimeout(currentOSChatInterval);
    currentOSChatInterval = null;
  }
}

function renderMaterialsList(os) {
  const container = document.getElementById("sheet-materials-container");
  const valorTotalEl = document.getElementById("sheet-total-custo-valor");
  
  if (!container || !valorTotalEl) return;
  
  if (!os.materiais || os.materiais.length === 0) {
    container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 10px 0;">Nenhum material cadastrado nesta OS.</div>`;
    valorTotalEl.textContent = "R$ 0,00";
    return;
  }
  
  container.innerHTML = `
    <ul class="materials-list">
      ${os.materiais.map(m => `
        <li class="material-item">
          <div>
            <span style="font-weight: 600;">${m.nome_material}</span>
            <span style="font-size: 11px; color: var(--text-secondary); display: block;">Qtd: ${m.quantidade} x R$ ${m.valor_unitario.toFixed(2)}</span>
          </div>
          <span style="font-weight: 700;">R$ ${m.valor_total.toFixed(2)}</span>
        </li>
      `).join("")}
    </ul>
  `;
  
  const custoTotal = os.materiais.reduce((acc, cur) => acc + cur.valor_total, 0);
  valorTotalEl.textContent = `R$ ${custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}

// Renderiza botões na OS dependendo do status e do role
// Renderiza botões na OS dependendo do status e do role
function renderOSActionsButtons(os) {
  const actionsContainer = document.getElementById("sheet-actions");
  const addMaterialBtn = document.getElementById("btn-adicionar-material-trigger");
  if (!actionsContainer) return;
  
  // Por padrão, oculta botão de adicionar material
  if (addMaterialBtn) addMaterialBtn.style.display = "none";
  
  actionsContainer.innerHTML = "";
  
  if (os.status === 'Finalizada') {
    actionsContainer.innerHTML = `
      <button class="btn btn-success" onclick="abrirEImprimirRelatorio('${os.id}')" style="width: 100%;">
        <i data-lucide="printer"></i> Visualizar & Imprimir Relatório PDF / QR
      </button>
    `;
    lucide.createIcons();
    return;
  }
  
  if (os.status === 'Cancelada' || os.status === 'Rejeitada por Diretor') {
    if (os.status === 'Rejeitada por Diretor') {
      actionsContainer.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: var(--radius-sm); font-size: 12px; color: var(--status-cancelada);">
          <strong>Materiais Rejeitados por Diretoria:</strong><br>
          ${os.motivo_rejeicao || 'Nenhum motivo detalhado.'}
        </div>
      `;
    }
    return;
  }
  
  // ======== ROLE: DIRETOR (APROVAÇÃO DE MATERIAIS) ========
  if (currentUser.role === 'diretor') {
    if (os.materiais && os.materiais.length > 0 && os.material_aprovado === null) {
      actionsContainer.innerHTML += `
        <div style="display: flex; gap: 10px; margin-bottom: 8px;">
          <button class="btn btn-success" style="flex: 1;" onclick="diretorAprovarOS('${os.id}')">
            <i data-lucide="check"></i> Aprovar Materiais
          </button>
          <button class="btn btn-secondary" style="flex: 1; color: var(--status-cancelada); border-color: rgba(239, 68, 68, 0.2);" onclick="diretorRejeitarOS('${os.id}')">
            <i data-lucide="x"></i> Rejeitar Materiais
          </button>
        </div>
      `;
    }
  }
  
  // ======== ROLE: TI OU DIRETOR (ACESSO ADMIN TOTAL) ========
  if (currentUser.role === 'ti' || currentUser.role === 'diretor') {
    if (os.status === 'Aberta' || os.status === 'Em andamento') {
      if (addMaterialBtn) addMaterialBtn.style.display = "block"; // Permite adicionar materiais
      
      let adminButtons = "";
      if (os.status === 'Aberta') {
        adminButtons += `
          <button class="btn" onclick="iniciarAtendimentoOS('${os.id}')" style="width: 100%; margin-bottom: 8px;">
            <i data-lucide="play"></i> Mudar Status para 'Em Andamento'
          </button>
        `;
      }
      
      adminButtons += `
        <button class="btn btn-success" onclick="finalizarOS('${os.id}')" style="width: 100%; margin-bottom: 8px;">
          <i data-lucide="check-square"></i> Finalizar Ordem de Serviço
        </button>
        <button class="btn btn-secondary" onclick="cancelarOS('${os.id}')" style="color: var(--status-cancelada); border-color: rgba(239, 68, 68, 0.2); width: 100%;">
          <i data-lucide="x-circle"></i> Cancelar Ordem de Serviço
        </button>
      `;
      
      actionsContainer.innerHTML += `
        <div style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          ${adminButtons}
        </div>
      `;
    }
  } else if (currentUser.role === 'usuario') {
    if ((os.status === 'Aberta' || os.status === 'Em andamento') && (String(os.criado_por) === String(currentUser.uid || currentUser.id))) {
      actionsContainer.innerHTML += `
        <div style="margin-top: 12px; border-top: 1px solid var(--border-color); padding-top: 12px;">
          <button class="btn btn-secondary" onclick="cancelarOS('${os.id}')" style="color: var(--status-cancelada); border-color: rgba(239, 68, 68, 0.2); width: 100%;">
            <i data-lucide="x-circle"></i> Cancelar Minha Solicitação
          </button>
        </div>
      `;
    }
  }
  
  lucide.createIcons();
}

// ACOES DE TRANSIÇÃO DE STATUS DA OS
function iniciarAtendimentoOS(osId) {
  const currentUserId = currentUser.uid || currentUser.id;
  const updates = {
    status: "Em andamento",
    tecnico_responsavel: currentUserId,
    usuarios_envolvidos: [currentUserId]
  };
  
  const os = AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Iniciou atendimento da OS", currentUserId, osId, `Técnico ${currentUser.nome} iniciou o atendimento técnico da OS #${osId}`);
  if (os.criado_por) {
    AppDatabase.criarNotificacao(os.criado_por, `O Técnico ${currentUser.nome} iniciou o atendimento de sua OS #${osId}.`);
  }
  
  abrirOSDetails(osId);
  
  // Se for a tela de listagem de OS, atualiza ela ao fundo
  if (currentRoute === 'os' || currentRoute === 'dashboard') navegarPara(currentRoute);
}

function abrirAdicionarMaterial() {
  // Configura inputs
  const osIdInput = document.getElementById("material-os-id");
  if (osIdInput) osIdInput.value = selectedOSId;
  
  // Carrega opções de estoque
  const estoqueList = AppDatabase.getCollection("estoque");
  const materialSelect = document.getElementById("material-select");
  
  if (materialSelect) {
    materialSelect.innerHTML = `
      <option value="">-- Selecione o Material --</option>
      ${estoqueList.map(e => e ? `<option value="${e.id}">${e.nome_material || 'Sem Nome'} (Qtd Disp: ${e.quantidade_atual ?? 0})</option>` : '').join("")}
      <option value="custom">-- Adicionar Outro Material (Fora do Estoque) --</option>
    `;
  }
  
  abrirModal("modal-adicionar-material");
}

function atualizarPrecoUnitarioMaterial(val) {
  const customGroup = document.getElementById("material-custom-group");
  const priceInput = document.getElementById("material-valor-unitario");
  
  if (!priceInput) return;
  
  if (val === "custom") {
    if (customGroup) customGroup.style.display = "block";
    priceInput.value = "0.00";
    priceInput.readOnly = false;
  } else if (val === "") {
    if (customGroup) customGroup.style.display = "none";
    priceInput.value = "0.00";
  } else {
    if (customGroup) customGroup.style.display = "none";
    const material = AppDatabase.getDoc("estoque", val, "id");
    if (material) {
      priceInput.value = material.valor_unitario.toFixed(2);
      priceInput.readOnly = true; // Mantém travado com o preço do estoque
    }
  }
  calcularValorTotalMaterial();
}

function calcularValorTotalMaterial() {
  const qty = parseInt(document.getElementById("material-quantidade").value) || 0;
  const price = parseFloat(document.getElementById("material-valor-unitario").value) || 0;
  const totalEl = document.getElementById("material-valor-total");
  
  if (totalEl) {
    totalEl.textContent = `R$ ${(qty * price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }
}

function adicionarMaterialOS(e) {
  e.preventDefault();
  
  const osId = document.getElementById("material-os-id").value;
  const materialSelectVal = document.getElementById("material-select").value;
  const qty = parseInt(document.getElementById("material-quantidade").value);
  const price = parseFloat(document.getElementById("material-valor-unitario").value);
  
  let nomeMaterial = "";
  let itemEstoque = null;
  
  if (materialSelectVal === "custom") {
    nomeMaterial = document.getElementById("material-nome-custom").value;
  } else {
    itemEstoque = AppDatabase.getDoc("estoque", materialSelectVal, "id");
    nomeMaterial = itemEstoque ? itemEstoque.nome_material : "";
    
    // Validação de estoque para técnicos
    if (itemEstoque && qty > itemEstoque.quantidade_atual) {
      alert(`Quantidade insuficiente no estoque! Quantidade disponível: ${itemEstoque.quantidade_atual}`);
      return;
    }
  }
  
  const os = AppDatabase.getDoc("os", osId, "id");
  if (!os) return;
  
  // Abate estoque imediatamente se for item do estoque
  if (itemEstoque) {
    const novaQtd = Math.max(0, itemEstoque.quantidade_atual - qty);
    AppDatabase.updateDoc("estoque", itemEstoque.id, { quantidade_atual: novaQtd }, "id");
    
    // Registra movimentação de estoque imediatamente
    AppDatabase.insertDoc("movimentacoes_estoque", {
      id: "mov_" + Math.random().toString(36).substr(2, 9),
      nome_material: nomeMaterial,
      quantidade: qty,
      tipo: "saida",
      data: new Date().toISOString(),
      os_id: osId
    });
    
    // Se o estoque ficou crítico, notifica técnicos
    if (novaQtd <= itemEstoque.estoque_minimo) {
      const tecnicos = AppDatabase.getCollection("users").filter(u => u.role === 'ti');
      tecnicos.forEach(t => {
        AppDatabase.criarNotificacao(t.uid, `ALERTA: O material '${nomeMaterial}' atingiu o estoque mínimo crítico!`);
      });
    }
  }
  
  const novoMaterial = {
    nome_material: nomeMaterial,
    quantidade: qty,
    valor_unitario: price,
    valor_total: qty * price
  };
  
  const novosMateriais = [...(os.materiais || []), novoMaterial];
  const novoCustoTotal = novosMateriais.reduce((acc, cur) => acc + cur.valor_total, 0);
  
  // Atualiza a OS com os materiais e mantém o status atual (não vai para aprovação)
  const updates = {
    materiais: novosMateriais,
    custo_total_materiais: novoCustoTotal
  };
  
  const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
  AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Adicionou materiais usados na OS", currentUserId, osId, `Adicionou ${quantidade}x ${nomeMaterial} (R$ ${(quantidade * valorUnitario).toFixed(2)}) à OS #${osId}`);
  
  fecharModal("modal-adicionar-material");
  abrirOSDetails(osId);
  
  if (currentRoute === 'os' || currentRoute === 'dashboard') navegarPara(currentRoute);
}

// DIRETOR APROVA MATERIAIS
function diretorAprovarOS(osId) {
  const os = AppDatabase.getDoc("os", osId, "id");
  if (!os) return;
  
  const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
  // Abater estoques dos materiais cadastrados
  const estoqueList = AppDatabase.getCollection("estoque");
  
  os.materiais.forEach(m => {
    // Procura por nome equivalente no estoque
    const item = estoqueList.find(e => e.nome_material === m.nome_material);
    if (item) {
      const novaQtd = Math.max(0, item.quantidade_atual - m.quantidade);
      AppDatabase.updateDoc("estoque", item.id, { quantidade_atual: novaQtd }, "id");
      
      // Registra movimentação de estoque
      AppDatabase.insertDoc("movimentacoes_estoque", {
        id: "mov_" + Math.random().toString(36).substr(2, 9),
        nome_material: m.nome_material,
        quantidade: m.quantidade,
        tipo: "saida",
        data: new Date().toISOString(),
        os_id: osId
      });
      
      // Se estoque ficou crítico, notifica técnicos
      if (novaQtd <= item.estoque_minimo) {
        const tecnicos = AppDatabase.getCollection("users").filter(u => u.role === 'ti');
        tecnicos.forEach(t => {
          AppDatabase.criarNotificacao(t.uid, `ALERTA: O material '${m.nome_material}' atingiu o estoque mínimo crítico!`);
        });
      }
    }
  });
  
  const updates = {
    status: "Em andamento",
    material_aprovado: true
  };
  
  AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Aprovou materiais da OS", currentUserId, osId, `Diretor ${currentUser.nome} aprovou os materiais da OS #${osId}`);
  
  // Notifica técnico responsável
  if (os.tecnico_responsavel) {
    AppDatabase.criarNotificacao(os.tecnico_responsavel, `O Diretor aprovou os materiais da OS #${osId}. Pode dar andamento.`);
  }
  
  abrirOSDetails(osId);
  navegarPara(currentRoute);
}

// DIRETOR REJEITA MATERIAIS
function diretorRejeitarOS(osId) {
  document.getElementById("rejeitar-os-id").value = osId;
  abrirModal("modal-rejeitar-material");
}

function confirmarRejeicaoMaterial(e) {
  e.preventDefault();
  
  const osId = document.getElementById("rejeitar-os-id").value;
  const motivo = document.getElementById("rejeitar-motivo").value;
  
  const os = AppDatabase.getDoc("os", osId, "id");
  if (!os) return;
  
  const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
  const updates = {
    status: "Rejeitada por Diretor",
    material_aprovado: false,
    motivo_rejeicao: motivo
  };
  
  AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Rejeitou materiais da OS", currentUserId, osId, `Diretor ${currentUser.nome} rejeitou materiais da OS #${osId}. Motivo: ${motivo}`);
  
  // Notifica técnico responsável
  if (os.tecnico_responsavel) {
    AppDatabase.criarNotificacao(os.tecnico_responsavel, `ATENÇÃO: Materiais da OS #${osId} foram rejeitados. Motivo: ${motivo}`);
  }
  
  fecharModal("modal-rejeitar-material");
  abrirOSDetails(osId);
  navegarPara(currentRoute);
}

// FINALIZAR OS
function finalizarOS(osId) {
  const confirmacao = confirm("Deseja realmente finalizar esta Ordem de Serviço? Isso gerará o PDF e QR Code técnico.");
  if (!confirmacao) return;
  
  const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
  const updates = {
    status: "Finalizada",
    data_finalizacao: new Date().toISOString()
  };
  
  const os = AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Finalizou a OS", currentUserId, osId, `OS #${osId} finalizada e concluída por ${currentUser.nome}`);
  if (os.criado_por) {
    AppDatabase.criarNotificacao(os.criado_por, `Sua Ordem de Serviço #${osId} foi finalizada com sucesso! Relatório técnico já disponível.`);
  }
  
  abrirOSDetails(osId);
  navegarPara(currentRoute);
}

// CANCELAR OS
function cancelarOS(osId) {
  const confirmacao = confirm("Deseja realmente cancelar esta Ordem de Serviço?");
  if (!confirmacao) return;
  
  const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
  const updates = {
    status: "Cancelada",
    data_finalizacao: new Date().toISOString()
  };
  
  const os = AppDatabase.updateDoc("os", osId, updates, "id");
  AppDatabase.registrarLog("Cancelou a OS", currentUserId, osId, `OS #${osId} cancelada por ${currentUser.nome}`);
  if (os.criado_por) {
    AppDatabase.criarNotificacao(os.criado_por, `Sua Ordem de Serviço #${osId} foi cancelada.`);
  }
  
  abrirOSDetails(osId);
  navegarPara(currentRoute);
}

// ================= SISTEMA DE CHAT SIMULADO EM TEMPO REAL =================

function renderChatMessages(os, forceScroll = false) {
  const container = document.getElementById("chat-messages-list");
  const chatForm = document.getElementById("form-chat-send");
  if (!container) return;

  // Todos os técnicos, diretores e usuários envolvidos têm acesso direto ao chat
  if (chatForm) {
    chatForm.style.display = "flex";
  }
  
  if (!os.mensagens || os.mensagens.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--text-muted); font-size: 11px; padding: 20px 0;">Envie uma mensagem ou foto para iniciar a conversa.</div>`;
    container.removeAttribute("data-msg-count");
    return;
  }
  
  const currentCount = os.mensagens.length;
  const hasNewMessages = container.getAttribute("data-msg-count") !== String(currentCount);
  container.setAttribute("data-msg-count", currentCount);
  
  const users = AppDatabase.getCollection("users");
  
  container.innerHTML = os.mensagens.map(m => {
    const userObj = users.find(u => u.uid === m.enviado_por);
    const userName = userObj ? userObj.nome : "Desconhecido";
    const sentByMe = m.enviado_por === currentUser.uid;
    const dataF = new Date(m.data_envio).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    let midiaHTML = "";
    if (m.tipo_midia === "foto") {
      midiaHTML = `<div class="chat-media-preview"><img src="${m.midia_url}" onclick="abrirVisualizadorImagem(this.src)" style="cursor: zoom-in;"></div>`;
    } else if (m.tipo_midia === "video") {
      midiaHTML = `<div class="chat-media-preview"><video src="${m.midia_url}" controls></video></div>`;
    }
    
    return `
      <div class="chat-bubble ${sentByMe ? 'sent' : 'received'}">
        <span style="font-weight: 700; font-size: 10px; display: block; margin-bottom: 2px;">${userName}</span>
        <div>${m.mensagem_texto}</div>
        ${midiaHTML}
        <div class="chat-bubble-meta">
          <span>${dataF}</span>
        </div>
      </div>
    `;
  }).join("");
  
  // Só rola se houver novas mensagens ou se for rolagem forçada (como ao enviar ou abrir o chat)
  if (hasNewMessages || forceScroll) {
    container.scrollTop = container.scrollHeight;
  }
}

function abrirVisualizadorImagem(src) {
  const modal = document.getElementById("modal-visualizador-imagem");
  const img = document.getElementById("img-visualizador");
  if (modal && img) {
    img.src = src;
    modal.classList.add("active");
  }
}

function selecionarAnexoChat(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(evt) {
    chatAnexoBase64 = evt.target.result;
    chatAnexoTipo = file.type.startsWith("image/") ? "foto" : "video";
    
    const bar = document.getElementById("chat-upload-bar");
    const filenameEl = document.getElementById("chat-upload-filename");
    if (bar && filenameEl) {
      filenameEl.textContent = `Anexo: ${file.name.slice(0, 20)}...`;
      bar.style.display = "flex";
    }
  };
  reader.readAsDataURL(file);
}

function cancelarAnexoChat() {
  chatAnexoBase64 = "";
  chatAnexoTipo = "nenhum";
  document.getElementById("chat-file-input").value = "";
  
  const bar = document.getElementById("chat-upload-bar");
  if (bar) bar.style.display = "none";
}

function enviarMensagemChat(e) {
  e.preventDefault();
  
  const textInput = document.getElementById("chat-input-text");
  if (!textInput || !selectedOSId) return;
  
  const txt = textInput.value.trim();
  if (txt === "" && chatAnexoBase64 === "") return;
  
  const os = AppDatabase.getDoc("os", selectedOSId, "id");
  if (!os) return;
  
  const novaMsg = {
    mensagem_texto: txt,
    midia_url: chatAnexoBase64,
    tipo_midia: chatAnexoTipo,
    enviado_por: currentUser.uid || currentUser.id,
    data_envio: new Date().toISOString()
  };
  
  const novasMsg = [...(os.mensagens || []), novaMsg];
  AppDatabase.updateDoc("os", selectedOSId, { mensagens: novasMsg }, "id");
  
  // Limpar campos
  textInput.value = "";
  cancelarAnexoChat();
  
  // Re-renderizar mensagens com rolagem forçada
  const osAtualizada = AppDatabase.getDoc("os", selectedOSId, "id");
  renderChatMessages(osAtualizada, true);
  
  // Notificar outros envolvidos
  const targetUserId = currentUser.role === 'usuario' ? os.tecnico_responsavel : os.criado_por;
  if (targetUserId) {
    AppDatabase.criarNotificacao(targetUserId, `Nova mensagem no chat da OS #${os.id}: ${txt.slice(0, 30)}...`);
  }
}

// ================= CENTRAL DE NOTIFICAÇÕES =================

function toggleNotificacoes(event) {
  event.stopPropagation();
  const panel = document.getElementById("notification-panel");
  if (panel) {
    panel.classList.toggle("active");
    if (panel.classList.contains("active")) {
      renderNotificacoesList();
    }
  }
}

function atualizarContadorNotificacoes() {
  const notifCount = document.getElementById("notif-count");
  if (!notifCount || !currentUser) return;
  
  const unreadList = AppDatabase.getCollection("notificacoes").filter(n => n.user_id === currentUser.uid && !n.lida);
  notifCount.textContent = unreadList.length;
  notifCount.style.display = unreadList.length > 0 ? "flex" : "none";
}

function renderNotificacoesList() {
  const container = document.getElementById("notif-list");
  if (!container || !currentUser) return;
  
  const list = AppDatabase.getCollection("notificacoes")
                 .filter(n => n.user_id === currentUser.uid)
                 .sort((a,b) => new Date(b.data) - new Date(a.data));
                 
  if (list.length === 0) {
    container.innerHTML = `<div class="notif-empty">Nenhuma notificação por aqui.</div>`;
    return;
  }
  
  container.innerHTML = list.map(n => {
    const dataF = new Date(n.data).toLocaleDateString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `
      <div class="notif-item ${n.lida ? '' : 'unread'}" onclick="marcarLida('${n.id}')">
        <div class="notif-item-text">${n.mensagem}</div>
        <div class="notif-item-time">${dataF}</div>
      </div>
    `;
  }).join("");
}

function marcarLida(id) {
  AppDatabase.updateDoc("notificacoes", id, { lida: true }, "id");
  atualizarContadorNotificacoes();
  renderNotificacoesList();
}

function marcarTodasLidas() {
  if (!currentUser) return;
  const list = AppDatabase.getCollection("notificacoes").filter(n => n.user_id === currentUser.uid);
  list.forEach(n => {
    AppDatabase.updateDoc("notificacoes", n.id, { lida: true }, "id");
  });
  atualizarContadorNotificacoes();
  renderNotificacoesList();
}

// ================= GERAÇÃO DE USUÁRIOS E EXCLUSÃO SIMULADA =================

async function criarNovoUsuario(e) {
  e.preventDefault();
  
  const nome = document.getElementById("user-new-nome").value.trim();
  const usuario = document.getElementById("user-new-usuario").value.trim();
  const emailInp = document.getElementById("user-new-email");
  const email = emailInp && emailInp.value.trim() ? emailInp.value.trim() : `${usuario.toLowerCase().replace(/\s+/g, '')}@empresa.com`;
  const cargo = document.getElementById("user-new-cargo").value;
  const loja = document.getElementById("user-new-loja").value || null;
  const checkedBoxes = Array.from(document.querySelectorAll("input[name='user-new-tipos-equipamentos_item']:checked")).map(cb => cb.value);
  
  const cargoObj = CARGOS.find(c => c.cargo === cargo);
  const role = cargoObj ? cargoObj.role : 'usuario';
  
  if (currentUser && currentUser.role === 'ti' && role !== 'usuario') {
    alert("Erro: Técnicos de TI só podem cadastrar Funcionários Comum.");
    return;
  }
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Cadastrando...";
  }
  
  try {
    let uid = "usr_" + Math.random().toString(36).substr(2, 9);
    const currentUserId = currentUser ? (currentUser.uid || currentUser.id) : null;
    
    // Tenta cadastrar na API de Auth do Supabase se ela estiver acessível
    try {
      const { data, error } = await AppDatabase.supabase.auth.signUp({
        email: email,
        password: "empresa123",
        options: {
          data: {
            nome: nome,
            role: role,
            cargo: cargo,
            loja: loja,
            usuario: usuario
          }
        }
      });
      if (data && data.user) {
        uid = data.user.id;
      }
      if (currentUserId) {
        await AppDatabase.login(currentUserId);
      }
    } catch (authErr) {
      console.warn("Supabase Auth signUp ignorado ou não configurado:", authErr.message);
    }
    
    const newUser = {
      uid: uid,
      id: uid,
      nome: nome,
      usuario: usuario,
      senha: "empresa123",
      email: email,
      role: role,
      cargo: cargo,
      loja: loja,
      tipos_equipamentos: checkedBoxes,
      ativo: true,
      created_at: new Date().toISOString()
    };
    
    AppDatabase.insertDoc("users", newUser);
    if (currentUserId) {
      AppDatabase.registrarAuditLog(currentUserId, "usuario_criado", `Criou o usuário "${nome}" (@${usuario}) com cargo ${cargo}${loja ? ' para a loja ' + loja : ''}`);
      AppDatabase.registrarLog(`Criou usuário: ${nome} (${cargo})${loja ? ' para a loja ' + loja : ''}`, currentUserId);
    }
    
    fecharModal("modal-criar-usuario");
    document.getElementById("form-criar-usuario").reset();
    
    alert("Usuário cadastrado com sucesso!");
    navegarPara("usuarios");
  } catch (err) {
    console.error("Erro geral no cadastro do usuário:", err);
    alert("Erro ao cadastrar usuário: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Cadastrar Usuário";
    }
  }
}

function excluirUsuarioSimulado(uid) {
  const user = AppDatabase.getDoc("users", uid, "uid") || AppDatabase.getDoc("users", uid, "id");
  if (!user) return;
  
  const targetId = user.id || user.uid || uid;
  const currentId = currentUser ? (currentUser.id || currentUser.uid) : null;
  if (currentId && (targetId === currentId || user.usuario === currentUser.usuario)) {
    alert("Erro: Você não pode excluir sua própria conta de usuário logada.");
    return;
  }

  if (currentUser && currentUser.role === 'ti' && user.role !== 'usuario') {
    alert("Erro: Técnicos de TI só podem remover Funcionários Comum.");
    return;
  }
  
  const confirmacao = confirm(`Deseja realmente excluir o usuário ${user.nome} (@${user.usuario}) do sistema?`);
  if (!confirmacao) return;
  
  AppDatabase.deleteDoc("users", targetId);
  if (currentUser) {
    AppDatabase.registrarAuditLog(currentUser.uid || currentUser.id, "usuario_excluido", `Excluiu o usuário "${user.nome}" (@${user.usuario})`);
    AppDatabase.registrarLog(`Excluiu usuário: ${user.nome} (@${user.usuario})`, currentUser.uid || currentUser.id);
  }
  
  alert(`Usuário ${user.nome} excluído com sucesso!`);
  renderUsuarios();
}

function abrirEditarUsuario(uid) {
  const user = AppDatabase.getDoc("users", uid, "uid") || AppDatabase.getDoc("users", uid, "id");
  if (!user) return;
  
  if (currentUser && currentUser.role === 'ti' && user.role !== 'usuario') {
    alert("Erro: Técnicos de TI só podem editar Funcionários Comum.");
    return;
  }
  
  // Preenche os inputs do formulário
  document.getElementById("user-edit-uid").value = user.uid || user.id;
  document.getElementById("user-edit-nome").value = user.nome;
  document.getElementById("user-edit-usuario").value = user.usuario;
  const userEditEmailEl = document.getElementById("user-edit-email");
  if (userEditEmailEl) userEditEmailEl.value = user.email || "";
  document.getElementById("user-edit-status").value = String(user.ativo);
  
  // Popular cargos no select de editar
  const cargoSelect = document.getElementById("user-edit-cargo");
  if (cargoSelect) {
    let filteredCargos = CARGOS;
    if (currentUser && currentUser.role === 'ti') {
      filteredCargos = CARGOS.filter(c => c.role === 'usuario');
    }
    cargoSelect.innerHTML = filteredCargos.map(c => `
      <option value="${c.cargo}">${c.cargo}</option>
    `).join("");
    cargoSelect.value = user.cargo || "";
  }
  
  // Popular lojas no select de editar
  const lojaSelect = document.getElementById("user-edit-loja");
  if (lojaSelect) {
    const lojas = AppDatabase.getCollection("lojas") || [];
    const optionsHTML = lojas.map(l => `<option value="${l.nome}">${l.nome}</option>`).join("");
    lojaSelect.innerHTML = `<option value="">Nenhuma (Corporativo / TI)</option>` + optionsHTML;
    lojaSelect.value = user.loja || "";
  }
  
  // Popular tipos de equipamentos vinculados
  const userTipos = user.tipos_equipamentos || SUGESTOES_EQUIPAMENTOS_POR_CARGO[user.cargo] || ["Computador/PC", "Monitor", "Teclado", "Mouse"];
  renderCheckboxesTiposEquipamentos("user-edit-tipos-equipamentos", userTipos);
  
  abrirModal("modal-editar-usuario");
}

async function salvarEdicaoUsuario(e) {
  e.preventDefault();
  
  const uid = document.getElementById("user-edit-uid").value;
  const nome = document.getElementById("user-edit-nome").value.trim();
  const usuario = document.getElementById("user-edit-usuario").value.trim();
  const emailInp = document.getElementById("user-edit-email");
  const email = emailInp && emailInp.value.trim() ? emailInp.value.trim() : `${usuario.toLowerCase().replace(/\s+/g, '')}@empresa.com`;
  const cargo = document.getElementById("user-edit-cargo").value;
  const loja = document.getElementById("user-edit-loja").value || null;
  const ativo = document.getElementById("user-edit-status").value === "true";
  const checkedBoxes = Array.from(document.querySelectorAll("input[name='user-edit-tipos-equipamentos_item']:checked")).map(cb => cb.value);
  
  const user = AppDatabase.getDoc("users", uid, "uid") || AppDatabase.getDoc("users", uid, "id");
  if (!user) return;
  
  const cargoObj = CARGOS.find(c => c.cargo === cargo);
  const role = cargoObj ? cargoObj.role : 'usuario';
  
  if (currentUser && currentUser.role === 'ti' && role !== 'usuario') {
    alert("Erro: Técnicos de TI só podem salvar alterações de Funcionários Comum.");
    return;
  }
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Salvando...";
  }
  
  try {
    // Atualiza no cache local e persiste no Supabase public.users
    const updates = {
      nome: nome,
      usuario: usuario,
      email: email,
      role: role,
      cargo: cargo,
      loja: loja,
      tipos_equipamentos: checkedBoxes,
      ativo: ativo
    };
    
    AppDatabase.updateDoc("users", user.uid || user.id, updates);
    if (currentUser) {
      AppDatabase.registrarAuditLog(currentUser.uid || currentUser.id, "usuario_editado", `Editou o usuário "${nome}" (@${usuario}) - Cargo: ${cargo}, Status: ${ativo ? 'Ativo' : 'Inativo'}`);
      AppDatabase.registrarLog(`Editou usuário: ${nome} (${cargo})${loja ? ' para a loja ' + loja : ''} - Status: ${ativo ? 'Ativo' : 'Inativo'}`, currentUser.uid || currentUser.id);
    }
    
    fecharModal("modal-editar-usuario");
    alert("Usuário atualizado com sucesso!");
    navegarPara("usuarios");
  } catch (err) {
    console.error("Erro geral ao editar o usuário:", err);
    alert("Erro ao editar usuário: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Salvar Alterações";
    }
  }
}

// ================= IMPRESSÃO DO RELATÓRIO PDF & QR CODE =================

function abrirEImprimirRelatorio(osId) {
  const os = AppDatabase.getDoc("os", osId, "id");
  if (!os) return;
  
  const criador = AppDatabase.getDoc("users", os.criado_por, "uid");
  const tecnico = AppDatabase.getDoc("users", os.tecnico_responsavel, "uid");
  
  // Preenche dados no template de impressão
  document.getElementById("print-os-id").textContent = os.id;
  document.getElementById("print-data-emissao").textContent = `Emissão: ${new Date().toLocaleDateString('pt-BR')}`;
  
  document.getElementById("print-titulo").textContent = os.titulo;
  document.getElementById("print-loja").textContent = os.loja_unidade;
  document.getElementById("print-equipamento").textContent = os.equipamento;
  document.getElementById("print-prioridade").textContent = os.prioridade;
  document.getElementById("print-criado-por").textContent = criador ? criador.nome : "Desconhecido";
  document.getElementById("print-tecnico").textContent = tecnico ? tecnico.nome : "Não atribuído";
  
  document.getElementById("print-data-abertura").textContent = new Date(os.data_criacao).toLocaleString('pt-BR');
  document.getElementById("print-data-finalizacao").textContent = os.data_finalizacao ? new Date(os.data_finalizacao).toLocaleString('pt-BR') : "--";
  
  document.getElementById("print-descricao").textContent = os.descricao;
  
  // Tabela de materiais
  const tbody = document.getElementById("print-materials-rows");
  if (tbody) {
    if (!os.materiais || os.materiais.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #555;">Nenhum componente ou material aplicado.</td></tr>`;
    } else {
      tbody.innerHTML = os.materiais.map(m => `
        <tr>
          <td>${m.nome_material}</td>
          <td style="text-align: center;">${m.quantidade}</td>
          <td style="text-align: right;">R$ ${m.valor_unitario.toFixed(2)}</td>
          <td style="text-align: right;">R$ ${m.valor_total.toFixed(2)}</td>
        </tr>
      `).join("");
    }
  }
  
  const totalCusto = os.materiais ? os.materiais.reduce((acc, c) => acc + c.valor_total, 0) : 0;
  document.getElementById("print-valor-total").textContent = `R$ ${totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  
  // Rodapé e assinaturas
  document.getElementById("print-signature-tecnico").innerHTML = `${tecnico ? tecnico.nome : 'Sem técnico'}<br>Assinatura do Técnico`;
  
  // Limpa e desenha o QR Code
  const qrContainer = document.getElementById("print-qrcode");
  if (qrContainer) {
    qrContainer.innerHTML = "";
    
    // Simula a URL criptografada de autenticação da OS no nosso QR
    const qrUrl = `https://portal-ti.empresa.com/auditar-os?id=${os.id}`;
    
    try {
      new QRCode(qrContainer, {
        text: qrUrl,
        width: 110,
        height: 110,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
      });
    } catch(err) {
      // Se por algum motivo o QRCodeJS CDN falhar, renderiza um canvas desenhado simulando o QR
      qrContainer.innerHTML = `<div style="font-size: 8px; color: #888; text-align: center; border: 1px dashed #000; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center;">[QR CODE MOCK]<br>${os.id}</div>`;
    }
  }
  
  // Abre o prompt de impressão nativa do navegador
  setTimeout(() => {
    window.print();
  }, 500);
}

// ================= CONTROLE DE ESTOQUE ADICIONAL =================

async function excluirMaterialEstoque(id, nomeMaterial) {
  if (!confirm(`Tem certeza de que deseja excluir o material "${nomeMaterial}" do estoque?`)) {
    return;
  }
  
  try {
    AppDatabase.deleteDoc("estoque", id);
    AppDatabase.registrarLog(`Excluiu material do estoque: ${nomeMaterial}`, currentUser.uid);
    AppDatabase.registrarAuditLog(currentUser.uid, "excluir_estoque", `Excluiu o material "${nomeMaterial}" do inventário`);
    
    alert(`Material "${nomeMaterial}" excluído com sucesso!`);
    renderEstoque();
  } catch (error) {
    console.error("Erro ao excluir material do estoque:", error);
    alert("Erro ao excluir: " + error.message);
  }
}

function abrirModalAdicionarEstoque() {
  const select = document.getElementById("estoque-item-select");
  if (select) {
    const estoqueList = AppDatabase.getCollection("estoque");
    select.innerHTML = `
      <option value="">-- Selecione o Item --</option>
      ${estoqueList.map(e => `<option value="${e.id}">${e.nome_material} (Qtd Atual: ${e.quantidade_atual})</option>`).join("")}
    `;
  }
  
  // Reseta campos do modal
  document.getElementById("form-adicionar-estoque").reset();
  alternarTipoCadastroEstoque("existente");
  
  abrirModal("modal-adicionar-estoque");
}

function alternarTipoCadastroEstoque(tipo) {
  const grupoExistente = document.getElementById("estoque-grupo-existente");
  const grupoNovo = document.getElementById("estoque-grupo-novo");
  
  const selectItem = document.getElementById("estoque-item-select");
  const inputNome = document.getElementById("estoque-novo-nome");
  const inputPreco = document.getElementById("estoque-novo-preco");
  const inputMinimo = document.getElementById("estoque-novo-minimo");
  
  if (tipo === "existente") {
    if (grupoExistente) grupoExistente.style.display = "block";
    if (grupoNovo) grupoNovo.style.display = "none";
    if (selectItem) selectItem.required = true;
    if (inputNome) inputNome.required = false;
    if (inputPreco) inputPreco.required = false;
    if (inputMinimo) inputMinimo.required = false;
  } else {
    if (grupoExistente) grupoExistente.style.display = "none";
    if (grupoNovo) grupoNovo.style.display = "block";
    if (selectItem) selectItem.required = false;
    if (inputNome) inputNome.required = true;
    if (inputPreco) inputPreco.required = true;
    if (inputMinimo) inputMinimo.required = true;
  }
}

function adicionarEstoqueItem(e) {
  e.preventDefault();
  
  const tipo = document.getElementById("estoque-tipo-cadastro").value;
  const qty = parseInt(document.getElementById("estoque-quantidade-adicionar").value);
  
  let nomeMaterial = "";
  let itemId = "";
  
  if (tipo === "existente") {
    itemId = document.getElementById("estoque-item-select").value;
    if (!itemId) {
      alert("Selecione um item do estoque!");
      return;
    }
    const item = AppDatabase.getDoc("estoque", itemId, "id");
    if (item) {
      nomeMaterial = item.nome_material;
      const novaQtd = item.quantidade_atual + qty;
      AppDatabase.updateDoc("estoque", itemId, { quantidade_atual: novaQtd }, "id");
    }
  } else {
    // Cadastrar Novo Produto
    nomeMaterial = document.getElementById("estoque-novo-nome").value;
    const price = parseFloat(document.getElementById("estoque-novo-preco").value);
    const minQty = parseInt(document.getElementById("estoque-novo-minimo").value);
    
    itemId = "est_" + Math.random().toString(36).substr(2, 9);
    
    const novoItem = {
      id: itemId,
      nome_material: nomeMaterial,
      quantidade_atual: qty,
      estoque_minimo: minQty,
      valor_unitario: price
    };
    
    AppDatabase.insertDoc("estoque", novoItem);
  }
  
  // Registrar log de movimentação de entrada
  AppDatabase.insertDoc("movimentacoes_estoque", {
    id: "mov_" + Math.random().toString(36).substr(2, 9),
    nome_material: nomeMaterial,
    quantidade: qty,
    tipo: "entrada",
    data: new Date().toISOString(),
    os_id: ""
  });
  
  AppDatabase.registrarLog(`Entrada de estoque: +${qty} ${nomeMaterial}`, currentUser.uid);
  
  fecharModal("modal-adicionar-estoque");
  alert(`Entrada de estoque realizada com sucesso!`);
  
  // Re-renderiza a tela
  navegarPara("estoque");
}


// ================= CONTROLES DE SEGURANÇA E PROTEÇÃO CONTRA FORÇA BRUTA/BOTS =================
let clientFingerprint = {
  ip: "127.0.0.1",
  navegador: "Desconhecido",
  dispositivo: "Desktop"
};

// Coleta informações básicas de fingerprint (assíncrono)
async function carregarFingerprint() {
  const ua = navigator.userAgent;
  let browser = "Outro";
  if (ua.indexOf("Firefox") > -1) browser = "Firefox";
  else if (ua.indexOf("SamsungBrowser") > -1) browser = "Samsung Browser";
  else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) browser = "Opera";
  else if (ua.indexOf("Trident") > -1) browser = "Internet Explorer";
  else if (ua.indexOf("Edge") > -1) browser = "Microsoft Edge";
  else if (ua.indexOf("Chrome") > -1) browser = "Google Chrome";
  else if (ua.indexOf("Safari") > -1) browser = "Safari";
  clientFingerprint.navegador = browser;

  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  clientFingerprint.dispositivo = isMobile ? "Mobile" : "Desktop";

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch("https://api.ipify.org?format=json", { signal: controller.signal });
    clearTimeout(id);
    const data = await resp.json();
    if (data && data.ip) {
      clientFingerprint.ip = data.ip;
    }
  } catch (e) {
    console.log("Fingerprint: usando IP padrão (local/offline).");
  }
}

// Inicializa fingerprint
carregarFingerprint();

// Análise de Comportamento (Anti-Bot)
let pageLoadTime = Date.now();
let mouseMoved = false;
let keypressed = false;

window.addEventListener("mousemove", () => { mouseMoved = true; }, { once: true });
window.addEventListener("keydown", () => { keypressed = true; }, { once: true });

// Smart Lock (Limite global de 100 logins por minuto por dispositivo)
function verificarSmartLock() {
  const now = Date.now();
  
  const blockUntil = localStorage.getItem("app_os_smartlock_block_until");
  if (blockUntil && parseInt(blockUntil) > now) {
    const remainingMins = Math.ceil((parseInt(blockUntil) - now) / (60 * 1000));
    return { blocked: true, message: `Dispositivo bloqueado devido a excesso de tentativas de login. Tente novamente em ${remainingMins} minutos.` };
  }
  
  let attempts = JSON.parse(localStorage.getItem("app_os_login_attempts") || "[]");
  attempts = attempts.filter(t => now - t < 60 * 1000);
  
  if (attempts.length >= 100) {
    const blockDuration = 60 * 60 * 1000; // 1 hora de bloqueio
    localStorage.setItem("app_os_smartlock_block_until", String(now + blockDuration));
    return { blocked: true, message: "Acesso bloqueado por 1 hora devido a atividade suspeita (múltiplas tentativas de login em curto período)." };
  }
  
  attempts.push(now);
  localStorage.setItem("app_os_login_attempts", JSON.stringify(attempts));
  
  return { blocked: false };
}

// Captcha (Cloudflare Turnstile com fallback local simulado)
let captchaValido = false;

function exibirCaptcha() {
  const container = document.getElementById("login-captcha-container");
  if (!container) return;
  
  if (container.style.display === "flex") return;
  
  container.style.display = "flex";
  container.innerHTML = "";
  
  if (window.turnstile) {
    const div = document.createElement("div");
    div.id = "cf-turnstile-widget";
    container.appendChild(div);
    
    turnstile.render('#cf-turnstile-widget', {
      sitekey: '1x00000000000000000000AA',
      callback: function(token) {
        captchaValido = true;
      }
    });
  } else {
    container.innerHTML = `
      <div class="simulated-captcha" style="display: flex; align-items: center; gap: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-sm); width: 100%; box-sizing: border-box; border-left: 4px solid var(--accent-color);">
        <input type="checkbox" id="simulated-captcha-check" onchange="captchaValido = this.checked" style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--accent-color);">
        <span style="font-size: 13px; color: var(--text-primary); font-weight: 500; user-select: none;">Sou humano (Verificação de segurança)</span>
        <div style="margin-left: auto; display: flex; flex-direction: column; align-items: center; justify-content: center;">
          <span style="font-size: 10px; font-weight: 800; color: var(--accent-color); letter-spacing: 1px; user-select: none;">MEGA</span>
          <span style="font-size: 7px; color: var(--text-muted); font-weight: 500; user-select: none;">SECURITY</span>
        </div>
      </div>
    `;
  }
}


// ================= HANDLERS DE AUTENTICAÇÃO E AUDITORIA =================

async function efetuarLogin(e) {
  e.preventDefault();
  
  const alertError = document.getElementById("login-alert-error");
  const alertSuccess = document.getElementById("login-alert-success");
  if (alertError) alertError.style.display = "none";
  if (alertSuccess) alertSuccess.style.display = "none";
  
  // A. BOT PROTECTION: Honeypot Check
  const honeypotInput = document.getElementById("login-honeypot");
  if (honeypotInput && honeypotInput.value) {
    console.warn("Bot detectado pelo Honeypot!");
    exibirErroLogin("Usuário ou senha inválidos.");
    return;
  }

  // B. BOT PROTECTION: Behavior Analysis
  const timeDiff = Date.now() - pageLoadTime;
  const isBotByBehavior = (timeDiff < 1500) || (!mouseMoved && !keypressed);
  if (isBotByBehavior) {
    console.warn("Atividade suspeita de Bot detectada (tempo muito curto ou sem atividade do usuário)!");
    exibirErroLogin("Acesso suspenso temporariamente. Comportamento de bot detectado.");
    return;
  }

  // C. SMART LOCK: Rate limiting per device (100 attempts / minute)
  const smartLockCheck = verificarSmartLock();
  if (smartLockCheck.blocked) {
    exibirErroLogin(smartLockCheck.message);
    return;
  }

  const usernameInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const lembrarCheckbox = document.getElementById("login-lembrar-usuario");
  
  if (!usernameInput || !passwordInput) return;
  
  const usernameTyped = usernameInput.value.trim();
  const passwordTyped = passwordInput.value.trim();
  
  if (!usernameTyped || !passwordTyped) {
    exibirErroLogin("Por favor, preencha todos os campos obrigatórios.");
    return;
  }
  
  const btnLogin = document.getElementById("btn-login-entrar");
  if (btnLogin) {
    btnLogin.disabled = true;
    btnLogin.innerHTML = `<span>Carregando...</span>`;
  }
  
  try {
    // Sincroniza dados com o Supabase antes de verificar credenciais (se possível)
    try {
      await AppDatabase.load();
    } catch (syncErr) {
      console.warn("Sincronização com o Supabase falhou, usando dados do cache local:", syncErr.message);
    }
    
    // Busca usuário na base local de forma resiliente
    const cleanUsername = usernameTyped.toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-").trim();
    const allUsers = AppDatabase.getCollection("users") || [];
    const user = allUsers.find(u => {
      const uUser = (u.usuario || "").toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-").trim();
      const uEmail = (u.email || "").toLowerCase().trim();
      const uEmailPrefix = uEmail.split("@")[0].replace(/[\u2010-\u2015\u2212]/g, "-").trim();
      const uNome = (u.nome || "").toLowerCase().trim();
      const uId = String(u.id || u.uid || "").toLowerCase();
      return (
        uUser === cleanUsername ||
        uEmail === cleanUsername ||
        uEmailPrefix === cleanUsername ||
        uNome === cleanUsername ||
        uId === cleanUsername
      );
    });
    
    // D. BOT PROTECTION: Captcha Verification
    if (user && (user.tentativas_falhas || 0) >= 5) {
      exibirCaptcha();
      if (!captchaValido) {
        exibirErroLogin("Por favor, confirme que você é humano (resolva o Captcha).");
        if (btnLogin) {
          btnLogin.disabled = false;
          btnLogin.innerHTML = `<span>Entrar</span>`;
        }
        return;
      }
    }

    // E. ANTI-ENUMERATION: Usuário não cadastrado
    if (!user) {
      await AppDatabase.registrarAuditLog(null, "login_falha", `Tentativa de login falhou: Usuário não encontrado para '${usernameTyped}'`);
      exibirErroLogin("Usuário ou senha inválidos.");
      return;
    }
    
    const targetUserId = user.uid || user.id;
    
    if (!user.ativo) {
      await AppDatabase.registrarAuditLog(targetUserId, "login_falha", `Tentativa de login falhou: Conta inativa para '${usernameTyped}'`);
      exibirErroLogin("Sua conta está inativa. Entre em contato com a TI/Diretoria.");
      return;
    }
    
    // F. BRUTE FORCE: Conta temporariamente bloqueada
    if (user.bloqueado_ate && new Date(user.bloqueado_ate) > new Date()) {
      const diffMs = new Date(user.bloqueado_ate) - new Date();
      let tempoTexto = "";
      if (diffMs > 60 * 60 * 1000) {
        const hours = Math.ceil(diffMs / (60 * 60 * 1000));
        tempoTexto = `${hours} horas`;
      } else {
        const mins = Math.ceil(diffMs / (60 * 1000));
        tempoTexto = `${mins} minutos`;
      }
      await AppDatabase.registrarAuditLog(targetUserId, "login_bloqueado", `Tentativa de login bloqueada temporariamente para '${usernameTyped}'`);
      exibirErroLogin(`Sua conta está bloqueada temporariamente. Tente novamente em ${tempoTexto}.`);
      return;
    }
    
    // 1. Verifica se é senha temporária ativa e aprovada
    const resetRequests = AppDatabase.getCollection("password_reset_requests");
    const tempReq = resetRequests.find(r => 
      String(r.user_id) === String(targetUserId) &&
      r.status === 'aprovado' &&
      r.senha_temporaria === passwordTyped &&
      new Date(r.expira_em) > new Date()
    );
    
    if (tempReq) {
      console.log("Senha temporária válida inserida. Redirecionando para alteração de senha.");
      
      // Reseta tentativas falhas e bloqueios
      AppDatabase.updateDoc("users", targetUserId, { tentativas_falhas: 0, bloqueado_ate: null });
      
      // Lembra usuário se marcado
      tratarLembrarUsuario(usernameTyped, lembrarCheckbox && lembrarCheckbox.checked);
      
      // Abre modal de troca de senha obrigatória
      const modalId = "modal-alterar-senha-obrigatorio";
      const uIdInput = document.getElementById("change-pwd-user-id");
      const reqIdInput = document.getElementById("change-pwd-reset-req-id");
      
      if (uIdInput) uIdInput.value = targetUserId;
      if (reqIdInput) reqIdInput.value = tempReq.id;
      
      abrirModal(modalId);
      
      // Reseta botão
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.innerHTML = `<span>Entrar</span>`;
      }
      return;
    }
    
    // 2. Executa a autenticação via Supabase Auth com fallback seguro para contas pré-cadastradas
    const authResult = await AppDatabase.autenticar(usernameTyped, passwordTyped);
    
    if (!authResult.success) {
      const novasTentativas = (user.tentativas_falhas || 0) + 1;
      let updates = { tentativas_falhas: novasTentativas };
      
      let tempoBloqueioMs = 0;
      let msgErro = "";
      
      if (novasTentativas >= 20) {
        tempoBloqueioMs = 24 * 60 * 60 * 1000; // 24 horas
        msgErro = "Conta bloqueada por 24 horas devido a múltiplas tentativas incorretas.";
      } else if (novasTentativas >= 10) {
        tempoBloqueioMs = 30 * 60 * 1000; // 30 minutos
        msgErro = "Conta bloqueada por 30 minutos devido a múltiplas tentativas incorretas.";
      } else if (novasTentativas >= 5) {
        tempoBloqueioMs = 5 * 60 * 1000; // 5 minutos
        msgErro = "Conta bloqueada por 5 minutos devido a múltiplas tentativas incorretas.";
      }
      
      if (tempoBloqueioMs > 0) {
        const bloqueadoAte = new Date(Date.now() + tempoBloqueioMs).toISOString();
        updates.bloqueado_ate = bloqueadoAte;
        
        AppDatabase.updateDoc("users", targetUserId, updates);
        await AppDatabase.registrarAuditLog(targetUserId, "conta_bloqueada_temp", `Conta de '${usernameTyped}' bloqueada por ${tempoBloqueioMs / (60 * 1000)} minutos após ${novasTentativas} erros de login`);
        exibirErroLogin(msgErro);
      } else {
        AppDatabase.updateDoc("users", targetUserId, updates);
        await AppDatabase.registrarAuditLog(targetUserId, "login_falha", `Tentativa de login falhou: Credenciais inválidas para '${usernameTyped}' (Erro ${novasTentativas})`);
        exibirErroLogin(authResult.error || "Usuário ou senha inválidos.");
      }
      
      // Exibe Captcha caso tenha atingido 5 erros
      if (novasTentativas >= 5) {
        exibirCaptcha();
      }
      
      if (btnLogin) {
        btnLogin.disabled = false;
        btnLogin.innerHTML = `<span>Entrar</span>`;
      }
      
      return;
    }
    
    // Sucesso!
    tratarLembrarUsuario(usernameTyped, lembrarCheckbox && lembrarCheckbox.checked);
    
    // Zera contador de tentativas falhas e limpa bloqueios
    AppDatabase.updateDoc("users", targetUserId, { 
      tentativas_falhas: 0, 
      bloqueado_ate: null,
      ultimo_login: new Date().toISOString()
    });
    
    // Salva a senha na sessão temporária para permitir re-login RLS pós-cadastro
    sessionStorage.setItem("app_os_session_password", passwordTyped);
    
    // Loga com sucesso
    await loginComSucesso(targetUserId);
    
  } catch (err) {
    console.error("Erro no fluxo de login:", err);
    exibirErroLogin("Ocorreu um erro no servidor ao tentar efetuar login.");
  } finally {
    if (btnLogin) {
      btnLogin.disabled = false;
      btnLogin.innerHTML = `<span>Entrar</span>`;
    }
  }
}

function exibirErroLogin(msg) {
  const alertError = document.getElementById("login-alert-error");
  if (alertError) {
    alertError.textContent = msg;
    alertError.style.display = "flex";
  }
}

function tratarLembrarUsuario(username, lembrar) {
  if (lembrar) {
    localStorage.setItem("app_os_remembered_user", username);
  } else {
    localStorage.removeItem("app_os_remembered_user");
  }
}

async function solicitarNovaSenha(e) {
  e.preventDefault();
  
  const alertError = document.getElementById("recovery-alert");
  if (alertError) alertError.style.display = "none";
  
  const nomeInput = document.getElementById("recovery-nome");
  const usuarioInput = document.getElementById("recovery-usuario");
  const setorInput = document.getElementById("recovery-setor");
  const obsInput = document.getElementById("recovery-observacao");
  
  if (!nomeInput || !usuarioInput || !setorInput) return;
  
  const nome = nomeInput.value.trim();
  const usuario = usuarioInput.value.trim();
  const setor = setorInput.value.trim();
  const obs = obsInput ? obsInput.value.trim() : "";
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Solicitando...";
  }
  
  try {
    try {
      await AppDatabase.load(['users']);
    } catch (syncErr) {
      console.warn("Sincronização falhou, usando cache local:", syncErr.message);
    }
    const users = AppDatabase.getCollection("users") || [];
    
    // Normalização para comparar sem problemas de caracteres especiais/hífens unicode e maiúsculas/minúsculas
    const cleanStr = (s) => (s || "").toString().replace(/[\u2010-\u2015\u2212]/g, "-").trim().toLowerCase();
    const cleanUsuario = cleanStr(usuario);
    const cleanNome = cleanStr(nome);
    
    console.log(`[Recuperação Senha] Buscando: usuario='${cleanUsuario}', nome='${cleanNome}' entre ${users.length} usuários cadastrados`);
    console.log(`[Recuperação Senha] Usuários disponíveis:`, users.map(u => ({ usuario: u.usuario, email: u.email, nome: u.nome, id: u.id })));
    
    // Procura o usuário correspondente com prioridade absoluta para usuário, e-mail ou matrícula exata
    let user = users.find(u => {
      const uUser = cleanStr(u.usuario);
      const uEmail = cleanStr(u.email);
      const uId = cleanStr(u.id || u.uid);
      const emailPrefix = uEmail.includes("@") ? uEmail.split("@")[0] : uEmail;

      return (
        (uUser && (uUser === cleanUsuario || uUser === cleanNome)) ||
        (uEmail && (uEmail === cleanUsuario || uEmail === cleanNome || emailPrefix === cleanUsuario || emailPrefix === cleanNome)) ||
        (uId && (uId === cleanUsuario || uId === cleanNome))
      );
    });

    // Se não encontrou por usuário/email/id, busca pelo nome completo exato
    if (!user) {
      user = users.find(u => {
        const uNome = cleanStr(u.nome);
        return uNome && (uNome === cleanNome || uNome === cleanUsuario);
      });
    }

    // Se ainda não encontrou, busca por prefixo seguro do nome
    if (!user) {
      user = users.find(u => {
        const uNome = cleanStr(u.nome);
        return (cleanNome.length >= 3 && uNome.startsWith(cleanNome)) || 
               (cleanUsuario.length >= 3 && uNome.startsWith(cleanUsuario));
      });
    }
    
    if (!user) {
      console.warn(`[Recuperação Senha] Nenhum usuário encontrado para '${cleanUsuario}' ou '${cleanNome}'`);
      exibirErroRedefinicao(`Usuário ou matrícula não encontrado no sistema.`);
      return;
    }
    
    const targetUserId = user.uid || user.id;
    
    // Verificação de Rate Limit local no LocalStorage (1 solicitação a cada 2 horas)
    const storageKey = `pwd_recovery_timestamps_${targetUserId}`;
    let timestamps = [];
    try {
      timestamps = JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (err) {
      timestamps = [];
    }
    const now = Date.now();
    // Filtra timestamps dos últimos 120 minutos (2 * 60 * 60 * 1000 ms)
    timestamps = timestamps.filter(t => now - t < 2 * 60 * 60 * 1000);
    
    if (timestamps.length > 0) {
      exibirErroRedefinicao("Bloqueio de Segurança: Limite de solicitação excedido (máximo 1 solicitação a cada 2 horas).");
      return;
    }
    
    const reqId = "req_" + Math.random().toString(36).substr(2, 9);
    const newRequest = {
      id: reqId,
      user_id: targetUserId,
      solicitante: nome,
      setor: setor,
      observacao: obs,
      status: "pendente",
      solicitado_em: new Date().toISOString()
    };
    
    // Insere documento de solicitação
    AppDatabase.insertDoc("password_reset_requests", newRequest);
    
    // Registra o timestamp no LocalStorage
    timestamps.push(now);
    localStorage.setItem(storageKey, JSON.stringify(timestamps));
    
    // Notifica diretores e equipe de TI
    const staff = users.filter(u => u.role === "ti" || u.role === "diretor");
    staff.forEach(s => {
      AppDatabase.criarNotificacao(s.uid || s.id, `Solicitação de Senha: ${nome} (${setor}) necessita de redefinição.`);
    });
    
    // Registra auditoria
    await AppDatabase.registrarAuditLog(targetUserId, "solicitacao_senha", `Solicitação de redefinição de senha criada por '${nome}' (${setor})`);
    
    alert("Solicitação enviada! Aguarde a aprovação de um Técnico de TI ou Diretor.");
    fecharModal("modal-recuperar-senha");
    document.getElementById("form-recuperar-senha").reset();
    
  } catch (err) {
    console.error("Erro na solicitação de senha:", err);
    exibirErroRedefinicao("Erro ao processar solicitação.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Solicitar Nova Senha";
    }
  }
}

function exibirErroRedefinicao(msg) {
  const alertError = document.getElementById("recovery-alert");
  if (alertError) {
    alertError.textContent = msg;
    alertError.style.display = "flex";
  }
}

async function confirmarAlterarSenhaObrigatoria(e) {
  e.preventDefault();
  
  const alertError = document.getElementById("change-alert");
  if (alertError) alertError.style.display = "none";
  
  const passwordInput = document.getElementById("change-password");
  const confirmInput = document.getElementById("change-password-confirm");
  const userIdInput = document.getElementById("change-pwd-user-id");
  const reqIdInput = document.getElementById("change-pwd-reset-req-id");
  
  if (!passwordInput || !confirmInput || !userIdInput || !reqIdInput) return;
  
  const password = passwordInput.value;
  const confirm = confirmInput.value;
  const userId = userIdInput.value;
  const reqId = reqIdInput.value;
  
  if (password !== confirm) {
    exibirErroForcarSenha("As senhas não coincidem.");
    return;
  }
  
  if (!validarForcaSenha(password)) {
    exibirErroForcarSenha("A senha não atende aos requisitos de complexidade.");
    return;
  }
  
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Alterando...";
  }
  
  try {
    // Atualiza a senha definitiva do usuário
    AppDatabase.updateDoc("users", userId, { senha: password }, "uid");
    
    // Marca a solicitação como usada
    AppDatabase.updateDoc("password_reset_requests", reqId, { status: "usado" }, "id");
    
    // Registra log de auditoria
    await AppDatabase.registrarAuditLog(userId, "senha_alterada_obrigatoria", "Senha alterada obrigatoriamente no primeiro acesso");
    
    // Atualiza data do último login
    AppDatabase.updateDoc("users", userId, { ultimo_login: new Date().toISOString() }, "uid");
    
    // Salva a nova senha na sessão temporária
    sessionStorage.setItem("app_os_session_password", password);
    
    alert("Senha alterada com sucesso! Acessando o sistema...");
    fecharModal("modal-alterar-senha-obrigatorio");
    document.getElementById("form-alterar-senha-obrigatorio").reset();
    
    // Efetua login do usuário
    await loginComSucesso(userId);
    
  } catch (err) {
    console.error("Erro ao alterar senha obrigatória:", err);
    exibirErroForcarSenha("Erro ao alterar senha.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Alterar Senha e Acessar";
    }
  }
}

function exibirErroForcarSenha(msg) {
  const alertError = document.getElementById("change-alert");
  if (alertError) {
    alertError.textContent = msg;
    alertError.style.display = "flex";
  }
}

async function aprovarSolicitacaoSenha(reqId) {
  const req = AppDatabase.getDoc("password_reset_requests", reqId, "id");
  if (!req) return;
  
  const confirmacao = confirm(`Deseja aprovar a solicitação de redefinição de senha para '${req.solicitante}'? Uma senha temporária complexa será gerada.`);
  if (!confirmacao) return;
  
  try {
    const senhaTemp = gerarSenhaComplexa();
    const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24h de validade
    
    // Atualiza solicitação no banco
    AppDatabase.updateDoc("password_reset_requests", reqId, {
      status: "aprovado",
      senha_temporaria: senhaTemp,
      expira_em: expiraEm,
      aprovado_por: currentUser.uid
    }, "id");
    
    // Cria notificação para o usuário (caso logado/visualizando)
    AppDatabase.criarNotificacao(req.user_id, `Sua solicitação de redefinição de senha foi aprovada. Use a senha temporária para acessar o sistema.`);
    
    // Log de auditoria
    await AppDatabase.registrarAuditLog(currentUser.uid, "senha_aprovada", `Aprovou redefinição de senha para '${req.solicitante}' (Senha Temporária Gerada)`);
    
    // Exibe a senha gerada em destaque para o administrador repassar
    alert(`Solicitação aprovada!\n\nRepasse a senha temporária ao usuário:\n----------------------------------------\n${senhaTemp}\n----------------------------------------\n* Válida por 24 horas e expirará no primeiro uso.`);
    
    // Recarrega aba
    renderUsuarios();
    
  } catch (err) {
    console.error("Erro ao aprovar redefinição de senha:", err);
    alert("Erro ao aprovar solicitação: " + err.message);
  }
}

async function rejeitarSolicitacaoSenha(reqId) {
  const req = AppDatabase.getDoc("password_reset_requests", reqId, "id");
  if (!req) return;
  
  const confirmacao = confirm(`Deseja rejeitar a solicitação de redefinição de senha para '${req.solicitante}'?`);
  if (!confirmacao) return;
  
  try {
    AppDatabase.updateDoc("password_reset_requests", reqId, {
      status: "rejeitado",
      aprovado_por: currentUser.uid
    }, "id");
    
    AppDatabase.criarNotificacao(req.user_id, `Sua solicitação de redefinição de senha foi REJEITADA pela TI/Diretoria.`);
    
    await AppDatabase.registrarAuditLog(currentUser.uid, "senha_rejeitada", `Rejeitou solicitação de senha para '${req.solicitante}'`);
    
    alert("Solicitação rejeitada com sucesso.");
    renderUsuarios();
    
  } catch (err) {
    console.error("Erro ao rejeitar solicitação:", err);
    alert("Erro ao rejeitar solicitação: " + err.message);
  }
}

function gerarSenhaComplexa() {
  const charsUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charsLower = "abcdefghijklmnopqrstuvwxyz";
  const charsNumbers = "0123456789";
  const charsSpecial = "!@#$%^&*()_+~`|}{[]:;?><,./-=";
  
  let pwd = "";
  // Garante ao menos 1 de cada categoria
  pwd += charsUpper[Math.floor(Math.random() * charsUpper.length)];
  pwd += charsLower[Math.floor(Math.random() * charsLower.length)];
  pwd += charsNumbers[Math.floor(Math.random() * charsNumbers.length)];
  pwd += charsSpecial[Math.floor(Math.random() * charsSpecial.length)];
  
  // Preenche o resto até completar 10 caracteres
  const allChars = charsUpper + charsLower + charsNumbers + charsSpecial;
  for (let i = 0; i < 6; i++) {
    pwd += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Embaralha para que os primeiros caracteres não sigam o mesmo padrão
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

function toggleSenhaVisualizacao(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(`icon-eye-${inputId}`);
  if (!input) return;
  
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye-off"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>`;
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-eye"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
  }
}

function validarForcaSenha(password) {
  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  
  function getReqText(key) {
    switch (key) {
      case "length": return "Mínimo de 8 caracteres";
      case "upper": return "Pelo menos uma letra maiúscula";
      case "lower": return "Pelo menos uma letra minúscula";
      case "number": return "Pelo menos um número";
      case "special": return "Pelo menos um caractere especial";
    }
  }
  
  for (const [key, valid] of Object.entries(reqs)) {
    const element = document.getElementById(`req-${key}`);
    if (element) {
      if (valid) {
        element.classList.add("valid");
        element.innerHTML = `<i data-lucide="check" style="width:12px;height:12px;color:var(--status-finalizada);"></i> ` + getReqText(key);
      } else {
        element.classList.remove("valid");
        element.innerHTML = `<i data-lucide="x" style="width:12px;height:12px;color:var(--status-cancelada);"></i> ` + getReqText(key);
      }
    }
  }
  lucide.createIcons();
  
  return Object.values(reqs).every(v => v);
}

// ================= AUTO LOGOUT POR INATIVIDADE =================

let tempoInatividadeTimer = null;
const TEMPO_LIMITE_INATIVIDADE = 30 * 60 * 1000; // 30 minutos em milissegundos

function resetarTimerInatividade() {
  if (tempoInatividadeTimer) {
    clearTimeout(tempoInatividadeTimer);
  }
  
  if (currentUser) {
    tempoInatividadeTimer = setTimeout(() => {
      deslogarPorInatividade();
    }, TEMPO_LIMITE_INATIVIDADE);
  }
}

async function deslogarPorInatividade() {
  if (currentUser) {
    const userId = currentUser.uid;
    console.log("Inatividade detectada: efetuando logout automático.");
    
    // Registra log de auditoria
    await AppDatabase.registrarAuditLog(userId, "logout_inatividade", "Sessão expirada por inatividade (30 minutos)");
    
    alert("Sua sessão expirou por inatividade. Por favor, faça login novamente.");
    await executarLimpezaSessao();
    exibirTelaLogin();
  }
}

function iniciarMonitoramentoInatividade() {
  const eventos = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
  eventos.forEach(evento => {
    document.addEventListener(evento, resetarTimerInatividade, true);
  });
  
  // Inicia o timer inicial
  resetarTimerInatividade();
}

// ================= GAVETA DE SIDEBAR RESPONSIVA (MOBILE) =================
function toggleSidebarDrawer(event) {
  if (event) event.stopPropagation();
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar && backdrop) {
    sidebar.classList.toggle("open");
    backdrop.classList.toggle("active");
  }
}

function fecharSidebarDrawer() {
  const sidebar = document.getElementById("sidebar");
  const backdrop = document.getElementById("sidebar-backdrop");
  if (sidebar && backdrop) {
    sidebar.classList.remove("open");
    backdrop.classList.remove("active");
  }
}

// ================= RENDERIZADOR DE EQUIPAMENTOS =================
function renderEquipamentos() {
  const contentBody = document.getElementById("content-body");
  const equipamentos = AppDatabase.getCollection("equipamentos") || [];
  const lojas = AppDatabase.getCollection("lojas") || [];
  
  let html = `
    <div class="view-header-sticky">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px;">
        <div>
          <h1 style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Cadastrar Equipamento</h1>
          <p style="color: var(--text-secondary); font-size: 14px;">Registro de equipamentos e controle patrimonial (QR Code)</p>
        </div>
        <button class="btn" style="width: auto;" onclick="abrirModal('modal-criar-equipamento')">
          <i data-lucide="plus-circle"></i> Novo Equipamento
        </button>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        <div class="panel-title"><i data-lucide="monitor"></i> Equipamentos Cadastrados</div>
      </div>
      <div class="table-container">
        <table class="os-table">
          <thead>
            <tr>
              <th>Equipamento</th>
              <th>Patrimônio</th>
              <th>Setor</th>
              <th>Dono / Responsável</th>
              <th>Marca/Modelo</th>
              <th>Nº Série</th>
              <th>Nº Lote</th>
              <th>Loja / Unidade</th>
            </tr>
          </thead>
          <tbody>
  `;

  if (equipamentos.length === 0) {
    html += `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          Nenhum equipamento cadastrado no sistema.
        </td>
      </tr>
    `;
  } else {
    equipamentos.forEach(eq => {
      const lojaObj = lojas.find(l => l.id === eq.loja_id) || { nome: 'Unidade' };
      html += `
        <tr onclick="abrirDetalhesEquipamento('${eq.id}')" style="cursor: pointer; transition: background-color var(--transition-fast);" onmouseover="this.style.backgroundColor='rgba(255,255,255,0.02)'" onmouseout="this.style.backgroundColor='transparent'">
          <td style="font-weight: 600;">${eq.nome_equipamento}</td>
          <td><span class="badge" style="background: rgba(99, 102, 241, 0.1); color: var(--primary-color); border: 1px solid rgba(99, 102, 241, 0.2); font-family: monospace;">${eq.codigo_patrimonio}</span></td>
          <td style="color: var(--text-primary); font-weight: 500;">${eq.usuario ? `<i data-lucide="user-check" style="width: 12px; height: 12px; display: inline; color: #38bdf8; margin-right: 4px;"></i>${eq.usuario}` : '<span style="color: var(--text-muted); font-size: 11px;">Não informado</span>'}</td>
          <td style="color: var(--text-primary); font-weight: 500;">${eq.dono ? `<i data-lucide="user" style="width: 12px; height: 12px; display: inline; color: #818cf8; margin-right: 4px;"></i>${eq.dono}` : '<span style="color: var(--text-muted); font-size: 11px;">Não informado</span>'}</td>
          <td>${eq.marca || 'N/A'} / ${eq.modelo || 'N/A'}</td>
          <td>${eq.numero_serie || 'N/A'}</td>
          <td>${eq.numero_lote || 'N/A'}</td>
          <td>${lojaObj.nome}</td>
        </tr>
      `;
    });
  }

  html += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  contentBody.innerHTML = html;
  lucide.createIcons();
}

async function criarNovoEquipamento(e) {
  e.preventDefault();
  if (!currentUser) return;

  const usuario = document.getElementById("eq-usuario") ? document.getElementById("eq-usuario").value.trim() : "";
  const nome = document.getElementById("eq-nome").value.trim();
  const marca = document.getElementById("eq-marca").value.trim();
  const modelo = document.getElementById("eq-modelo").value.trim();
  const patrimonio = document.getElementById("eq-patrimonio").value.trim();
  const serial = document.getElementById("eq-serial").value.trim();
  const lote = document.getElementById("eq-lote").value.trim();
  const dono = document.getElementById("eq-dono") ? document.getElementById("eq-dono").value.trim() : "";
  const lojaId = document.getElementById("eq-loja").value;
  const valor = parseFloat(document.getElementById("eq-valor").value) || 1500.00;

  if (!nome || !marca || !modelo || !patrimonio || !serial || !lote || !lojaId) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Verifica se o patrimônio já existe
  const eqList = AppDatabase.getCollection("equipamentos") || [];
  const duplicate = eqList.some(eq => eq.codigo_patrimonio.toLowerCase() === patrimonio.toLowerCase());
  if (duplicate) {
    alert("Código de patrimônio já cadastrado em outro equipamento.");
    return;
  }

  const newEq = {
    id: "eq_" + Math.random().toString(36).substr(2, 9),
    usuario: usuario || null,
    nome_equipamento: nome,
    codigo_patrimonio: patrimonio,
    loja_id: lojaId,
    dono: dono || null,
    marca: marca,
    modelo: modelo,
    numero_serie: serial,
    numero_lote: lote,
    valor_estimado: valor,
    data_cadastro: new Date().toISOString()
  };

  try {
    await AppDatabase.insertDoc("equipamentos", newEq);
    await AppDatabase.registrarAuditLog(currentUser.uid, "equipamento_cadastrado", `Cadastrado equipamento '${nome}' via painel web.`);
    
    alert("Equipamento cadastrado com sucesso!");
    fecharModal("modal-criar-equipamento");
    document.getElementById("form-criar-equipamento").reset();
    renderEquipamentos();
  } catch (err) {
    console.error(err);
    alert("Erro ao cadastrar equipamento.");
  }
}

function abrirModalEditarEquipamento(id) {
  const eqId = id || (currentSelectedEquipment ? currentSelectedEquipment.id : null);
  if (!eqId) return;

  const eq = AppDatabase.getDoc("equipamentos", eqId);
  if (!eq) {
    alert("Equipamento não encontrado.");
    return;
  }

  // Preenche opções de lojas nos selects
  popularLojasDropdown();

  // Preenche os campos do formulário
  document.getElementById("edit-eq-id").value = eq.id;
  const userInp = document.getElementById("edit-eq-usuario");
  if (userInp) userInp.value = eq.usuario || "";
  document.getElementById("edit-eq-nome").value = eq.nome_equipamento || "";
  document.getElementById("edit-eq-marca").value = eq.marca || "";
  document.getElementById("edit-eq-modelo").value = eq.modelo || "";
  document.getElementById("edit-eq-patrimonio").value = eq.codigo_patrimonio || "";
  document.getElementById("edit-eq-serial").value = eq.numero_serie || "";
  document.getElementById("edit-eq-lote").value = eq.numero_lote || "";
  const donoInp = document.getElementById("edit-eq-dono");
  if (donoInp) donoInp.value = eq.dono || "";
  document.getElementById("edit-eq-loja").value = eq.loja_id || "";
  document.getElementById("edit-eq-valor").value = eq.valor_estimado != null ? Number(eq.valor_estimado).toFixed(2) : "1500.00";

  abrirModal("modal-editar-equipamento");
  if (typeof lucide !== 'undefined' && lucide.createIcons) {
    lucide.createIcons();
  }
}

async function salvarEdicaoEquipamento(e) {
  e.preventDefault();
  if (!currentUser) return;

  const id = document.getElementById("edit-eq-id").value;
  const usuario = document.getElementById("edit-eq-usuario") ? document.getElementById("edit-eq-usuario").value.trim() : "";
  const nome = document.getElementById("edit-eq-nome").value.trim();
  const marca = document.getElementById("edit-eq-marca").value.trim();
  const modelo = document.getElementById("edit-eq-modelo").value.trim();
  const patrimonio = document.getElementById("edit-eq-patrimonio").value.trim();
  const serial = document.getElementById("edit-eq-serial").value.trim();
  const lote = document.getElementById("edit-eq-lote").value.trim();
  const dono = document.getElementById("edit-eq-dono") ? document.getElementById("edit-eq-dono").value.trim() : "";
  const lojaId = document.getElementById("edit-eq-loja").value;
  const valor = parseFloat(document.getElementById("edit-eq-valor").value) || 1500.00;

  if (!nome || !marca || !modelo || !patrimonio || !serial || !lote || !lojaId) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  // Verifica se o patrimônio já existe em outro equipamento
  const eqList = AppDatabase.getCollection("equipamentos") || [];
  const duplicate = eqList.some(eq => String(eq.id) !== String(id) && String(eq.codigo_patrimonio).toLowerCase() === patrimonio.toLowerCase());
  if (duplicate) {
    alert("Código de patrimônio já cadastrado em outro equipamento.");
    return;
  }

  const lojas = AppDatabase.getCollection("lojas") || [];
  const lojaObj = lojas.find(l => l.id === lojaId);
  const nomeLoja = lojaObj ? lojaObj.nome : "";

  const updates = {
    nome_equipamento: nome,
    usuario: usuario || null,
    dono: dono || null,
    marca: marca,
    modelo: modelo,
    codigo_patrimonio: patrimonio,
    numero_serie: serial,
    numero_lote: lote,
    loja_id: lojaId,
    loja: nomeLoja,
    valor_estimado: valor
  };

  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i data-lucide="loader-2" class="spin"></i> Salvando...`;
  }

  try {
    const updatedEq = AppDatabase.updateDoc("equipamentos", id, updates, "id");
    await AppDatabase.registrarAuditLog(currentUser.uid || currentUser.id, "equipamento_editado", `Editou informações do equipamento '${nome}' (Patrimônio: ${patrimonio})`);

    alert("Equipamento atualizado com sucesso!");
    fecharModal("modal-editar-equipamento");

    // Atualiza tabela de equipamentos
    renderEquipamentos();

    // Se o prontuário estiver aberto, atualiza na hora
    if (currentSelectedEquipment && String(currentSelectedEquipment.id) === String(id)) {
      abrirDetalhesEquipamento(id);
    }
  } catch (err) {
    console.error("Erro ao editar equipamento:", err);
    alert("Erro ao salvar alterações do equipamento: " + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i data-lucide="save"></i> Salvar Alterações`;
      if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
      }
    }
  }
}

let currentSelectedEquipment = null;

function abrirDetalhesEquipamento(id) {
  const eq = AppDatabase.getDoc("equipamentos", id);
  if (!eq) return;
  
  currentSelectedEquipment = eq;
  
  const lojas = AppDatabase.getCollection("lojas");
  const lojaObj = lojas.find(l => l.id === eq.loja_id) || { nome: 'Unidade' };
  
  const detUsuarioEl = document.getElementById("det-eq-usuario");
  if (detUsuarioEl) detUsuarioEl.innerText = eq.usuario || 'Não informado';
  document.getElementById("det-eq-nome").innerText = eq.nome_equipamento;
  document.getElementById("det-eq-patrimonio").innerText = eq.codigo_patrimonio;
  document.getElementById("det-eq-dono").innerText = eq.dono || 'Não informado';
  document.getElementById("det-eq-marca").innerText = eq.marca || 'N/A';
  document.getElementById("det-eq-modelo").innerText = eq.modelo || 'N/A';
  document.getElementById("det-eq-serial").innerText = eq.numero_serie || 'N/A';
  document.getElementById("det-eq-lote").innerText = eq.numero_lote || 'N/A';
  document.getElementById("det-eq-loja").innerText = lojaObj.nome;
  document.getElementById("det-eq-valor").innerText = "R$ " + (eq.valor_estimado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  const qrContainer = document.getElementById("det-eq-qrcode");
  qrContainer.innerHTML = "";
  
  new QRCode(qrContainer, {
    text: eq.codigo_patrimonio,
    width: 140,
    height: 140,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });
  
  // ----------------------------------------------------
  // EXTRAÇÃO DE HISTÓRICO DE MANUTENÇÕES E PEÇAS
  // ----------------------------------------------------
  const osList = AppDatabase.getCollection("os") || [];
  const eqOS = osList.filter(o => o.equipamento_id === eq.id || o.equipamento === eq.codigo_patrimonio || (o.descricao && o.descricao.includes(eq.codigo_patrimonio)));
  
  let totalMaintenanceCost = 0;
  let materialsReplaced = [];
  let timelineHTML = "";
  
  eqOS.sort((a, b) => new Date(b.data_criacao) - new Date(a.data_criacao));
  
  eqOS.forEach(o => {
    let osCusto = o.custo_total_materiais || 0;
    
    if (osCusto === 0 && o.materiais && o.materiais.length > 0) {
      osCusto = o.materiais.reduce((acc, m) => acc + (m.quantidade * m.valor_unitario), 0);
    }
    
    totalMaintenanceCost += osCusto;
    
    if (o.materiais && o.materiais.length > 0) {
      o.materiais.forEach(m => {
        materialsReplaced.push({
          nome: m.nome_material,
          quantidade: m.quantidade,
          valor: m.valor_unitario,
          data: o.data_finalizacao || o.data_criacao,
          osId: o.id
        });
      });
    }
    
    const dataF = DateTimeFormatFriendly(o.data_criacao);
    const statusClass = o.status === 'Finalizada' ? 'status-finalizada' : o.status === 'Aberta' ? 'status-aberta' : 'status-cancelada';
    
    timelineHTML += `
      <div style="position: relative; margin-bottom: 8px;">
        <div style="position: absolute; left: -26px; top: 4px; width: 10px; height: 10px; border-radius: 50%; background-color: var(--primary-color); border: 2px solid var(--bg-primary);"></div>
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
          <span style="font-weight: 700; font-size: 13px; color: #fff;">${o.id} - ${o.titulo}</span>
          <span class="badge ${statusClass}" style="font-size: 9px; padding: 2px 6px;">${o.status}</span>
        </div>
        <p style="font-size: 11px; color: var(--text-muted); margin-bottom: 6px;">Aberto em: ${dataF}</p>
        <p style="font-size: 12px; color: var(--text-secondary); line-height: 1.4; background: rgba(255,255,255,0.01); padding: 8px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
          <strong>Problema:</strong> ${o.descricao}<br>
          ${o.solucao_tecnica ? `<strong>Solução:</strong> ${o.solucao_tecnica}` : '<em>Manutenção em andamento...</em>'}
        </p>
      </div>
    `;
  });
  
  if (eqOS.length === 0) {
    timelineHTML = `<p style="font-size: 13px; color: var(--text-secondary); text-align: center; padding: 12px;">Nenhuma manutenção registrada para este equipamento.</p>`;
  }
  
  document.getElementById("det-eq-timeline-container").innerHTML = timelineHTML;
  
  let pecasHTML = "";
  if (materialsReplaced.length === 0) {
    pecasHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 6px 0; font-size: 12px;">Nenhuma peça substituída registrada.</p>`;
  } else {
    pecasHTML = `
      <table style="width: 100%; border-collapse: collapse; text-align: left;">
        <thead>
          <tr style="color: var(--text-secondary); border-bottom: 1px solid var(--border-color); font-size: 11px; text-transform: uppercase;">
            <th style="padding: 6px 4px;">Componente</th>
            <th style="padding: 6px 4px; text-align: center;">Qtd</th>
            <th style="padding: 6px 4px; text-align: right;">Unitário</th>
          </tr>
        </thead>
        <tbody>
          ${materialsReplaced.map(m => `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 12px;">
              <td style="padding: 6px 4px; color: #fff; font-weight: 500;">${m.nome}</td>
              <td style="padding: 6px 4px; text-align: center; color: var(--text-secondary);">${m.quantidade}</td>
              <td style="padding: 6px 4px; text-align: right; color: #10B981;">R$ ${m.valor.toFixed(2)}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }
  document.getElementById("det-eq-pecas-container").innerHTML = pecasHTML;
  
  // ----------------------------------------------------
  // ANÁLISE DE VIABILIDADE FINANCEIRA
  // ----------------------------------------------------
  const valorNovo = eq.valor_estimado || 1500.00;
  const ratio = (totalMaintenanceCost / valorNovo) * 100;
  
  let viabilityText = "Viável para Conserto";
  let viabilityColor = "var(--status-finalizada)";
  let viabilityBg = "rgba(16, 185, 129, 0.1)";
  
  if (ratio > 80) {
    viabilityText = "Substituição Recomendada";
    viabilityColor = "var(--status-cancelada)";
    viabilityBg = "rgba(239, 68, 68, 0.1)";
  } else if (ratio >= 50) {
    viabilityText = "Atenção (Gasto Elevado)";
    viabilityColor = "#F59E0B";
    viabilityBg = "rgba(245, 158, 11, 0.1)";
  }
  
  const viabCard = document.getElementById("det-eq-viabilidade-card");
  viabCard.style.backgroundColor = viabilityBg;
  viabCard.style.border = `1px solid ${viabilityColor}`;
  
  const viabTag = document.getElementById("det-eq-viabilidade-tag");
  viabTag.innerText = viabilityText;
  viabTag.style.color = viabilityColor;
  viabTag.style.backgroundColor = viabilityBg;
  viabTag.style.borderColor = viabilityColor;
  
  document.getElementById("det-eq-viabilidade-gasto").innerText = `R$ ${totalMaintenanceCost.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${ratio.toFixed(1)}% do valor de compra)`;
  
  const viabBar = document.getElementById("det-eq-viabilidade-bar");
  viabBar.style.width = Math.min(ratio, 100) + "%";
  viabBar.style.backgroundColor = viabilityColor;
  
  abrirModal("modal-detalhes-equipamento");
  lucide.createIcons();
}

function DateTimeFormatFriendly(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  const dia = String(date.getDate()).padStart(2, '0');
  const mes = String(date.getMonth() + 1).padStart(2, '0');
  const ano = date.getFullYear();
  const hora = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  
  return `${dia}/${mes}/${ano} ${hora}:${min}`;
}

function imprimirQRCodeEquipamento() {
  if (!currentSelectedEquipment) return;
  
  const eq = currentSelectedEquipment;
  const printWindow = window.open("", "_blank");
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Etiqueta Patrimonial - ${eq.codigo_patrimonio}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Arial, sans-serif;
            text-align: center;
            padding: 20px;
            color: #000;
            background: #fff;
          }
          .label-container {
            border: 2px dashed #000;
            padding: 15px;
            display: inline-block;
            border-radius: 8px;
            background: #fff;
          }
          .title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .subtitle {
            font-size: 12px;
            color: #555;
            margin-bottom: 15px;
          }
          .qr-wrapper {
            margin: 15px auto;
            display: flex;
            justify-content: center;
          }
          .code {
            font-size: 14px;
            font-weight: bold;
            font-family: monospace;
            margin-top: 5px;
            letter-spacing: 1px;
          }
        </style>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
      </head>
      <body>
        <div class="label-container">
          <div class="title">REDE MEGA SUPERMERCADOS</div>
          <div class="subtitle">${eq.nome_equipamento}</div>
          <div class="qr-wrapper">
            <div id="print-qrcode"></div>
          </div>
          <div class="code">${eq.codigo_patrimonio}</div>
          <div style="font-size: 9px; color: #777; margin-top: 5px;">${eq.usuario ? `Setor: ${eq.usuario} | ` : ''}Série: ${eq.numero_serie || 'N/A'} | Lote: ${eq.numero_lote || 'N/A'}</div>
        </div>
        <script>
          window.onload = function() {
            new QRCode(document.getElementById("print-qrcode"), {
              text: "${eq.codigo_patrimonio}",
              width: 130,
              height: 130,
              colorDark : "#000000",
              colorLight : "#ffffff",
              correctLevel : QRCode.CorrectLevel.H
            });
            setTimeout(function() {
              window.print();
              window.close();
            }, 500);
          }
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}

let scannerStream = null;
let scannerActive = false;

async function ativarWebcamScanner() {
  const container = document.getElementById("scanner-webcam-container");
  const video = document.getElementById("scanner-video");
  if (!container || !video) return;
  
  container.style.display = "block";
  scannerActive = true;
  
  try {
    scannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });
    video.srcObject = scannerStream;
    video.setAttribute("playsinline", true);
    video.play();
    
    requestAnimationFrame(tickScanner);
  } catch (err) {
    console.error("Erro ao acessar webcam:", err);
    alert("Não foi possível acessar a câmera para escanear o QR Code.");
    container.style.display = "none";
    scannerActive = false;
  }
}

function desativarWebcamScanner() {
  scannerActive = false;
  const container = document.getElementById("scanner-webcam-container");
  const video = document.getElementById("scanner-video");
  if (container) container.style.display = "none";
  
  if (scannerStream) {
    scannerStream.getTracks().forEach(track => track.stop());
    scannerStream = null;
  }
  if (video) video.srcObject = null;
}

function tickScanner() {
  if (!scannerActive) return;
  
  const video = document.getElementById("scanner-video");
  if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });
    
    if (code) {
      const decodedValue = code.data.trim();
      console.log("QR Code detectado pelo scanner:", decodedValue);
      
      const inputPatrimonio = document.getElementById("os-codigo-patrimonio");
      if (inputPatrimonio) {
        inputPatrimonio.value = decodedValue;
        aoDigitarCodigoPatrimonio(decodedValue);
      }
      
      const equipamentos = AppDatabase.getCollection("equipamentos") || [];
      const eq = equipamentos.find(e => (e.codigo_patrimonio && e.codigo_patrimonio.toLowerCase() === decodedValue.toLowerCase()) || (e.id && e.id.toLowerCase() === decodedValue.toLowerCase()));
      
      if (eq) {
        alert(`Equipamento detectado: [${eq.codigo_patrimonio}] ${eq.nome_equipamento}`);
      } else {
        alert(`Código lido: "${decodedValue}" (não cadastrado no banco de equipamentos).`);
      }
      desativarWebcamScanner();
      return;
    }
  }
  
  if (scannerActive) {
    requestAnimationFrame(tickScanner);
  }
}

function popularEquipamentosCadastradosDropdown() {
  const datalist = document.getElementById("datalist-equipamentos-patrimonio");
  if (!datalist) return;
  
  const equipamentos = AppDatabase.getCollection("equipamentos") || [];
  const categoriasPadrao = LISTA_TIPOS_EQUIPAMENTOS.map(e => e.id);
  
  let userPermissoes = null;
  if (currentUser && currentUser.role === 'usuario' && Array.isArray(currentUser.tipos_equipamentos) && currentUser.tipos_equipamentos.length > 0) {
    userPermissoes = currentUser.tipos_equipamentos;
  }
  
  let html = "";
  
  // 1. Equipamentos cadastrados
  equipamentos.forEach(eq => {
    const isUserEquipment = currentUser && eq.usuario && eq.usuario.toLowerCase().includes(currentUser.nome.toLowerCase());
    
    if (isUserEquipment) {
      html += `<option value="${eq.codigo_patrimonio}">⭐ Seu Equipamento: ${eq.nome_equipamento} (${eq.codigo_patrimonio})</option>`;
    } else {
      html += `<option value="${eq.codigo_patrimonio}">${eq.nome_equipamento} (${eq.marca || ''} ${eq.modelo || ''}) - ${eq.codigo_patrimonio}</option>`;
    }
  });
  
  // 2. Categorias gerais permitidas para o usuário
  const categoriasParaMostrar = userPermissoes ? categoriasPadrao.filter(c => userPermissoes.includes(c)) : categoriasPadrao;
  categoriasParaMostrar.forEach(cat => {
    html += `<option value="${cat}">Categoria Geral: ${cat}</option>`;
  });
  
  datalist.innerHTML = html;
}

// ================= MOTOR DE REGRAS DE PRIORIDADE AUTOMÁTICA =================

function calcularPrioridadePorEquipamento(equipamento) {
  if (!equipamento) return "Baixa";
  const eq = String(equipamento).trim().toLowerCase();
  
  // Prioridade Máxima (Alta):
  // PDV/CPU, PDV, CPU, Checkout, Caixa, Frente de Caixa, Sistema, Servidor, Internet, Balança, Balança de checkout, TEF, Pin Pad, Equipamentos de Segurança Eletrônica
  const prioridadeMaxima = [
    "pdv/cpu",
    "pdv / cpu",
    "pdv",
    "cpu",
    "checkout",
    "frente de caixa",
    "caixa",
    "pin pad",
    "pinpad",
    "tef",
    "sat/mfe",
    "sat",
    "mfe",
    "sistema",
    "software",
    "servidor",
    "server",
    "internet",
    "link",
    "modem",
    "balança",
    "balanca",
    "balança de checkout",
    "balanca de checkout",
    "equipamentos de segurança eletrônica",
    "equipamentos de seguranca eletronica",
    "segurança eletrônica",
    "seguranca eletronica",
    "cftv",
    "dvr",
    "nvr",
    "câmeras",
    "cameras"
  ];
  
  if (prioridadeMaxima.some(item => eq === item || eq.includes(item))) {
    return "Alta";
  }
  
  // Prioridade Média:
  // Impressora, Computador, Monitor, Central de Alarme, Switch, Roteador, Nobreak
  const prioridadeMedia = [
    "impressora",
    "computador",
    "pc",
    "desktop",
    "notebook",
    "monitor",
    "tela",
    "central de alarme",
    "alarme",
    "nobreak",
    "estabilizador",
    "switch",
    "roteador",
    "leitor"
  ];
  
  if (prioridadeMedia.some(item => eq === item || eq.includes(item))) {
    return "Média";
  }
  
  // O que sobrou é prioridade mínima (Baixa)
  return "Baixa";
}

function atualizarPrioridadeAutomatica() {
  const eqEl = document.getElementById("os-equipamento");
  const codPatrimonioInput = document.getElementById("os-codigo-patrimonio");
  const prioEl = document.getElementById("os-prioridade");
  const infoEl = document.getElementById("os-prioridade-badge-info");
  if (!prioEl) return;
  
  const equipamento = (eqEl && eqEl.value) ? eqEl.value : "";
  const codPatrimonio = (codPatrimonioInput && codPatrimonioInput.value) ? codPatrimonioInput.value.replace(/^Categoria Geral:\s*/i, '').trim() : "";
  
  // Determina a prioridade calculando sobre o equipamento selecionado ou código/categoria digitada
  let prioridade = calcularPrioridadePorEquipamento(equipamento);
  if (codPatrimonio) {
    const prioByCode = calcularPrioridadePorEquipamento(codPatrimonio);
    if (prioByCode === "Alta" || (prioByCode === "Média" && prioridade === "Baixa")) {
      prioridade = prioByCode;
    }
  }
  
  prioEl.value = prioridade;
  
  if (infoEl) {
    let color = "var(--status-finalizada)";
    let desc = "Mínima";
    if (prioridade === "Alta") {
      color = "var(--status-cancelada)";
      desc = "Máxima";
    } else if (prioridade === "Média") {
      color = "var(--status-aberta)";
      desc = "Média";
    }
    infoEl.innerHTML = `<span style="display:inline-block; width:8px; height:8px; border-radius:50%; background-color:${color};"></span> <span style="color:${color}; font-weight:700;">Prioridade ${desc} (${prioridade})</span> <span style="color:var(--text-muted); font-size:11px;">– Definida automaticamente pelo sistema</span>`;
  }
}

// ================= DIGITAÇÃO E LOCALIZAÇÃO DE EQUIPAMENTO / PATRIMÔNIO =================

function aoDigitarCodigoPatrimonio(codeTyped) {
  const hiddenIdEl = document.getElementById("os-equipamento-cadastro");
  const feedbackEl = document.getElementById("os-equipamento-feedback");
  const generalCategorySelect = document.getElementById("os-equipamento");
  const lojaSelect = document.getElementById("os-loja");
  
  const rawCode = (codeTyped || "").trim();
  
  if (!rawCode) {
    if (hiddenIdEl) hiddenIdEl.value = "";
    if (feedbackEl) {
      feedbackEl.style.display = "none";
      feedbackEl.innerHTML = "";
    }
    atualizarPrioridadeAutomatica();
    return;
  }
  
  const cleanCode = rawCode.toLowerCase();
  const cleanCategory = rawCode.replace(/^Categoria Geral:\s*/i, '').trim();
  const equipamentos = AppDatabase.getCollection("equipamentos") || [];
  
  // Localiza equipamento no banco/cache por código de patrimônio ou ID
  const eq = equipamentos.find(e => 
    (e.codigo_patrimonio && e.codigo_patrimonio.toLowerCase() === cleanCode) ||
    (e.id && e.id.toLowerCase() === cleanCode)
  );
  
  if (eq) {
    if (hiddenIdEl) hiddenIdEl.value = eq.id;
    
    // Assimilação Automática da Categoria
    const nameLower = (eq.nome_equipamento || "").toLowerCase();
    if (nameLower.includes("pdv") || nameLower.includes("cpu") || nameLower.includes("caixa") || nameLower.includes("checkout")) {
      generalCategorySelect.value = "PDV/CPU";
    } else if (nameLower.includes("impressora")) {
      generalCategorySelect.value = "Impressora";
    } else if (nameLower.includes("computador") || nameLower.includes("pc") || nameLower.includes("dell") || nameLower.includes("desktop") || nameLower.includes("notebook")) {
      generalCategorySelect.value = "Computador";
    } else if (nameLower.includes("monitor") || nameLower.includes("tela")) {
      generalCategorySelect.value = "Monitor";
    } else if (nameLower.includes("balança") || nameLower.includes("balanca")) {
      generalCategorySelect.value = "Balança de checkout";
    } else if (nameLower.includes("servidor")) {
      generalCategorySelect.value = "Servidor";
    } else if (nameLower.includes("internet") || nameLower.includes("roteador") || nameLower.includes("switch") || nameLower.includes("modem")) {
      generalCategorySelect.value = "Internet";
    } else if (nameLower.includes("segurança") || nameLower.includes("seguranca") || nameLower.includes("cftv") || nameLower.includes("camera") || nameLower.includes("câmera") || nameLower.includes("dvr") || nameLower.includes("nvr")) {
      generalCategorySelect.value = "Equipamentos de Segurança Eletrônica";
    } else if (nameLower.includes("alarme")) {
      generalCategorySelect.value = "Central de Alarme";
    } else if (nameLower.includes("acesso") || nameLower.includes("catraca") || nameLower.includes("fechadura")) {
      generalCategorySelect.value = "Controle de Acesso";
    } else if (nameLower.includes("cerca")) {
      generalCategorySelect.value = "Cerca Elétrica";
    } else if (nameLower.includes("ponto") || nameLower.includes("tablet")) {
      generalCategorySelect.value = "Tablet de Ponto";
    } else if (nameLower.includes("sistema") || nameLower.includes("software")) {
      generalCategorySelect.value = "Sistema";
    }
    
    // Auto-ajusta a loja caso esteja cadastrada e usuário tenha permissão
    if (eq.loja && lojaSelect && currentUser.role !== 'usuario') {
      lojaSelect.value = eq.loja;
    }
    
    // Atualiza a prioridade automaticamente
    atualizarPrioridadeAutomatica();
    
    if (feedbackEl) {
      feedbackEl.style.display = "block";
      feedbackEl.innerHTML = `
        <div style="background: rgba(99, 102, 241, 0.12); border: 1px solid rgba(99, 102, 241, 0.35); border-radius: var(--radius-sm); padding: 10px 12px; color: #e0e7ff;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; flex-wrap: wrap; gap: 6px;">
            <span style="font-weight: 700; color: #818cf8; display: flex; align-items: center; gap: 6px;">
              <i data-lucide="check-circle-2" style="width: 15px; height: 15px; color: #34d399;"></i>
              Equipamento Localizado: [${eq.codigo_patrimonio}] ${eq.nome_equipamento}
            </span>
            <span class="badge" style="background: rgba(99, 102, 241, 0.25); color: #c7d2fe; font-size: 10px; padding: 2px 8px;">${eq.marca || ''} ${eq.modelo || ''}</span>
          </div>
          <div style="font-size: 11px; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
            <span><i data-lucide="map-pin" style="width: 11px; height: 11px; display: inline;"></i> ${eq.loja || 'Corporativo / TI'}</span>
            ${eq.dono ? `<span>•</span><span><i data-lucide="user" style="width: 11px; height: 11px; display: inline; color: #818cf8;"></i> Dono: <strong style="color: #c7d2fe;">${eq.dono}</strong></span>` : ''}
            <span>•</span>
            <span style="color: #34d399; font-weight: 600; display: flex; align-items: center; gap: 4px;">
              <i data-lucide="git-commit" style="width: 12px; height: 12px;"></i> Vinculado à linha do tempo deste equipamento
            </span>
          </div>
        </div>
      `;
      lucide.createIcons();
    }
  } else {
    if (hiddenIdEl) hiddenIdEl.value = "";
    if (generalCategorySelect && cleanCategory) {
      generalCategorySelect.value = cleanCategory;
    }
    atualizarPrioridadeAutomatica();
    
    if (feedbackEl) {
      if (rawCode.length >= 2) {
        feedbackEl.style.display = "block";
        feedbackEl.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); color: #fbbf24; border-radius: var(--radius-sm); padding: 8px 10px; font-size: 11px; display: flex; align-items: center; gap: 6px;">
            <i data-lucide="help-circle" style="width: 14px; height: 14px; flex-shrink: 0;"></i>
            <span>Nenhum equipamento cadastrado com o código <strong>"${rawCode}"</strong>. A OS será aberta como categoria geral.</span>
          </div>
        `;
        lucide.createIcons();
      } else {
        feedbackEl.style.display = "none";
        feedbackEl.innerHTML = "";
      }
    }
  }
}

function aoMudarEquipamentoGeral() {
  atualizarPrioridadeAutomatica();
}

function escanearQRCodeDeArquivo(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const img = new Image();
    img.onload = function() {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, img.width, img.height);
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        const decodedValue = code.data.trim();
        console.log("QR Code lido do arquivo de imagem:", decodedValue);
        
        const inputPatrimonio = document.getElementById("os-codigo-patrimonio");
        if (inputPatrimonio) {
          inputPatrimonio.value = decodedValue;
          aoDigitarCodigoPatrimonio(decodedValue);
        }
        
        const equipamentos = AppDatabase.getCollection("equipamentos") || [];
        const eq = equipamentos.find(e => (e.codigo_patrimonio && e.codigo_patrimonio.toLowerCase() === decodedValue.toLowerCase()) || (e.id && e.id.toLowerCase() === decodedValue.toLowerCase()));
        
        if (eq) {
          alert(`Equipamento detectado: [${eq.codigo_patrimonio}] ${eq.nome_equipamento}`);
        } else {
          alert(`Código lido: "${decodedValue}" (não cadastrado no banco de equipamentos).`);
        }
      } else {
        alert("Não foi possível ler o QR Code a partir desta imagem. Certifique-se de que a foto esteja nítida, com boa iluminação e que o QR Code esteja focado.");
      }
      
      document.getElementById('scanner-file-input').value = '';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
