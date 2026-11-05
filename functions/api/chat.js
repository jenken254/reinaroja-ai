export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userPrompt = body.prompt || "Hola Reina Roja.";

        // Verifica que el binding 'AI' esté disponible
        if (!env.AI) {
            return new Response(JSON.stringify({ 
                error: "El binding 'AI' no está respondiendo en la configuración de Pages." 
            }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        }

        // Llamada al modelo Llama 3.1 8B activo en Cloudflare
        const aiResult = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
            messages: [
                {
                    role: "system",
                    content: "Eres Reina Roja AI (2026), una entidad de análisis técnico, ciberseguridad, arquitectura de redes y desarrollo de software. Respondes de forma directa, técnica, precisa y estructurada para DEMIAN ALEX3NDER."
                },
                {
                    role: "user",
                    content: userPrompt
                }
            ]
        });

        return new Response(JSON.stringify({ response: aiResult.response }), {
            headers: { "Content-Type": "application/json;charset=UTF-8" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
    }
}
