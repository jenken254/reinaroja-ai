const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');

async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // 1. Mostrar mensaje del usuario
    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${escaparHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Crear mensaje temporal de carga
    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/36/dc143c/ffffff?text=RR'">
            <div class="message-content">Procesando...</div>
        </div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // 3. Petición directa a tu Worker de Cloudflare
        const respuesta = await fetch(`https://redqueen-ai.fkasudje.workers.dev/?prompt=${encodeURIComponent(texto)}`);
        const data = await respuesta.json();

        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        
        // Asignar respuesta o error devuelto por el servidor
        if (data && data.response) {
            botMsgDiv.innerText = data.response;
        } else if (data && data.error) {
            botMsgDiv.innerText = `[Error de Servidor]: ${data.error}`;
        } else {
            botMsgDiv.innerText = "Reina Roja: Módulo en espera de configuración backend.";
        }

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error de conexión con el Worker de Cloudflare.";
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapingHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

sendBtn.addEventListener('click', enviarMensaje);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
    }
});
