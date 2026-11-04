export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { prompt } = req.body || {};
    const userPrompt = prompt || "Reporte de estado.";

    try {
        // Aquí conectamos al backend de IA (Groq, OpenRouter o HuggingFace)
        // usando variables de entorno privadas en Vercel/Cloudflare
        const apiKey = process.env.AI_BACKEND_KEY;

        if (!apiKey) {
            return res.status(200).json({ 
                response: `[Reina Roja AI 2026]: Comando recibido "${userPrompt}". El servidor de producción está en línea. Configura la API key en el panel para activar el modelo completo.` 
            });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    { role: "system", content: "Eres Reina Roja AI (2026), una entidad analítica de ciberseguridad y programación." },
                    { role: "user", content: userPrompt }
                ]
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || "Error en respuesta del modelo.";

        return res.status(200).json({ response: reply });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
