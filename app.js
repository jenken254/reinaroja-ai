// Reemplaza o asegura estas dos partes en tu app.js:

async function enviarMensaje() {
    const userInput = document.getElementById('userInput');
    const messagesContainer = document.getElementById('messages');
    
    if (!userInput || !messagesContainer) return;

    const texto = userInput.value.trim();
    if (!texto) return;

    // 1. Mostrar mensaje del usuario inmediatamente
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.innerHTML = `<div class="message-content">${aplicarEscapeHTML(texto)}</div>`;
    messagesContainer.appendChild(userDiv);
    
    userInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 2. Guardar en sesión activa
    let sesion = sesiones.find(s => s.id === sesionActualId);
    if (sesion) {
        if (sesion.mensajes.length === 0) {
            sesion.titulo = texto.length > 20 ? texto.substring(0, 20) + '...' : texto;
        }
        sesion.mensajes.push({ role: 'user', content: texto });
    }

    // 3. Crear contenedor de "Procesando..."
    const tempBotId = 'bot-' + Date.now();
    const botContainer = document.createElement('div');
    botContainer.className = 'message bot';
    botContainer.id = tempBotId;
    botContainer.innerHTML = `
        <div class="bot-header">
            <img src="neo/imag/5.jpg" alt="Reina Roja" class="avatar-lateral" onerror="this.src='https://via.placeholder.com/30/dc143c/ffffff?text=RR'">
            <strong>Reina Roja</strong>
        </div>
        <div class="message-content">Procesando petición...</div>`;
    messagesContainer.appendChild(botContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    // 4. Petición a Cloudflare Functions
    try {
        const respuesta = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: texto, lang: idiomaActual })
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP status: ${respuesta.status}`);
        }

        const data = await respuesta.json();
        const botMsgDiv = botContainer.querySelector('.message-content');
        
        if (data && data.response) {
            const textoRespuesta = data.response;
            botMsgDiv.innerText = textoRespuesta;
            
            // Botón de audio
            const ttsButton = document.createElement('button');
            ttsButton.className = 'tts-btn';
            ttsButton.innerText = '🔊 Escuchar Audio';
            ttsButton.onclick = () => reproducirVoz(textoRespuesta);
            botContainer.appendChild(ttsButton);

            if (sesion) {
                sesion.mensajes.push({ role: 'bot', content: textoRespuesta });
                guardarAlmacenamiento();
                renderizarHistorialSidebar();
            }
        } else {
            botMsgDiv.innerText = "Error: El motor no devolvió una respuesta válida.";
        }

    } catch (error) {
        console.error("Error detectado:", error);
        const botMsgDiv = botContainer.querySelector('.message-content');
        botMsgDiv.innerText = `Error de conexión (/api/chat). Verifica las funciones de Cloudflare.`;
    }

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Asegurar la vinculación de eventos al cargar
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('sendBtn');
    const input = document.getElementById('userInput');

    if (btn) {
        btn.onclick = (e) => {
            e.preventDefault();
            enviarMensaje();
        };
    }

    if (input) {
        input.onkeydown = (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                enviarMensaje();
            }
        };
    }
});
