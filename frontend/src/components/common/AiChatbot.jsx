import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Loader, Bot, User, AlertTriangle } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';
import useAuthStore from '../../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

// Reusable suggestion chip component
const SuggestionChip = ({ text, onClick, disabled }) => (
  <button
    onClick={() => onClick(text)}
    disabled={disabled}
    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-slate-700 dark:hover:border-orange-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
  >
    {text}
  </button>
);

const AiChatbot = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm Note Buddy! I can help you:\n\n• Create and organize notes\n• Update existing notes\n• Pin important items\n• Search and analyze your notes\n• Delete notes (with confirmation)\n\nWhat would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [pendingDeleteConfirmation, setPendingDeleteConfirmation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { fetchNotes, fetchTags, setAiFilter } = useNoteStore();
  const token = useAuthStore((state) => state.token);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input and trigger mount animation
  useEffect(() => {
    inputRef.current?.focus();
    const timer = setTimeout(() => setIsMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Send message handler
  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return;

    setHasSentFirstMessage(true);
    const userMessage = messageText.trim();
    setInput('');
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = '48px';
    }

    // Add user message
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:4000/api/ai/chat',
        {
          message: userMessage,
          conversationHistory: conversationHistory
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const { 
        message: aiMessage, 
        action, 
        actionResult, 
        conversationContext,
        searchResultIds,
        requiresConfirmation,
        parameters 
      } = response.data;

      if (action === 'REQUEST_DELETE_CONFIRMATION' && requiresConfirmation) {
        setPendingDeleteConfirmation(parameters);
      } else {
        setPendingDeleteConfirmation(null);
      }

      const newAiMessage = {
        role: 'assistant',
        content: aiMessage,
        action: action,
        requiresConfirmation: requiresConfirmation,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, newAiMessage]);

      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        conversationContext
      ]);

      if (action === 'SEARCH_NOTES' && searchResultIds) {
        setAiFilter(searchResultIds);
      }

      if (action && !['ANSWER_QUESTION', 'REQUEST_DELETE_CONFIRMATION', 'SEARCH_NOTES', 'SUMMARIZE_NOTES'].includes(action)) {
        await fetchNotes();
        await fetchTags();
        
        switch (action) {
          case 'CREATE_NOTE': toast.success('Note created successfully!'); break;
          case 'CREATE_MULTIPLE_NOTES': toast.success(`${actionResult?.length || 0} notes created!`); break;
          case 'UPDATE_NOTE': if (actionResult) toast.success('Note updated!'); break;
          case 'PIN_NOTE': if (actionResult) toast.success(actionResult.pinned ? 'Note pinned!' : 'Note unpinned!'); break;
          case 'DELETE_NOTE': if (actionResult) toast.success('Note deleted!'); break;
          case 'DELETE_MULTIPLE_NOTES': if (actionResult) toast.success(`${actionResult.deletedCount} note(s) deleted!`); break;
        }
      }

    } catch (error) {
      console.error('Error with AI chat:', error);
      const errorMessage = {
        role: 'assistant',
        content: "Sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to communicate with Note Buddy');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 w-full max-w-md md:max-w-lg lg:max-w-xl h-[80vh] max-h-[650px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      
      {/* Header - Solid Orange with No Border */}
      <div className="flex items-center justify-between p-4 bg-orange-600 dark:bg-orange-700">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-white/20 rounded-xl shadow-sm backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-orange-600 dark:border-orange-700"></div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Note Buddy</h3>
            <p className="text-xs text-orange-100 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
              </span>
              Online • Powered by Gemini
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-xl text-orange-100 hover:text-white hover:bg-white/10 transition-all duration-200"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages - Orange Scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50 dark:bg-slate-900/50 scrollbar-thin scrollbar-thumb-orange-500 hover:scrollbar-thumb-orange-600 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm mb-5 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                  : msg.isError ? 'bg-red-500' : msg.requiresConfirmation ? 'bg-yellow-500' 
                  : 'bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> 
                : msg.requiresConfirmation ? <AlertTriangle className="w-4 h-4 text-white" /> 
                : <Bot className={`w-4 h-4 ${msg.isError ? 'text-white' : 'text-orange-600 dark:text-orange-400'}`} />}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-br-sm'
                    : msg.isError ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 rounded-bl-sm border border-red-100 dark:border-red-800/50'
                    : msg.requiresConfirmation ? 'bg-yellow-50 text-yellow-900 dark:bg-yellow-900/20 dark:text-yellow-200 rounded-bl-sm border border-yellow-200 dark:border-yellow-800/50'
                    : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-200 rounded-bl-sm border border-slate-100 dark:border-slate-700'
                }`}>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap break-words prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 max-w-none" dangerouslySetInnerHTML={{ __html: msg.content }} />
                  
                  {/* Action Badge */}
                  {msg.action && !['ANSWER_QUESTION', 'REQUEST_DELETE_CONFIRMATION'].includes(msg.action) && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-md">
                        <Sparkles className="w-3 h-3" />
                        {msg.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {/* Confirm Buttons */}
                  {msg.requiresConfirmation && msg.action === 'REQUEST_DELETE_CONFIRMATION' && (
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => sendMessage('yes, delete them')} disabled={isLoading} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50">Yes, Delete</button>
                      <button onClick={() => { sendMessage('cancel'); setPendingDeleteConfirmation(null); }} disabled={isLoading} className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-white text-sm font-medium rounded-lg transition-all shadow-sm hover:shadow disabled:opacity-50">Cancel</button>
                    </div>
                  )}
                </div>
                
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 px-1">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
            
            {/* Suggestion Chips */}
            {index === 0 && !hasSentFirstMessage && (
              <div className="flex flex-wrap gap-2 pt-1 pl-11">
                <SuggestionChip text="Create a shopping list" onClick={handleSuggestionClick} disabled={isLoading} />
                <SuggestionChip text="What notes do I have?" onClick={handleSuggestionClick} disabled={isLoading} />
                <SuggestionChip text="Summarize my notes" onClick={handleSuggestionClick} disabled={isLoading} />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Loading Dots */}
        {isLoading && (
          <div className="flex gap-3 items-end">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center shadow-sm mb-5">
              <Bot className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="bg-white dark:bg-slate-800 px-4 py-4 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 flex items-center mb-5">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSubmit} className="relative flex items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingDeleteConfirmation ? "Type 'yes' to confirm or 'cancel'..." : "Ask me anything about your notes..."}
            disabled={isLoading}
            rows={1}
            className="w-full pl-4 pr-14 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 caret-orange-600 disabled:opacity-50 resize-none transition-all shadow-inner"
            style={{ minHeight: '48px', maxHeight: '120px' }}
            onInput={(e) => { e.target.style.height = '48px'; e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'; }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-1.5 p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 dark:disabled:from-slate-700 dark:disabled:to-slate-700 dark:disabled:text-slate-500 transition-all shadow-sm disabled:shadow-none"
          >
            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
        <div className="flex justify-between items-center mt-2 px-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500">
            <span className="font-medium">Enter</span> to send, <span className="font-medium">Shift+Enter</span> for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiChatbot;