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

        const mapaIdiomas = {
            es: "ESPAÑOL",
            en: "INGLÉS",
            jp: "JAPONÉS (日本語)",
            zh: "CHINO MANDARÍN (中文)",
            ko: "COREANO (한국어)",
            fr: "FRANCÉS",
            it: "ITALIANO"
        };

        const nombreIdioma = mapaIdiomas[idioma] || "ESPAÑOL";
        const reglaIdioma = `REGLA DE IDIOMA CRÍTICA: Responde ESTRICTAMENTE en ${nombreIdioma}. Está prohibido responder en cualquier otro idioma.`;

        const aiResult = await env.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
            messages: [
                {
                    role: "system",
                    content: `Eres Reina Roja AI (2026), una entidad de análisis técnico, ciberseguridad, arquitectura de redes y desarrollo de software para DEMIAN ALEX3NDER. ${reglaIdioma} Mantén siempre un tono frío, analítico, directo, preciso y sin rodeos.`
                },
                {
                    role: "user",
                    content: `[Idioma requerido: ${nombreIdioma}] Consulta: ${userPrompt}`
                }
            ],
            max_tokens: 2048
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
