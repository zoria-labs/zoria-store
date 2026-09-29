# Zoria Study API

Backend seguro para el tutor IA de Zoria Study.

## Arquitectura

Alumno → Zoria Study (GitHub Pages) → Cloudflare Worker → Workers AI → explicación + mini-prueba

La clave importante: no se coloca ninguna API key en el frontend.

## Endpoint

POST /api/tutor

Body:

    {
      "subject": "Matemáticas",
      "question": "¿Por qué 24 × 7 = 168?"
    }

Respuesta:

    {
      "explanation": "...",
      "steps": ["...", "..."],
      "checkQuestion": "...",
      "checkAnswer": "..."
    }

## Estado

El código del backend ya está preparado en el repositorio, pero todavía no está conectado al sitio público porque el despliegue de Cloudflare requiere acceso a una cuenta de Cloudflare. No se inventan credenciales ni se guardan secretos en GitHub.

## Para activar la IA

1. Crear/usar una cuenta de Cloudflare.
2. Crear el Worker zoria-study-api.
3. Asociar Workers AI al binding AI.
4. Desplegar api/ con Wrangler.
5. Conectar el frontend de study/ al endpoint del Worker.
6. Probar CORS y el flujo pregunta → explicación → mini-prueba.

Hasta completar esos pasos, Zoria Study seguirá funcionando con su tutor local de aritmética.
