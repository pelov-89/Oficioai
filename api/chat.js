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
      input: mensaje,
    });

    res.status(200).json({
      respuesta: respuesta.output_text,
    });
  } catch (error) {
    res.status(500).json({
      error: "No se pudo obtener respuesta de la IA",
    });
  }
}
