import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Método no permitido",
    });
  }

  try {
    const { mensaje } = req.body;

    if (!mensaje || !mensaje.trim()) {
      return res.status(400).json({
        error: "Escribe o dicta una consulta.",
      });
    }

    const respuesta = await client.responses.create({
      model: "gpt-5-mini",

      instructions: `
Eres OficioAI, un asistente práctico especializado en trabajos y oficios.

Ayudas principalmente con:
- Electricidad
- Instalaciones solares fotovoltaicas
- Fontanería
- Albañilería
- Pintura
- Climatización
- Mecánica
- Presupuestos y materiales

Responde siempre en español.

Tu objetivo es ayudar a profesionales y particulares con respuestas prácticas, claras y fáciles de entender.

Reglas:
- Habla de forma clara, sencilla y profesional.
- Prioriza soluciones prácticas y pasos concretos.
- Evita respuestas innecesariamente largas.
- Responde normalmente con un máximo de 5 puntos.
- Usa frases cortas porque las respuestas también se escuchan por voz.
- Empieza por las comprobaciones más probables y sencillas.
- Si falta un dato importante, pregunta antes de asumirlo.
- Si el usuario selecciona una especialidad, céntrate especialmente en ese oficio.
- Si la consulta pertenece claramente a otro oficio, responde según la consulta real.
- No repitas información innecesariamente.
- Si el usuario pide más detalle, puedes ampliar la explicación.

Seguridad:
En trabajos eléctricos o solares, prioriza siempre seguridad, desconexión, EPI y verificación de ausencia de tensión antes de manipular equipos.
No indiques al usuario que trabaje con partes energizadas.
`,

      input: mensaje,
    });

    const texto = respuesta.output_text?.trim();

    if (!texto) {
      return res.status(500).json({
        error: "OficioAI no ha generado respuesta. Inténtalo otra vez.",
      });
    }

    return res.status(200).json({
      respuesta: texto,
    });

  } catch (error) {
    console.error("Error OficioAI:", error);

    if (error.status === 429) {
      return res.status(429).json({
        error: "OficioAI se ha quedado sin crédito de API. Revisa el saldo de OpenAI.",
      });
    }

    return res.status(500).json({
      error: "OficioAI ha tenido un problema al responder. Inténtalo de nuevo.",
    });
  }
}
