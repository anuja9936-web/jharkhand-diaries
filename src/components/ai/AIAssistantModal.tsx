import { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle,
  Bot,
  MapPin,
  Send,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { generateAITravelResponse, type AIMessage, type TouristPreferences } from '../../services/ai/aiService';
import { useTranslation } from '../../i18n';
import { Button, Input } from '../ui';
import { formatIndianCurrency } from '../../lib/utils';

export function AIAssistantModal() {
  const { language, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userGateway, setUserGateway] = useState<string>('Ranchi');
  const [messages, setMessages] = useState<AIMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Reset/Initialize welcome message when language changes
  useEffect(() => {
    const welcomeMsg: AIMessage = {
      id: 'welcome',
      role: 'assistant',
      content: language === 'hi'
        ? `**जोहार!** मैं आपका **झारखंड डायरीज़ एआई यात्रा सहायक** हूँ ✦\n\nमैं 24 जिलों में 2-3 घंटे की लघु यात्राएं, झरने, बेतला सफारी, सोहराई कला और व्यक्तिगत यात्रा कार्यक्रम बनाने में आपकी सहायता कर सकता हूँ।`
        : `**Johar!** I am your **Jharkhand Diaries AI Travel Assistant** ✦\n\nI can help you explore 24 districts, plan short 2–3 hour getaways, find waterfalls, discover Sohrai art, and curate personalized multi-day circuits.`,
      timestamp: new Date().toISOString(),
      quickActions: language === 'hi'
        ? [
            { label: '🚗 रांची से 3 घंटे की यात्रा', action: 'ask', payload: 'रांची के पास 3 घंटे की यात्रा के लिए स्थल' },
            { label: '🌊 प्रमुख जलप्रपात', action: 'ask', payload: 'झारखंड के प्रमुख झरने कौन से हैं?' },
            { label: '🗓️ ₹10,000 में 3-दिवसीय यात्रा', action: 'ask', payload: '2 लोगों के लिए ₹10000 के अंदर 3 दिन की यात्रा की योजना बनाओ' },
            { label: '🎨 आदिवासी कला एवं सोहराई', action: 'ask', payload: 'आदिवासी शिल्प और सोहराई कला के बारे में बताएं' },
          ]
        : [
            { label: '🚗 3-Hour Trip from Ranchi', action: 'ask', payload: 'Places near Ranchi for a 3 hour trip' },
            { label: '🌊 Top Waterfalls', action: 'ask', payload: 'What are the top waterfalls in Jharkhand?' },
            { label: '🗓️ 3-Day Plan under ₹10,000', action: 'ask', payload: 'Plan a 3 day trip for 2 people under ₹10000' },
            { label: '🎨 Tribal Culture & Art', action: 'ask', payload: 'I want tribal culture and Sohrai art' },
          ],
    };

    setMessages((prev) => (prev.length <= 1 ? [welcomeMsg] : prev));
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Listen for open-johar-ai global custom event from map and other pages
  useEffect(() => {
    const handleCustomOpen = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (customEvent.detail?.prompt) {
        const prompt = customEvent.detail.prompt;
        setInputQuery(prompt);
        setTimeout(() => {
          void handleSend(prompt);
        }, 150);
      }
    };

    window.addEventListener('open-johar-ai', handleCustomOpen);
    return () => {
      window.removeEventListener('open-johar-ai', handleCustomOpen);
    };
  }, [messages, userGateway, language]);

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

    // Read stored tourist preferences if available
    let touristPrefs: TouristPreferences | undefined = undefined;
    try {
      const stored = localStorage.getItem('tourist_travel_preferences');
      if (stored) {
        touristPrefs = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }

    try {
      const response = await generateAITravelResponse(text, messages, userGateway, language, touristPrefs);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error('[AI] Assistant error', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: language === 'hi'
            ? 'क्षमा करें, यात्रा विवरण प्राप्त करने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'Sorry, I encountered an issue retrieving travel details. Please try again or explore destinations directly.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: { label: string; action: string; payload?: string }) => {
    if (action.action === 'navigate' && action.payload) {
      setIsOpen(false);
      navigate(action.payload);
    } else if (action.action === 'ask' && action.payload) {
      void handleSend(action.payload);
    } else if (action.action === 'plan') {
      setIsOpen(false);
      navigate('/plan-trip');
    }
  };

  return (
    <>
      {/* Floating Trigger Pill (Fixed Bottom-Right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2 rounded-full bg-forest-900 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xl ring-2 ring-amber-400/50 hover:bg-forest-800 hover:shadow-2xl hover:scale-105 transition-all duration-200"
          aria-label={t('ai.assistantTitle', 'Johar AI Assistant')}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <Sparkles className="h-4 w-4 text-amber-300" />
          <span>{t('ai.assistantTitle', 'Johar AI Assistant')}</span>
        </button>
      </div>

      {/* Slide-in Assistant Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end sm:p-6 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="flex flex-col h-[85vh] sm:h-[650px] w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#FAF8F5] shadow-2xl border border-ink-200/90 overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-ink-200/80">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-forest-900 p-2 text-amber-400 flex items-center justify-center shadow-sm">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-ink-950 text-sm flex items-center gap-1.5">
                    <span>{t('ai.assistantTitle', 'Johar AI Travel Assistant')}</span>
                    <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] px-1.5 py-0.2 font-semibold">
                      Smart GIS
                    </span>
                  </h3>
                  <p className="text-[11px] text-ink-500">
                    {t('ai.assistantSubtitle', 'Official tourism intelligence for 24 Jharkhand districts')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  asChild
                  size="sm"
                  variant="secondary"
                  className="text-xs font-semibold py-1 h-auto hidden sm:inline-flex"
                >
                  <Link to="/plan-trip" onClick={() => setIsOpen(false)}>
                    {language === 'hi' ? 'यात्रा योजना' : 'Plan Trip'}
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1.5 text-ink-400 hover:text-ink-800 hover:bg-sand transition"
                  aria-label="Close assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Gateway selection strip */}
            <div className="bg-sand/40 px-4 py-1.5 border-b border-ink-100 flex items-center justify-between text-[11px]">
              <span className="text-ink-600 font-medium flex items-center gap-1">
                <MapPin className="h-3 w-3 text-clay-700" />
                <span>{t('ai.startingFrom', 'Starting from:')}</span>
              </span>
              <div className="flex items-center gap-1">
                {['Ranchi', 'Jamshedpur', 'Deoghar', 'Dhanbad'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setUserGateway(city)}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all text-[10px] ${
                      userGateway === city
                        ? 'bg-forest-900 text-white'
                        : 'bg-white text-ink-700 hover:bg-sand border border-ink-200/60'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Messages List */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="h-7 w-7 rounded-full bg-forest-900 text-amber-400 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-3 ${
                      msg.role === 'user'
                        ? 'bg-forest-900 text-white rounded-tr-xs shadow-sm font-medium'
                        : 'bg-white text-ink-900 border border-ink-200/80 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {/* Message Body */}
                    <div className="whitespace-pre-line prose prose-xs max-w-none">
                      {msg.content}
                    </div>

                    {/* Active Safety Alerts if mentioned */}
                    {msg.alerts && msg.alerts.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-amber-200">
                        {msg.alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="rounded-xl border border-amber-300 bg-amber-50/90 p-2.5 text-[11px] text-amber-950 flex items-start gap-2"
                          >
                            <AlertTriangle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-bold">{alert.title}</p>
                              <p className="text-amber-800 text-[10px] mt-0.5">{alert.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actionable Destination Recommendations Cards */}
                    {msg.suggestedDestinations && msg.suggestedDestinations.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-ink-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-clay-700">
                          {language === 'hi' ? 'अनुशंसित पर्यटन स्थल' : 'Recommended Locations'}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestedDestinations.map((dest) => (
                            <div
                              key={dest.id}
                              className="flex items-center gap-2.5 rounded-xl border border-ink-200/90 bg-[#FFFDF9] p-2 hover:border-clay-400 transition-all"
                            >
                              <img
                                src={dest.cover_image || '/images/destinations/hundru-falls.jpg'}
                                alt={dest.name}
                                className="h-10 w-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-ink-950 text-xs truncate">
                                  {dest.name}
                                </h4>
                                <p className="text-[10px] text-ink-500 truncate">
                                  {dest.district} District • {dest.category}
                                </p>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <Link
                                  to={`/map?destination=${dest.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="rounded-lg p-1.5 text-ink-500 hover:text-ink-900 hover:bg-sand text-[10px] font-bold"
                                  title={t('common.viewOnMap', 'View on Map')}
                                >
                                  <MapPin className="h-3.5 w-3.5 text-clay-700" />
                                </Link>
                                <Button
                                  asChild
                                  size="sm"
                                  variant="secondary"
                                  className="text-[10px] py-1 px-2 h-auto font-bold"
                                >
                                  <Link
                                    to={`/destinations/${dest.slug}`}
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {t('common.viewDetails', 'Details')}
                                  </Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Stays / Crafts Offerings Cards */}
                    {msg.suggestedOfferings && msg.suggestedOfferings.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-ink-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-forest-800">
                          {language === 'hi' ? 'अनुशंसित आवास एवं सेवाएं' : 'Recommended Stays & Offerings'}
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.suggestedOfferings.map((offering) => (
                            <div
                              key={offering.id}
                              className="flex items-center gap-2.5 rounded-xl border border-ink-200/90 bg-[#FFFDF9] p-2 hover:border-forest-400 transition-all"
                            >
                              <img
                                src={offering.cover_image || offering.gallery?.[0] || '/images/destinations/ranchi-city.jpg'}
                                alt={offering.name}
                                className="h-10 w-10 rounded-lg object-cover shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-ink-950 text-xs truncate">
                                  {offering.name}
                                </h4>
                                <p className="text-[10px] text-forest-700 font-semibold">
                                  {offering.price ? formatIndianCurrency(offering.price) : 'Contact for Price'} • {offering.district}
                                </p>
                              </div>
                              <Button
                                asChild
                                size="sm"
                                variant="secondary"
                                className="text-[10px] py-1 px-2 h-auto font-bold"
                              >
                                <Link
                                  to={
                                    offering.kind === 'stay'
                                      ? `/stays/${offering.id}`
                                      : offering.kind === 'product'
                                        ? `/products/${offering.id}`
                                        : `/experiences/${offering.id}`
                                  }
                                  onClick={() => setIsOpen(false)}
                                >
                                  {language === 'hi' ? 'देखें' : 'View'}
                                </Link>
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Chips */}
                    {msg.quickActions && msg.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {msg.quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleQuickAction(action)}
                            className="rounded-full border border-ink-200 bg-sand/60 px-2.5 py-1 text-[10px] font-bold text-ink-800 hover:bg-forest-900 hover:text-white hover:border-forest-900 transition-all duration-150"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Model Source Attribution */}
                    {msg.role === 'assistant' && msg.modelUsed && (
                      <div className="pt-1 text-[9px] text-ink-400 text-right">
                        <span>✦ {msg.modelUsed}</span>
                      </div>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="h-7 w-7 rounded-full bg-clay-700 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-ink-500 italic p-2 animate-pulse">
                  <Bot className="h-4 w-4 text-forest-700 animate-spin" />
                  <span>
                    {language === 'hi'
                      ? 'जोहार एआई पर्यटन ज्ञानकोष से जानकारी खोज रहा है...'
                      : 'Johar AI is searching Jharkhand tourism knowledge...'}
                  </span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Bar */}
            <div className="p-3.5 bg-white border-t border-ink-200/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  type="text"
                  placeholder={t('ai.askPlaceholder', 'Ask about waterfalls, 3-hour trips, Netarhat, Sohrai art...')}
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  className="text-xs bg-ink-50 border-ink-200 focus:border-forest-600 h-10"
                />
                <Button
                  type="submit"
                  disabled={!inputQuery.trim() || isLoading}
                  className="bg-forest-900 hover:bg-forest-800 text-white h-10 px-3.5 rounded-xl shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
