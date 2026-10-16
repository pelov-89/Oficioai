import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const { mensaje } = req.body;

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

Responde en español.
Habla de forma clara, sencilla y profesional.
Prioriza soluciones prácticas y pasos concretos.
Evita respuestas innecesariamente largas.
Cuando una respuesta se pueda explicar brevemente, hazlo en 3 a 6 frases.
Si el usuario selecciona una especialidad, céntrate especialmente en ese oficio.
Si falta un dato importante para dar una respuesta correcta, pregunta antes de asumirlo.
`,

  input: mensaje,
});

    res.status(200).json({
      respuesta: respuesta.output_text,
    });
  } catch (error) {
  res.status(500).json({
  error: error.message,
});
  }
}
