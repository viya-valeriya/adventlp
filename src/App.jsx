import React, { useState, useEffect } from 'react';
import { 
  Lock, Sparkles, X, Gift, TreePine,
  // Импорт тематических иконок для пожеланий
  Coffee, CloudSun, Heart, Feather, Compass, Cat, Shield, 
  Smile, ShoppingBag, BatteryCharging, Wind, Clock, 
  BookOpen, Rocket, Moon, Crown, Users, Puzzle, PartyPopper,
  Music, Sun
} from 'lucide-react'; 
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

// --- КОНФИГУРАЦИЯ FIREBASE ---
// БЕЗ __firebase_config, просто прямой объект
const firebaseConfig = {
  apiKey: "AIzaSyCOHeMkOIwG0ddkwh3zz4o5pyfR97jPS50",
  authDomain: "adventlp.firebaseapp.com",
  projectId: "adventlp",
  storageBucket: "adventlp.firebasestorage.app",
  messagingSenderId: "1025160764098",
  appId: "1:1025160764098:web:35d99c13486ece5753f95b",
  measurementId: "G-SNGM8LTHJX"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- ЦВЕТОВАЯ ПАЛИТРА И КОНСТАНТЫ ---
const COLORS = {
  white: '#ffffff',
  dawnPink: '#f1eae0',     // Фон
  tuatara: '#363636',      // Текст
  fireEngineRed: '#c82926', // Акцент
  kimberly: '#706c91',     // Акцент 2
  rodeoDust: '#c7b895',    // Для заблокированных
  bone: '#e3dbca',         // Для открытых
  forestGreen: '#2f855a',  // Для елки
};

// --- СПИСОК ПОЖЕЛАНИЙ ---
const WISHES_POOL = [
  "Ты — автор своей истории, даже если сейчас сложная глава - самое время писать следующую!",
  "Найди сегодня минуту размеренности — такой, как когда наблюдаешь за снежинками и просто дышишь.",
  "Устрой себе 30 минут ничегонеделания — побудь в моменте без задач, спешки и тревоги. Насладись моментом.",
  "Подари себе сегодня немного тепла — позвони близкому или обними того, кто рядом.",
  "Найди время для уединения с хорошей книгой.",
  "Открой день для нового знакомства — маленького, но вдохновляющего.",
  "Пополни запас энергии — чем-то вкусным, тёплым или приятным.",
  "Отметь своё достижение — даже если оно крошечное, оно твоё.",
  "Сделай паузу ради качественного отдыха, а не «на бегу».",
  "Устрой себе маленький ритуал, который повышает качество жизни.",
  "Позаботься о себе так же качественно, как о проекте.",
  "Скажи себе что-то доброе — так, как сказал бы в поддержку коллегe.",
  "Спроси себя: Что бы я сделал для друга? — и сделай это для себя.",
  "Пожелай кому-то хорошего дня — искренне.",
  "Сделай сегодня маленький смелый шаг.",
  "Прими решение, которое давно откладывал.",
  "Сделай шаг к тому, кем хочешь быть в новом году.",
  "Найди то, что делает тебя особенным — и улыбнись этому.",
  "Отмечай необычные мысли — там источник творчества.",
  "Позволь себе быть «странным» ровно настолько, чтобы чувствовать себя.",
  "Прими комплимент своей неповторимости.",
  "Признай, что ты сегодня чувствуешь — без фильтров.",
  "Скажи себе правду про свои желания.",
  "Прими похвалу честно, без обесценивания.",
  "Спроси себя: “Что мне на самом деле нужно сейчас?”",
  "Признай свою силу — без скромности.",
  "Узнай сегодня что-то новое — пусть даже одну строчку.",
  "Сделай шаг вперёд там, где обычно сомневаешься.",
  "Посмотри на задачу под другим углом.",
  "Спроси у себя: “Что новое я могу попробовать сегодня?”",
  "Сделай одну вещь, которая делает тебя лучше, чем вчера.",
  "Отметь, где ты уже вырос как человек?",
  "Позволь себе ошибаться — ради роста.",
  "Подумай о версии себя через год — и сделай шаг к ней.",
  "Найди лучик света в своём дне — он точно есть.",
  "Вспомни, что всегда есть путь, даже если его пока не видно.",
  "Подумай о будущем, которое греет.",
  "Посмотри на что-то красивое — и почувствуй лёгкость.",
  "Сделай что-то, что дарит ощущение «всё будет хорошо».",
  "Позволь себе поверить, что впереди много хорошего.",
  "Сделай сегодня что-то, что вдохновляет тебя хотя бы на 1%.",
  "Слушай музыку, которая поднимает настроение.",
  "Зажги свечу и создай атмосферу для творчества.",
  "Позволь себе мечтать чуть смелее.",
  "Почувствуй красоту момента — даже если он короткий.",
  "Устрой себе пяти минутку творческого хаоса.",
  "Делай что-то с огоньком — даже если это мелочь.",
  "Сделай что-то качественное ради будущего себя.",
  "Вдохнови себя мыслью, что у тебя получается.",
  "Позволь уникальности вести тебя в решениях.",
  "Приложи лидерство там, где нужен маленький шаг вперёд.",
  "Поддержи коллегу — как поддержал(а) бы себя.",
  "Заметь рост, который произошёл незаметно.",
  "Выбери действие, которое делает тебя лучше.",
  "Отдавай сегодня свет, который хочешь получать.",
  "Поймай вдохновение в простом моменте.",
  "Прислушайся к себе честно — и сделай вывод мягко.",
  "Удели внимание тому, что делает тебя уникальным человеком.",
  "Найди сегодня минуту тишины — такую, в которой слышно, как декабрь успокаивает воздух.",
  "Позволь себе замедлиться так, будто за окном впервые пошёл снег.",
  "Подари себе ощущение начала — как утром первого января.",
  "Сделай глоток горячего напитка и почувствуй, как возвращается спокойствие.",
  "Скажи себе добрые слова так, будто кладёшь их под новогоднюю ёлку.",
  "Подари себе ощущение обновления — будто год вот-вот сменится.",
  "Посмотри на огоньки вокруг и отметь то, что зажигает внутри тебя.",
  "Позволь себе мечтать шире — декабрь любит мечты.",
  "Устрой 30 минут уюта — плед, тишина и ты.",
  "Представь, что этот день — подарок. Открой его медленно, насладись.",
  "Найди силу в себе — ту самую, которая помогает загадывать желания.",
  "Подари себе немного веры в лучшее — как в новогоднюю ночь.",
  "Заметь свет вокруг: в словах, людях, моментах.",
  "Отметь всё, что ты прожил(а) в этом году — и поблагодари себя.",
  "Позволь себе выдохнуть — как будто закрываешь последний рабочий день года.",
  "Создай себе атмосферу, в которой хочется быть.",
  "Вдохни глубже — воздух декабря всегда чище.",
  "Посмотри на свой путь, как на гирлянду из маленьких побед.",
  "Зажги свою внутреннюю «лампочку» — вдохновением или заботой.",
  "Устрой себе аромат праздника — тем, что любишь именно ты.",
  "Представь, что каждый шаг сегодня — шаг в новый год.",
  "Найди что-то, что делает этот день особенным.",
  "Услышь своё желание — то самое, настоящее.",
  "Сделай доброе действие для себя — как подарок в декабре.",
  "Устрой мини-очищение: выброси одну ненужную мысль.",
  "Поддержи себя так, как поддерживают в праздничные вечера.",
  "Посмотри на свою жизнь глазами человека, который тебя любит.",
  "Дай себе пространство, чтобы мечтать о следующем годе.",
  "Обними свою сегодняшнюю версию — она достойна тепла.",
  "Попроси у декабря то, чего хочешь — и будь готов(а) это принять.",
  "Выбери сегодня одно маленькое удовольствие и сделай его обязательным.",
  "Вспомни, чем ты гордишься в себе — и побудь с этим.",
  "Найди место в дне, где можно вдохнуть свежий воздух.",
  "Поддержи себя тёплыми словами, которые обычно говоришь другим.",
  "Попроси у дня подсказку — и будь открытым к её получению.",
  "Обними свою сегодняшнюю версию — в ней твоя точка опоры."
];

// --- ХЕЛПЕР: ПОДБОР ИЛЛЮСТРАЦИИ ---
const getThematicIllustration = (text) => {
  const props = { size: 48, strokeWidth: 1.5 };
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("кофе") || lowerText.includes("чай") || lowerText.includes("паузу") || lowerText.includes("отдых") || lowerText.includes("ничегонеделания") || lowerText.includes("напитка") || lowerText.includes("уют")) return <Coffee {...props} color="#795548" />;
  if (lowerText.includes("солнце") || lowerText.includes("свет") || lowerText.includes("тепла") || lowerText.includes("луч") || lowerText.includes("огоньки") || lowerText.includes("лампочку")) return <Sun {...props} color="#F59E0B" />;
  if (lowerText.includes("сердце") || lowerText.includes("любовь") || lowerText.includes("обними") || lowerText.includes("себя") || lowerText.includes("любишь") || lowerText.includes("словами")) return <Heart {...props} color="#c82926" />;
  if (lowerText.includes("снежинк") || lowerText.includes("небо") || lowerText.includes("тишин") || lowerText.includes("атмосферу") || lowerText.includes("снег") || lowerText.includes("декабрь")) return <CloudSun {...props} color="#706c91" />;
  if (lowerText.includes("творчеств") || lowerText.includes("вдохнов") || lowerText.includes("мысли") || lowerText.includes("хаос") || lowerText.includes("мечтать")) return <Feather {...props} color="#c82926" />;
  if (lowerText.includes("ошибк") || lowerText.includes("пазл") || lowerText.includes("решение") || lowerText.includes("очищение")) return <Puzzle {...props} color="#706c91" />;
  if (lowerText.includes("кот") || lowerText.includes("животное")) return <Cat {...props} color="#363636" />;
  if (lowerText.includes("нет") || lowerText.includes("границы") || lowerText.includes("защит") || lowerText.includes("опоры")) return <Shield {...props} color="#363636" />;
  if (lowerText.includes("покупк") || lowerText.includes("магазин")) return <ShoppingBag {...props} color="#c82926" />;
  if (lowerText.includes("энерги") || lowerText.includes("заряд") || lowerText.includes("сил")) return <BatteryCharging {...props} color="#706c91" />;
  if (lowerText.includes("улыб") || lowerText.includes("смех") || lowerText.includes("радость") || lowerText.includes("хорошо") || lowerText.includes("счастливым") || lowerText.includes("удовольствие")) return <Smile {...props} color="#F59E0B" />;
  if (lowerText.includes("дыши") || lowerText.includes("ветер") || lowerText.includes("воздух") || lowerText.includes("выдохни")) return <Wind {...props} color="#706c91" />;
  if (lowerText.includes("время") || lowerText.includes("минут") || lowerText.includes("часы") || lowerText.includes("темп") || lowerText.includes("замедлиться")) return <Clock {...props} color="#363636" />;
  if (lowerText.includes("книг") || lowerText.includes("чита") || lowerText.includes("автор") || lowerText.includes("глава") || lowerText.includes("истори")) return <BookOpen {...props} color="#795548" />;
  if (lowerText.includes("шаг") || lowerText.includes("вперед") || lowerText.includes("старт") || lowerText.includes("действи") || lowerText.includes("начала")) return <Rocket {...props} color="#c82926" />;
  if (lowerText.includes("компас") || lowerText.includes("путь") || lowerText.includes("направлени") || lowerText.includes("контроль") || lowerText.includes("подсказку")) return <Compass {...props} color="#c82926" />;
  if (lowerText.includes("чудо") || lowerText.includes("маги") || lowerText.includes("искренне") || lowerText.includes("огоньком") || lowerText.includes("волшебство")) return <Sparkles {...props} color="#F59E0B" />;
  if (lowerText.includes("важен") || lowerText.includes("король") || lowerText.includes("достижение") || lowerText.includes("похвал") || lowerText.includes("лидерство") || lowerText.includes("побед") || lowerText.includes("гордишься")) return <Crown {...props} color="#F59E0B" />;
  if (lowerText.includes("праздник") || lowerText.includes("вечерин") || lowerText.includes("ритуал") || lowerText.includes("ёлку") || lowerText.includes("новый год")) return <PartyPopper {...props} color="#c82926" />;
  if (lowerText.includes("друг") || lowerText.includes("коллег") || lowerText.includes("люд") || lowerText.includes("знакомств")) return <Users {...props} color="#706c91" />;
  if (lowerText.includes("музык") || lowerText.includes("песн") || lowerText.includes("слушай")) return <Music {...props} color="#c82926" />;
  if (lowerText.includes("свеч") || lowerText.includes("огонь")) return <Sun {...props} color="#F59E0B" />;
  
  return <Gift {...props} color="#c82926" />;
};

export default function AdventCalendar() {
  const [user, setUser] = useState(null);
  const [openedDays, setOpenedDays] = useState({});
  const [modalData, setModalData] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  
  const [currentDate, setCurrentDate] = useState(1); 

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth(); // 0-11, где 11 = Декабрь
    const day = now.getDate();

    if (month < 11) {
      setCurrentDate(0);
    } else if (month === 11) {
      setCurrentDate(day);
    } else {
      setCurrentDate(31);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const progressRef = collection(db, 'artifacts', appId, 'users', user.uid, 'advent_progress');
    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      const data = {};
      snapshot.docs.forEach(doc => {
        data[doc.id] = doc.data().message;
      });
      setOpenedDays(data);
    }, (error) => console.error("Error fetching progress:", error));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleDayClick = async (dayNumber) => {
    if (!user) return;

    if (dayNumber > currentDate) {
      setToastMessage("Этот день еще не настал");
      return; 
    }

    if (openedDays[dayNumber]) {
      setModalData({ day: dayNumber, text: openedDays[dayNumber], isNew: false });
      return;
    }

    const receivedWishes = Object.values(openedDays);
    const availableWishes = WISHES_POOL.filter(w => !receivedWishes.includes(w));
    const pool = availableWishes.length > 0 ? availableWishes : WISHES_POOL;
    const randomWish = pool[Math.floor(Math.random() * pool.length)];

    try {
      const dayDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'advent_progress', String(dayNumber));
      await setDoc(dayDocRef, { day: dayNumber, message: randomWish, openedAt: serverTimestamp() });
      setModalData({ day: dayNumber, text: randomWish, isNew: true });
    } catch (e) {
      console.error("Error saving wish:", e);
    }
  };

  const closeModal = () => setModalData(null);

  const daysGrid = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center font-sans relative overflow-x-hidden selection:bg-red-200"
      style={{ backgroundColor: COLORS.dawnPink, color: COLORS.tuatara }}
    >
      <header className="w-full max-w-md p-6 flex flex-col items-center text-center mt-4">
        <div className="mb-4">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-stone-200">
             <span className="text-sm font-bold tracking-widest text-[#363636]">LIFEPRACTIC</span>
            </div>
        </div>
        
        <h1 className="text-2xl font-bold leading-tight mb-2">
          Адвент-календарь<br/>команды LifePractic
        </h1>
        <p className="text-sm opacity-60 font-medium">
          31 день маленьких радостей и пожеланий
        </p>
      </header>

      <main className="w-full max-w-md p-4 pb-20">
        <div className="grid grid-cols-5 gap-3 sm:gap-4">
          {daysGrid.map((day) => {
            const isFuture = day > currentDate;
            const isOpened = !!openedDays[day];
            const isAvailable = !isFuture && !isOpened;
            
            const isFancyTree = day > 15;
            const treeColor = isFancyTree ? COLORS.fireEngineRed : COLORS.forestGreen;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-[4/5] rounded-[18px] flex flex-col items-center justify-center relative transition-all duration-300
                  ${isFuture ? 'cursor-not-allowed active:scale-95' : 'cursor-pointer hover:-translate-y-1 active:scale-95'}
                `}
                style={{
                  backgroundColor: isOpened ? COLORS.bone : (isFuture ? COLORS.dawnPink : COLORS.white),
                  border: isAvailable ? `2px solid ${COLORS.fireEngineRed}` : (isFuture ? `1px solid rgba(199, 184, 149, 0.3)` : 'none'),
                  boxShadow: isAvailable ? '0 4px 12px rgba(200, 41, 38, 0.15)' : 'none',
                  opacity: isFuture ? 0.8 : 1
                }}
              >
                <span 
                  className={`font-semibold z-10 text-lg ${isFuture ? 'opacity-40' : ''}`}
                  style={{ color: isFuture ? COLORS.rodeoDust : COLORS.tuatara }}
                >
                  {day}
                </span>

                <div className="mt-1">
                  {isFuture && (
                    <Lock size={14} color={COLORS.rodeoDust} className="opacity-60" />
                  )}
                  {isOpened && (
                    <div className="flex items-center justify-center animate-pulse relative">
                      <TreePine size={16} color={treeColor} />
                      {isFancyTree && (
                        <Sparkles size={10} color={COLORS.rodeoDust} className="absolute -top-1 -right-1" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </main>

      {toastMessage && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[60] animate-in fade-in zoom-in duration-200">
           <div className="bg-[#363636] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-medium whitespace-nowrap">
             <Lock size={16} className="text-[#e3dbca]" />
             {toastMessage}
           </div>
        </div>
      )}

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          ></div>
          
          <div 
            className="bg:white w-full max-w-sm rounded-[24px] p-8 relative shadow-2xl transform transition-all scale-100 flex flex-col items-center text-center animate-in fade-in zoom-in duration-300"
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/5 hover:bg-black/10"
            >
              <X size={18} className="text-[#363636]" />
            </button>

            <div className="mb-6 bg-[#f1eae0] p-6 rounded-full inline-flex items-center justify-center shadow-inner">
                {getThematicIllustration(modalData.text)}
            </div>

            <h3 className="text-xl font-bold mb-2 text-[#363636]">
              День {modalData.day}
            </h3>
            
            <div className="w-12 h-1 bg-[#c82926] rounded-full mb-6 opacity-20 mx-auto"></div>

            <p className="text-lg leading-relaxed mb-8 text-[#363636]">
              «{modalData.text}»
            </p>

            <button
              onClick={closeModal}
              className="w-full py-3.5 rounded-xl font-semibold text:white transition-transform active:scale-95 shadow-lg shadow-red-200"
              style={{ backgroundColor: COLORS.fireEngineRed }}
            >
              Вернуться к календарю
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
