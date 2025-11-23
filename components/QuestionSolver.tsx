import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Mic, Loader2, StopCircle, Volume2 } from 'lucide-react';
import { createSolverChat, sendChatMessage } from '../services/geminiService';
import { AiQuestion, QuestionType } from '../types';
import { Chat } from '@google/genai';

const QuestionSolver = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AiQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatSessionRef = useRef<Chat | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize chat session on mount
  useEffect(() => {
    try {
      chatSessionRef.current = createSolverChat();
    } catch (e) {
      console.error("Failed to init chat", e);
    }
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN'; // Default to Chinese for Campus app
      recognition.interimResults = false;
      
      recognition.onstart = () => setIsListening(true);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
      };
      
      recognition.onerror = (e: any) => {
        console.error("Speech error", e);
        setIsListening(false);
      };
      
      recognition.onend = () => setIsListening(false);
      
      recognition.start();
    } else {
      alert("Browser does not support speech recognition.");
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

    if (!chatSessionRef.current) {
        // Re-init if missing
        chatSessionRef.current = createSolverChat();
    }

    const userMsg: AiQuestion = {
      id: Date.now().toString(),
      userId: 'user-1',
      content: input,
      imageUri: selectedImage || undefined,
      questionType: QuestionType.UNKNOWN,
      answer: '',
      explanationSteps: [],
      relatedKnowledgePoints: [],
      timestamp: Date.now(),
      sender: 'user'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const tempImage = selectedImage;
    setSelectedImage(null); 
    setLoading(true);

    try {
      const base64Data = tempImage ? tempImage.split(',')[1] : undefined;
      
      // Use the persistent chat session
      const result = await sendChatMessage(chatSessionRef.current, userMsg.content, base64Data);

      const aiMsg: AiQuestion = {
        id: (Date.now() + 1).toString(),
        userId: 'user-1',
        content: '',
        questionType: result.type,
        answer: result.answer,
        explanationSteps: result.steps,
        relatedKnowledgePoints: result.knowledge,
        timestamp: Date.now(),
        sender: 'ai'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: AiQuestion = {
        id: Date.now().toString(),
        userId: 'system',
        content: '',
        questionType: QuestionType.GENERAL,
        answer: "Sorry, I encountered an error processing your request. Please try again.",
        explanationSteps: [],
        relatedKnowledgePoints: [],
        timestamp: Date.now(),
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-700">AI Tutor</h2>
            {isListening && <span className="text-xs text-red-500 animate-pulse font-bold flex items-center gap-1"><Mic size={12}/> Listening...</span>}
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          Gemini 2.5 Flash
        </span>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
            <BrainCircuitIcon className="w-16 h-16 mb-4" />
            <p className="text-lg">Ask any academic question...</p>
            <p className="text-sm">Supports Math, Coding, Translation</p>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 ${
              msg.sender === 'user' 
                ? 'bg-primary text-white rounded-br-none' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none'
            }`}>
              {/* User Content */}
              {msg.sender === 'user' && (
                <div className="space-y-2">
                  {msg.imageUri && (
                    <img src={msg.imageUri} alt="User upload" className="max-h-48 rounded-lg border border-white/20" />
                  )}
                  <p>{msg.content}</p>
                </div>
              )}

              {/* AI Content */}
              {msg.sender === 'ai' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-2 py-1 rounded">
                      {msg.questionType}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <h4 className="font-bold text-slate-900">Answer:</h4>
                    <p className="whitespace-pre-wrap">{msg.answer}</p>
                    
                    {msg.explanationSteps.length > 0 && (
                      <div className="mt-4 bg-white p-3 rounded-lg border border-slate-200">
                        <h4 className="font-bold text-slate-900 mb-2">Detailed Steps:</h4>
                        <ol className="list-decimal pl-4 space-y-1">
                          {msg.explanationSteps.map((step, idx) => (
                            <li key={idx}>{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                    {msg.relatedKnowledgePoints.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200">
                        <p className="text-xs font-bold text-slate-500 mb-2">KNOWLEDGE POINTS:</p>
                        <div className="flex flex-wrap gap-2">
                          {msg.relatedKnowledgePoints.map((kp, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                              {kp}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
            <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-none p-4 flex items-center gap-2 text-slate-500">
                    <Loader2 className="animate-spin w-4 h-4" />
                    <span className="text-sm">Thinking...</span>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200 print:hidden">
        {selectedImage && (
            <div className="mb-2 relative inline-block">
                <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-md border border-slate-200" />
                <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600"
                >
                    <XIcon className="w-3 h-3" />
                </button>
            </div>
        )}
        <div className="flex gap-2 items-end">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-slate-500 hover:text-primary hover:bg-blue-50 rounded-full transition-colors"
            title="Upload Image"
          >
            <ImageIcon size={20} />
          </button>
          
          <button 
            onClick={startListening}
            className={`p-3 rounded-full transition-colors ${
                isListening 
                ? 'bg-red-100 text-red-500 animate-pulse' 
                : 'text-slate-500 hover:text-primary hover:bg-blue-50'
            }`}
            title="Voice Input"
          >
            <Mic size={20} />
          </button>

          <div className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:bg-white transition-all">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                  }
              }}
              placeholder={isListening ? "Listening..." : "Type your question..."}
              className="w-full bg-transparent border-none focus:ring-0 outline-none resize-none max-h-32 text-sm"
              rows={1}
            />
          </div>
          <button 
            onClick={handleSend}
            disabled={(!input.trim() && !selectedImage) || loading}
            className="p-3 bg-primary text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper Icons
const BrainCircuitIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8.86a6 6 0 0 0-2.33-4.73l-4.48-3.41"/><path d="M7.81 4.13 3.33 8.86a6 6 0 0 0 0 8.48l4.48 3.41"/><path d="M16.19 22.13 21 17.14a6 6 0 0 0-1.19-9.13"/><path d="m3 17.14 4.81 4.99a6 6 0 0 0 9.13-1.19"/><path d="M14.5 9.5 16 11l-3.5 3.5L11 13l-3.5 3.5-1.5-1.5"/><path d="m14 17 2.5-2.5"/><path d="m9 11-2.5 2.5"/></svg>
);

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default QuestionSolver;