const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');
const welcomeMsg = document.getElementById('welcome-msg');

let idiomaActual = 'es'; // Por defecto español

function setLanguage(lang) {
    idiomaActual = lang;
    document.getElementById('btn-es').classList.remove('active');
    document.getElementById('btn-jp').classList.remove('active');
    
    if (lang === 'es') {
        document.getElementById('btn-es').classList.add('active');
        userInput.placeholder = "Escribe tu consulta o comando técnico...";
        welcomeMsg.innerText = "Entorno de control activo para DEMIAN ALEX3NDER. Sistemas en línea. ¿Qué vector de análisis o código vamos a ejecutar?";
    } else {
        document.getElementById('btn-jp').classList.add('active');
        userInput.placeholder = "セキュリティのコマンドや質問をここに入力してください...";
        welcomeMsg.innerText = "DEMIAN ALEX3NDER のアクティブな制御環境。システムオンライン。どの分析またはコードベクトルを実行しますか?";
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
