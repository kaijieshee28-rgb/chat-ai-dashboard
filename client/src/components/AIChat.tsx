import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, X, Bot, User, Minimize2, Maximize2, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatHistory, useSendMessage } from "@/hooks/use-chat";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const { data: messages, isLoading } = useChatHistory();
  const sendMessage = useSendMessage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || sendMessage.isPending) return;
    sendMessage.mutate(inputValue);
    setInputValue("");
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-primary to-accent rounded-full shadow-2xl shadow-primary/30 flex items-center justify-center text-white z-50 hover:shadow-primary/50 transition-shadow"
          >
            <MessageCircle className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? "auto" : "600px"
            }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className={cn(
              "fixed right-6 bottom-6 w-[90vw] md:w-[400px] bg-card border border-border rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden",
              isMinimized ? "h-auto" : "h-[600px] max-h-[80vh]"
            )}
          >
            {/* Header */}
            <div className="p-4 bg-muted/50 border-b border-border flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="h-8 w-8 rounded-full">
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-background/50">
                  <div className="space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : messages?.length === 0 ? (
                      <div className="text-center py-20 text-muted-foreground px-6">
                        <Bot className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Hi! I'm your dashboard assistant. Ask me anything or tell me to perform actions!</p>
                      </div>
                    ) : (
                      messages?.map((msg, i) => (
                        <div
                          key={msg.id || i}
                          className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                          )}
                        >
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                            msg.role === "user" ? "bg-muted" : "bg-primary/10 text-primary"
                          )}>
                            {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </div>
                          <div className={cn(
                            "p-3 rounded-2xl text-sm shadow-sm",
                            msg.role === "user" 
                              ? "bg-primary text-primary-foreground rounded-tr-none" 
                              : "bg-card border border-border/50 rounded-tl-none"
                          )}>
                            {msg.content}
                          </div>
                        </div>
                      ))
                    )}
                    {sendMessage.isPending && (
                      <div className="flex gap-3 max-w-[85%] mr-auto">
                         <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-primary/10 text-primary">
                            <Bot className="w-4 h-4" />
                         </div>
                         <div className="bg-card border border-border/50 p-4 rounded-2xl rounded-tl-none">
                            <div className="flex gap-1">
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                              <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                            </div>
                         </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-4 bg-card border-t border-border">
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2 relative"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type a message..."
                      className="rounded-full pl-4 pr-12 py-6 bg-muted/30 border-border/50 focus:bg-background transition-colors"
                      disabled={sendMessage.isPending}
                    />
                    <Button 
                      size="icon" 
                      type="submit" 
                      disabled={!inputValue.trim() || sendMessage.isPending}
                      className="absolute right-1 top-1 h-10 w-10 rounded-full"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
