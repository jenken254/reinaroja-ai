export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userPrompt = body.prompt || "Hola Reina Roja.";
        const idioma = body.lang || "es";

        if (!env.AI) {
            return new Response(JSON.stringify({ error: "Binding AI no configurado." }), {
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        }

        // Definir la regla de idioma para la IA
        const instruccionIdioma = idioma === 'jp' 
            ? "REGLA CRÍTICA: Responde estrictamente en JAPONÉS. Mantén un tono técnico, frío y preciso." 
            : "REGLA CRÍTICA: Responde estrictamente en ESPAÑOL. Mantén un tono técnico, frío y preciso.";

        const aiResult = await env.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
            messages: [
                {
                    role: "system",
                    content: `Eres Reina Roja AI (2026), una entidad de análisis técnico, ciberseguridad, arquitectura de redes y desarrollo de software para DEMIAN ALEX3NDER. ${instruccionIdioma}`
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
