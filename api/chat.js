import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });
  try {
    const { mensaje, imagen } = req.body || {};
    if (typeof mensaje !== "string" || !mensaje.trim() || mensaje.length > 5000) {
      return res.status(400).json({ error: "Escribe o dicta una consulta válida." });
    }
    if (imagen && (typeof imagen !== "string" || imagen.length > 4500000 || !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(imagen))) {
      return res.status(400).json({ error: "La imagen es demasiado grande o tiene un formato no admitido." });
    }
    const instrucciones = `Eres OficioAI, un asistente práctico especializado en trabajos y oficios.
Ayudas con electricidad, instalaciones solares fotovoltaicas, fontanería, albañilería, pintura, climatización, mecánica, presupuestos y materiales.
Responde siempre en español claro y profesional. Prioriza soluciones prácticas y pasos concretos. Normalmente usa un máximo de cinco puntos y frases breves porque las respuestas también se escuchan por voz. Si faltan datos importantes, pregunta antes de asumirlos. Respeta el oficio seleccionado, pero responde a la consulta real.
Cuando recibas una foto, describe solo lo que puedas observar. No afirmes que un equipo es seguro, que una avería está confirmada o que cumple la normativa solo por una imagen. Indica qué mediciones o verificaciones faltan.
Seguridad: en electricidad o energía solar, prioriza desconexión, EPI y verificación de ausencia de tensión antes de manipular equipos. No indiques trabajar con partes energizadas. En gas, estructuras o alturas recomienda personal cualificado cuando corresponda.`;
    const contenido = imagen
      ? [{ type: "input_text", text: mensaje }, { type: "input_image", image_url: imagen, detail: "low" }]
      : mensaje;
    const respuesta = await client.responses.create({
      model: "gpt-5-mini",
      instructions: instrucciones,
      input: [{ role: "user", content: contenido }],
      max_output_tokens: 900,
    });
    const texto = respuesta.output_text?.trim();
    if (!texto) return res.status(502).json({ error: "OficioAI no ha generado respuesta. Inténtalo otra vez." });
    return res.status(200).json({ respuesta: texto });
  } catch (error) {
    console.error("Error OficioAI:", error?.status, error?.message);
    if (error?.status === 429) return res.status(429).json({ error: "Límite o saldo de API agotado. Revisa el saldo de OpenAI." });
    if (error?.status === 401) return res.status(401).json({ error: "La clave de la API no es válida." });
    return res.status(500).json({ error: "OficioAI ha tenido un problema al responder. Inténtalo de nuevo." });
  }
}
