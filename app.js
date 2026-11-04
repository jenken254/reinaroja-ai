const sendBtn = document.getElementById('sendBtn');
const userInput = document.getElementById('userInput');
const messagesContainer = document.getElementById('messages');

async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // Agregar mensaje del usuario al chat
    messagesContainer.innerHTML += `
        <div class="message user">
            <div class="message-content">${escaparHTML(texto)}</div>
        </div>`;
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // Indicador de carga
    const tempBotId = 'bot-' + Date.now();
    messagesContainer.innerHTML += `
        <div class="message bot" id="${tempBotId}">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/36/dc143c/ffffff?text=RR'">
            <div class="message-content">Procesando orden...</div>
        </div>`;
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
        const respuesta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: texto })
        });

        const data = await respuesta.json();
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = data.response || data.error || "Sin respuesta del módulo backend.";

    } catch (error) {
        const botMsgDiv = document.getElementById(tempBotId).querySelector('.message-content');
        botMsgDiv.innerText = "Error de conexión con el servidor.";
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escaparHTML(str) {
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
