"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, ExternalLink, Folder, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  provider?: string;
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hey! I'm your Content Vault assistant. Ask me anything about your saved content, and I'll help you find it!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Not authenticated");

      // Get user's API keys from localStorage
      const userApiKeys = localStorage.getItem("user_api_keys");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
            ...(userApiKeys && { "X-User-API-Keys": userApiKeys })
          },
          body: JSON.stringify({
            messages: newMessages.map(m => ({ role: m.role, content: m.content })),
            temperature: 0.7,
            max_tokens: 1000,
            use_rag: true,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: data.content,
          sources: data.sources || [],
          provider: data.provider,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] bg-card rounded-3xl border border-border overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            } animate-fadeIn`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <ReactMarkdown
                className="prose prose-sm dark:prose-invert max-w-none"
                components={{
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                  code: ({ children }) => (
                    <code className="bg-background/50 px-1 py-0.5 rounded text-sm">
                      {children}
                    </code>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>

              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border/50 pt-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Sources ({message.sources.length})
                  </p>
                  {message.sources.slice(0, 3).map((source, sIdx) => (
                    <Card
                      key={sIdx}
                      className="p-3 bg-background/50 hover:bg-background/80 transition-colors cursor-pointer"
                      onClick={() => window.open(source.url, "_blank")}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                            <p className="text-sm font-medium truncate">
                              {source.title}
                            </p>
                          </div>
                          
                          {/* Folders */}
                          {source.folders && source.folders.length > 0 && (
                            <div className="flex items-center gap-1 mb-1">
                              <Folder className="h-3 w-3 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground truncate">
                                {source.folders.join(" > ")}
                              </p>
                            </div>
                          )}
                          
                          {/* Tags */}
                          {source.tags && source.tags.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              {source.tags.slice(0, 3).map((tag: string, tIdx: number) => (
                                <Badge
                                  key={tIdx}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {Math.round(source.similarity * 100)}%
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Provider Badge */}
              {message.provider && (
                <div className="mt-2">
                  <Badge variant="outline" className="text-xs">
                    {message.provider}
                  </Badge>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-accent" />
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4 bg-background/50 backdrop-blur-sm">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your saved content..."
            disabled={loading}
            className="h-12 rounded-2xl"
          />
          <Button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            size="icon"
            className="h-12 w-12 rounded-2xl flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}