const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

// Можно регулировать лимиты, чтобы не раздувать расходы
functions.logger.log("Initializing functions...");
admin.initializeApp();
const db = admin.firestore();

// Токен бота берём из functions:config (см. ниже)
const BOT_TOKEN = functions.config().telegram.bot_token;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// ID приложения для коллекции artifacts/{appId}/...
// Можешь поменять на свой __app_id, если используешь его в проекте.
const APP_ID = "default";

// Крон-функция: каждый день в 06:00 по Москве шлём напоминания
exports.sendAdventReminders = functions.pubsub
  .schedule("0 6 * * *")
  .timeZone("Europe/Moscow")
  .onRun(async (context) => {
    functions.logger.info("sendAdventReminders started");

    try {
      const usersSnap = await db
        .collection("artifacts")
        .doc(APP_ID)
        .collection("users")
        .get();

      if (usersSnap.empty) {
        functions.logger.info("No users found");
        return null;
      }

      const tasks = [];

      usersSnap.forEach((userDoc) => {
        const userId = userDoc.id;

        // Ожидаем структуру:
        // artifacts/{appId}/users/{userId}/reminders/settings
        // c полями { enabled: true|false, telegram_chat_id: number }
        const remindersDocRef = userDoc.ref
          .collection("reminders")
          .doc("settings");

        tasks.push(
          remindersDocRef.get().then(async (remindersSnap) => {
            if (!remindersSnap.exists) {
              functions.logger.debug(
                `No reminders settings for user ${userId}`
              );
              return;
            }

            const data = remindersSnap.data();
            const enabled = data.enabled;
            const chatId = data.telegram_chat_id;

            if (!enabled || !chatId) {
              functions.logger.debug(
                `Reminders disabled or chatId missing for user ${userId}`
              );
              return;
            }

            const text = "Новый день адвента уже открыт! 🎄";

            try {
              const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: chatId,
                  text,
                }),
              });

              const body = await res.text();

              if (!res.ok) {
                functions.logger.error(
                  `Failed to send to ${userId} (${chatId}): ${res.status} ${body}`
                );
              } else {
                functions.logger.info(
                  `Reminder sent to user ${userId} (${chatId})`
                );
              }
            } catch (err) {
              functions.logger.error(
                `Error sending to user ${userId} (${chatId}): ${err}`
              );
            }
          })
        );
      });

      await Promise.all(tasks);
      functions.logger.info("sendAdventReminders finished");
      return null;
    } catch (err) {
      functions.logger.error("sendAdventReminders error", err);
      return null;
    }
  });
