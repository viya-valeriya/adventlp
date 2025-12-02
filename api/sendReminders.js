// api/sendReminders.js
// Тестовый минимальный хендлер, чтобы проверить, что маршрут работает

export default async function handler(req, res) {
  try {
    const hasBotToken = !!process.env.TELEGRAM_BOT_TOKEN;
    const hasFirebaseKey = !!process.env.FIREBASE_API_KEY;

    return res.status(200).json({
      ok: true,
      message: "sendReminders test handler is working",
      env: {
        TELEGRAM_BOT_TOKEN: hasBotToken,
        FIREBASE_API_KEY: hasFirebaseKey,
      },
    });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      error: String(e),
    });
  }
}
