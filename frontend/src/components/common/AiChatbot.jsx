import React, { useState, useRef, useEffect } from 'react';
import { CornerDownLeft, X, Sparkles, Loader, Bot, User, AlertTriangle } from 'lucide-react';
import useNoteStore from '../../stores/noteStore';
import useAuthStore from '../../stores/authStore';
import axios from 'axios';
import toast from 'react-hot-toast';

const AiChatbot = ({ onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm your smart note assistant. I can help you:\n\n📝 Create and update notes\n📌 Pin important notes\n🗑️ Delete notes (with confirmation)\n🔍 Search and filter notes\n📊 Provide summaries and analytics\n\nWhat would you like to do?",
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { fetchNotes, fetchTags, deleteNote } = useNoteStore();
  const token = useAuthStore((state) => state.token);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Check if this is a confirmation response
    const isConfirmation = pendingConfirmation && 
      (userMessage.toLowerCase().includes('yes') || 
       userMessage.toLowerCase().includes('confirm') ||
       userMessage.toLowerCase().includes('go ahead') ||
       userMessage.toLowerCase().includes('delete them'));

    const isCancellation = pendingConfirmation && 
      (userMessage.toLowerCase().includes('no') ||
       userMessage.toLowerCase().includes('cancel') ||
       userMessage.toLowerCase().includes('nevermind'));

    // Add user message to UI
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);

    // Handle confirmation/cancellation
    if (pendingConfirmation) {
      if (isCancellation) {
        const cancelMessage = {
          role: 'assistant',
          content: "Operation cancelled. Your notes are safe! 👍",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, cancelMessage]);
        setPendingConfirmation(null);
        return;
      }

      if (isConfirmation) {
        setIsLoading(true);
        try {
          // Execute the pending deletion
          const { operation, noteIds } = pendingConfirmation;
          
          if (operation === 'DELETE_MULTIPLE') {
            // Delete all notes in the list
            for (const noteId of noteIds) {
              await deleteNote(noteId);
            }
            
            const successMessage = {
              role: 'assistant',
              content: `✅ Successfully deleted ${noteIds.length} note(s). Your notes have been updated.`,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, successMessage]);
            
            await fetchNotes();
            await fetchTags();
            toast.success(`${noteIds.length} notes deleted`);
          }
          
          setPendingConfirmation(null);
        } catch (error) {
          console.error('Error executing confirmed deletion:', error);
          const errorMessage = {
            role: 'assistant',
            content: "Sorry, I encountered an error while deleting the notes. Please try again.",
            timestamp: new Date(),
            isError: true
          };
          setMessages(prev => [...prev, errorMessage]);
          toast.error('Failed to delete notes');
        } finally {
          setIsLoading(false);
        }
        return;
      }
    }

    setIsLoading(true);

    try {
      // Send to backend AI endpoint
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

      const { message: aiMessage, action, actionResult, parameters, conversationContext } = response.data;

      // Handle REQUEST_CONFIRMATION action
      if (action === 'REQUEST_CONFIRMATION') {
        setPendingConfirmation({
          operation: parameters.operation,
          noteIds: parameters.noteIds,
          details: parameters.details
        });
        
        const confirmMessage = {
          role: 'assistant',
          content: aiMessage,
          action: action,
          timestamp: new Date(),
          needsConfirmation: true
        };
        setMessages(prev => [...prev, confirmMessage]);
      } else {
        // Add AI response to UI
        const newAiMessage = {
          role: 'assistant',
          content: aiMessage,
          action: action,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, newAiMessage]);

        // If an action was performed, refresh the notes
        if (action && action !== 'ANSWER_QUESTION' && action !== 'SEARCH_NOTES' && action !== 'SUMMARIZE_NOTES') {
          await fetchNotes();
          await fetchTags();
          
          // Show success toast based on action
          switch (action) {
            case 'CREATE_NOTE':
              toast.success('Note created!');
              break;
            case 'UPDATE_NOTE':
              if (actionResult) toast.success('Note updated!');
              break;
            case 'PIN_NOTE':
              if (actionResult) toast.success('Note pinned/unpinned!');
              break;
            case 'DELETE_NOTE':
              if (actionResult) toast.success('Note deleted!');
              break;
          }
        }
      }

      // Update conversation history for context
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: userMessage },
        conversationContext
      ]);

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
    <div className="fixed bottom-8 right-8 z-50 w-full max-w-2xl h-[600px] bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-600 rounded-lg">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">AI Note Assistant</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {pendingConfirmation ? '⚠️ Waiting for confirmation...' : 'Powered by Gemini AI'}
            </p>
          </div>
        </div>
        <button 
          onClick={onClose} 
          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              msg.role === 'user' 
                ? 'bg-orange-600' 
                : msg.isError
                ? 'bg-red-500'
                : msg.needsConfirmation
                ? 'bg-yellow-500'
                : 'bg-slate-200 dark:bg-slate-700'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4 text-white" />
              ) : msg.needsConfirmation ? (
                <AlertTriangle className="w-4 h-4 text-white" />
              ) : (
                <Bot className={`w-4 h-4 ${msg.isError ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
              )}
            </div>

            {/* Message Bubble */}
            <div className={`flex flex-col max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`px-4 py-2.5 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-orange-600 text-white rounded-tr-sm'
                    : msg.isError
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-tl-sm'
                    : msg.needsConfirmation
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 border-2 border-yellow-400 dark:border-yellow-600 rounded-tl-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                {msg.action && msg.action !== 'ANSWER_QUESTION' && msg.action !== 'REQUEST_CONFIRMATION' && (
                  <div className="mt-2 pt-2 border-t border-slate-300 dark:border-slate-600">
                    <span className="text-xs opacity-75">
                      Action: {msg.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 px-1">
                {formatTime(msg.timestamp)}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 px-4 py-2.5 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        {pendingConfirmation && (
          <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-600 rounded-lg">
            <p className="text-xs text-yellow-900 dark:text-yellow-200 font-medium">
              ⚠️ Confirmation required. Type "yes" to proceed or "no" to cancel.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              pendingConfirmation 
                ? "Type 'yes' to confirm or 'no' to cancel..." 
                : "Ask me anything about your notes..."
            }
            disabled={isLoading}
            rows={1}
            className="w-full pl-4 pr-12 py-3 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-orange-600 focus:ring-2 focus:ring-orange-600/20 caret-orange-600 disabled:opacity-50 resize-none"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <CornerDownLeft className="w-5 h-5" />
            )}
          </button>
        </form>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          {pendingConfirmation 
            ? "Confirm or cancel the pending operation"
            : "Press Enter to send, Shift+Enter for new line"}
        </p>
      </div>
    </div>
  );
};

export default AiChatbot;