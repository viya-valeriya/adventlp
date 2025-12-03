// api/remind.js
// Минимальная тестовая функция, чтобы проверить, что эндпоинт жив.

export default async function handler(req, res) {
  try {
    return res.status(200).json({
      ok: true,
      message: "remind endpoint is alive",
      time: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e)
    });
  }
}
