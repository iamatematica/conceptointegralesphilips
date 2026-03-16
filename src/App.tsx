import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Calculator, Activity, Layers, Info, CheckCircle2, XCircle, BookOpen, Play, Pause, FastForward } from 'lucide-react';

function IntegralAnimation() {
  const [n, setN] = useState(10);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(10);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setN(prev => {
          if (prev >= 1000) {
            setIsPlaying(false);
            return 1000;
          }
          return Math.min(1000, prev + speed);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up canvas dimensions for high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    const width = rect.width;
    const height = rect.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Coordinate system: 0 to 1000
    const minX = -100;
    const maxX = 1100;
    const minY = -20;
    const maxY = 120;

    const mapX = (x: number) => ((x - minX) / (maxX - minX)) * width;
    const mapY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

    // Function f(x) = -0.0004x^2 + 0.4x (Parabola with roots at 0 and 1000, max height 100 at x=500)
    const f = (x: number) => -0.0004 * x * x + 0.4 * x;

    // Draw grid
    ctx.strokeStyle = '#f1f5f9'; // slate-100
    ctx.lineWidth = 1;
    for (let i = 0; i <= 1000; i += 100) {
      ctx.beginPath();
      ctx.moveTo(mapX(i), mapY(minY));
      ctx.lineTo(mapX(i), mapY(maxY));
      ctx.stroke();
    }
    for (let i = 0; i <= 100; i += 20) {
      ctx.beginPath();
      ctx.moveTo(mapX(minX), mapY(i));
      ctx.lineTo(mapX(maxX), mapY(i));
      ctx.stroke();
    }

    // Draw axes
    ctx.beginPath();
    ctx.strokeStyle = '#94a3b8'; // slate-400
    ctx.lineWidth = 2;
    // X axis
    ctx.moveTo(mapX(minX), mapY(0));
    ctx.lineTo(mapX(maxX), mapY(0));
    // Y axis
    ctx.moveTo(mapX(0), mapY(minY));
    ctx.lineTo(mapX(0), mapY(maxY));
    ctx.stroke();

    // Draw axis labels
    ctx.fillStyle = '#64748b';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('0', mapX(0) - 10, mapY(0) + 15);
    ctx.fillText('500', mapX(500), mapY(0) + 15);
    ctx.fillText('1000', mapX(1000), mapY(0) + 15);
    
    ctx.textAlign = 'right';
    ctx.fillText('50', mapX(0) - 5, mapY(50) + 4);
    ctx.fillText('100', mapX(0) - 5, mapY(100) + 4);

    // Integration limits
    const a = 0;
    const b = 1000;
    const dx = (b - a) / n;
    
    let area = 0;

    // Draw rectangles (Left Riemann Sum)
    for (let i = 0; i < n; i++) {
      const x = a + i * dx;
      const rectHeight = f(x);
      area += rectHeight * dx;

      const px = mapX(x);
      const py = mapY(rectHeight);
      const pWidth = mapX(a + dx) - mapX(a);
      const pHeight = mapY(0) - py;

      // Fill
      ctx.fillStyle = 'rgba(99, 102, 241, 0.2)'; // indigo-500 with opacity
      ctx.fillRect(px, py, pWidth, pHeight);
      
      // Stroke (reduce line width for large N to avoid solid color blocks)
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.8)'; // indigo-600
      ctx.lineWidth = n > 200 ? 0.1 : (n > 50 ? 0.5 : 1.5);
      ctx.strokeRect(px, py, pWidth, pHeight);
    }

    // Draw curve
    ctx.beginPath();
    ctx.strokeStyle = '#ef4444'; // red-500
    ctx.lineWidth = 3;
    for (let x = minX; x <= maxX; x += 5) {
      if (x === minX) {
        ctx.moveTo(mapX(x), mapY(f(x)));
      } else {
        ctx.lineTo(mapX(x), mapY(f(x)));
      }
    }
    ctx.stroke();

    // Draw exact area text
    const exactArea = 66666.67; // Integral of -0.0004x^2 + 0.4x from 0 to 1000
    
    ctx.fillStyle = '#1e293b'; // slate-800
    ctx.font = 'bold 15px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Área Aproximada: ${area.toFixed(2)}`, 20, 30);
    ctx.fillText(`Área Exacta: ${exactArea.toFixed(2)}`, 20, 55);

  }, [n]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full aspect-video max-w-3xl relative rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full"
        />
      </div>
      
      <div className="mt-8 w-full max-w-xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-6">
          {/* N Slider */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Número de rectángulos (N)
              </label>
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold min-w-[60px]">
                {n}
              </span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="1000" 
              value={n} 
              onChange={(e) => {
                setN(parseInt(e.target.value));
                setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span>1</span>
              <span>1000</span>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Playback Controls */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                if (n >= 1000 && !isPlaying) setN(1);
                setIsPlaying(!isPlaying);
              }}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors shrink-0 ${
                isPlaying ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
              title={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>

            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <FastForward className="w-4 h-4 text-indigo-500" />
                  Velocidad de animación
                </label>
              </div>
              <input 
                type="range" 
                min="1" 
                max="50" 
                value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const QUIZ_QUESTIONS = [
  {
    question: "¿Qué representa geométricamente la integral definida de una función positiva?",
    options: ["La pendiente de la recta tangente", "El área bajo la curva", "El volumen de un cubo", "La velocidad instantánea"],
    correct: 1
  },
  {
    question: "¿Qué representa el término dx (o Δx) en la suma de Riemann?",
    options: ["La altura del rectángulo", "El número total de rectángulos", "El ancho (base) de cada rectángulo infinitamente pequeño", "El área total"],
    correct: 2
  },
  {
    question: "Al aumentar el número de rectángulos (N) hacia el infinito en una suma de Riemann, ¿qué sucede?",
    options: ["El área calculada se vuelve infinita", "La aproximación se convierte en el área exacta", "El error de cálculo aumenta", "Los rectángulos se vuelven más anchos"],
    correct: 1
  },
  {
    question: "¿De qué palabra proviene el símbolo de la integral (∫)?",
    options: ["Summa (Suma)", "Signum (Signo)", "Sectio (Sección)", "Spatium (Espacio)"],
    correct: 0
  },
  {
    question: "Según el Teorema Fundamental del Cálculo, ¿cuál es la relación entre la derivada y la integral?",
    options: ["Son exactamente lo mismo", "No tienen ninguna relación", "Son operaciones inversas", "Ambas calculan áreas"],
    correct: 2
  }
];

function Quiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (qIndex: number, oIndex: number) => {
    if (showResults) return;
    setAnswers(prev => ({ ...prev, [qIndex]: oIndex }));
  };

  const score = Object.keys(answers).reduce((acc, qIndex) => {
    return acc + (answers[parseInt(qIndex)] === QUIZ_QUESTIONS[parseInt(qIndex)].correct ? 1 : 0);
  }, 0);

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Pon a prueba tu conocimiento</h3>
      </div>
      
      <div className="space-y-10">
        {QUIZ_QUESTIONS.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <p className="font-semibold text-slate-800 text-lg">{qIndex + 1}. {q.question}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt, oIndex) => {
                const isSelected = answers[qIndex] === oIndex;
                const isCorrect = q.correct === oIndex;
                const showCorrect = showResults && isCorrect;
                const showWrong = showResults && isSelected && !isCorrect;

                let btnClass = "p-4 rounded-xl border text-left text-sm font-medium transition-all duration-200 ";
                if (showCorrect) btnClass += "bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm";
                else if (showWrong) btnClass += "bg-red-50 border-red-500 text-red-900 shadow-sm";
                else if (isSelected) btnClass += "bg-indigo-50 border-indigo-500 text-indigo-900 shadow-sm ring-1 ring-indigo-500";
                else btnClass += "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-700";

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex)}
                    className={btnClass}
                    disabled={showResults}
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span>{opt}</span>
                      {showCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                      {showWrong && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      
      {!showResults ? (
        <button 
          onClick={() => setShowResults(true)}
          disabled={Object.keys(answers).length < QUIZ_QUESTIONS.length}
          className="mt-10 w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          Ver Resultados
        </button>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center"
        >
          <p className="text-2xl font-bold text-slate-900 mb-2">
            Tu puntuación: <span className={score >= 3 ? "text-emerald-600" : "text-indigo-600"}>{score}</span> de {QUIZ_QUESTIONS.length}
          </p>
          <p className="text-slate-600 mb-6">
            {score === 5 ? "¡Excelente! Has dominado el concepto de la integral." : 
             score >= 3 ? "¡Buen trabajo! Tienes una buena comprensión del tema." : 
             "Sigue repasando los conceptos, ¡la práctica hace al maestro!"}
          </p>
          <button 
            onClick={() => { setAnswers({}); setShowResults(false); }}
            className="px-8 py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Reintentar Quiz
          </button>
        </motion.div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Calculator className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Descubriendo la Integral
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-24">
        
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-6 leading-tight">
            El arte de sumar <span className="text-indigo-600">infinitas partes</span>
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            La integral es uno de los conceptos más hermosos y poderosos de las matemáticas. 
            Nos permite calcular áreas, volúmenes, y entender cómo se acumulan las cantidades a lo largo del tiempo.
          </p>
        </motion.section>

        {/* Concept Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-sm font-semibold">
              <Activity className="w-4 h-4" />
              <span>El Concepto</span>
            </div>
            <h3 className="text-3xl font-bold tracking-tight">¿Qué transmite la integral?</h3>
            <p className="text-slate-600 leading-relaxed">
              Geométricamente, la integral definida representa el <strong>área bajo una curva</strong> en un gráfico. 
              Pero su significado va mucho más allá de la geometría: transmite la idea de <strong>acumulación</strong>.
            </p>
            <p className="text-slate-600 leading-relaxed">
              Si la derivada nos dice qué tan rápido cambia algo (la velocidad), la integral nos dice 
              cuánto se ha acumulado en total (la distancia recorrida). Es la herramienta que usamos 
              para reconstruir el todo a partir de sus partes más pequeñas.
            </p>
            
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex gap-4 items-start">
              <div className="mt-1 text-indigo-500">
                <Info className="w-5 h-5" />
              </div>
              <p className="text-sm text-slate-700">
                El símbolo de la integral <span className="font-serif text-lg italic mx-1">∫</span> es en realidad una "S" alargada, 
                que proviene de la palabra latina <em>summa</em> (suma).
              </p>
            </div>
          </div>
          
          <div className="bg-slate-100 rounded-2xl p-8 flex items-center justify-center aspect-square md:aspect-auto md:h-full relative overflow-hidden">
            {/* Abstract representation of accumulation */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="text-6xl font-serif italic text-indigo-600">∫</div>
              <div className="text-xl font-medium text-slate-800 font-serif">f(x) dx</div>
              <div className="mt-4 text-sm text-slate-500 text-center max-w-[200px]">
                La suma continua de infinitos rectángulos de ancho infinitamente pequeño (dx).
              </div>
            </div>
          </div>
        </motion.section>

        {/* Definition Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-indigo-900 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
            <div className="text-[20rem] font-serif italic leading-none">∫</div>
          </div>
          <div className="relative z-10 max-w-3xl">
            <h3 className="text-3xl font-bold tracking-tight mb-6">La Definición Formal</h3>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
              La integral definida de una función <span className="font-serif italic">f(x)</span> en un intervalo <span className="font-serif italic">[a, b]</span> se define formalmente como el límite de las sumas de Riemann cuando el número de subdivisiones (<span className="font-serif italic">n</span>) tiende a infinito.
            </p>
            
            <div className="bg-indigo-950/60 p-6 md:p-8 rounded-2xl border border-indigo-800/50 inline-block backdrop-blur-sm">
              <div className="flex items-center gap-2 md:gap-4 text-xl md:text-3xl font-serif">
                
                {/* Integral */}
                <div className="flex items-center">
                  <div className="flex flex-col items-center justify-center text-sm md:text-base mr-1">
                    <span className="translate-y-3 translate-x-2">b</span>
                    <span className="text-5xl md:text-6xl font-light italic leading-none">∫</span>
                    <span className="-translate-y-3 -translate-x-1">a</span>
                  </div>
                  <div className="ml-2">f(x) dx</div>
                </div>

                <div className="mx-2 md:mx-4 font-sans font-light">=</div>
                
                {/* Limit */}
                <div className="flex flex-col items-center justify-center">
                  <span className="text-2xl md:text-3xl font-bold leading-none">lim</span>
                  <span className="text-xs md:text-sm mt-1">n → ∞</span>
                </div>
                
                {/* Summation */}
                <div className="flex flex-col items-center justify-center mx-2">
                  <span className="text-xs md:text-sm translate-y-1">n</span>
                  <span className="text-4xl md:text-5xl leading-none">∑</span>
                  <span className="text-xs md:text-sm -translate-y-1">i=1</span>
                </div>
                
                {/* Function */}
                <div>
                  f(x<sub>i</sub>) Δx
                </div>

              </div>
            </div>
          </div>
        </motion.section>

        {/* Procedure Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold tracking-tight mb-4">El Procedimiento</h3>
            <p className="text-slate-600 max-w-2xl mx-auto">
              ¿Cómo calculamos el área de una forma curva irregular? El genio de las matemáticas 
              consiste en usar formas que sí conocemos (rectángulos) para aproximar lo que no conocemos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Dividir",
                desc: "Dividimos el intervalo bajo la curva en pequeños segmentos de igual ancho."
              },
              {
                step: "02",
                title: "Construir",
                desc: "Levantamos rectángulos en cada segmento hasta tocar la curva de la función."
              },
              {
                step: "03",
                title: "Sumar",
                desc: "Calculamos el área de cada rectángulo (base × altura) y las sumamos todas."
              },
              {
                step: "04",
                title: "El Límite",
                desc: "Hacemos los rectángulos cada vez más finos hasta que su número tienda a infinito."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-colors">
                <div className="text-5xl font-black text-slate-50 absolute -top-2 -right-2 group-hover:text-indigo-50 transition-colors">
                  {item.step}
                </div>
                <div className="relative z-10">
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Interactive Animation Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white shadow-xl"
        >
          <div className="text-center mb-10">
            <h3 className="text-3xl font-bold tracking-tight mb-4">Animación Interactiva (0 a 1000)</h3>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Experimenta con las Sumas de Riemann en un intervalo de 0 a 1000. Observa cómo al aumentar el número de rectángulos (N), 
              el área aproximada se acerca cada vez más al área exacta bajo la curva roja.
            </p>
          </div>

          <IntegralAnimation />
          
        </motion.section>

        {/* Quiz Section */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <Quiz />
        </motion.section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-24">
        <div className="max-w-5xl mx-auto px-6 text-center text-slate-500 text-sm">
          <p>Concepto de Integral • Construido para aprender y explorar.</p>
        </div>
      </footer>
    </div>
  );
}
