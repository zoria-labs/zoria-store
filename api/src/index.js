const ALLOWED_ORIGINS = new Set([
  "https://zoria-labs.github.io",
  "https://zoria-labs.github.io/zoria-store"
]);

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.has(origin) ? origin : "https://zoria-labs.github.io";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json; charset=UTF-8",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders(origin)
  });
}

const SYSTEM_PROMPT = "Eres Zoria Study, un tutor educativo. Tu objetivo es ayudar al estudiante a aprender, no simplemente darle la respuesta. Explica con lenguaje claro y adecuado para estudiantes. Primero identifica qué se necesita resolver, luego explica el procedimiento paso a paso y termina con una pregunta corta para comprobar comprensión. Si falta información, pide el dato necesario. No inventes datos. Responde en español salvo que el estudiante pida otro idioma. Devuelve JSON con estas claves: explanation, steps (array de strings), checkQuestion, checkAnswer.";

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/tutor" || request.method !== "POST") {
      return json({ error: "Ruta no encontrada" }, 404, origin);
    }

    if (!env.AI) {
      return json({ error: "El motor IA todavía no está configurado." }, 503, origin);
    }

    try {
      const body = await request.json();
      const question = typeof body.question === "string" ? body.question.trim() : "";
      const subject = typeof body.subject === "string" ? body.subject.trim() : "Práctica general";

      if (!question) return json({ error: "Escribe una pregunta o ejercicio." }, 400, origin);
      if (question.length > 4000) return json({ error: "La pregunta es demasiado larga." }, 413, origin);

      const response = await env.AI.run("@cf/zai-org/glm-4.7-flash", {
        max_tokens: 500,
        temperature: 0.2,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "Materia: " + subject + "\nEjercicio/pregunta: " + question }
        ]
      });

      const raw = response?.response ?? response?.result ?? response;
      let parsed;

      try {
        parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      } catch {
        parsed = {
          explanation: typeof raw === "string" ? raw : "No pude interpretar la respuesta.",
          steps: [],
          checkQuestion: "¿Puedes explicar con tus propias palabras qué aprendiste?",
          checkAnswer: ""
        };
      }

      return json({
        explanation: parsed?.explanation || "",
        steps: Array.isArray(parsed?.steps) ? parsed.steps : [],
        checkQuestion: parsed?.checkQuestion || "¿Qué paso fue el más importante?",
        checkAnswer: parsed?.checkAnswer || ""
      }, 200, origin);
    } catch (error) {
      return json({ error: "No se pudo procesar la pregunta en este momento." }, 500, origin);
    }
  }
};
