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
    className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-orange-50 hover:border-orange-300 dark:hover:bg-slate-600 dark:hover:border-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
  >
    {text}
  </button>
);

const AiChatbot = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! 👋 I'm your AI note assistant. I can help you:\n\n• Create and organize notes\n• Update existing notes\n• Pin important items\n• Search and analyze your notes\n• Delete notes (with confirmation)\n\nWhat would you like to do?",
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
  
  const { fetchNotes, fetchTags } = useNoteStore();
  const token = useAuthStore((state) => state.token);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
        requiresConfirmation,
        parameters 
      } = response.data;

      // Handle delete confirmation
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

      // Refresh notes if action was performed
      if (action && !['ANSWER_QUESTION', 'REQUEST_DELETE_CONFIRMATION', 'SEARCH_NOTES', 'SUMMARIZE_NOTES'].includes(action)) {
        await fetchNotes();
        await fetchTags();
        
        // Show success toasts
        switch (action) {
          case 'CREATE_NOTE':
            toast.success('Note created successfully!');
            break;
          case 'CREATE_MULTIPLE_NOTES':
            toast.success(`${actionResult?.length || 0} notes created!`);
            break;
          case 'UPDATE_NOTE':
            if (actionResult) toast.success('Note updated!');
            break;
          case 'PIN_NOTE':
            if (actionResult) toast.success(actionResult.pinned ? 'Note pinned!' : 'Note unpinned!');
            break;
          case 'DELETE_NOTE':
            if (actionResult) toast.success('Note deleted!');
            break;
          case 'DELETE_MULTIPLE_NOTES':
            if (actionResult) toast.success(`${actionResult.deletedCount} note(s) deleted!`);
            break;
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
      toast.error('Failed to communicate with AI assistant');
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
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 z-50 w-full max-w-2xl h-[650px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300 ease-out ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-white to-orange-50 dark:from-slate-800 dark:to-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></div>
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">AI Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Powered by Gemini
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-700 transition-all duration-200"
          aria-label="Close chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages Container */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-slate-200 dark:scrollbar-track-slate-800 hover:scrollbar-thumb-orange-500"
      >
        {messages.map((msg, index) => (
          <React.Fragment key={index}>
            {/* Message Wrapper */}
            <div className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-600' 
                  : msg.isError
                  ? 'bg-gradient-to-br from-red-500 to-red-600'
                  : msg.requiresConfirmation
                  ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : msg.requiresConfirmation ? (
                  <AlertTriangle className="w-5 h-5 text-white" />
                ) : (
                  <Bot className={`w-4 h-4 ${
                    msg.isError ? 'text-white' : 'text-orange-600 dark:text-orange-400'
                  }`} />
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-md'
                      : msg.isError
                      ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-tl-md border border-red-200 dark:border-red-800'
                      : msg.requiresConfirmation
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 rounded-tl-md border-2 border-yellow-400 dark:border-yellow-600'
                      : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-md border border-slate-200 dark:border-slate-600'
                  }`}
                >
                  <div
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words prose prose-sm dark:prose-invert prose-p:my-1 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 max-w-none"
                    dangerouslySetInnerHTML={{ __html: msg.content }}
                  />
                  
                  {/* Action Badge */}
                  {msg.action && !['ANSWER_QUESTION', 'REQUEST_DELETE_CONFIRMATION'].includes(msg.action) && (
                    <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-600">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/40 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                        {msg.action.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}

                  {/* Confirmation Buttons */}
                  {msg.requiresConfirmation && msg.action === 'REQUEST_DELETE_CONFIRMATION' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => sendMessage('yes, delete them')}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Yes, Delete
                      </button>
                      <button
                        onClick={() => {
                          sendMessage('cancel');
                          setPendingDeleteConfirmation(null);
                        }}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Timestamp */}
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 px-2">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            </div>
            
            {/* Suggestion Chips (only after first message) */}
            {index === 0 && !hasSentFirstMessage && (
              <div className="flex flex-wrap gap-2 pt-3 px-12">
                <SuggestionChip text="Create a shopping list" onClick={handleSuggestionClick} disabled={isLoading} />
                <SuggestionChip text="What notes do I have?" onClick={handleSuggestionClick} disabled={isLoading} />
                <SuggestionChip text="Summarize my notes" onClick={handleSuggestionClick} disabled={isLoading} />
              </div>
            )}
          </React.Fragment>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-200 dark:border-slate-600">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingDeleteConfirmation ? "Type 'yes' to confirm or 'cancel'..." : "Type your message..."}
            disabled={isLoading}
            rows={1}
            className="w-full pl-4 pr-14 py-3.5 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 caret-orange-600 disabled:opacity-50 resize-none transition-all duration-200"
            style={{ minHeight: '52px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 disabled:from-orange-300 disabled:to-orange-400 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2.5 px-1 flex items-center justify-between">
          <span>Press <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs font-mono">Enter</kbd> to send</span>
          <span className="text-slate-400 dark:text-slate-500">Shift+Enter for new line</span>
        </p>
      </div>
    </div>
  );
};

export default AiChatbot;