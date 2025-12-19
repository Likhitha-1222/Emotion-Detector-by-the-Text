
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage, EmotionType, MoodHistoryEntry } from './types';
import { analyzeTextEmotion } from './services/geminiService';
import { EmotionChart } from './components/EmotionChart';
import { 
  Send, Brain, TrendingUp, Sparkles, Heart, 
  MessageCircle, Ghost, History as HistoryIcon,
  ChevronRight, Smile
} from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm Sentira, your emotional companion. How are you feeling today? Share your thoughts, and I'll help you navigate your emotions.",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodHistoryEntry[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const analysis = await analyzeTextEmotion(inputValue);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: analysis.motivation,
        timestamp: new Date(),
        analysis,
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Update history
      setMoodHistory(prev => [
        ...prev, 
        { 
          timestamp: new Date(), 
          primaryEmotion: analysis.primaryEmotion as EmotionType,
          intensity: analysis.allEmotions.find(e => e.label === analysis.primaryEmotion)?.score || 0.5
        }
      ].slice(-10)); // Keep last 10 entries

    } catch (error) {
      console.error(error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble analyzing that right now. Could you try saying it a different way?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const lastAnalysis = messages.slice().reverse().find(m => m.analysis)?.analysis;

  return (
    <div className="flex flex-col h-screen max-w-7xl mx-auto md:flex-row overflow-hidden bg-slate-50">
      
      {/* Sidebar - Desktop Only Stats */}
      <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-slate-200 p-6 overflow-y-auto shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Sentira</h1>
        </div>

        <section className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Emotion Profile
            </h2>
            {lastAnalysis ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-indigo-600">{lastAnalysis.primaryEmotion}</span>
                  <span className="text-xs font-medium text-slate-400 capitalize">{lastAnalysis.sentiment} sentiment</span>
                </div>
                <EmotionChart data={lastAnalysis.allEmotions} type="bar" />
              </div>
            ) : (
              <div className="h-32 flex items-center justify-center text-slate-400 text-sm italic text-center px-4">
                Start chatting to see your emotional analysis here.
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <HistoryIcon className="w-4 h-4" /> Mood Timeline
            </h2>
            <div className="space-y-3">
              {moodHistory.length > 0 ? (
                moodHistory.slice().reverse().map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border border-slate-100">
                    <div className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="text-xs font-medium text-slate-700">{entry.primaryEmotion}</span>
                    <span className="text-[10px] text-slate-400 ml-auto">
                      {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center">No history yet.</p>
              )}
            </div>
          </div>
        </section>

        <div className="mt-auto pt-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl text-white">
            <p className="text-sm font-medium mb-1 flex items-center gap-2"><Sparkles className="w-4 h-4" /> Pro Tip</p>
            <p className="text-xs opacity-90">Expressing yourself clearly helps me understand your needs better.</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full bg-slate-50">
        {/* Header Mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            <span className="font-bold text-slate-800">Sentira</span>
          </div>
          {lastAnalysis && (
            <div className="flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100">
              <span className="text-xs font-semibold text-indigo-700">{lastAnalysis.primaryEmotion}</span>
            </div>
          )}
        </header>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5 ml-1">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
                      <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-xs font-semibold text-slate-500">Sentira</span>
                  </div>
                )}
                <div className={`
                  px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
                  ${msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 rounded-tl-none border border-slate-200'}
                `}>
                  {msg.content}
                </div>
                
                {msg.analysis && (
                  <div className="mt-2 w-full max-w-sm bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Ghost className="w-3 h-3" /> Sentiment Reflection
                    </p>
                    <p className="text-xs text-indigo-900 italic opacity-80 mb-3 leading-snug">
                      "{msg.analysis.reflection}"
                    </p>
                    <div className="flex gap-2">
                       <span className="px-2 py-0.5 rounded-full bg-white border border-indigo-100 text-[10px] font-semibold text-indigo-600">
                         {msg.analysis.primaryEmotion}
                       </span>
                       <span className="px-2 py-0.5 rounded-full bg-white border border-indigo-100 text-[10px] font-semibold text-indigo-600">
                         {msg.analysis.sentiment}
                       </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm">
                <div className="flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-200 lg:p-6">
          <form onSubmit={handleSendMessage} className="relative max-w-4xl mx-auto flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Describe how you're feeling..."
                rows={1}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none max-h-32"
                style={{ height: 'auto', minHeight: '44px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'inherit';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`
                p-3 rounded-xl transition-all shadow-md shadow-indigo-100
                ${!inputValue.trim() || isLoading 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'}
              `}
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="max-w-4xl mx-auto mt-2 flex justify-center gap-4 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Real-time Analysis</span>
            <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Empathetic Support</span>
            <span className="flex items-center gap-1"><Smile className="w-3 h-3" /> Mood Lifting</span>
          </div>
        </div>
      </main>

      {/* Mobile Analysis Drawer (Optional/Conditional) */}
      <div className="lg:hidden absolute bottom-24 right-4 z-50">
        <button 
          onClick={() => alert("Check desktop version for detailed charts! Integrated mobile charts coming soon.")}
          className="p-3 bg-white border border-slate-200 shadow-xl rounded-full text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          <TrendingUp className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default App;
