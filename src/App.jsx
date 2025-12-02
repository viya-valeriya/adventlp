import React, { useState, useEffect } from "react";
import {
  Lock,
  Sparkles,
  TreePine,
  Coffee,
  CloudSun,
  Heart,
  Feather,
  Users,
  Gift,
  Smile,
  BookOpen,
  Rocket,
  PartyPopper,
  Music,
  Sun
} from "lucide-react";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp
} from "firebase/firestore";

// --- ТВОЙ FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyCOHeMkOIwG0ddkwh3zz4o5pyfR97jPS50",
  authDomain: "adventlp.firebaseapp.com",
  projectId: "adventlp",
  storageBucket: "adventlp.firebasestorage.app",
  messagingSenderId: "1025160764098",
  appId: "1:1025160764098:web:35d99c13486ece5753f95b",
  measurementId: "G-SNGM8LTHJX"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Идентификатор приложения в Firestore
const APP_ID = "lifepactic-advent";

// Цвета
const COLORS = {
  white: "#ffffff",
  dawnPink: "#f1eae0",
  tuatara: "#363636",
  fireEngineRed: "#c82926",
  rodeoDust: "#c7b895",
  bone: "#e3dbca",
  forestGreen: "#2f855a"
};

// Пул пожеланий
const WISHES_POOL = [
  "Ты — автор своей истории, даже если сейчас сложная глава - самое время писать следующую!",
  "Найди сегодня минуту размеренности — такой, как когда наблюдаешь за снежинками и просто дышишь.",
  "Устрой себе 30 минут ничегонеделания — побудь в моменте без задач и тревоги.",
  "Подари себе сегодня немного тепла — позвони близкому или обними того, кто рядом.",
  "Найди время для уединения с хорошей книгой.",
  "Пополни запас энергии — чем-то вкусным и тёплым.",
  "Сделай шаг к тому, кем хочешь быть в новом году.",
  "Позволь себе мечтать чуть смелее.",
  "Посмотри на огоньки вокруг — отметь, что зажигает внутри.",
  "Обними свою сегодняшнюю версию — она достойна тепла."
];

// Подбор иконки по тексту пожелания
const getThematicIllustration = (text) => {
  const props = { size: 48, strokeWidth: 1.5 };
  const t = text.toLowerCase();

  if (t.includes("чай") || t.includes("кофе") || t.includes("тепл"))
    return <Coffee {...props} color="#795548" />;
  if (t.includes("свет") || t.includes("огоньки") || t.includes("огонь"))
    return <Sun {...props} color="#F59E0B" />;
  if (t.includes("люб") || t.includes("обним"))
    return <Heart {...props} color="#c82926" />;
  if (t.includes("снег") || t.includes("тишин") || t.includes("декабр"))
    return <CloudSun {...props} color="#706c91" />;
  if (t.includes("мечт") || t.includes("вдохнов"))
    return <Feather {...props} color="#c82926" />;
  if (t.includes("улыб"))
    return <Smile {...props} color="#F59E0B" />;
  if (t.includes("книг"))
    return <BookOpen {...props} color="#795548" />;
  if (t.includes("шаг"))
    return <Rocket {...props} color="#c82926" />;
  if (t.includes("празд"))
    return <PartyPopper {...props} color="#c82926" />;
  if (t.includes("коллег") || t.includes("друг"))
    return <Users {...props} color="#706c91" />;

  return <Gift {...props} color="#c82926" />;
};

export default function AdventCalendar() {
  const [user, setUser] = useState(null);
  const [openedDays, setOpenedDays] = useState({});
  const [modalData, setModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // currentDate:
  // -1 = доступен только 29.11
  //  0 = 29–30.11
  //  1..31 = дни декабря
  const [currentDate, setCurrentDate] = useState(-1);

  // Авторизация (анонимно)
  useEffect(() => {
    const run = async () => {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth error:", e);
      }
    };
    run();
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // Определяем текущий доступный день по системной дате
  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-янв, 10-ноя, 11-дек
    const day = now.getDate();

    let value = -1;

    if (month === 10) {
      // Ноябрь
      if (day >= 30) value = 0;       // 29 и 30 ноября
      else if (day >= 29) value = -1; // только 29
    } else if (month === 11) {
      // Декабрь
      value = Math.min(day, 31);
    }

    setCurrentDate(value);
  }, []);

  // Подписка на прогресс пользователя
  useEffect(() => {
    if (!user) return;

    const ref = collection(
      db,
      "artifacts",
      APP_ID,
      "users",
      user.uid,
      "advent_progress"
    );

    return onSnapshot(ref, (snapshot) => {
      const data = {};
      snapshot.forEach((d) => {
        data[d.id] = d.data().message;
      });
      setOpenedDays(data);
    });
  }, [user]);

  // Автоматическое скрытие тоста
  useEffect(() => {
    if (!toastMessage) return;
    const t = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(t);
  }, [toastMessage]);

  const days = [-1, 0, ...Array.from({ length: 31 }, (_, i) => i + 1)];
  const label = (d) => (d === -1 ? "29.11" : d === 0 ? "30.11" : d);

  const handleDayClick = async (day) => {
    if (!user) return;

    const isFuture = day > currentDate;

    // Клик по будущему дню -> тост
    if (isFuture) {
      setToastMessage("Этот день ещё не наступил");
      return;
    }

    // Уже открыт — просто показываем модалку
    if (openedDays[day]) {
      setModalData({ day, text: openedDays[day] });
      return;
    }

    try {
      const used = Object.values(openedDays);
      const available = WISHES_POOL.filter((w) => !used.includes(w));
      const pool = available.length ? available : WISHES_POOL;
      const wish = pool[Math.floor(Math.random() * pool.length)];

      const ref = doc(
        db,
        "artifacts",
        APP_ID,
        "users",
        user.uid,
        "advent_progress",
        String(day)
      );

      await setDoc(ref, {
        day,
        message: wish,
        openedAt: serverTimestamp()
      });

      setModalData({ day, text: wish });
    } catch (e) {
      console.error("Firestore write error:", e);
      setToastMessage("Не удалось сохранить, проверь Firestore rules");
    }
  };

  const closeModal = () => setModalData(null);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: COLORS.dawnPink,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "24px 12px",
        boxSizing: "border-box"
      }}
    >
      {/* Шапка */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 800,
          color: COLORS.tuatara,
          marginTop: 8,
          textAlign: "center"
        }}
      >
        Адвент-календарь команды LifePractic
      </h1>

      {/* Сетка */}
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 12
        }}
      >
        {days.map((day) => {
          const isFuture = day > currentDate;
          const isOpened = !!openedDays[day];
          const canOpen = !isFuture && !isOpened;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              style={{
                backgroundColor: isOpened
                  ? COLORS.bone
                  : isFuture
                  ? COLORS.dawnPink
                  : COLORS.white,
                borderRadius: 18,
                border: canOpen
                  ? `2px solid ${COLORS.fireEngineRed}`
                  : `1px solid ${COLORS.rodeoDust}`,
                padding: 8,
                aspectRatio: "4 / 5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: isFuture ? "not-allowed" : "pointer",
                opacity: isFuture ? 0.6 : 1,
                boxShadow: canOpen
                  ? "0 4px 12px rgba(200,41,38,0.15)"
                  : "none"
              }}
            >
              <span
                style={{
                  fontWeight: 600,
                  fontSize: day <= 0 ? 10 : 16,
                  color: isFuture ? COLORS.rodeoDust : COLORS.tuatara
                }}
              >
                {label(day)}
              </span>

              {/* Ёлка только если день открыт И уже наступил */}
              {isOpened && !isFuture && (
                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 4
                  }}
                >
                  <TreePine size={16} color={COLORS.forestGreen} />
                  <Sparkles size={12} color={COLORS.rodeoDust} />
                </div>
              )}

              {/* Замочек на будущем дне (визуально) */}
              {isFuture && (
                <div style={{ marginTop: 4 }}>
                  <Lock size={14} color={COLORS.rodeoDust} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* ТОСТ "этот день ещё не наступил" */}
      {toastMessage && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            padding: "12px 18px",
            borderRadius: 999,
            backgroundColor: COLORS.tuatara,
            color: "white",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 15,
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)"
          }}
        >
          <Lock size={18} color={COLORS.rodeoDust} />
          {toastMessage}
        </div>
      )}

      {/* МОДАЛКА с пожеланием */}
      {modalData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 1000
          }}
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: COLORS.white,
              borderRadius: 24,
              padding: 24,
              maxWidth: 400,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)"
            }}
          >
            <div
              style={{
                marginBottom: 16,
                backgroundColor: COLORS.dawnPink,
                borderRadius: "999px",
                width: 96,
                height: 96,
                marginInline: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              {getThematicIllustration(modalData.text)}
            </div>

            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginBottom: 8,
                color: COLORS.tuatara
              }}
            >
              День {modalData.day}
            </h2>

            <p
              style={{
                fontSize: 16,
                lineHeight: 1.4,
                marginBottom: 16,
                color: COLORS.tuatara
              }}
            >
              «{modalData.text}»
            </p>

            <button
              onClick={closeModal}
              style={{
                backgroundColor: COLORS.fireEngineRed,
                color: "white",
                border: "none",
                borderRadius: 14,
                padding: "12px 16px",
                fontWeight: 600,
                cursor: "pointer",
                width: "100%"
              }}
            >
              Вернуться к календарю
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
