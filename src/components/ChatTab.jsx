import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

export default function ChatTab({ token, isProvider }) {
  const sender = token?.split('|')[0];
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.conversationId);
    }
  }, [selectedConversation, token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/messages/get/conversationLists`,
        {
          headers: { 'X-LOGIN-TOKEN': token }
        }
      );
      setConversations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/messages/get/conversationMessage?conversationId=${conversationId}`,
        {
          headers: { 'X-LOGIN-TOKEN': token },
        }
      );
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const conversationId = selectedConversation.conversationId;

      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/messages/send`,
        { 
            conversationId,
            content: newMessage 
        },
        {
          headers: {
            'X-LOGIN-TOKEN': token,
            'Content-Type': 'application/json'
          }
        }
      );

      setNewMessage('');
      fetchMessages(selectedConversation.conversationId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">💬 Chat</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading conversations...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="border rounded-xl shadow bg-white p-4">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Chats</h3>
            <div className="flex flex-col gap-2">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.conversationId}
                    onClick={() => setSelectedConversation(conv)}
                    className={`text-left px-4 py-3 rounded-lg transition shadow-sm ${
                      selectedConversation?.conversationId === conv.conversationId
                        ? 'bg-blue-100 text-blue-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-300 text-white rounded-full flex items-center justify-center font-semibold">
                        {conv.toName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{conv.toName}</p>
                        
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-gray-500 text-center py-10">No conversations yet</p>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="md:col-span-2 border rounded-xl shadow bg-white flex flex-col h-[600px]">
            {selectedConversation ? (
              <>
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.offsetDateTime} className={`flex ${msg.sender === sender ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`px-4 py-3 max-w-[70%] rounded-2xl shadow ${
                          msg.sender === sender
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-[10px] mt-1 text-right opacity-60">
                          {new Date(msg.offsetDateTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="border-t px-4 py-3 bg-gray-50 flex gap-2 items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button
                    onClick={sendMessage}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
