const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');

function aplicarEscapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // 1. Insertar el mensaje del usuario en el chat
    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${aplicarEscapeHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Crear el bloque de respuesta temporal
    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/36/dc143c/ffffff?text=RR'">
            <div class="message-content">Procesando consulta...</div>
        </div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // 3. Petición al Worker
        const respuesta = await fetch(`https://redqueen-ai.fkasudje.workers.dev/?prompt=${encodeURIComponent(texto)}`);
        const data = await respuesta.json();

        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        
        if (data && data.response) {
            botMsgDiv.innerText = data.response;
        } else if (data && data.error) {
            botMsgDiv.innerText = `[Respuesta del Servidor]: ${data.error}`;
        } else {
            botMsgDiv.innerText = "Reina Roja: Módulo activo, esperando datos.";
        }

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error de comunicación con el Worker de Cloudflare.";
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Eventos de escucha para el botón y la tecla Enter
if (sendBtn) {
    sendBtn.addEventListener('click', enviarMensaje);
}

if (userInput) {
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            enviarMensaje();
        }
    });
}
