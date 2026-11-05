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

        let reglaIdioma = "RESPONDE ESTRICTAMENTE EN ESPAÑOL. Está prohibido usar el idioma inglés.";
        if (idioma === 'jp') {
            reglaIdioma = "RESPONDE ESTRICTAMENTE EN JAPONÉS. Está prohibido usar el idioma inglés.";
        }

        const aiResult = await env.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
            messages: [
                {
                    role: "system",
                    content: `Eres Reina Roja AI (2026), una entidad de ciberseguridad y desarrollo de software para DEMIAN ALEX3NDER. ${reglaIdioma} Mantén un tono técnico, frío y preciso.`
                },
                {
                    role: "user",
                    content: `[Instrucción de Idioma: ${reglaIdioma}] Consulta: ${userPrompt}`
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
