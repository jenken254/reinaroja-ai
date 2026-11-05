const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');
const welcomeMsg = document.getElementById('welcome-msg');
const historyListContainer = document.getElementById('historyListContainer');

let idiomaActual = 'es';
let sesiones = JSON.parse(localStorage.getItem('reina_roja_sesiones')) || [];
let sesionActualId = localStorage.getItem('reina_roja_actual_id') || null;

const configIdiomas = {
    es: { placeholder: "Escribe tu consulta o comando técnico...", welcome: "Entorno de control activo para DEMIAN ALEX3NDER. Sistemas en línea. ¿Qué vector de análisis o código vamos a ejecutar?" },
    en: { placeholder: "Enter your technical query or command...", welcome: "Active control environment for DEMIAN ALEX3NDER. Systems online. What analysis or code vector shall we execute?" },
    jp: { placeholder: "セキュリティのコマンドや質問をここに入力してください...", welcome: "DEMIAN ALEX3NDER のアクティブな制御環境。システムオンライン。どの分析またはコードベクトルを実行しますか?" },
    zh: { placeholder: "在此输入您的技术咨询或命令...", welcome: "DEMIAN ALEX3NDER 的活动控制环境。系统在线。我们要执行什么分析或代码向量？" },
    ko: { placeholder: "기술 문의 또는 명령을 여기에 입력하세요...", welcome: "DEMIAN ALEX3NDER를 위한 활성 제어 환경. 시스템 온라인. 어떤 분석 또는 코드 벡터를 실행할까요?" },
    fr: { placeholder: "Entrez votre commande ou requête technique...", welcome: "Environnement de contrôle actif pour DEMIAN ALEX3NDER. Systèmes en ligne. Quel vecteur d'analyse ou de code allons-nous exécuter ?" },
    it: { placeholder: "Inserisci il tuo comando o quesito tecnico...", welcome: "Ambiente di controllo attivo per DEMIAN ALEX3NDER. Sistemi online. Quale vettore di analisi o codice eseguiamo?" }
};

// --- MÓDULO DE VOZ (TTS) ---
function reproducirVoz(texto) {
    if (!('speechSynthesis' in window)) {
        alert("La síntesis de voz no está soportada en este navegador.");
        return;
    }
    window.speechSynthesis.cancel(); // Detener cualquier reproducción previa
    const utterance = new SpeechSynthesisUtterance(texto);
    
    const codigosVoz = {
        es: 'es-ES',
        en: 'en-US',
        jp: 'ja-JP',
        zh: 'zh-CN',
        ko: 'ko-KR',
        fr: 'fr-FR',
        it: 'it-IT'
    };
    
    utterance.lang = codigosVoz[idiomaActual] || 'es-ES';
    utterance.rate = 1.0; // Velocidad normal de locución
    window.speechSynthesis.speak(utterance);
}

// --- GESTIÓN DE HISTORIAL Y SESIONES ---
function inicializarSesiones() {
    if (sesiones.length === 0) {
        iniciarNuevaSesion();
    } else if (!sesionActualId || !sesiones.some(s => s.id === sesionActualId)) {
        sesionActualId = sesiones[0].id;
    }
    renderizarHistorialSidebar();
    cargarMensajesSesionActual();
}

function iniciarNuevaSesion() {
    const nuevaSesion = {
        id: 'session_' + Date.now(),
        titulo: 'Nueva Sesión',
        mensajes: []
    };
    sesiones.unshift(nuevaSesion);
    sesionActualId = nuevaSesion.id;
    guardarAlmacenamiento();
    renderizarHistorialSidebar();
    limpiarContenedorChat();
}

function guardarAlmacenamiento() {
    localStorage.setItem('reina_roja_sesiones', JSON.stringify(sesiones));
    localStorage.setItem('reina_roja_actual_id', sesionActualId);
}

function renderizarHistorialSidebar() {
    historyListContainer.innerHTML = '';
    sesiones.forEach(sesion => {
        const div = document.createElement('div');
        div.className = `history-item ${sesion.id === sesionActualId ? 'active' : ''}`;
        div.innerText = sesion.titulo;
        div.onclick = () => cambiarSesion(sesion.id);
        historyListContainer.appendChild(div);
    });
}

function cambiarSesion(id) {
    sesionActualId = id;
    guardarAlmacenamiento();
    renderizarHistorialSidebar();
    cargarMensajesSesionActual();
}

function limpiarContenedorChat() {
    messagesContainer.innerHTML = `
        <div class="message bot">
            <div class="bot-header">
                <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/32/dc143c/ffffff?text=RR'">
                <strong>Reina Roja</strong>
            </div>
            <div class="message-content" id="welcome-msg">
                ${configIdiomas[idiomaActual].welcome}
            </div>
        </div>`;
}

function cargarMensajesSesionActual() {
    const sesion = sesiones.find(s => s.id === sesionActualId);
    if (!sesion || sesion.mensajes.length === 0) {
        limpiarContenedorChat();
        return;
    }

    messagesContainer.innerHTML = '';
    sesion.mensajes.forEach(msg => {
        if (msg.role === 'user') {
            messagesContainer.innerHTML += `
                <div class="message user">
                    <div class="message-content">${aplicarEscapeHTML(msg.content)}</div>
                </div>`;
        } else {
            const botDivId = 'msg_' + Math.random().toString(36.substr(2, 9));
            const botDiv = document.createElement('div');
            botDiv.className = 'message bot';
            botDiv.innerHTML = `
                <div class="bot-header">
                    <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/32/dc143c/ffffff?text=RR'">
                    <strong>Reina Roja</strong>
                </div>
                <div class="message-content">${aplicarEscapeHTML(msg.content)}</div>
                <button class="tts-btn" onclick="reproducirVoz(this.previousElementSibling.innerText)">🔊 Escuchar Audio</button>`;
            messagesContainer.appendChild(botDiv);
        }
    });
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setLanguage(lang) {
    idiomaActual = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (configIdiomas[lang]) {
        userInput.placeholder = configIdiomas[lang].placeholder;
        const welcome = document.getElementById('welcome-msg');
        if (welcome) welcome.innerText = configIdiomas[lang].welcome;
    }
}

function aplicarEscapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // Agregar mensaje de usuario al DOM
    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${aplicarEscapeHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Guardar en la sesión actual
    let sesion = sesiones.find(s => s.id === sesionActualId);
    if (sesion) {
        if (sesion.mensajes.length === 0) {
            sesion.titulo = texto.length > 25 ? texto.substring(0, 25) + '...' : texto;
        }
        sesion.mensajes.push({ role: 'user', content: texto });
    }

    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <div class="bot-header">
                <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/32/dc143c/ffffff?text=RR'">
                <strong>Reina Roja</strong>
            </div>
            <div class="message-content">Procesando...</div>
        </div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const respuesta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: texto, lang: idiomaActual })
        });

        const data = await respuesta.json();
        const botContainer = document.getElementById(tempBotId);
        const botMsgDiv = botContainer.querySelector('.message-content');
        
        if (data && data.response) {
            const textoRespuesta = data.response;
            botMsgDiv.innerText = textoRespuesta;
            
            // Añadir botón de voz a la respuesta generada
            const ttsButton = document.createElement('button');
            ttsButton.className = 'tts-btn';
            ttsButton.innerText = '🔊 Escuchar Audio';
            ttsButton.onclick = () => reproducirVoz(textoRespuesta);
            botContainer.appendChild(ttsButton);

            // Guardar respuesta en la sesión
            if (sesion) {
                sesion.mensajes.push({ role: 'bot', content: textoRespuesta });
                guardarAlmacenamiento();
                renderizarHistorialSidebar();
            }
        } else {
            botMsgDiv.innerText = "Error en la respuesta del motor.";
        }

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error de comunicación con el servidor.";
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Event Listeners
if (sendBtn) sendBtn.addEventListener('click', enviarMensaje);
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    });
}

// Inicializar al cargar la página
window.onload = () => {
    inicializarSesiones();
};
