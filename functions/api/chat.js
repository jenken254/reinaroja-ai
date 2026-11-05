export async function onRequestPost(context) {
    try {
        const { request, env } = context;
        const body = await request.json();
        const userPrompt = body.prompt || "";
        const userLang = body.lang || "es";

        // Comprobar si el binding de Workers AI está activo
        if (!env.AI) {
            return new Response(JSON.stringify({ 
                error: "El binding de IA ('AI') no está configurado en Cloudflare Pages." 
            }), {
                status: 500,
                headers: { "Content-Type": "application/json;charset=UTF-8" }
            });
        }

        // Prompts de sistema según el idioma
        const systemPrompts = {
            es: "Eres la Reina Roja AI (2026), un asistente táctico de ciberseguridad e inteligencia analítica. Responde en español de forma precisa, profesional y directa.",
            en: "You are Red Queen AI (2026), a tactical cybersecurity and analytical intelligence assistant. Respond in English accurately and concisely.",
            jp: "あなたはレッドクイーンAI（2026）です。サイバーセキュリティと分析の専門家として、日本語で正確に回答してください。",
            zh: "你是红后AI（2026），网络安全与分析情报助手。请用中文准确回答。",
            ko: "당신은 레드 퀸 AI(2026)입니다. 사이버 보안 및 분석 정보 보조원으로서 한국어로 명확하게 답변하십시오.",
            fr: "Vous êtes la Reine Rouge AI (2026), assistante tactique en cybersécurité et intelligence analytique. Répondez en français de manière précise.",
            it: "Sei la Regina Rossa AI (2026), un assistente tattico di cybersecurity e intelligenza analitica. Rispondi in italiano in modo preciso."
        };

        const systemMessage = systemPrompts[userLang] || systemPrompts.es;

        // Ejecutar llamada a Cloudflare Workers AI (Mistral 7B)
        const aiResponse = await env.AI.run("@cf/mistral/mistral-7b-instruct-v0.1", {
            messages: [
                { role: "system", content: systemMessage },
                { role: "user", content: userPrompt }
            ],
            max_tokens: 1024
        });

        const replyText = aiResponse.response || "Sin respuesta del modelo.";

        return new Response(JSON.stringify({ response: replyText }), {
            headers: { 
                "Content-Type": "application/json;charset=UTF-8",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { "Content-Type": "application/json;charset=UTF-8" }
        });
    }
}
