/**
 * db.js - Conexão e sincronização em cache com o Supabase Database (Postgres) para o Sistema de OS.
 * Encapsula a tradução entre tabelas relacionais do Supabase e o formato esperado pelo front-end.
 * Configurado para rodar com RLS ativo (Opção B - com login real via Anon Key).
 */

const SUPABASE_URL = "https://jeoxslbhhmgcifyjzbic.supabase.co";
// Chave pública (publishable) do projeto Supabase para respeitar e testar as políticas RLS
const SUPABASE_KEY = "sb_publishable_tFWnok6olNFdDUU4AJDO2w_rORih4zR";

// Inicializa o cliente do Supabase
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// FALLBACK DE DADOS MOCKADOS LOCAIS CASO O BANCO SUPABASE ESTEJA VAZIO OU SEM CONEXÃO
const MOCK_USERS_FALLBACK = [
  {
    id: "usr_diretor",
    nome: "Diretor Carlos Silva",
    email: "diretor@empresa.com",
    usuario: "diretor",
    senha: "empresa123",
    role: "diretor",
    cargo: "Diretor",
    loja: "Corporativo / TI",
    ativo: true
  },
  {
    id: "usr_tecnico",
    nome: "Técnico Lucas Nunes",
    email: "tecnico@empresa.com",
    usuario: "tecnico",
    senha: "empresa123",
    role: "ti",
    cargo: "Técnico de TI",
    loja: "Corporativo / TI",
    ativo: true
  },
  {
    id: "usr_lucas",
    nome: "Lucas",
    email: "kinhas@empresa.com",
    usuario: "kinhas",
    senha: "empresa123",
    role: "usuario",
    cargo: "Faturista",
    loja: "Mega Maurilândia",
    ativo: true
  },
  {
    id: "usr_adagalmir",
    nome: "Adagalmir",
    email: "adagalmir-frente@empresa.com",
    usuario: "adagalmir-frente",
    senha: "empresa123",
    role: "usuario",
    cargo: "Frente de Caixa",
    loja: "Big Maurilandia",
    ativo: true
  }
];

const MOCK_LOJAS_FALLBACK = [
  { id: "loj_mega_maurilandia", nome: "Mega Maurilândia" },
  { id: "loj_mega_turvelandia", nome: "Mega Turvelandia" },
  { id: "loj_mega_porteirao", nome: "Mega Porteirão" },
  { id: "loj_mega_santa_helena", nome: "Mega Santa Helena" },
  { id: "loj_big_maurilandia", nome: "Big Maurilandia" }
];

const MOCK_ESTOQUE_FALLBACK = [
  { id: "est_ssd", nome_material: "SSD 240GB Kingston", quantidade_atual: 15, estoque_minimo: 5, valor_unitario: 180.00 },
  { id: "est_ram", nome_material: "Memória RAM DDR4 8GB", quantidade_atual: 8, estoque_minimo: 4, valor_unitario: 220.00 },
  { id: "est_cabo", nome_material: "Cabo de Rede Cat6 (metros)", quantidade_atual: 120, estoque_minimo: 50, valor_unitario: 2.50 },
  { id: "est_mouse", nome_material: "Mouse USB Básico", quantidade_atual: 25, estoque_minimo: 8, valor_unitario: 35.00 },
  { id: "est_teclado", nome_material: "Teclado USB ABNT2", quantidade_atual: 18, estoque_minimo: 6, valor_unitario: 55.00 },
  { id: "est_roteador", nome_material: "Roteador Wireless TP-Link", quantidade_atual: 3, estoque_minimo: 4, valor_unitario: 199.00 },
  { id: "est_suporte", nome_material: "Suporte Monitor de Mesa", quantidade_atual: 6, estoque_minimo: 2, valor_unitario: 89.90 }
];

const MOCK_EQUIPAMENTOS_FALLBACK = [
  { id: "eq_comp_checkout_01", nome_equipamento: "Computador Checkout 01", codigo_patrimonio: "PAT-COMP-01", loja_id: "loj_mega_maurilandia", loja: "Mega Maurilândia", dono: "Frente de Caixa 01", usuario: "tecnico", marca: "Dell", modelo: "OptiPlex 3080", numero_serie: "DELL-SER-992", numero_lote: "Lote Caixa 2024", valor_estimado: 3500.00, status: "ativo" },
  { id: "eq_hp_p1102_01", nome_equipamento: "Impressora HP P1102", codigo_patrimonio: "PAT-HP1102-01", loja_id: "loj_mega_porteirao", loja: "Mega Porteirão", dono: "Faturamento / João Silva", usuario: "tecnico", marca: "HP", modelo: "LaserJet P1102", numero_serie: "HP-77698536", numero_lote: "Lote Faturamento", valor_estimado: 1200.00, status: "ativo" },
  { id: "eq_balanca_01", nome_equipamento: "Balança Checkout 02", codigo_patrimonio: "PAT-BAL-01", loja_id: "loj_mega_maurilandia", loja: "Mega Maurilândia", dono: "Frente de Caixa 02", usuario: "tecnico", marca: "Toledo", modelo: "Prix 3 Fit", numero_serie: "TOL-SER-771", numero_lote: "Lote Balanças 2023", valor_estimado: 1850.00, status: "ativo" },
  { id: "eq_servidor_01", nome_equipamento: "Servidor de Banco e Aplicação", codigo_patrimonio: "PAT-SRV-01", loja_id: "loj_mega_maurilandia", loja: "Corporativo / TI", dono: "TI Central", usuario: "tecnico", marca: "Dell", modelo: "PowerEdge R440", numero_serie: "DELL-SRV-2022", numero_lote: "Lote Datacenter", valor_estimado: 18500.00, status: "ativo" }
];

const MOCK_OS_FALLBACK = [];
const MOCK_NOTIFICACOES_FALLBACK = [];

const AppDatabase = {
  supabase: supabaseClient,
  // Cache local em memória sincronizado com o Supabase
  cache: {
    users: [],
    lojas: [],
    estoque: [],
    os: [],
    logs: [],
    notificacoes: [],
    movimentacoes_estoque: [],
    audit_logs: [],
    password_reset_requests: [],
    equipamentos: [],
    os_raw_temp: [],
    os_materiais_temp: [],
    os_mensagens_temp: []
  },

  // Fila de promessas de escrita pendentes para evitar condições de corrida (Race Conditions)
  pendingWrites: [],

  // Função principal de autenticação: valida credenciais no Supabase Auth com fallback seguro para contas pré-cadastradas
  async autenticar(identifier, passwordTyped) {
    if (!identifier || !passwordTyped) {
      return { success: false, error: "Preencha o usuário e a senha." };
    }

    const cleanIdentifier = identifier.toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-").trim();
    const users = this.getCollection("users") || [];
    
    const user = users.find(u => {
      const uUser = (u.usuario || "").toLowerCase().replace(/[\u2010-\u2015\u2212]/g, "-").trim();
      const uEmail = (u.email || "").toLowerCase().trim();
      const uEmailPrefix = uEmail.split("@")[0].replace(/[\u2010-\u2015\u2212]/g, "-").trim();
      const uNome = (u.nome || "").toLowerCase().trim();
      const uId = String(u.id || u.uid || "").toLowerCase();
      return (
        uUser === cleanIdentifier ||
        uEmail === cleanIdentifier ||
        uEmailPrefix === cleanIdentifier ||
        uNome === cleanIdentifier ||
        uId === cleanIdentifier
      );
    });

    if (!user) {
      return { success: false, error: "Usuário ou senha inválidos." };
    }

    const targetEmail = user.email;

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: targetEmail,
        password: passwordTyped
      });

      if (!error && data && data.user) {
        console.log(`Autenticado com sucesso no Supabase Auth para: ${targetEmail}`);
        sessionStorage.setItem("app_os_session_password", passwordTyped);
        return { success: true, user: user, authData: data };
      }
    } catch (err) {
      console.warn("Autenticação Supabase Auth em segundo plano falhou ou indisponível:", err);
    }

    const mockUser = MOCK_USERS_FALLBACK.find(m => 
      m.email.toLowerCase() === targetEmail.toLowerCase() ||
      m.usuario.toLowerCase() === cleanIdentifier
    );

    const expectedPassword = (user.senha) ? user.senha : (mockUser ? mockUser.senha : "empresa123");

    if (passwordTyped === expectedPassword) {
      console.log(`Autenticação confirmada para o usuário: ${user.nome}`);
      sessionStorage.setItem("app_os_session_password", passwordTyped);
      return { success: true, user: user };
    }

    return { success: false, error: "Usuário ou senha inválidos." };
  },

  // Faz login real no Supabase Auth com o email do usuário e senha padrão ou da sessão
  async login(uid) {
    const user = this.getDoc("users", uid, "uid");
    if (!user) return;
    
    // Tenta recuperar a senha da sessão temporária se disponível, senão usa 'empresa123'
    const password = sessionStorage.getItem("app_os_session_password") || "empresa123";
    
    console.log(`Efetuando login no Supabase Auth para: ${user.email}`);
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: password
      });
      if (error) {
        console.error("Erro ao autenticar no Supabase Auth:", error);
      } else {
        console.log(`Autenticado como '${user.nome}' (Role: ${user.role}). RLS ativo e aplicado.`);
      }
    } catch (err) {
      console.error("Erro na rotina de login do Supabase Auth:", err);
    }
  },

  // Faz logout real no Supabase Auth e limpa dados de sessão
  async logout() {
    console.log("Efetuando logout do Supabase Auth...");
    try {
      await supabaseClient.auth.signOut();
    } catch (err) {
      console.error("Erro ao deslogar do Supabase Auth:", err);
    }
    // Limpa sessionStorage
    sessionStorage.removeItem("app_os_session_password");
  },

  saveLocalCache() {
    try {
      const serialized = {
        users: (this.cache.users || []).filter(u => u.id !== 'usr_usuario' && u.usuario !== 'usuario' && u.email !== 'usuario@empresa.com'),
        lojas: this.cache.lojas,
        estoque: this.cache.estoque,
        os: this.cache.os || [],
        logs: this.cache.logs || [],
        notificacoes: this.cache.notificacoes || [],
        movimentacoes_estoque: this.cache.movimentacoes_estoque || [],
        audit_logs: this.cache.audit_logs || [],
        password_reset_requests: this.cache.password_reset_requests || [],
        equipamentos: this.cache.equipamentos
      };
      localStorage.setItem("app_os_db_cache_v7", JSON.stringify(serialized));
    } catch (e) {
      console.warn("Erro ao salvar cache local no localStorage:", e);
    }
  },

  loadLocalCache() {
    try {
      // Remove chaves antigas de cache para limpar qualquer vestígio de dados acumulados
      ["app_os_db_cache", "app_os_db_cache_v1", "app_os_db_cache_v2", "app_os_db_cache_v3", "app_os_db_cache_v4", "app_os_db_cache_v5", "app_os_db_cache_v6"].forEach(k => localStorage.removeItem(k));
      
      if (localStorage.getItem("app_os_session_uid") === "usr_usuario") {
        localStorage.removeItem("app_os_session_uid");
      }

      const saved = localStorage.getItem("app_os_db_cache_v7");
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(parsed).forEach(k => {
          if (Array.isArray(parsed[k])) {
            this.cache[k] = parsed[k];
          }
        });
      }

      // Garante purga estrita de segurança
      if (this.cache.users) {
        this.cache.users = this.cache.users.filter(u => u.id !== 'usr_usuario' && u.usuario !== 'usuario' && u.email !== 'usuario@empresa.com');
      }
    } catch (e) {
      console.warn("Erro ao carregar cache do localStorage:", e);
    }
  },

  // Método utilitário para zerar todas as OSs e notificações do sistema
  limparTodasOS() {
    this.cache.os = [];
    this.cache.os_raw_temp = [];
    this.cache.os_materiais_temp = [];
    this.cache.os_mensagens_temp = [];
    this.cache.notificacoes = [];
    this.cache.logs = [];
    this.cache.audit_logs = [];
    this.cache.password_reset_requests = [];
    
    // Limpa travamentos de rate-limit de criação no localStorage
    try {
      Object.keys(localStorage).forEach(k => {
        if (k.startsWith("os_creation_timestamps_") || k.startsWith("pwd_recovery_timestamps_")) {
          localStorage.removeItem(k);
        }
      });
    } catch (e) {}

    this.saveLocalCache();
    console.log("Todas as Ordens de Serviço e notificações foram zeradas com sucesso!");
  },

  // Carrega os dados do Supabase para o cache em memória (suporta carga parcial de tabelas)
  async load(collectionNames = null) {
    // Garante que o cache local esteja populado antes de tentar o Supabase
    this.loadLocalCache();

    // Salva snapshot do que já existe no cache antes de tentar o Supabase
    const hadUsers = (this.cache.users && this.cache.users.length > 0);
    const hadLojas = (this.cache.lojas && this.cache.lojas.length > 0);
    const hadEstoque = (this.cache.estoque && this.cache.estoque.length > 0);
    const hadEquipamentos = (this.cache.equipamentos && this.cache.equipamentos.length > 0);
    const hadOS = (this.cache.os && this.cache.os.length > 0);
    const hadNotificacoes = (this.cache.notificacoes && this.cache.notificacoes.length > 0);

    // Se houver gravações em andamento no banco, aguarda elas finalizarem para não carregar dados desatualizados
    if (this.pendingWrites.length > 0) {
      try {
        await Promise.all(this.pendingWrites);
      } catch (err) {
        console.error("Erro ao aguardar gravações pendentes:", err);
      }
    }

    // Reenvia logs que ficaram só no navegador (ex.: sem conexão). Uma tentativa por sessão para cada registro.
    this._flushTried = this._flushTried || new Set();
    const validUserIds = new Set((this.cache.users || []).map(u => String(u.id || u.uid)));
    const flushJobs = [];
    ["logs", "audit_logs"].forEach(colName => {
      (this.cache[colName] || []).forEach(item => {
        if (item._synced || this._flushTried.has(item.id)) return;
        if (colName === "logs" && !validUserIds.has(String(item.feito_por || item.usuario_id))) return;
        this._flushTried.add(item.id);
        flushJobs.push(
          this.persistInsert(colName, item)
            .then(() => { item._synced = true; })
            .catch(e => console.warn(`Reenvio de ${colName} falhou:`, e.message))
        );
      });
    });
    if (flushJobs.length) await Promise.all(flushJobs);

    const allCollections = [
      "users", "lojas", "estoque", "os", "os_materiais", 
      "os_mensagens", "logs", "notificacoes", "movimentacoes_estoque", 
      "audit_logs", "password_reset_requests", "equipamentos"
    ];
    const targetCollections = collectionNames || allCollections;

    try {
      const promises = [];
      const indexMap = {};

      targetCollections.forEach((col, idx) => {
        indexMap[col] = idx;
        if (col === "users") promises.push(supabaseClient.from("users").select("*"));
        else if (col === "lojas") promises.push(supabaseClient.from("lojas").select("*"));
        else if (col === "estoque") promises.push(supabaseClient.from("estoque").select("*"));
        else if (col === "os") promises.push(supabaseClient.from("os").select("*"));
        else if (col === "os_materiais") promises.push(supabaseClient.from("os_materiais").select("*"));
        else if (col === "os_mensagens") promises.push(supabaseClient.from("os_mensagens").select("*"));
        else if (col === "logs") promises.push(supabaseClient.from("logs").select("*"));
        else if (col === "notificacoes") promises.push(supabaseClient.from("notificacoes").select("*"));
        else if (col === "movimentacoes_estoque") promises.push(supabaseClient.from("movimentacoes_estoque").select("*"));
        else if (col === "audit_logs") promises.push(supabaseClient.from("audit_logs").select("*"));
        else if (col === "password_reset_requests") promises.push(supabaseClient.from("password_reset_requests").select("*"));
        else if (col === "equipamentos") promises.push(supabaseClient.from("equipamentos").select("*"));
      });

      const results = await Promise.all(promises);

      targetCollections.forEach(col => {
        const idx = indexMap[col];
        const res = results[idx];
        if (res && res.error) console.error(`Falha ao carregar ${col} do Supabase:`, res.error);
        if (res && !res.error && Array.isArray(res.data)) {
          const data = res.data;
          if (col === "users") {
            const serverUsers = data.map(u => ({ ...u, uid: u.id }));
            const serverIds = new Set(serverUsers.map(u => String(u.id)));
            const currentLocal = this.cache.users || [];
            const pendingLocal = currentLocal.filter(u => !serverIds.has(String(u.id || u.uid)));
            this.cache.users = [...serverUsers, ...pendingLocal];
          }
          else if (col === "lojas") {
            const serverIds = new Set(data.map(d => String(d.id)));
            const currentLocal = this.cache.lojas || [];
            const pendingLocal = currentLocal.filter(l => !serverIds.has(String(l.id)));
            this.cache.lojas = [...data, ...pendingLocal];
          }
          else if (col === "estoque") {
            const serverIds = new Set(data.map(d => String(d.id)));
            const currentLocal = this.cache.estoque || [];
            const pendingLocal = currentLocal.filter(l => !serverIds.has(String(l.id)));
            this.cache.estoque = [...data, ...pendingLocal];
          }
          else if (col === "logs") {
            this.cache.logs = data || [];
          }
          else if (col === "notificacoes") this.cache.notificacoes = data || [];
          else if (col === "movimentacoes_estoque") this.cache.movimentacoes_estoque = data || [];
          else if (col === "audit_logs") {
            this.cache.audit_logs = data || [];
          }
          else if (col === "password_reset_requests") {
            const serverIds = new Set(data.map(d => String(d.id)));
            const currentLocal = this.cache.password_reset_requests || [];
            const pendingLocal = currentLocal.filter(l => !serverIds.has(String(l.id)));
            this.cache.password_reset_requests = [...data, ...pendingLocal];
          }
          else if (col === "equipamentos") {
            const serverIds = new Set(data.map(d => String(d.id)));
            const currentLocal = this.cache.equipamentos || [];
            const pendingLocal = currentLocal.filter(l => !serverIds.has(String(l.id)));
            this.cache.equipamentos = [...data, ...pendingLocal];
          }
          else if (col === "os") {
            const serverIds = new Set(data.map(d => String(d.id)));
            const currentLocal = this.cache.os_raw_temp || [];
            const pendingLocal = currentLocal.filter(l => !serverIds.has(String(l.id)));
            this.cache.os_raw_temp = [...data, ...pendingLocal];
          }
          else if (col === "os_materiais") this.cache.os_materiais_temp = data;
          else if (col === "os_mensagens") this.cache.os_mensagens_temp = data;
        }
      });

      // Se atualizou 'os', 'os_materiais' ou 'os_mensagens', reconstrói a lista mapeada de OS
      if (this.cache.os_raw_temp) {
        const currentOSList = this.cache.os_raw_temp;
        const mat = this.cache.os_materiais_temp || [];
        const msg = this.cache.os_mensagens_temp || [];

        this.cache.os = currentOSList.map(item => {
          return {
            ...item,
            materiais: (item.materiais && item.materiais.length > 0) ? item.materiais : mat.filter(m => String(m.os_id) === String(item.id)),
            mensagens: (item.mensagens && item.mensagens.length > 0) ? item.mensagens : msg
              .filter(m => String(m.os_id) === String(item.id))
              .sort((a, b) => new Date(a.data_envio) - new Date(b.data_envio))
          };
        });
      }

      // Fallback: só usa dados mockados se o cache estava vazio ANTES e continua vazio DEPOIS
      if (!hadUsers && (!this.cache.users || this.cache.users.length === 0)) {
        console.warn("Usando fallback de dados locais mockados devido a banco vazio ou erro de conexão.");
        this.cache.users = MOCK_USERS_FALLBACK.map(u => ({ ...u, uid: u.id }));
      }
      if (!hadLojas && (!this.cache.lojas || this.cache.lojas.length === 0)) {
        this.cache.lojas = MOCK_LOJAS_FALLBACK;
      }
      if (!hadEstoque && (!this.cache.estoque || this.cache.estoque.length === 0)) {
        this.cache.estoque = MOCK_ESTOQUE_FALLBACK;
      }
      if (!hadEquipamentos && (!this.cache.equipamentos || this.cache.equipamentos.length === 0)) {
        this.cache.equipamentos = MOCK_EQUIPAMENTOS_FALLBACK;
      }
      if (!hadOS && (!this.cache.os || this.cache.os.length === 0)) {
        this.cache.os = MOCK_OS_FALLBACK;
      }
      if (!hadNotificacoes && (!this.cache.notificacoes || this.cache.notificacoes.length === 0)) {
        this.cache.notificacoes = MOCK_NOTIFICACOES_FALLBACK;
      }

      this.saveLocalCache();
    } catch (err) {
      console.error("Falha na sincronização parcial do Supabase:", err);
    }
  },

  // Inicializador padrão
  init() {
    // Se o cache de usuários estiver completamente vazio (primeira execução sem rede), carrega os usuários padrão
    if (this.cache.users.length === 0) {
      this.cache.users = MOCK_USERS_FALLBACK.map(u => ({ ...u, uid: u.id }));
    }
    if (!this.cache.lojas || this.cache.lojas.length === 0) {
      this.cache.lojas = MOCK_LOJAS_FALLBACK;
    }
    if (!this.cache.estoque || this.cache.estoque.length === 0) {
      this.cache.estoque = MOCK_ESTOQUE_FALLBACK;
    }
    if (!this.cache.equipamentos || this.cache.equipamentos.length === 0) {
      this.cache.equipamentos = MOCK_EQUIPAMENTOS_FALLBACK;
    }
    if (!this.cache.os || this.cache.os.length === 0) {
      this.cache.os = MOCK_OS_FALLBACK;
    }
    if (!this.cache.notificacoes || this.cache.notificacoes.length === 0) {
      this.cache.notificacoes = MOCK_NOTIFICACOES_FALLBACK;
    }
    console.log("AppDatabase (RLS Ativo + Cache Persistente) carregado.");
  },

  // Obter todos os itens de uma coleção/tabela
  getCollection(name) {
    return this.cache[name] || [];
  },

  // Buscar um documento específico no cache por id/uid
  getDoc(collectionName, id, idField = "id") {
    const items = this.getCollection(collectionName);
    return items.find(item => {
      if (collectionName === "users") {
        return String(item.uid) === String(id) || String(item.id) === String(id);
      }
      return String(item[idField]) === String(id) || String(item.id) === String(id);
    }) || null;
  },

  // Gera o próximo número de OS via RPC do Supabase ou fallback inteligente de numeração sequencial
  async generateNextOSId() {
    try {
      const { data, error } = await supabaseClient.rpc('get_next_os_id');
      if (!error && data && typeof data === 'string' && data.startsWith('OS-')) {
        return data;
      }
    } catch (err) {
      console.warn("RPC get_next_os_id indisponível, calculando próximo ID localmente:", err);
    }

    const osList = this.getCollection("os") || [];
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
    return `OS-${maxNum + 1}`;
  },

  // Chamada RPC para criação atômica completa da OS no Supabase (com mensagens e anexos)
  async criarOSCompletaRPC(novaOS) {
    try {
      const msgInicial = (novaOS.mensagens && novaOS.mensagens[0]) ? novaOS.mensagens[0] : null;
      const payload = {
        p_titulo: novaOS.titulo,
        p_descricao: novaOS.descricao,
        p_equipamento: novaOS.equipamento,
        p_equipamento_id: novaOS.equipamento_id || null,
        p_prioridade: novaOS.prioridade,
        p_criado_por: novaOS.criado_por,
        p_loja_unidade: novaOS.loja_unidade,
        p_mensagem_inicial: msgInicial ? msgInicial.mensagem_texto : null,
        p_midia_url: msgInicial ? msgInicial.midia_url : null,
        p_tipo_midia: msgInicial ? (msgInicial.tipo_midia || 'nenhum') : 'nenhum'
      };

      const { data, error } = await supabaseClient.rpc('criar_nova_os_completa', payload);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Inclusão transacional do ponto de vista da interface: só atualiza o cache após confirmação do servidor.
  // Usar em fluxos críticos como abertura de OS.
  async insertDocConfirmed(collectionName, doc) {
    await this.persistInsert(collectionName, doc);
    const items = this.cache[collectionName] || (this.cache[collectionName] = []);
    const idx = items.findIndex(item => String(item.id) === String(doc.id));
    if (idx >= 0) items[idx] = { ...items[idx], ...doc };
    else items.push({ ...doc });
    if (collectionName === "os") {
      this.cache.os_raw_temp = this.cache.os_raw_temp || [];
      const rawIdx = this.cache.os_raw_temp.findIndex(item => String(item.id) === String(doc.id));
      if (rawIdx >= 0) this.cache.os_raw_temp[rawIdx] = { ...this.cache.os_raw_temp[rawIdx], ...doc };
      else this.cache.os_raw_temp.push({ ...doc });
    }
    this.saveLocalCache();
    return doc;
  },

  // Adicionar documento localmente e sincronizar em segundo plano (para recursos não críticos).
  insertDoc(collectionName, doc) {
    if (!this.cache[collectionName]) {
      this.cache[collectionName] = [];
    }
    const items = this.cache[collectionName];
    const queryField = (collectionName === "users" && doc.uid) ? "uid" : "id";
    const existingIdx = items.findIndex(it => doc[queryField] && String(it[queryField]) === String(doc[queryField]));
    if (existingIdx >= 0) {
      items[existingIdx] = { ...items[existingIdx], ...doc };
    } else {
      items.push(doc);
    }

    if (collectionName === "os") {
      if (!this.cache.os_raw_temp) this.cache.os_raw_temp = [];
      const rawIdx = this.cache.os_raw_temp.findIndex(it => doc.id && String(it.id) === String(doc.id));
      if (rawIdx >= 0) {
        this.cache.os_raw_temp[rawIdx] = { ...this.cache.os_raw_temp[rawIdx], ...doc };
      } else {
        this.cache.os_raw_temp.push(doc);
      }
    }

    this.saveLocalCache();

    // Envia para o Supabase em background e gerencia a promessa na fila
    const promise = this.persistInsert(collectionName, doc).then(() => {
      if (collectionName === "logs" || collectionName === "audit_logs") {
        doc._synced = true;
        this.saveLocalCache();
      }
      this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
    }).catch(err => {
      console.warn(`Erro assíncrono ao persistir insert em ${collectionName}:`, err);
      this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
    });
    this.pendingWrites.push(promise);

    return doc;
  },

  // Atualizar um documento específico (Síncrono localmente + Assíncrono no DB com fila)
  updateDoc(collectionName, id, updates, idField = "id") {
    const items = this.getCollection(collectionName);
    const index = items.findIndex(item => {
      if (collectionName === "users") {
        return String(item.uid) === String(id) || String(item.id) === String(id);
      }
      return String(item[idField]) === String(id) || String(item.id) === String(id);
    });
    if (index !== -1) {
      // Atualiza o cache local
      items[index] = { ...items[index], ...updates };
      
      if (collectionName === "os" && this.cache.os_raw_temp) {
        const rawIdx = this.cache.os_raw_temp.findIndex(it => String(it.id) === String(id));
        if (rawIdx !== -1) {
          this.cache.os_raw_temp[rawIdx] = { ...this.cache.os_raw_temp[rawIdx], ...updates };
        }
      }

      this.saveLocalCache();

      // Envia para o Supabase em background e gerencia a promessa na fila
      const promise = this.persistUpdate(collectionName, id, updates, idField).then(() => {
        this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
      }).catch(err => {
        console.warn(`Erro assíncrono ao persistir update em ${collectionName}:`, err);
        this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
      });
      this.pendingWrites.push(promise);
      
      return items[index];
    }
    return null;
  },

  // Deletar um documento (Síncrono localmente + Assíncrono no DB com fila)
  deleteDoc(collectionName, id, idField = "id") {
    const items = this.getCollection(collectionName);
    this.cache[collectionName] = items.filter(item => {
      if (collectionName === "users") {
        return String(item.uid) !== String(id) && String(item.id) !== String(id);
      }
      return String(item[idField]) !== String(id) && String(item.id) !== String(id);
    });

    if (collectionName === "os" && this.cache.os_raw_temp) {
      this.cache.os_raw_temp = this.cache.os_raw_temp.filter(it => String(it.id) !== String(id));
    }

    this.saveLocalCache();

    // Envia para o Supabase em background e gerencia a promessa na fila
    const promise = this.persistDelete(collectionName, id, idField).then(() => {
      this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
    }).catch(err => {
      console.warn(`Erro assíncrono ao persistir delete em ${collectionName}:`, err);
      this.pendingWrites = this.pendingWrites.filter(p => p !== promise);
    });
    this.pendingWrites.push(promise);
  },

  // Helper para registrar log de auditoria unificado em logs e audit_logs
  registrarLog(acao, feitoPorUid, osId = "", descricaoExtra = "") {
    const userId = feitoPorUid || (typeof currentUser !== 'undefined' && currentUser ? (currentUser.uid || currentUser.id) : null);
    const timestamp = new Date().toISOString();

    // Localiza o ID de usuário válido cadastrado no banco (FK)
    const userObj = (this.cache.users || []).find(u => 
      String(u.id) === String(userId) || 
      String(u.uid) === String(userId) || 
      (u.usuario && String(u.usuario).toLowerCase() === String(userId).toLowerCase()) || 
      (u.email && String(u.email).toLowerCase() === String(userId).toLowerCase())
    );
    const validUserId = userObj ? (userObj.id || userObj.uid) : null;

    if (validUserId) {
      this.insertDoc("logs", {
        id: "log_" + Math.random().toString(36).substr(2, 9),
        acao: acao,
        feito_por: validUserId,
        usuario_id: validUserId,
        os_id: osId || null,
        descricao: descricaoExtra || null,
        data: timestamp
      });
    }

    // Sincroniza também na coleção audit_logs (guarda a descrição completa, mesmo que anônimo)
    this.insertDoc("audit_logs", {
      id: "audit_" + Math.random().toString(36).substr(2, 9),
      usuario_id: validUserId,
      acao: acao,
      os_id: osId || null,
      descricao: descricaoExtra || acao,
      data: timestamp
    });
  },

  // Helper para registrar log de auditoria geral (audit_logs)
  async registrarAuditLog(userId, acao, descricao) {
    const fp = window.clientFingerprint || { ip: "127.0.0.1", navegador: "Desconhecido", dispositivo: "Desktop" };
    const descComFp = descricao ? `${descricao} [Navegador: ${fp.navegador} | Dispositivo: ${fp.dispositivo}]` : `[Navegador: ${fp.navegador} | Dispositivo: ${fp.dispositivo}]`;
    this.registrarLog(acao, userId, "", descComFp);
  },

  // Helper para limpar logs de auditoria e logs do sistema (Apenas Diretor)
  async limparLogs() {
    this.cache.audit_logs = [];
    this.cache.logs = [];
    this.saveLocalCache();
    try {
      if (supabaseClient) {
        const { error: err1 } = await supabaseClient.from("audit_logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (err1) {
          await supabaseClient.from("audit_logs").delete().neq("acao", "___dummy___");
        }
        const { error: err2 } = await supabaseClient.from("logs").delete().neq("id", "00000000-0000-0000-0000-000000000000");
        if (err2) {
          await supabaseClient.from("logs").delete().neq("acao", "___dummy___");
        }
      }
    } catch (err) {
      console.warn("Aviso ao limpar logs no Supabase:", err);
    }
  },

  // Helper para criar uma notificação
  criarNotificacao(userId, mensagem) {
    const notif = {
      id: "not_" + Math.random().toString(36).substr(2, 9),
      user_id: userId,
      mensagem: mensagem,
      lida: false,
      data: new Date().toISOString()
    };
    this.insertDoc("notificacoes", notif);
  },

  // ================= MÉTODOS INTERNOS DE PERSISTÊNCIA DE REDE =================

  async persistInsert(collectionName, doc) {
    let payload = { ...doc };

    // Trata e limpa o payload de acordo com as colunas reais do esquema PostgreSQL do Supabase
    if (collectionName === "os") {
      const initialMessages = Array.isArray(payload.mensagens) ? payload.mensagens : [];
      const initialMaterials = Array.isArray(payload.materiais) ? payload.materiais : [];

      delete payload.materiais;
      delete payload.mensagens;
      delete payload.materiais_count;
      delete payload.mensagens_count;
      delete payload.ultimo_envio;
      delete payload.midia_url;
      delete payload.tipo_midia;

      if (payload.tecnico_responsavel === "") payload.tecnico_responsavel = null;
      if (payload.equipamento_id === "") payload.equipamento_id = null;

      const { data, error } = await supabaseClient.from("os").insert([payload]).select();
      if (error) {
        console.error(`Falha ao inserir em os:`, error);
        throw new Error(`Não foi possível gravar a OS no Supabase: ${error.message}`);
      }

      if (initialMessages.length > 0) {
        const msgRows = initialMessages.map(m => ({
          os_id: doc.id,
          mensagem_texto: m.mensagem_texto || "",
          midia_url: m.midia_url || null,
          tipo_midia: m.tipo_midia || "nenhum",
          enviado_por: m.enviado_por,
          data_envio: m.data_envio || new Date().toISOString()
        }));
        const msgResult = await supabaseClient.from("os_mensagens").insert(msgRows);
        if (msgResult.error) {
          console.warn("Aviso: Falha ao gravar mensagem inicial da OS:", msgResult.error);
        }
      }

      if (initialMaterials.length > 0) {
        const matRows = initialMaterials.map(m => ({
          os_id: doc.id,
          nome_material: m.nome_material,
          quantidade: m.quantidade,
          valor_unitario: m.valor_unitario
        }));
        const matResult = await supabaseClient.from("os_materiais").insert(matRows);
        if (matResult.error) {
          console.warn("Aviso: Falha ao gravar materiais iniciais da OS:", matResult.error);
        }
      }

      return data && data[0] ? data[0] : payload;
    }

    if (["logs", "notificacoes", "movimentacoes_estoque", "audit_logs", "password_reset_requests", "os_mensagens", "os_materiais"].includes(collectionName)) {
      delete payload.id;
    }

    if (collectionName === "logs") {
      const timestamp = payload.data || payload.data_hora || new Date().toISOString();
      let logPayload = {
        acao: String(payload.acao || "Ação do Sistema"),
        feito_por: String(payload.feito_por || payload.usuario_id || payload.user_id || "Sistema"),
        os_id: payload.os_id ? String(payload.os_id) : null,
        data: timestamp
      };

      let insertRes = await supabaseClient.from("logs").insert([logPayload]).select();
      if (insertRes.error && (insertRes.error.message.includes("violates foreign key") || insertRes.error.code === "23503")) {
        logPayload.feito_por = null;
        insertRes = await supabaseClient.from("logs").insert([logPayload]).select();
      }
      if (insertRes.error) {
        console.warn("Aviso ao persistir logs no Supabase:", insertRes.error);
      }
      return insertRes.data && insertRes.data[0] ? insertRes.data[0] : logPayload;
    } else if (collectionName === "audit_logs") {
      const fp = window.clientFingerprint || {};
      const timestamp = payload.data_hora || payload.data || new Date().toISOString();
      const rawUserId = payload.usuario_id || payload.feito_por || null;
      
      let auditPayload = {
        usuario_id: rawUserId ? String(rawUserId) : null,
        acao: String(payload.acao || "Ação do Sistema"),
        descricao: payload.descricao ? String(payload.descricao) : String(payload.acao || ""),
        ip: payload.ip || fp.ip || "127.0.0.1",
        dispositivo: payload.dispositivo || fp.dispositivo || "Navegador Web",
        data_hora: timestamp
      };

      let insertRes = await supabaseClient.from("audit_logs").insert([auditPayload]).select();
      
      // Se a coluna no banco chama-se 'data' em vez de 'data_hora'
      if (insertRes.error && (insertRes.error.message.includes("data_hora") || insertRes.error.code === "PGRST204" || insertRes.error.code === "42703")) {
        delete auditPayload.data_hora;
        auditPayload.data = timestamp;
        insertRes = await supabaseClient.from("audit_logs").insert([auditPayload]).select();
      }
      
      // Se a foreign key em usuario_id falhar
      if (insertRes.error && (insertRes.error.message.includes("violates foreign key") || insertRes.error.code === "23503")) {
        auditPayload.usuario_id = null;
        insertRes = await supabaseClient.from("audit_logs").insert([auditPayload]).select();
      }

      if (insertRes.error) {
        console.warn("Aviso ao persistir audit_logs no Supabase:", insertRes.error);
      }
      return insertRes.data && insertRes.data[0] ? insertRes.data[0] : auditPayload;
    } else if (collectionName === "users") {
      if (payload.uid) {
        payload.id = payload.uid;
        delete payload.uid;
      }
    } else if (collectionName === "movimentacoes_estoque") {
      if (payload.os_id === "") payload.os_id = null;
      delete payload.usuario;
      delete payload.material_id;
    } else if (collectionName === "notificacoes") {
      payload = {
        user_id: String(payload.user_id || payload.usuario_id || "todos"),
        mensagem: String(payload.mensagem || ""),
        link: payload.link || null,
        lida: Boolean(payload.lida),
        data: payload.data || new Date().toISOString()
      };
    } else if (collectionName === "password_reset_requests") {
      payload = {
        user_id: String(payload.user_id || ""),
        solicitante: String(payload.solicitante || ""),
        setor: String(payload.setor || ""),
        observacao: payload.observacao || null,
        status: payload.status || "pendente",
        solicitado_em: payload.solicitado_em || new Date().toISOString()
      };
    }

    const { data, error } = await supabaseClient.from(collectionName).insert([payload]).select();
    if (error) {
      console.error(`Falha ao inserir em ${collectionName}:`, error);
      throw new Error(`Não foi possível gravar em ${collectionName}: ${error.message}`);
    }
    return data && data[0] ? data[0] : payload;
  },

  async persistUpdate(collectionName, id, updates, idField = "id") {
    try {
      const queryField = (collectionName === "users" && idField === "uid") ? "id" : idField;
      const payload = { ...updates };

      if (collectionName === "users") {
        delete payload.uid;
      }

      if (collectionName === "os") {
        if (payload.tecnico_responsavel === "") payload.tecnico_responsavel = null;
        if (payload.equipamento_id === "") payload.equipamento_id = null;
        delete payload.materiais_count;
        delete payload.mensagens_count;
        delete payload.ultimo_envio;
        delete payload.midia_url;
        delete payload.tipo_midia;

        if (payload.materiais !== undefined) {
          const materiais = payload.materiais || [];
          await supabaseClient.from("os_materiais").delete().eq("os_id", id);
          if (materiais.length > 0) {
            const matPayload = materiais.map(m => ({
              os_id: id,
              nome_material: m.nome_material,
              quantidade: m.quantidade,
              valor_unitario: m.valor_unitario
            }));
            await supabaseClient.from("os_materiais").insert(matPayload);
          }
          delete payload.materiais;
        }

        if (payload.mensagens !== undefined) {
          const mensagens = payload.mensagens || [];
          if (mensagens.length > 0) {
            const lastMsg = mensagens[mensagens.length - 1];
            await supabaseClient.from("os_mensagens").insert({
              os_id: id,
              mensagem_texto: lastMsg.mensagem_texto || "",
              midia_url: lastMsg.midia_url || null,
              tipo_midia: lastMsg.tipo_midia || "nenhum",
              enviado_por: lastMsg.enviado_por,
              data_envio: lastMsg.data_envio || new Date().toISOString()
            });
          }
          delete payload.mensagens;
        }
      }

      if (collectionName === "movimentacoes_estoque" && payload.os_id === "") {
        payload.os_id = null;
      }

      if (Object.keys(payload).length > 0) {
        const { error } = await supabaseClient
          .from(collectionName)
          .update(payload)
          .eq(queryField, id);

        if (error) {
          console.error(`Erro ao salvar update no Supabase para ${collectionName}:`, error);
        }
      }
    } catch (err) {
      console.error(err);
    }
  },

  async persistDelete(collectionName, id, idField = "id") {
    try {
      const queryField = (collectionName === "users") ? "id" : idField;
      const { data, error } = await supabaseClient
        .from(collectionName)
        .delete()
        .eq(queryField, id)
        .select();

      if (error) {
        console.error(`Erro ao deletar no Supabase para ${collectionName}:`, error);
      } else {
        console.log(`Deletado com sucesso do Supabase (${collectionName}):`, data);
      }
    } catch (err) {
      console.error(`Exceção em persistDelete (${collectionName}):`, err);
    }
  }
};

// Exposição global do banco
window.AppDatabase = AppDatabase;
AppDatabase.init();
