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

    // 1. Mostrar mensaje del usuario
    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${aplicarEscapeHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Crear bloque de respuesta temporal
    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/36/dc143c/ffffff?text=RR'">
            <div class="message-content">Procesando consulta...</div>
        </div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        // PETICIÓN A RUTA LOCAL RELATIVA (Sin dominios externos de Workers)
        const respuesta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: texto })
        });

        const data = await respuesta.json();
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        
        if (data && data.response) {
            botMsgDiv.innerText = data.response;
        } else if (data && data.error) {
            botMsgDiv.innerText = `[Error de Pages]: ${data.error}`;
        } else {
            botMsgDiv.innerText = "Reina Roja: Módulo activo, sin respuesta del motor.";
        }

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error al conectar con la ruta interna /api/chat de Pages.";
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
