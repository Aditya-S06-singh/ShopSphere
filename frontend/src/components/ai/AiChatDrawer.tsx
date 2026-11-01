import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sparkles,
  Send,
  Loader2,
  Bot,
  User,
  ExternalLink,
  Plus
} from 'lucide-react';
import { AiChatMessage } from '../../types/ai';
import { Product } from '../../types/product';
import { sendAiChatMessage } from '../../api/ai';

interface AiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const QUICK_PROMPTS = [
  'Gifts for developers under $100',
  'Ergonomic gear for long typing hours',
  'Best wireless audio and music equipment',
  'What accessories do you have in stock?',
];

export const AiChatDrawer: React.FC<AiChatDrawerProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content:
        '👋 Hi! I am **SphereAI**, your real-time shopping assistant. I have direct access to our live PostgreSQL catalog, prices, and stock levels.\n\nAsk me for recommendations, budget comparisons, or gift ideas!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: AiChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendAiChatMessage(text, history);

      const assistantMsg: AiChatMessage = {
        role: 'assistant',
        content: response.reply,
        recommendedProducts: response.recommendedProducts,
        source: response.source,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            '⚠️ Sorry, I had trouble reaching the AI retrieval engine. Please check your connection and try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-pink-50/50">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">SphereAI Concierge</h3>
                <span className="text-[10px] text-purple-700 font-medium">
                  RAG Shopping Assistant &bull; Live Catalog
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompts */}
          <div className="px-4 py-2.5 bg-gray-50/80 border-b border-gray-100 overflow-x-auto whitespace-nowrap">
            <div className="flex space-x-1.5 text-[11px]">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  disabled={loading}
                  onClick={() => handleSend(prompt)}
                  className="px-2.5 py-1 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer disabled:opacity-50 flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex space-x-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Markdown text representation */}
                  <div className="whitespace-pre-line font-sans">{msg.content}</div>

                  {/* Product Recommendation Cards (RAG Injected) */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="pt-2 border-t border-gray-200/60 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        Matching Products from Store:
                      </span>
                      {msg.recommendedProducts.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-gray-200/80 hover:border-indigo-300 transition-all text-gray-900"
                        >
                          <img
                            src={
                              p.imageUrl ||
                              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=120'
                            }
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold truncate text-[11px]">{p.name}</h5>
                            <div className="flex items-center space-x-2 mt-0.5">
                              <span className="font-bold text-indigo-600 text-xs">
                                ${p.price.toFixed(2)}
                              </span>
                              {p.stockQuantity > 0 ? (
                                <span className="text-[9px] text-emerald-600 font-medium">
                                  {p.stockQuantity} in stock
                                </span>
                              ) : (
                                <span className="text-[9px] text-rose-500 font-medium">
                                  Out of stock
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            <button
                              onClick={() => {
                                onSelectProduct(p);
                                onClose();
                              }}
                              title="View details"
                              className="p-1 rounded-md text-gray-400 hover:text-indigo-600 hover:bg-gray-100 cursor-pointer"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={p.stockQuantity === 0}
                              onClick={() => onAddToCart(p)}
                              title="Add to cart"
                              className="p-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.source && (
                    <div className="text-[9px] text-gray-400 pt-1 text-right">
                      {msg.source === 'GEMINI_LLM' ? '✨ Powered by Gemini LLM' : '🧠 SphereAI RAG Engine'}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex space-x-2.5 items-center text-xs text-gray-400 pl-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                  <span>Searching PostgreSQL vectors & synthesizing reply...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder="Ask SphereAI anything about products..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                className="flex-1 text-xs px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
