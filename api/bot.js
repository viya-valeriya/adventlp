// api/bot.js
// Вебхук для Telegram-бота @advent_LP_bot на Vercel

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

// Маленький хелпер для отправки сообщений
async function sendMessage(chatId, text) {
  const webAppUrl = "https://adventlp.vercel.app";

  const body = {
    chat_id: chatId,
    text,
    reply_markup: {
      keyboard: [
        [
          {
            text: "Открыть календарь",
            web_app: { url: webAppUrl },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
    parse_mode: "HTML",
  };

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  const update = req.body;

  if (!update || !update.message) {
    return res.status(200).json({ ok: true });
  }

  const chatId = update.message.chat.id;
  const text = update.message.text || "";

  if (text === "/start" || text.startsWith("/start@advent_LP_bot")) {
    const intro =
      "Привет! ✨\n\n" +
      "Это адвент-календарь команды LifePractic — 31 день маленьких поддерживающих посланий.\n\n" +
      "Нажми кнопку <b>«Открыть календарь»</b>, чтобы перейти к окнам декабря.";

    try {
      await sendMessage(chatId, intro);
    } catch (e) {
      console.error("Error sending /start message:", e);
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true });
}
