
"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
    role: "user" | "ai";
    text: string;
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function sendMessage() {
        if (!input.trim()) return;

        const currentInput = input;
        setInput("");

        const newMessages: Message[] = [...messages, { role: "user", text: currentInput }];
        setMessages(newMessages);
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: currentInput }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            let aiMessage = "";

            setMessages((prev) => [...prev, { role: "ai", text: "" }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                aiMessage += chunk;

                setMessages((prev) => {
                    const updated = [...prev];
                    if (updated.length > 0) {
                        updated[updated.length - 1] = { role: "ai", text: aiMessage };
                    }
                    return updated;
                });
            }
        } catch (error: any) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                { role: "ai", text: `Error: ${error.message || "Something went wrong. Please try again."}` }
            ]);
        } finally {
            setLoading(false);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-80px)] w-full max-w-4xl mx-auto">
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                        <p className="text-2xl font-semibold mb-2">OllamaGPT</p>
                        <p>Ask anything...</p>
                    </div>
                )}
                {messages.map((m, i) => (
                    <div
                        key={i}
                        className={`p-4 rounded-lg flex gap-4 ${m.role === "user" ? "bg-gray-700/50" :
                                m.text.startsWith("Error:") ? "bg-red-900/20 border border-red-500/50" : "bg-transparent"
                            }`}
                    >
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-blue-600" :
                                    m.text.startsWith("Error:") ? "bg-red-600" : "bg-green-600"
                                }`}
                        >
                            {m.role === "user" ? "U" : "AI"}
                        </div>
                        <div className={`leading-relaxed whitespace-pre-wrap pt-1 ${m.text.startsWith("Error:") ? "text-red-200" : "text-gray-100"
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {loading && messages[messages.length - 1]?.role === "user" && (
                    <div className="p-4 rounded-lg flex gap-4 bg-transparent">
                        <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
                            AI
                        </div>
                        <div className="flex items-center">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce mr-1 delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-gray-800 border-t border-gray-700">
                <div className="relative max-w-4xl mx-auto">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        className="w-full bg-gray-700 text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none overflow-hidden"
                        style={{ minHeight: "44px", maxHeight: "200px" }}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="absolute right-2 bottom-2 p-1.5 text-gray-400 hover:text-white disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5"
                        >
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
                <div className="text-xs text-center text-gray-500 mt-2">
                    OllamaGPT can make mistakes. Consider checking important information.
                </div>
            </div>
        </div>
    );
}
