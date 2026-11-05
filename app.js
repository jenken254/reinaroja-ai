const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');
const welcomeMsg = document.getElementById('welcome-msg');

let idiomaActual = 'es';

const configIdiomas = {
    es: { placeholder: "Escribe tu consulta o comando técnico...", welcome: "Entorno de control activo para DEMIAN ALEX3NDER. Sistemas en línea. ¿Qué vector de análisis o código vamos a ejecutar?" },
    en: { placeholder: "Enter your technical query or command...", welcome: "Active control environment for DEMIAN ALEX3NDER. Systems online. What analysis or code vector shall we execute?" },
    jp: { placeholder: "セキュリティのコマンドや質問をここに入力してください...", welcome: "DEMIAN ALEX3NDER のアクティブな制御環境。システムオンライン。どの分析またはコードベクトルを実行しますか?" },
    zh: { placeholder: "在此输入您的技术咨询或命令...", welcome: "DEMIAN ALEX3NDER 的活动控制环境。系统在线。我们要执行什么分析或代码向量？" },
    ko: { placeholder: "기술 문의 또는 명령을 여기에 입력하세요...", welcome: "DEMIAN ALEX3NDER를 위한 활성 제어 환경. 시스템 온라인. 어떤 분석 또는 코드 벡터를 실행할까요?" },
    fr: { placeholder: "Entrez votre commande ou requête technique...", welcome: "Environnement de contrôle actif pour DEMIAN ALEX3NDER. Systèmes en ligne. Quel vecteur d'analyse ou de code allons-nous exécuter ?" },
    it: { placeholder: "Inserisci il tuo comando o quesito tecnico...", welcome: "Ambiente di controllo attivo per DEMIAN ALEX3NDER. Sistemi online. Quale vettore di analisi o codice eseguiamo?" }
};

function setLanguage(lang) {
    idiomaActual = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.getElementById(`btn-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');

    if (configIdiomas[lang]) {
        userInput.placeholder = configIdiomas[lang].placeholder;
        if (welcomeMsg) welcomeMsg.innerText = configIdiomas[lang].welcome;
    }
}

function aplicarEscapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${aplicarEscapeHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/36/dc143c/ffffff?text=RR'">
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
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        
        if (data && data.response) {
            botMsgDiv.innerText = data.response;
        } else {
            botMsgDiv.innerText = "Error en la respuesta del motor.";
        }

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error de comunicación con el servidor.";
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

if (sendBtn) sendBtn.addEventListener('click', enviarMensaje);
if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    });
}
