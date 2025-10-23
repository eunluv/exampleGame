import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// All code is merged into this one file to resolve module loading issues in a build-less environment.

// --- From types.ts ---
interface Apple {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  speed: number;
}

type GameState = 'start' | 'playing' | 'gameOver';

// --- From constants.ts ---
const INITIAL_LIVES = 3;
const APPLE_SIZE = 50; // pixels
const BASE_APPLE_SPEED = 0.15;
const APPLE_SPAWN_INTERVAL = 1000; // ms

// --- From components/AppleIcon.tsx ---
const AppleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className={className}>
        {/* Apple Body */}
        <path
            d="M 50,29 C 20,29 15,58 30,78 C 45,98 55,98 70,78 C 85,58 80,29 50,29 Z"
            fill="#f44336"
        />
        {/* Top indent shadow */}
        <path
            d="M 50,29 C 40,38 60,38 50,29 Z"
            fill="#c62828"
        />
        {/* Stem */}
        <path
            d="M 50,29 C 52,20 62,20 60,10"
            stroke="#795548"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
        />
        {/* Leaf */}
        <path
            d="M 60,20 C 70,10 80,20 65,25"
            fill="#4caf50"
        />
    </svg>
);

// --- From components/HeartIcon.tsx ---
const HeartIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
    </svg>
);

// --- From App.tsx ---
const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('start');
    const [apples, setApples] = useState<Apple[]>([]);
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(INITIAL_LIVES);
    const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('appleCatcherHighScore') || 0));

    const gameLoopRef = useRef<number | null>(null);
    const lastSpawnTimeRef = useRef<number>(0);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const startGame = () => {
        setScore(0);
        setLives(INITIAL_LIVES);
        setApples([]);
        setGameState('playing');
    };

    const handleAppleClick = (id: number) => {
        setApples(prev => prev.filter(apple => apple.id !== id));
        setScore(prev => prev + 10);
    };
    
    const gameLoop = useCallback(() => {
        if (gameState !== 'playing') return;

        const now = Date.now();

        setApples(prevApples => {
            let livesLost = 0;
            const survivingApples = prevApples.map(apple => ({
                ...apple,
                y: apple.y + apple.speed,
            })).filter(apple => {
                if (apple.y > 100) {
                    livesLost++;
                    return false;
                }
                return true;
            });
            
            if (livesLost > 0) {
                setLives(prevLives => Math.max(0, prevLives - livesLost));
            }

            if (now - lastSpawnTimeRef.current > APPLE_SPAWN_INTERVAL) {
                lastSpawnTimeRef.current = now;
                const newApple: Apple = {
                    id: now,
                    x: Math.random() * (100 - (APPLE_SIZE / (gameAreaRef.current?.clientWidth || APPLE_SIZE)) * 100),
                    y: -10, // Start above the screen
                    speed: BASE_APPLE_SPEED + Math.random() * 0.1 + (score / 1000), // Speed increases with score
                };
                return [...survivingApples, newApple];
            }
            
            return survivingApples;
        });

        gameLoopRef.current = requestAnimationFrame(gameLoop);
    }, [gameState, score]);
    
    useEffect(() => {
        if (lives <= 0) {
            setGameState('gameOver');
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('appleCatcherHighScore', score.toString());
            }
        }
    }, [lives, score, highScore]);

    useEffect(() => {
        if (gameState === 'playing') {
            lastSpawnTimeRef.current = performance.now();
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (gameLoopRef.current) {
                cancelAnimationFrame(gameLoopRef.current);
            }
        };
    }, [gameState, gameLoop]);


    const renderGameContent = () => {
        switch (gameState) {
            case 'start':
                return (
                    <div className="text-center bg-white/70 backdrop-blur-sm p-10 rounded-xl shadow-lg">
                        <h1 className="text-5xl font-bold text-gray-800 mb-2">Apple Catcher</h1>
                        <p className="text-gray-600 mb-6">Click the apples before they fall!</p>
                        <button 
                            onClick={startGame}
                            className="bg-green-500 text-white font-bold py-3 px-8 rounded-full hover:bg-green-600 transition-transform transform hover:scale-105 text-xl shadow-md"
                        >
                            Start Game
                        </button>
                    </div>
                );
            case 'gameOver':
                return (
                    <div className="text-center bg-white/70 backdrop-blur-sm p-10 rounded-xl shadow-lg">
                        <h1 className="text-5xl font-bold text-red-600 mb-2">Game Over</h1>
                        <p className="text-2xl text-gray-700 mb-4">Your Score: {score}</p>
                        <p className="text-xl text-gray-600 mb-6">High Score: {highScore}</p>
                        <button 
                            onClick={startGame}
                            className="bg-blue-500 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-600 transition-transform transform hover:scale-105 text-xl shadow-md"
                        >
                            Play Again
                        </button>
                    </div>
                );
            case 'playing':
                return (
                    <>
                        <div className="absolute top-4 left-4 bg-white/80 p-2 rounded-lg shadow-md">
                            <p className="text-xl font-bold text-gray-700">Score: {score}</p>
                        </div>
                        <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-lg shadow-md flex items-center gap-2">
                             <p className="text-xl font-bold text-gray-700">Lives: </p>
                             <div className="flex">
                                {Array.from({ length: lives }).map((_, i) => (
                                    <HeartIcon key={i} className="w-6 h-6 text-red-500" />
                                ))}
                             </div>
                        </div>
                        {apples.map(apple => (
                            <div
                                key={apple.id}
                                className="absolute cursor-pointer transition-transform transform hover:scale-110"
                                style={{ 
                                    left: `${apple.x}%`, 
                                    top: `${apple.y}%`,
                                    width: `${APPLE_SIZE}px`,
                                    height: `${APPLE_SIZE}px`
                                }}
                                onClick={() => handleAppleClick(apple.id)}
                            >
                                <AppleIcon className="w-full h-full" />
                            </div>
                        ))}
                    </>
                );
        }
    };

    return (
        <div className="h-screen w-screen bg-gradient-to-b from-sky-300 to-green-400 flex items-center justify-center font-sans overflow-hidden">
            <div 
                ref={gameAreaRef}
                className="relative bg-sky-100/50 backdrop-blur-sm w-[90vw] h-[80vh] max-w-[800px] max-h-[600px] rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50 flex items-center justify-center"
            >
                {renderGameContent()}
            </div>
        </div>
    );
};


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
