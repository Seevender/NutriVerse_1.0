'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, MessageSquare, Send, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { askChatbotAction } from '@/app/actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useToast } from '@/hooks/use-toast';

type Message = {
  role: 'user' | 'bot';
  text: string;
};

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    startTransition(async () => {
      const result = await askChatbotAction(input);
      if (result.error) {
        toast({
          variant: 'destructive',
          title: 'Chatbot Error',
          description: result.error,
        });
        const botErrorMessage: Message = { role: 'bot', text: "Sorry, I'm having trouble connecting. Please try again later." };
        setMessages(prev => [...prev, botErrorMessage]);
      } else {
        const botMessage: Message = { role: 'bot', text: result.data || "I'm not sure how to respond to that." };
        setMessages(prev => [...prev, botMessage]);
      }
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
        <span className="sr-only">Toggle Chatbot</span>
      </Button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50">
            <Card className="w-full max-w-sm h-[60vh] flex flex-col shadow-2xl">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Bot className="text-primary" />
                <span>NutriBot Assistant</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col p-0">
                <ScrollArea className="flex-grow p-6" ref={scrollAreaRef}>
                    <div className="space-y-4">
                    {messages.map((msg, index) => (
                        <div
                        key={index}
                        className={cn(
                            'flex items-start gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                        >
                        {msg.role === 'bot' && (
                            <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                <Bot />
                            </AvatarFallback>
                            </Avatar>
                        )}
                        <div
                            className={cn(
                            'rounded-lg px-4 py-2 text-sm max-w-[80%]',
                            msg.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                        >
                            {msg.text}
                        </div>
                        {msg.role === 'user' && (
                            <Avatar className="h-8 w-8">
                            <AvatarFallback>
                                <User />
                            </AvatarFallback>
                            </Avatar>
                        )}
                        </div>
                    ))}
                    {isPending && (
                        <div className="flex items-start gap-3 justify-start">
                             <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <Bot />
                                </AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg px-4 py-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-0"></span>
                                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-150"></span>
                                    <span className="h-2 w-2 bg-foreground rounded-full animate-pulse delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t flex-shrink-0">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <Input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask about nutrition..."
                        className="flex-grow"
                        disabled={isPending}
                    />
                    <Button type="submit" size="icon" disabled={isPending || !input.trim()}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                    </form>
                </div>
            </CardContent>
          </Card>>
        </div>
      )}
    </>
  );
}
