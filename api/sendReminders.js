// api/sendReminders.js

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;
const FIREBASE_PROJECT_ID = "adventlp";

export default async function handler(req, res) {
  try {
    if (!BOT_TOKEN || !FIREBASE_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "Missing TELEGRAM_BOT_TOKEN or FIREBASE_API_KEY env vars",
      });
    }

    const now = new Date();
    const currentTime = now.toISOString().slice(11, 16); // HH:MM

    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents:runQuery?key=${FIREBASE_API_KEY}`;

    const body = {
      structuredQuery: {
        from: [{ collectionId: "reminders" }],
        where: {
          compositeFilter: {
            op: "AND",
            filters: [
              {
                fieldFilter: {
                  field: { fieldPath: "enabled" },
                  op: "EQUAL",
                  value: { booleanValue: true },
                },
              },
              {
                fieldFilter: {
                  field: { fieldPath: "time" },
                  op: "EQUAL",
                  value: { stringValue: currentTime },
                },
              },
            ],
          },
        },
      },
    };

    const firestoreResponse = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const queryRes = await firestoreResponse.json();

    // Если Firestore вернул ошибку — не падаем, а показываем её
    if (!Array.isArray(queryRes)) {
      console.error("Firestore error response:", queryRes);
      return res.status(500).json({
        ok: false,
        source: "firestore",
        response: queryRes,
      });
    }

    const matches = queryRes
      .filter((r) => r.document && r.document.fields)
      .map((r) => r.document.fields);

    if (!matches.length) {
      return res.status(200).json({
        ok: true,
        message: "No reminders at this time",
        time: currentTime,
      });
    }

    const sendMsg = (chatId) =>
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: "✨ Новый день уже настал! Загляни в адвент 🎄",
        }),
      });

    await Promise.all(
      matches.map((u) => sendMsg(u.chatId.stringValue))
    );

    res.status(200).json({
      ok: true,
      sent: matches.length,
      time: currentTime,
    });
  } catch (e) {
    console.error("sendReminders ERROR:", e);
    res.status(500).json({ ok: false, error: String(e) });
  }
}
