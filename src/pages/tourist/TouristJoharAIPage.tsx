import { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, User, RotateCcw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../components/ui';
import { generateAITravelResponse, type AIMessage, type TouristPreferences } from '../../services/ai/aiService';
import { useAuth } from '../../hooks/useAuth';

const QUICK_TOPICS = [
  { label: '🌊 Best Waterfalls for Monsoon', prompt: 'What are the top waterfalls to visit near Ranchi with scenic viewpoints?' },
  { label: '🌿 2-Day Netarhat & Betla Trip', prompt: 'Plan a 2-day nature and safari itinerary for Netarhat and Betla National Park.' },
  { label: '🎨 Sohrai Art & Tribal Villages', prompt: 'Where can I see authentic GI-certified Sohrai wall painting villages in Hazaribagh?' },
  { label: '🍛 Jharkhand Local Food & Cuisine', prompt: 'What are the must-try traditional Jharkhand dishes and where can I find them?' },
  { label: '💰 Budget 3-Day Trip under ₹8,000', prompt: 'Create a 3-day budget itinerary for 2 people under ₹8,000 including stay and transport.' },
  { label: '🛕 Deoghar & Parasnath Pilgrimage', prompt: 'Tell me about the spiritual circuit connecting Baidyanath Dham Deoghar and Shikharji Parasnath.' },
];

export function TouristJoharAIPage() {
  const { profile } = useAuth();
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'welcome-tourist',
      role: 'assistant',
      content: `**Johar ${profile?.full_name ? profile.full_name.split(' ')[0] : 'Traveler'}! ✦**\n\nI am **Johar AI**, your intelligent Jharkhand travel companion. Ask me anything about:\n- Hidden waterfalls & eco-treks across all 24 districts\n- Day-by-day customized itineraries with budget estimates\n- Verified local homestays and tribal craft clusters\n- Monsoon & winter seasonal circuits\n\nHow can I help you plan your journey today?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const text = queryText || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    let touristPrefs: TouristPreferences | undefined = undefined;
    try {
      const stored = localStorage.getItem('tourist_travel_preferences');
      if (stored) touristPrefs = JSON.parse(stored);
    } catch {
      // Ignored
    }

    try {
      const responseMsg = await generateAITravelResponse(
        text,
        [...messages, userMsg],
        'Ranchi',
        'en',
        touristPrefs
      );
      setMessages((prev) => [...prev, responseMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Johar! I encountered a temporary connection glitch. Please feel free to ask again or browse our verified destination catalog.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `**Johar!** Chat reset. What would you like to explore next in Jharkhand?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-950 via-forest-950 to-clay-950 px-6 py-8 text-white shadow-xl sm:px-10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-400/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-forest-300 border border-forest-400/30">
              <Sparkles className="h-3.5 w-3.5" />
              <span>JOHAR AI TRAVEL COMPANION</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Ask Anything About Jharkhand Tourism
            </h1>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Powered by deep local geographical data covering all 24 districts, authentic tribal traditions, homestays, and budget circuits.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs">
              <Link to="/plan-trip">Multi-Day Planner</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleResetChat}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Suggested Topic Chips */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-600">Quick Inspiration Prompts:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_TOPICS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSend(item.prompt)}
              disabled={isLoading}
              className="rounded-full border border-ink-200 bg-[#FFFDF9] px-4 py-2 text-xs font-semibold text-ink-800 shadow-xs hover:border-clay-400 hover:bg-sand transition whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex flex-col h-[580px] p-0 overflow-hidden border-ink-200/90 bg-[#FFFDF9] shadow-lg">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="h-8 w-8 rounded-full bg-forest-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-clay-800 text-white rounded-tr-none'
                      : 'bg-white border border-ink-200/80 text-ink-900 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Suggested Destination Cards if present */}
                  {msg.suggestedDestinations && msg.suggestedDestinations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-ink-100 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-clay-700">Recommended Stops:</p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {msg.suggestedDestinations.map((dest) => (
                          <Link
                            key={dest.id}
                            to={`/destinations/${dest.slug}`}
                            className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-ink-200 bg-sand/40 hover:bg-sand transition text-xs font-semibold text-ink-900"
                          >
                            <div className="truncate">
                              <p className="truncate font-bold">{dest.name}</p>
                              <p className="text-[10px] text-ink-600 font-normal">{dest.district}</p>
                            </div>
                            <ArrowRight className="h-3.5 w-3.5 text-clay-600 shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="h-8 w-8 rounded-full bg-clay-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-ink-600">
              <div className="h-8 w-8 rounded-full bg-forest-900 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="h-4 w-4 text-amber-300" />
              </div>
              <div className="rounded-2xl bg-white border border-ink-200/80 p-3.5 text-xs text-ink-700">
                Johar AI is generating personalized Jharkhand recommendations...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 border-t border-ink-200/80 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask Johar AI about waterfalls, eco-homestays, itineraries, or culture..."
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-ink-200 bg-sand/30 px-4 py-3 text-xs sm:text-sm text-ink-900 placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
            <Button
              type="submit"
              variant="primary"
              disabled={!inputQuery.trim() || isLoading}
              className="rounded-2xl px-5"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
