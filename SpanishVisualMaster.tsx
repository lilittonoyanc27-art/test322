import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock as ClockIcon, 
  Hash, 
  ChevronRight, 
  RotateCcw, 
  Trophy, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types & Data ---

type GameMode = 'main' | 'numbers' | 'time';

interface NumberProblem {
  value: number;
  word: string;
  options: string[];
  icons: string[];
}

interface TimeProblem {
  hour: number;
  minute: number;
  correct: string;
  options: string[];
  meaning: string;
}

const SPANISH_NUMBERS: Record<number, string> = {
  0: 'cero', 1: 'uno', 2: 'dos', 3: 'tres', 4: 'cuatro', 5: 'cinco', 6: 'seis', 7: 'siete', 8: 'ocho', 9: 'nueve', 10: 'diez',
  11: 'once', 12: 'doce', 13: 'trece', 14: 'catorce', 15: 'quince', 16: 'dieciséis', 17: 'diecisiete', 18: 'dieciocho', 19: 'diecinueve', 20: 'veinte',
  30: 'treinta', 40: 'cuarenta', 50: 'cincuenta', 60: 'sesenta', 70: 'setenta', 80: 'ochenta', 90: 'noventa', 100: 'cien'
};

const NUMBER_ICONS = ['🍎', '⚽', '🍦', '🚗', '🐶', '🍕', '🌟', '🍩', '🦋', '🎈'];

const generateNumberProblems = (): NumberProblem[] => {
  const problems: NumberProblem[] = [];
  const used = new Set<number>();
  
  while (problems.length < 15) {
    let val;
    if (problems.length < 5) val = Math.floor(Math.random() * 10) + 1;
    else if (problems.length < 10) val = Math.floor(Math.random() * 10) + 11;
    else {
       const tens = [20, 30, 40, 50, 60, 70, 80, 90, 100];
       val = tens[Math.floor(Math.random() * tens.length)];
    }

    if (!used.has(val)) {
      used.add(val);
      const icon = NUMBER_ICONS[Math.floor(Math.random() * NUMBER_ICONS.length)];
      problems.push({
        value: val,
        word: SPANISH_NUMBERS[val],
        options: shuffleArray([
          SPANISH_NUMBERS[val],
          SPANISH_NUMBERS[val + 1] || SPANISH_NUMBERS[val - 1],
          SPANISH_NUMBERS[val + 10] || SPANISH_NUMBERS[val - 5]
        ]),
        icons: Array(val > 20 ? 1 : val).fill(icon)
      });
    }
  }
  return problems;
};

const generateTimeProblems = (): TimeProblem[] => {
  return [
    { hour: 1, minute: 0, correct: "Es la una", options: ["Es la una", "Son las uno", "Son las una"], meaning: "Ժամը մեկն է" },
    { hour: 2, minute: 0, correct: "Son las dos", options: ["Son las dos", "Es las dos", "Son las doce"], meaning: "Ժամը երկուսն է" },
    { hour: 4, minute: 30, correct: "Son las cuatro y media", options: ["Son las cuatro y media", "Son las cuatro y treinta", "Son las cinco menos media"], meaning: "Ժամը չորսն անց կես է" },
    { hour: 7, minute: 15, correct: "Son las siete y cuarto", options: ["Son las siete y cuarto", "Son las siete y quince", "Son las siete quince"], meaning: "Ժամը յոթն անց քառորդ է" },
    { hour: 9, minute: 45, correct: "Son las diez menos cuarto", options: ["Son las diez menos cuarto", "Son las nueve y cuarenta y cinco", "Son las nueve menos cuarto"], meaning: "Տասից քառորդ է պակաս" },
    { hour: 12, minute: 0, correct: "Es mediodía", options: ["Es mediodía", "Es medianoche", "Son las doce"], meaning: "Կեսօր է" },
    { hour: 6, minute: 10, correct: "Son las seis y diez", options: ["Son las seis y diez", "Es las seis y diez", "Son las siete menos diez"], meaning: "Վեցն անց տաս է" },
    { hour: 11, minute: 50, correct: "Son las doce menos diez", options: ["Son las doce menos diez", "Son las once y cincuenta", "Son las doce y diez"], meaning: "Տասներկուսից տաս է պակաս" },
    { hour: 3, minute: 15, correct: "Son las tres y cuarto", options: ["Son las tres y cuarto", "Son las tres y quince", "Son las cuatro menos cuarto"], meaning: "Երեքն անց քառորդ է" },
    { hour: 5, minute: 30, correct: "Son las cinco y media", options: ["Son las cinco y media", "Son las cinco media", "Es las cinco y media"], meaning: "Հինգն անց կես է" }
  ];
};

const shuffleArray = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);

// --- Sub-Components ---

const AnalogClock = ({ hour, minute }: { hour: number, minute: number }) => {
  const hDeg = (hour % 12) * 30 + (minute / 60) * 30;
  const mDeg = minute * 6;

  return (
    <div className="relative w-48 h-48 rounded-full border-4 border-slate-800 bg-white shadow-xl flex items-center justify-center translate-z-0">
      {/* Hour Markers */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i} 
          className="absolute w-1 h-3 bg-slate-200" 
          style={{ transform: `rotate(${i * 30}deg) translateY(-84px)` }}
        />
      ))}
      {/* Hands */}
      <motion.div 
        animate={{ rotate: hDeg }} 
        transition={{ type: 'spring', stiffness: 50 }}
        className="absolute w-1.5 h-12 bg-slate-900 rounded-full origin-bottom -translate-y-6"
      />
      <motion.div 
        animate={{ rotate: mDeg }} 
        transition={{ type: 'spring', stiffness: 50 }}
        className="absolute w-1 h-16 bg-slate-500 rounded-full origin-bottom -translate-y-8"
      />
      <div className="absolute w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow-sm" />
    </div>
  );
};

const Header = ({ title, onBack }: { title: string, onBack?: () => void }) => (
  <header className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-8">
    {onBack && (
      <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
        <ArrowLeft size={24} />
      </button>
    )}
    <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase italic">{title}</h1>
  </header>
);

// --- Main App ---

export default function SpanishVisualMaster() {
  const [mode, setMode] = useState<GameMode>('main');
  const [problems, setProblems] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<'playing' | 'feedback' | 'result'>('playing');
  const [feedback, setFeedback] = useState<any>(null);

  const startNumbers = () => {
    setProblems(generateNumberProblems());
    setMode('numbers');
    setCurrentIdx(0);
    setScore(0);
    setState('playing');
  };

  const startTime = () => {
    setProblems(generateTimeProblems());
    setMode('time');
    setCurrentIdx(0);
    setScore(0);
    setState('playing');
  };

  const handleAnswer = (option: string) => {
    const isCorrect = option === (mode === 'numbers' ? problems[currentIdx].word : problems[currentIdx].correct);
    if (isCorrect) setScore(s => s + 1);
    
    setFeedback({
      isCorrect,
      correct: mode === 'numbers' ? problems[currentIdx].word : problems[currentIdx].correct,
      meaning: problems[currentIdx].meaning
    });
    setState('feedback');
  };

  const handleNext = () => {
    setState('playing');
    setFeedback(null);
    if (currentIdx + 1 < problems.length) {
      setCurrentIdx(i => i + 1);
    } else {
      setState('result');
      if (score >= problems.length * 0.8) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-12 font-sans overflow-x-hidden">
      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {mode === 'main' && (
            <motion.div 
              key="main"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-12 py-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-indigo-600 text-white rounded-3xl shadow-xl shadow-indigo-200 mb-4 rotate-3">
                  <Sparkles size={40} />
                </div>
                <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
                  ԻՍՊԱՆԵՐԵՆԻ <br /> <span className="text-indigo-600">ՎԱՐՊԵՏ</span>
                </h1>
                <p className="text-slate-400 font-medium italic underline decoration-indigo-200 underline-offset-4">Ընտրիր խաղի տեսակը</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <button 
                  onClick={startNumbers}
                  className="group relative bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:scale-105 transition-all text-left overflow-hidden h-64"
                >
                  <div className="absolute -top-4 -right-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">123</div>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                    <Hash size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2 italic">ԹՎԵՐ</h2>
                  <p className="text-slate-400 font-medium italic text-sm">Սովորիր հաշվել իսպաներենով տեսողական քարտերի միջոցով:</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-600 font-black uppercase text-[10px] tracking-widest">
                    Խաղալ <ChevronRight size={14} />
                  </div>
                </button>

                <button 
                  onClick={startTime}
                  className="group relative bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm hover:shadow-2xl hover:scale-105 transition-all text-left overflow-hidden h-64"
                >
                  <div className="absolute -top-4 -right-4 text-8xl opacity-5 group-hover:opacity-10 transition-opacity">🕒</div>
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                    <ClockIcon size={24} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 mb-2 italic">ԺԱՄԱՆԱԿ</h2>
                  <p className="text-slate-400 font-medium italic text-sm">Սովորիր ճանաչել ժամը իսկական ժամացույցի օգնությամբ:</p>
                  <div className="mt-6 flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest">
                    Խաղալ <ChevronRight size={14} />
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {mode !== 'main' && (
            <motion.div 
              key="game"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <Header title={mode === 'numbers' ? "Թվերի Վարպետ" : "Ժամի Վարպետ"} onBack={() => setMode('main')} />
              
              <div className="flex justify-between items-center px-4">
                 <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ՀԱՐՑ</p>
                    <p className="text-2xl font-black text-slate-900 leading-none">{currentIdx + 1} / {problems.length}</p>
                 </div>
                 <div className="text-right space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">ՄԻԱՎՈՐ</p>
                    <p className="text-2xl font-black text-indigo-600 leading-none">{score}</p>
                 </div>
              </div>

              {state !== 'result' ? (
                <div className="bg-white border border-slate-200 rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-indigo-100 flex flex-col items-center gap-12 min-h-[500px]">
                  
                  {/* Visual Element */}
                  <div className="h-48 flex items-center justify-center w-full">
                    <AnimatePresence mode="wait">
                      {mode === 'numbers' ? (
                        <motion.div 
                          key={currentIdx}
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="flex flex-wrap items-center justify-center gap-2 max-w-sm"
                        >
                          {problems[currentIdx].value > 20 ? (
                            <div className="text-[100px] font-black text-indigo-600 italic tracking-tighter drop-shadow-lg">
                              {problems[currentIdx].value}
                            </div>
                          ) : (
                            problems[currentIdx].icons.map((icon: string, i: number) => (
                              <motion.span 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="text-4xl"
                              >
                                {icon}
                              </motion.span>
                            ))
                          )}
                        </motion.div>
                      ) : (
                        <motion.div key={currentIdx} initial={{ opacity: 0, rotate: -20 }} animate={{ opacity: 1, rotate: 0 }}>
                           <AnalogClock hour={problems[currentIdx].hour} minute={problems[currentIdx].minute} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="w-full space-y-8">
                    <div className="text-center space-y-6">
                      <h3 className="text-3xl font-black text-slate-800 italic uppercase">
                        {mode === 'numbers' ? "¿Cuántos hay?" : "¿Qué hora es?"}
                      </h3>
                      {state === 'feedback' && feedback && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1">
                          <p className="text-indigo-600 font-black text-3xl uppercase italic tracking-tight">{feedback.correct}</p>
                          <p className="text-slate-400 font-medium italic text-sm">{feedback.meaning}</p>
                        </motion.div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {state === 'playing' ? (
                        problems[currentIdx].options.map((opt: string) => (
                          <button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            className="py-6 rounded-[2rem] border-2 border-slate-100 bg-slate-50 text-xl font-black text-slate-700 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all active:scale-[0.98] italic"
                          >
                            {opt}
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full space-y-4">
                          <div className={`p-6 rounded-[2.5rem] flex items-center gap-4 ${feedback.isCorrect ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' : 'bg-rose-50 border border-rose-100 text-rose-700'}`}>
                             {feedback.isCorrect ? <CheckCircle2 /> : <AlertCircle />}
                             <p className="font-black italic uppercase italic tracking-widest">
                               {feedback.isCorrect ? "Գերազանց է!" : "Փորձիր նորից"}
                             </p>
                          </div>
                          <button 
                            onClick={handleNext}
                            className="w-full py-6 bg-slate-800 text-white rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 italic hover:bg-slate-900"
                          >
                            ՀԱՋՈՐԴԸ <ChevronRight size={20} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-12 py-12">
                   <div className="relative inline-block">
                    <div className="w-48 h-48 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10">
                      <Trophy size={80} />
                    </div>
                    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-indigo-400 rounded-full blur-2xl" />
                  </div>
                  
                  <div className="space-y-4 bg-white p-12 rounded-[4rem] border border-slate-100 shadow-2xl">
                    <h2 className="text-4xl font-black text-slate-800 italic uppercase">ԱՎԱՐՏՎԵՑ!</h2>
                    <div className="flex items-baseline justify-center gap-2">
                       <span className="text-8xl font-black text-indigo-600 italic tracking-tighter">{score}</span>
                       <span className="text-3xl font-black text-slate-200 italic">/ {problems.length}</span>
                    </div>
                    <p className="text-slate-400 font-medium italic">Դուք հաջողությամբ ավարտեցիք թեստը:</p>
                    <div className="pt-8 flex flex-col gap-4">
                      <button 
                        onClick={mode === 'numbers' ? startNumbers : startTime}
                        className="py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 italic"
                      >
                         <RotateCcw size={20} /> ԿՐԿՆԵԼ
                      </button>
                      <button 
                        onClick={() => setMode('main')}
                        className="py-6 bg-slate-100 text-slate-500 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 italic hover:bg-white hover:text-slate-800 border border-slate-200 transition-all"
                      >
                         ԳԼԽԱՎՈՐ ՄԵՆՅՈՒ
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
