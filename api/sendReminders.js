// api/sendReminders.js

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// Инициализация Firebase Admin (один раз)
function getAdminDb() {
  if (!getApps().length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  return getFirestore();
}

export default async function handler(req, res) {
  try {
    const db = getAdminDb();

    // Текущее UTC-время HH:MM
    const now = new Date();
    const currentTime = now.toISOString().slice(11, 16); // "HH:MM"

    // Пользователи с включёнными напоминаниями и совпадающим временем
    const snapshot = await db
      .collection('reminders')
      .where('enabled', '==', true)
      .where('time', '==', currentTime)
      .get();

    const users = snapshot.docs.map((d) => d.data());

    if (!users.length) {
      return res.status(200).json({
        ok: true,
        message: 'No users at this time',
        time: currentTime,
      });
    }

    const sendMessage = (chatId, text) =>
      fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: text,
          }),
        }
      );

    const results = await Promise.all(
      users.map((u) =>
        sendMessage(
          u.chatId,
          '✨ Новый день в адвенте уже настал! Загляни в календарь 🎄'
        )
      )
    );

    res.status(200).json({
      ok: true,
      sent: users.length,
      time: currentTime,
    });
  } catch (e) {
    console.error('sendReminders ERROR:', e);
    res.status(500).json({ ok: false, error: e.message });
  }
}
