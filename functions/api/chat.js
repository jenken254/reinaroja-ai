export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userPrompt = body.prompt || "Hola Reina Roja.";

        if (!env.AI) {
            return new Response(JSON.stringify({ 
                error: "El binding 'AI' no está configurado en Pages." 
            }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        }

        // Usar un modelo activo con alta compatibilidad en Cloudflare Workers AI
        const aiResult = await env.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
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
