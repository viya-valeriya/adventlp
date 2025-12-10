// src/App.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Lock,
  Sparkles,
  Gift,
  TreePine,
  Coffee,
  CloudSun,
  Heart,
  Feather,
  Compass,
  Cat,
  Shield,
  Smile,
  ShoppingBag,
  BatteryCharging,
  Wind,
  Clock,
  BookOpen,
  Rocket,
  Moon,
  Crown,
  Users,
  Puzzle,
  PartyPopper,
  Music,
  Sun,
  Anchor,
  Eye,
  X,
} from "lucide-react";

import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
} from "firebase/firestore";

// ----------------------
// Firebase
// ----------------------
const firebaseConfig = JSON.parse(__firebase_config);

let firebaseApp;
let db;

function initFirebase() {
  if (!getApps().length) {
    firebaseApp = initializeApp(firebaseConfig);
  } else {
    firebaseApp = getApps()[0];
  }
  db = getFirestore(firebaseApp);
}

initFirebase();

// ----------------------
// Данные по дням
// ----------------------
const baseWishes = {
  1: "Заметь сегодня хоть один момент, когда мир вокруг кажется чуть-чуть добрее, чем обычно.",
  2: "Сделай маленькую паузу в делах и просто посмотри в окно. Подумай, за что ты благодарна себе в этом году.",
  3: "Найди сегодня способ порадовать себя чем-то простым: любимый напиток, музыка, пять минут тишины.",
  4: "Скажи вслух одно тёплое слово себе — так, как ты бы сказала его близкому человеку.",
  5: "Отметь сегодня, что у тебя уже получается хорошо — в работе, жизни, отношениях, не важно в чём.",
  6: "Сделай шаг навстречу отдыху: ляг на пару минут, закрой глаза и просто глубоко подыши.",
  7: "Заметь, в какой момент дня тебе особенно хотелось бы поддержки — и мысленно обними себя в этот момент.",
  8: "Поделись чем-то тёплым с коллегой: словом, стикером, реакцией — чем-то маленьким, но живым.",
  9: "Сделай сегодня одно действие в свою пользу, которое обычно откладываешь “на потом”.",
  10: "Поддержи себя тёплыми словами, которые обычно говоришь другим.",
  11: "Найди в сегодняшнем дне хотя бы одну деталь, которая напоминает тебе о празднике.",
  12: "Сделай себе вечер “чуть-чуть уютнее”, чем обычно: свет, плед, чашка чего-то вкусного — что-то одно.",
  13: "Вспомни человека, который поддерживал тебя в этом году, и мысленно скажи ему “спасибо”.",
  14: "Разреши себе сегодня сделать что-то неидеально — и не ругать себя за это.",
  15: "Заметив напряжение в теле, попробуй мягко его отпустить: потянись, пошевелись, глубоко вдохни.",
  16: "Выбери одно маленькое дело, которое давно ждёт своей очереди, и сделай его без перфекционизма.",
  17: "Найди что-то, что вызывает у тебя улыбку — и позволь себе немного задержаться в этом состоянии.",
  18: "Сделай паузу среди дня и спроси себя: “А как я сейчас?” — без анализа и оценок, просто чтобы услышать.",
  19: "Поддержи кого-то из команды тёплым словом или реакцией — как поддержали бы тебя.",
  20: "Выбери сегодня один момент, когда ты выберешь себя — свой комфорт, темп, границы.",
  21: "Заметь, сколько всего ты уже держишь и ведёшь. Признай это как факт, без “могла бы лучше”.",
  22: "Найди сегодня маленькую радость: красивый свет, звук, запах, взгляд — и дозволь себе ей насладиться.",
  23: "Сделай сегодня чуть более мягкий переход между делами: не из “надо”, а с заботой о себе.",
  24: "Представь, что этот декабрь — про твою поддержку, а не только про задачи. Что бы ты добавила в день исходя из этого?",
  25: "Вспомни момент этого года, когда ты собой гордилась. Побудь с этим ощущением чуть дольше.",
  26: "Разреши себе не успеть всё. Выбери главное, остальное — можно отложить.",
  27: "Сделай что-то, что возвращает тебе ощущение жизни: музыка, прогулка, сообщение другу, три минуты тишины.",
  28: "Поддержи себя так, как ты поддержала бы вымотанного, но важного для тебя человека.",
  29: "Наметь один маленький, реалистичный и живой намеренный шаг на следующий год, без глобальных планов.",
  30: "Устрой внутренний аплодисмент себе за этот год — даже если кажется, что “мало сделала”.",
  31: "Сохрани в памяти что-то тёплое из этого декабря — для себя будущей.",
};

const DayIcon = ({ day, className = "" }) => {
  const iconsMap = {
    1: Coffee,
    2: CloudSun,
    3: Heart,
    4: Feather,
    5: Compass,
    6: Cat,
    7: Shield,
    8: Smile,
    9: ShoppingBag,
    10: BatteryCharging,
    11: Wind,
    12: Clock,
    13: BookOpen,
    14: Rocket,
    15: Moon,
    16: Crown,
    17: Users,
    18: Puzzle,
    19: PartyPopper,
    20: Music,
    21: Sun,
    22: Anchor,
    23: Eye,
    24: Coffee,
    25: CloudSun,
    26: Heart,
    27: Feather,
    28: Compass,
    29: Cat,
    30: Shield,
    31: Smile,
  };

  const Icon = iconsMap[day] || Sparkles;
  return <Icon className={className} />;
};

const dayCategories = {
  1: "мягкий старт",
  2: "замедление",
  3: "забота о себе",
  4: "поддержка",
  5: "осмысление",
  6: "отдых",
  7: "тепло к себе",
  8: "поддержка команды",
  9: "шаг вперёд",
  10: "словесная забота",
  11: "настроение праздника",
  12: "уютный вечер",
  13: "благодарность",
  14: "антиперфекционизм",
  15: "забота о теле",
  16: "маленькие шаги",
  17: "радость",
  18: "контакт с собой",
  19: "тепло другим",
  20: "выбор себя",
  21: "признание нагрузки",
  22: "маленькая радость",
  23: "мягкие переходы",
  24: "фокус на поддержке",
  25: "гордость за себя",
  26: "достаточно",
  27: "ощущение жизни",
  28: "тепло к себе",
  29: "живые намерения",
  30: "аплодисменты себе",
  31: "сохранить тёплое",
};

const wishesPool = {
  1: [
    "Заметь сегодня хоть один момент, когда мир вокруг кажется чуть-чуть добрее, чем обычно.",
    "Остановись на минуту и отметь, что в мире всё еще есть уютные, простые радости.",
  ],
  2: [
    "Сделай маленькую паузу в делах и просто посмотри в окно. Подумай, за что ты благодарна себе в этом году.",
    "Выдохни. Представь, что время на минуту замедлилось — и ты в полной безопасности.",
  ],
  // ... можно расширять по желанию, остальные дни пока используют базовый текст
};

const getWishForDay = (day, authoredWish) => {
  if (authoredWish && authoredWish.trim().length > 0) return authoredWish;

  const pool = wishesPool[day];
  if (pool && pool.length > 0) {
    const index = (day + 7) % pool.length;
    return pool[index];
  }

  return baseWishes[day] || "Пусть этот день принесёт тебе немного тепла и поддержки.";
};

function getTodayDay() {
  const now = new Date();
  const month = now.getMonth(); // 0–11, декабрь — 11
  const day = now.getDate();

  if (month !== 11) return 1;
  return Math.min(Math.max(day, 1), 31);
}

// ----------------------
// React-компонент
// ----------------------
export default function App() {
  const [currentDay] = useState(getTodayDay);
  const [unlockedDays, setUnlockedDays] = useState([]);
  const [selectedWishes, setSelectedWishes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingDay, setSavingDay] = useState(null);
  const [error, setError] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [progressCount, setProgressCount] = useState(0);
  const [teamProgress, setTeamProgress] = useState(null);

  const daysGrid = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);

  useEffect(() => {
    const unlock = [];
    for (let d = 1; d <= currentDay; d++) unlock.push(d);
    setUnlockedDays(unlock);
  }, [currentDay]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        const dbRef = db;
        const wishesSnap = await getDocs(collection(dbRef, "wishes"));
        const wishes = {};
        wishesSnap.forEach((docSnap) => {
          const data = docSnap.data();
          if (data && data.text) wishes[Number(docSnap.id)] = data.text;
        });
        setSelectedWishes(wishes);

        const progressDocRef = doc(dbRef, "meta", "progress");
        const progressSnap = await getDoc(progressDocRef);
        if (progressSnap.exists()) {
          const data = progressSnap.data();
          setTeamProgress({
            totalChosen: data.totalChosen || 0,
            lastUpdated: data.lastUpdated || null,
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки данных:", err);
        setError("Не получилось загрузить данные. Попробуй обновить страницу.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const count = Object.keys(selectedWishes).length;
    setProgressCount(count);
  }, [selectedWishes]);

  useEffect(() => {
    if (showModal) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [showModal]);

  const handleDayClick = (day) => {
    if (!unlockedDays.includes(day)) return;

    const authoredText = selectedWishes[day] || "";
    const finalText = getWishForDay(day, authoredText);

    setModalData({
      day,
      text: finalText,
      category: dayCategories[day],
      authored: Boolean(authoredText),
    });
    setShowModal(true);
  };

  const handleSaveWish = async (day, text) => {
    try {
      setSavingDay(day);
      setError(null);

      const dbRef = db;
      const wishDocRef = doc(dbRef, "wishes", String(day));
      await setDoc(wishDocRef, { text, updatedAt: new Date().toISOString() }, { merge: true });

      const progressDocRef = doc(dbRef, "meta", "progress");
      const snapshot = await getDoc(progressDocRef);
      let totalChosen = Object.keys(selectedWishes).length;
      const isNew = !selectedWishes[day];

      if (snapshot.exists()) {
        const data = snapshot.data();
        totalChosen = data.totalChosen || totalChosen;
        if (isNew) totalChosen += 1;
      } else if (isNew) {
        totalChosen += 1;
      }

      await setDoc(
        progressDocRef,
        {
          totalChosen,
          lastUpdated: new Date().toISOString(),
        },
        { merge: true }
      );

      setSelectedWishes((prev) => ({
        ...prev,
        [day]: text,
      }));

      setTeamProgress((prev) => ({
        totalChosen,
        lastUpdated: new Date().toISOString(),
        ...(prev || {}),
      }));
    } catch (err) {
      console.error("Ошибка сохранения пожелания:", err);
      setError("Не получилось сохранить пожелание. Попробуй ещё раз.");
    } finally {
      setSavingDay(null);
    }
  };

  const handleUseThisWish = async () => {
    if (!modalData) return;
    await handleSaveWish(modalData.day, modalData.text);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  const decoratedTitle = (
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#f7e6d5] border border-[#e3c3a2] text-xs font-medium tracking-wide text-[#8b4a32]">
        <TreePine className="w-3.5 h-3.5" />
        <span>Адвент-календарь команды LifePractic</span>
      </div>
      <h1 className="text-[22px] leading-tight md:text-2xl font-semibold text-[#3c2415] mt-2">
        31 день маленьких радостей
        <br />
        и тёплых пожеланий
      </h1>
    </div>
  );

  const totalDays = daysGrid.length;
  const percent = Math.round((progressCount / totalDays) * 100);

  const getThematicIllustration = (modal) => {
    if (!modal) return null;

    const iconColor = "#e2583e";

    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f8eae0] border border-[#e4c7b1] text-[11px] font-medium text-[#7a442e]">
        <DayIcon day={modal.day} className="w-3.5 h-3.5" color={iconColor} />
        <span>{modal.category || "Небольшая радость дня"}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f3e6d8] flex justify-center px-3 py-6 md:py-10">
      <div className="w-full max-w-md md:max-w-lg bg-[#fbf3ea] rounded-3xl shadow-[0_20px_60px_rgba(90,56,32,0.18)] border border-[#e3d0bc] px-4 pb-6 pt-5 md:px-6 md:pt-6 md:pb-8 relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-multiply">
          <div className="absolute -top-20 -right-16 w-40 h-40 rounded-full bg-[#e4b28c]" />
          <div className="absolute -bottom-24 -left-10 w-48 h-48 rounded-full bg-[#f7cfa7]" />
        </div>

        <div className="relative space-y-5 md:space-y-6">
          {decoratedTitle}

          <div className="flex items-center justify-between gap-3 text-[11px] md:text-xs text-[#7a5a3a] px-1">
            <div className="inline-flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-[#e2583e]" />
              <span>Сегодня уже можно открыть:</span>
              <span className="font-semibold text-[#3c2415]">
                день {currentDay > 31 ? 31 : currentDay}
              </span>
            </div>

            <div className="inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#e8a548]" />
              <span>
                выбрано:{" "}
                <span className="font-semibold text-[#3c2415]">
                  {progressCount}/{totalDays}
                </span>
              </span>
            </div>
          </div>

          <div className="mt-1">
            <div className="w-full h-1.5 rounded-full bg-[#ead5c1] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#e2583e] via-[#f0a14a] to-[#f6cf7f]"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-[#7a5a3a] px-0.5">
              <span>наш маленький прогресс</span>
              <span>{percent}% декабря с теплом</span>
            </div>
          </div>

          {teamProgress && (
            <div className="mt-1.5 px-3 py-2.5 rounded-2xl bg-[#f7ebde] border border-[#e2cbb3] text-[11px] text-[#6c4b30] flex items-start gap-2">
              <Heart className="w-3.5 h-3.5 mt-0.5 text-[#e2583e]" />
              <div>
                <div className="font-medium">
                  Команда уже выбрала {teamProgress.totalChosen || progressCount} тёплых дней
                </div>
                {teamProgress.lastUpdated && (
                  <div className="mt-0.5 text-[10px] opacity-75">
                    обновлялось: {new Date(teamProgress.lastUpdated).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="px-3 py-2.5 rounded-2xl bg-[#fdeae6] border border-[#f4b5a2] text-[11px] text-[#8b3b2d]">
              {error}
            </div>
          )}

          <div className="mt-1.5">
            <div className="grid grid-cols-5 gap-2 md:gap-3">
              {daysGrid.map((day) => {
                const isUnlocked = unlockedDays.includes(day);
                const isToday = day === currentDay;
                const isSelected = Boolean(selectedWishes[day]);
                const isPastSelected = isSelected && day < currentDay;
                const isFuture = day > currentDay;

                const bgClass = isUnlocked
                  ? isToday
                    ? "bg-[#fdf7f1]"
                    : "bg-[#f9efe3]"
                  : "bg-[#f1e3d4]";

                const borderClass = isToday
                  ? "border-2 border-[#e2583e]"
                  : isSelected
                  ? "border border-[#df9b6f]"
                  : "border border-[#e0cbb6]";

                const textClass = isUnlocked ? "text-[#3c2415]" : "text-[#b79b7f]";

                return (
                  <button
                    key={day}
                    onClick={() => handleDayClick(day)}
                    disabled={!isUnlocked}
                    className={[
                      "relative rounded-2xl md:rounded-3xl px-0.5 pt-2 pb-1.5 md:pt-2.5 md:pb-2 flex flex-col items-center justify-between transition-all duration-200",
                      "shadow-[0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(90,56,32,0.18)]",
                      "disabled:opacity-70 disabled:cursor-default",
                      bgClass,
                      borderClass,
                    ].join(" ")}
                  >
                    <span className={`text-xs md:text-sm font-semibold ${textClass}`}>{day}</span>

                    <div className="mt-0.5 mb-0.5 h-4 md:h-5 flex items-center justify-center">
                      {isUnlocked ? (
                        isSelected ? (
                          <Heart className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#e2583e] fill-[#e2583e]/70" />
                        ) : (
                          <DayIcon
                            day={day}
                            className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#c0814a]"
                          />
                        )
                      ) : (
                        <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-[#c9b09a]" />
                      )}
                    </div>

                    <div className="h-3 md:h-4 flex items-end justify-center">
                      {isPastSelected && (
                        <span className="text-[9px] md:text-[10px] text-[#8b5a37] bg-[#f3e1cf] rounded-full px-1.5 py-0.5">
                          уже с нами
                        </span>
                      )}
                      {isSelected && !isPastSelected && (
                        <span className="text-[9px] md:text-[10px] text-[#8b5a37] bg-[#f3e1cf] rounded-full px-1.5 py-0.5">
                          выбрано
                        </span>
                      )}
                      {!isSelected && isToday && (
                        <span className="text-[9px] md:text-[10px] text-[#8b4a32] bg-[#fbe1d1] rounded-full px-1.5 py-0.5">
                          сегодня
                        </span>
                      )}
                      {!isUnlocked && isFuture && (
                        <span className="text-[9px] md:text-[10px] text-[#aa8a6e] bg-[#ecddcc] rounded-full px-1.5 py-0.5">
                          скоро
                        </span>
                      )}
                    </div>

                    {isToday && (
                      <div className="absolute -top-1.5 right-1.5 md:-top-2 md:right-2">
                        <TreePine className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#e2583e]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {showModal && modalData && (
        <div className="fixed inset-0 z-40 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeModal}
            aria-hidden="true"
          />

          <div className="relative z-50 w-full max-w-md mx-4">
            <div className="bg-[#fdf7f1] rounded-3xl shadow-2xl border border-[#e3d2bf] px-5 py-6 md:px-7 md:py-7">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="space-y-1.5">
                  {getThematicIllustration(modalData)}
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#e2583e]" />
                    <span className="text-xs uppercase tracking-[0.16em] text-[#a06a48] font-medium">
                      День {modalData.day}
                    </span>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#f2e3d5] hover:bg-[#e6d3c1] border border-[#dfc7b0] text-[#7a4f32] transition-colors"
                  aria-label="Закрыть"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-1 mb-4">
                <p className="text-[13px] leading-relaxed text-[#3c2415] whitespace-pre-line">
                  {modalData.text}
                </p>
              </div>

              <div className="space-y-2.5">
                {!selectedWishes[modalData.day] && (
                  <button
                    onClick={handleUseThisWish}
                    disabled={savingDay === modalData.day}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#e2583e] hover:bg-[#d54c33] text-white text-[13px] font-medium px-4 py-2.5 rounded-2xl shadow-[0_8px_20px_rgba(226,88,62,0.55)] transition-all disabled:opacity-70 disabled:cursor-default"
                  >
                    <Gift className="w-4 h-4" />
                    {savingDay === modalData.day ? "Сохраняем..." : "Сохранить этот день как наш"}
                  </button>
                )}

                {selectedWishes[modalData.day] && (
                  <div className="w-full px-3 py-2.5 rounded-2xl bg-[#f7ebde] border border-[#e2cbb3] text-[11px] text-[#6c4b30] flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5 text-[#e2583e] fill-[#e2583e]/70" />
                    <span>Этот день уже живёт в нашем адвенте.</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full inline-flex items-center justify-center gap-2 text-[12px] text-[#7a5a3a] mt-1"
                >
                  <span>Вернуться к календарю</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
