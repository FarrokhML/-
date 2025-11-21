import React, { useState, useEffect, useRef } from 'react';
import { Send, RefreshCw, AlertCircle, PlayCircle } from 'lucide-react';
import { GameState, Message, Sender, MushairaResponse } from './types';
import * as GeminiService from './services/geminiService';
import Header from './components/Header';
import MessageBubble from './components/MessageBubble';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    requiredLetter: null,
    score: 0,
    loading: false,
    messages: [],
    gameOver: false,
  });

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [gameState.messages, gameState.loading]);

  const addMessage = (text: string, sender: Sender, poet?: string, isError = false) => {
    const newMessage: Message = {
      id: Date.now().toString() + Math.random().toString(),
      text,
      sender,
      poet,
      isError,
      timestamp: Date.now(),
    };

    setGameState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  const handleStartGame = async () => {
    setGameState({
      isPlaying: true,
      requiredLetter: null,
      score: 0,
      loading: true,
      messages: [],
      gameOver: false,
    });

    try {
      const response = await GeminiService.startNewGame();
      
      setGameState((prev) => ({
        ...prev,
        loading: false,
        requiredLetter: response.nextLetter || null,
      }));

      addMessage(response.message, Sender.BOT);
      if (response.botVerse) {
        // Add a small delay for the verse to feel natural
        setTimeout(() => {
            addMessage(response.botVerse!, Sender.BOT, response.botVersePoet);
        }, 600);
      }
    } catch (error) {
      console.error(error);
      setGameState((prev) => ({ ...prev, loading: false, isPlaying: false }));
      alert('خطا در اتصال به هوش مصنوعی. لطفاً دوباره تلاش کنید.');
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || gameState.loading || gameState.gameOver) return;

    const userVerse = inputText.trim();
    setInputText('');
    addMessage(userVerse, Sender.USER);
    
    setGameState((prev) => ({ ...prev, loading: true }));

    try {
      const response = await GeminiService.submitVerse(userVerse, gameState.requiredLetter);
      
      setGameState((prev) => ({ ...prev, loading: false }));

      if (!response.isValid) {
        addMessage(response.message, Sender.BOT, undefined, true);
        return; 
      }

      // If valid
      setGameState((prev) => ({ ...prev, score: prev.score + 1 }));

      // Bot responds
      if (response.botVerse) {
        // Optional: Encourage user occasionally via message
        if (response.message && response.message.length < 50) { 
             // Don't show generic messages if it's just a verse, but if there's specific feedback, show it.
             // We'll skip the generic "Nice job" messages to keep flow fast, unless it's unique.
        }

        setTimeout(() => {
            addMessage(response.botVerse!, Sender.BOT, response.botVersePoet);
            setGameState((prev) => ({
                ...prev,
                requiredLetter: response.nextLetter || null,
            }));
        }, 500);
      } else if (response.isWinner) {
         addMessage(response.message, Sender.BOT);
         setGameState(prev => ({ ...prev, gameOver: true }));
      }

    } catch (error) {
      console.error(error);
      setGameState((prev) => ({ ...prev, loading: false }));
      addMessage('خطایی رخ داد. لطفاً مجدد تلاش کنید.', Sender.BOT, undefined, true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      <main className="flex-grow container mx-auto max-w-3xl p-4 flex flex-col h-[calc(100vh-80px)]">
        
        {/* Game Area */}
        <div className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col relative">
          
          {/* Status Bar */}
          {gameState.isPlaying && !gameState.gameOver && (
            <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center text-sm px-6">
              <div className="flex items-center gap-2 text-slate-700">
                <span className="font-bold">امتیاز:</span>
                <span className="bg-teal-600 text-white px-2 py-0.5 rounded-md text-xs">{gameState.score}</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-slate-500">حرف بعدی:</span>
                 <span className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold border border-amber-200 text-lg shadow-sm">
                   {gameState.requiredLetter || '?'}
                 </span>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-4">
            {!gameState.isPlaying ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <PlayCircle size={48} className="text-teal-600 opacity-80" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-3">خوش آمدید!</h2>
                <p className="max-w-md mx-auto leading-7 mb-8">
                  در این بازی، شما با هوش مصنوعی مشاعره می‌کنید. هوش مصنوعی بیتی را می‌خواند و شما باید با حرف آخر آن بیت، شعری آغاز کنید.
                </p>
                <button
                  onClick={handleStartGame}
                  disabled={gameState.loading}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-teal-600/20 transition-all active:scale-95 flex items-center gap-2"
                >
                  {gameState.loading ? 'در حال راه‌اندازی...' : 'شروع بازی'}
                  {!gameState.loading && <PlayCircle size={20} />}
                </button>
              </div>
            ) : (
              <>
                {gameState.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                
                {gameState.loading && (
                  <div className="flex justify-end w-full mb-4">
                     <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                        <div className="flex space-x-1 space-x-reverse">
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-xs text-teal-600 mr-2">هوش مصنوعی در حال فکر کردن...</span>
                     </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          {gameState.isPlaying && (
            <div className="p-4 bg-slate-50 border-t border-slate-200">
              {gameState.gameOver ? (
                 <div className="text-center py-4">
                    <p className="text-lg font-bold text-slate-700 mb-4">بازی تمام شد!</p>
                    <button 
                      onClick={handleStartGame}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <RefreshCw size={18} />
                      بازی مجدد
                    </button>
                 </div>
              ) : (
                <div className="flex gap-2 relative">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={gameState.requiredLetter ? `بیتی بنویسید که با «${gameState.requiredLetter}» شروع شود...` : "نوبت شماست..."}
                        className="flex-grow p-4 pl-12 rounded-xl border border-slate-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none resize-none h-[60px] md:h-[70px] bg-white transition-all text-sm md:text-base scrollbar-hide"
                        disabled={gameState.loading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputText.trim() || gameState.loading}
                        className={`absolute left-2 bottom-2 md:bottom-3 p-2 md:p-3 rounded-lg transition-all ${
                        !inputText.trim() || gameState.loading
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md'
                        }`}
                    >
                        {gameState.loading ? (
                          <RefreshCw size={20} className="animate-spin" />
                        ) : (
                          <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />
                        )}
                    </button>
                </div>
              )}
              {gameState.requiredLetter && !gameState.gameOver && (
                  <div className="text-center mt-2">
                    <p className="text-xs text-slate-400">
                      نوبت شما: شروع با حرف <span className="font-bold text-amber-600 text-sm">«{gameState.requiredLetter}»</span>
                    </p>
                  </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;