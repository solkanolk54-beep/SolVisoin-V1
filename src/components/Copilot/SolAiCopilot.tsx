import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  MapPin, 
  Sparkles, 
  Layers, 
  Database, 
  FileText, 
  ExternalLink,
  RotateCcw,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Copy,
  Check
} from 'lucide-react';
import { Language, CopilotMessage, CopilotMapFocus } from '../../types';
import { queryCopilotKnowledgeBase, COPILOT_KNOWLEDGE_BASE } from '../../data/copilotKnowledgeBase';

interface SolAiCopilotProps {
  lang: Language;
  onFocusMapLocation?: (focus: CopilotMapFocus) => void;
  onSwitchTab?: (tabId: string) => void;
}

export const SolAiCopilot: React.FC<SolAiCopilotProps> = ({
  lang,
  onFocusMapLocation,
  onSwitchTab,
}) => {
  const isAr = lang === 'ar';

  const defaultWelcomeMessage: CopilotMessage = {
    id: 'msg-welcome',
    role: 'assistant',
    text: isAr
      ? `مرحباً بك في **SolAI Copilot** — المساعد الذكي للتحليل المكاني والهندسة الزراعية.\n\nيمكنك توجيه أسئلتك نصياً أو صوتياً باللغتين العربية والإنجليزية. أنا متصل مباشرة بقواعد بيانات PostGIS وطبقات SoilGrids ونماذج التعلم العميق (LSTM) للأحواض الساكبة في جيجل.`
      : `Welcome to **SolAI Copilot** — Your AI Natural Language GIS & Hydrological Assistant.\n\nAsk any question via text or voice. I am natively connected to PostGIS spatial layers, SoilGrids rasters, live Sentinel-2 indices, and Deep Learning LSTM flood models for Jijel catchments.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestedActions: [
      {
        id: 'act-citrus',
        labelEn: 'Moisture & NPK for Citrus',
        labelAr: 'رطوبة وأسمدة قطاع الحمضيات',
        actionType: 'run_simulation',
        payload: isAr ? 'ما هي نسبة الرطوبة والاحتياجات السمادية لقطاع الحمضيات اليوم؟' : 'What is the moisture and NPK fertilizer requirement for the Citrus sector today?'
      },
      {
        id: 'act-tabellout',
        labelEn: 'Critical Hotspot at Tabellout Dam',
        labelAr: 'أخطر بؤرة انجراف في حوض سد تابلوط',
        actionType: 'run_simulation',
        payload: isAr ? 'أين تقع أخطر بؤرة انجراف في حوض سد تابلوط؟' : 'Where is the most critical erosion hotspot in Tabellout Dam basin?'
      },
      {
        id: 'act-flood',
        labelEn: 'Deep Learning Flood Forecast',
        labelAr: 'التنبؤ الذكي بالسيول والإنذار المبكر',
        actionType: 'open_tab',
        payload: 'flood-forecast'
      }
    ]
  };

  const [messages, setMessages] = useState<CopilotMessage[]>([defaultWelcomeMessage]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [selectedGeoJsonModal, setSelectedGeoJsonModal] = useState<{ title: string; json: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = isAr ? 'ar-DZ' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText(transcript);
          handleSendQuery(transcript);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setVoiceSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isAr]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = isAr ? 'ar-DZ' : 'en-US';
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
      }
    }
  };

  const handleSpeakText = (text: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for pleasant vocalization
    const cleanText = text.replace(/[*#_`]/g, '').replace(/•/g, '-');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isAr ? 'ar-SA' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendQuery = async (queryToSend?: string) => {
    const text = (queryToSend || inputText).trim();
    if (!text || isTyping) return;

    const userMessage: CopilotMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate RAG geospatial lookup & LLM inference delay
    setTimeout(() => {
      const match = queryCopilotKnowledgeBase(text, lang);

      let botResponse: CopilotMessage;

      if (match) {
        botResponse = {
          id: `msg-bot-${Date.now()}`,
          role: 'assistant',
          text: isAr ? match.responseAr : match.responseEn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          intent: match.intent,
          metricsSummary: match.metricsSummary,
          mapFocus: match.mapFocus,
          geoJsonPayload: match.geoJsonPayload,
          suggestedActions: match.suggestedActions
        };
      } else {
        // Fallback intelligent general assistant response
        botResponse = {
          id: `msg-bot-${Date.now()}`,
          role: 'assistant',
          text: isAr
            ? `تم تحليل الاستفسار: "${text}". تم إجراء مطابقة عبر طبقات PostGIS وخريطة حرارة الجفاف ونماذج الانجراف.\n\nيمكنك استكشاف البيانات التفصيلية عبر أشرطة التبويب المخصصة أو استخدام الاستفسارات المقترحة السريعة أدناه.`
            : `Query analyzed: "${text}". Checked against PostGIS spatial indices, drought heatmaps, and RUSLE erosion rasters.\n\nYou can explore deep data through the specialized tabs or click one of the suggested prompts below.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedActions: [
            {
              id: 'sug-citrus',
              labelEn: 'Ask about Citrus NPK & Moisture',
              labelAr: 'اسأل عن رطوبة وتسميد الحمضيات',
              actionType: 'run_simulation',
              payload: isAr ? 'ما هي نسبة الرطوبة والاحتياجات السمادية لقطاع الحمضيات اليوم؟' : 'What is the moisture and NPK fertilizer requirement for the Citrus sector today?'
            },
            {
              id: 'sug-tabellout',
              labelEn: 'Where is the worst hotspot in Tabellout?',
              labelAr: 'أين تقع أخطر بؤرة انجراف في حوض سد تابلوط؟',
              actionType: 'run_simulation',
              payload: isAr ? 'أين تقع أخطر بؤرة انجراف في حوض سد تابلوط؟' : 'Where is the most critical erosion hotspot in Tabellout Dam basin?'
            }
          ]
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);

      if (autoSpeak) {
        handleSpeakText(botResponse.text, botResponse.id);
      }
    }, 750);
  };

  const handleActionClick = (action: NonNullable<CopilotMessage['suggestedActions']>[0], msg: CopilotMessage) => {
    if (action.actionType === 'focus_map' && msg.mapFocus) {
      if (onFocusMapLocation) {
        onFocusMapLocation(msg.mapFocus);
      }
    } else if (action.actionType === 'open_tab' && action.payload && onSwitchTab) {
      onSwitchTab(action.payload);
    } else if (action.actionType === 'run_simulation' && action.payload) {
      handleSendQuery(action.payload);
    }
  };

  const handleCopyText = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="flex flex-col h-[750px] bg-[#0F172A]/80 border border-[#1E293B] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md">
      {/* Copilot Header */}
      <div className="p-4 bg-slate-900/90 border-b border-[#1E293B] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">
                {isAr ? 'مساعد الذكاء الاصطناعي (SolAI Copilot)' : 'SolAI Copilot (GIS AI)'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Natural Language GIS • RAG
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'استعلامات جغرافية ومناخية ذكية مدعومة بقواعد PostGIS ونماذج التعلم العميق'
                : 'Intelligent spatial queries powered by PostGIS RAG & Deep Learning models'}
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>PostGIS: Live</span>
            <span>•</span>
            <span className="text-cyan-400">SoilGrids: OK</span>
          </div>

          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-lg border text-xs transition cursor-pointer flex items-center gap-1.5 ${
              autoSpeak
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
            title={isAr ? 'القراءة الصوتية التلقائية' : 'Auto Voice Readout'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{isAr ? 'الصوت التلقائي' : 'Auto Voice'}</span>
          </button>

          <button
            onClick={() => setMessages([defaultWelcomeMessage])}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-lg text-xs transition cursor-pointer"
            title={isAr ? 'إعادة ضبط المحادثة' : 'Reset Conversation'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Quick Prompt Chips Bar */}
      <div className="px-4 py-2 bg-[#0B0F19] border-b border-[#1E293B] flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
        <span className="text-slate-400 shrink-0 flex items-center gap-1 font-mono text-[11px]">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          {isAr ? 'أسئلة سريعة:' : 'Quick Prompts:'}
        </span>
        <button
          onClick={() => handleSendQuery(isAr ? 'ما هي نسبة الرطوبة والاحتياجات السمادية لقطاع الحمضيات اليوم؟' : 'What is the moisture and NPK fertilizer requirement for the Citrus sector today?')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-full whitespace-nowrap transition cursor-pointer"
        >
          {isAr ? '🍊 رطوبة وتسميد الحمضيات' : '🍊 Citrus NPK & Moisture'}
        </button>
        <button
          onClick={() => handleSendQuery(isAr ? 'أين تقع أخطر بؤرة انجراف في حوض سد تابلوط؟' : 'Where is the most critical erosion hotspot in Tabellout Dam basin?')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-full whitespace-nowrap transition cursor-pointer"
        >
          {isAr ? '🔥 أخطر بؤرة انجراف بسد تابلوط' : '🔥 Tabellout Critical Hotspot'}
        </button>
        <button
          onClick={() => handleSendQuery(isAr ? 'ما هي توقعات السيول العاجلة والإنذار المبكر لحوض كيسير؟' : 'What is the deep learning flood forecast and early warning for Kissir?')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-full whitespace-nowrap transition cursor-pointer"
        >
          {isAr ? '🌊 توقعات السيول العاجلة' : '🌊 Flash Flood Forecast'}
        </button>
        <button
          onClick={() => handleSendQuery(isAr ? 'ما هو حجم الرسوبيات المتوقع لسد بوسيابة؟' : 'What is the expected siltation volume for Boussiaba Dam?')}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-full whitespace-nowrap transition cursor-pointer"
        >
          {isAr ? '⛰️ توحل سد بوسيابة' : '⛰️ Boussiaba Siltation'}
        </button>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-gradient-to-b from-transparent via-[#0B0F19]/40 to-[#0B0F19]/70">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-cyan-600 text-white'
                    : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {isUser ? <Compass className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Content */}
              <div
                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed shadow-lg ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                    : 'bg-[#1E293B]/80 text-slate-100 border border-[#334155] rounded-tl-none'
                }`}
              >
                {/* Header info */}
                <div className="flex items-center justify-between gap-3 mb-1.5 text-[11px] opacity-75">
                  <span className="font-semibold">
                    {isUser ? (isAr ? 'المستخدم' : 'Engineer') : (isAr ? 'SolAI Copilot' : 'SolAI Assistant')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleSpeakText(msg.text, msg.id)}
                        className="hover:text-emerald-300 transition cursor-pointer"
                        title={isAr ? 'استماع للرد' : 'Listen'}
                      >
                        {speakingMessageId === msg.id ? (
                          <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                        ) : (
                          <VolumeX className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Text Content */}
                <div className="whitespace-pre-wrap space-y-2">
                  {msg.text.split('\n').map((line, idx) => {
                    if (line.startsWith('• **') || line.startsWith('- **')) {
                      return (
                        <div key={idx} className="pl-2 rtl:pr-2 rtl:pl-0 font-medium">
                          {line}
                        </div>
                      );
                    }
                    return <p key={idx}>{line}</p>;
                  })}
                </div>

                {/* Metrics Summary Chips if available */}
                {msg.metricsSummary && msg.metricsSummary.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-700/60 font-mono text-[11px]">
                    {msg.metricsSummary.map((m, idx) => (
                      <div key={idx} className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                        <span className="text-slate-400 text-[10px] block">
                          {isAr ? m.labelAr : m.labelEn}
                        </span>
                        <span className={`font-bold text-xs ${m.color || 'text-slate-100'}`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Map Viewport Card & Geometry preview */}
                {msg.mapFocus && (
                  <div className="mt-3 p-3 bg-slate-950/90 rounded-xl border border-emerald-500/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{isAr ? msg.mapFocus.titleAr : msg.mapFocus.titleEn}</span>
                      </div>
                      {msg.mapFocus.badge && (
                        <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {msg.mapFocus.badge}
                        </span>
                      )}
                    </div>
                    {(msg.mapFocus.descriptionAr || msg.mapFocus.descriptionEn) && (
                      <p className="text-[11px] text-slate-400">
                        {isAr ? msg.mapFocus.descriptionAr : msg.mapFocus.descriptionEn}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-mono text-slate-500">
                        Lat: {msg.mapFocus.lat.toFixed(4)}°, Lng: {msg.mapFocus.lng.toFixed(4)}°
                      </span>
                      <div className="flex items-center gap-2">
                        {msg.geoJsonPayload && (
                          <button
                            onClick={() =>
                              setSelectedGeoJsonModal({
                                title: msg.geoJsonPayload?.name || 'GeoJSON Layer',
                                json: JSON.stringify(msg.geoJsonPayload?.data, null, 2)
                              })
                            }
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-mono flex items-center gap-1 transition"
                          >
                            <Code2 className="w-3 h-3 text-cyan-400" />
                            <span>GeoJSON</span>
                          </button>
                        )}
                        <button
                          onClick={() => onFocusMapLocation && onFocusMapLocation(msg.mapFocus!)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 transition shadow cursor-pointer"
                        >
                          <Compass className="w-3 h-3" />
                          <span>{isAr ? '📍 تركيز الخريطة (Map Zoom)' : '📍 Focus Map Viewport'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Suggested Action Buttons */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-700/60 flex-wrap">
                    {msg.suggestedActions.map((act) => (
                      <button
                        key={act.id}
                        onClick={() => handleActionClick(act, msg)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/60 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {act.actionType === 'focus_map' && <MapPin className="w-3 h-3 text-emerald-400" />}
                        {act.actionType === 'open_tab' && <ExternalLink className="w-3 h-3 text-cyan-400" />}
                        {act.actionType === 'run_simulation' && <Sparkles className="w-3 h-3 text-amber-400" />}
                        <span>{isAr ? act.labelAr : act.labelEn}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#1E293B]/80 text-slate-300 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs flex items-center gap-2 border border-[#334155]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce delay-200"></span>
              <span className="text-[11px] font-mono text-slate-400 ml-1">
                {isAr ? 'جارٍ الاستعلام المكاني وحساب النوايا...' : 'Performing spatial RAG lookup...'}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 bg-slate-900/90 border-t border-[#1E293B]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Microphone Button */}
          {voiceSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-3 rounded-xl border transition cursor-pointer relative ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 shadow-lg shadow-rose-500/40 animate-pulse'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
              title={isListening ? (isAr ? 'جارٍ الاستماع... انقر للإيقاف' : 'Listening... click to stop') : (isAr ? 'تحدث صوتياً' : 'Voice Input')}
            >
              {isListening ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5" />}
              {isListening && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-400 rounded-full animate-ping" />
              )}
            </button>
          )}

          {/* Text input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening
                  ? (isAr ? 'جارٍ الاستماع لصوتك الآن...' : 'Listening to your voice...')
                  : (isAr ? 'اكتب استفسارك المكاني أو الزراعي أو الهيدرولوجي هنا...' : 'Type your spatial, agronomy or hydrological query...')
              }
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none transition shadow-inner"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className={`p-3 rounded-xl font-bold transition flex items-center justify-center cursor-pointer ${
              inputText.trim() && !isTyping
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 rtl:rotate-180" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2 px-1">
          <span>SolAI RAG Architecture • Fast-API Geospatial Gateway</span>
          <span className="hidden sm:inline">Press Enter to send • Voice enabled</span>
        </div>
      </div>

      {/* GeoJSON Modal Inspector */}
      {selectedGeoJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0F172A] border border-[#1E293B] rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-100">{selectedGeoJsonModal.title}</h3>
              </div>
              <button
                onClick={() => setSelectedGeoJsonModal(null)}
                className="text-slate-400 hover:text-slate-200 text-xs px-2 py-1 bg-slate-800 rounded-lg"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded-xl text-[11px] font-mono text-emerald-400 max-h-72 overflow-y-auto leading-relaxed border border-slate-800">
              {selectedGeoJsonModal.json}
            </pre>

            <div className="flex items-center justify-between">
              <button
                onClick={() => handleCopyText('geojson_modal', selectedGeoJsonModal.json)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition"
              >
                {copiedKey === 'geojson_modal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'geojson_modal' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ كود GeoJSON' : 'Copy GeoJSON')}</span>
              </button>
              <button
                onClick={() => setSelectedGeoJsonModal(null)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
              >
                {isAr ? 'تم' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
