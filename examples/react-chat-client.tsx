import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
    roomId: string;
    content: string;
    user: string;
    timestamp: string;
    socketId: string;
}

const SOCKET_URL = 'http://localhost:3000';
const ROOM_ID = 'general';

export default function ChatApp() {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [username] = useState(`User${Math.floor(Math.random() * 1000)}`);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Initialize Socket.IO connection
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        // Connection event handlers
        newSocket.on('connect', () => {
            console.log('Connected to server:', newSocket.id);
            setIsConnected(true);
            newSocket.emit('join:room', ROOM_ID);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from server');
            setIsConnected(false);
        });

        // Message event handler
        newSocket.on('chat:message', (message: Message) => {
            console.log('Received message:', message);
            setMessages((prev) => [...prev, message]);
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    useEffect(() => {
        // Auto-scroll to bottom when new messages arrive
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = () => {
        if (!socket || !inputValue.trim()) return;

        const message: Message = {
            roomId: ROOM_ID,
            content: inputValue.trim(),
            user: username,
            timestamp: new Date().toISOString(),
            socketId: socket.id || '',
        };

        socket.emit('chat:message', message);
        setInputValue('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-purple-600 to-blue-500">
            {/* Header */}
            <div className="bg-white shadow-lg p-4">
                <h1 className="text-2xl font-bold text-gray-800">💬 Socket.IO Chat</h1>
                <div className="flex items-center gap-2 mt-2">
                    <div
                        className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
                            }`}
                    />
                    <span className="text-sm text-gray-600">
                        {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                    <span className="text-sm text-gray-500 ml-auto">
                        Logged in as {username}
                    </span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => {
                    const isOwn = message.socketId === socket?.id;
                    const time = new Date(message.timestamp).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                    });

                    return (
                        <div
                            key={index}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className={`text-sm font-semibold ${isOwn ? 'text-purple-200' : 'text-white'
                                            }`}
                                    >
                                        {message.user}
                                    </span>
                                    <span className="text-xs text-gray-300">{time}</span>
                                </div>
                                <div
                                    className={`rounded-lg p-3 shadow-md ${isOwn
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white text-gray-800'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Container */}
            <div className="bg-white p-4 shadow-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={!isConnected}
                        className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-full focus:outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!isConnected || !inputValue.trim()}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white font-semibold rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}
