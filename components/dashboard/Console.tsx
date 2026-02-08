"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, RotateCw, Trash2, ChevronRight, Terminal as TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogLine {
    id: string;
    content: string;
    type: "log" | "command" | "response" | "error";
    timestamp: Date;
}

export default function ConsoleInterface({ readOnly = false }: { readOnly?: boolean }) {
    const [input, setInput] = useState("");
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [serverLogLines, setServerLogLines] = useState<string[]>([]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const logContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, []);

    const addLog = (content: string, type: LogLine["type"]) => {
        setLogs((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substring(7),
                content,
                type,
                timestamp: new Date(),
            },
        ].slice(-200)); // Keep last 200 items
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/minecraft/logs");
            const data = await res.json();
            if (data.logs && Array.isArray(data.logs)) {
                // If logs changed, update server log lines
                setServerLogLines(data.logs);
            }
        } catch (e) {
            console.error("Failed to fetch logs");
        }
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [logs, serverLogLines, scrollToBottom]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const command = input;
        setInput("");
        addLog(command, "command");

        try {
            const res = await fetch("/api/minecraft/rcon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });

            const data = await res.json();

            if (data.error) {
                addLog(`Error: ${data.error}`, "error");
            } else if (data.response) {
                addLog(data.response, "response");
            }
        } catch (error) {
            addLog("Failed to reach RCON server", "error");
        }
    };

    const clearConsole = () => {
        setLogs([]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-12rem)] gap-4">
            <Card className="flex-1 bg-black/40 backdrop-blur-xl border-gray-800 p-0 overflow-hidden flex flex-col shadow-2xl rounded-xl">
                <div className="flex justify-between items-center px-4 py-2 bg-gray-900/50 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="h-4 w-4 text-primary" />
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">System Terminal</span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-white" onClick={fetchLogs}>
                            <RotateCw className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-500 hover:text-red-400" onClick={clearConsole}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-4 font-mono text-sm" ref={logContainerRef}>
                    <div className="space-y-0.5">
                        {/* Server History Logs */}
                        {serverLogLines.map((line, i) => (
                            <div key={`server-${i}`} className="text-gray-500 whitespace-pre-wrap leading-tight">
                                {line}
                            </div>
                        ))}

                        {/* Status Separator if we have session logs */}
                        {logs.length > 0 && (
                            <div className="py-4 border-b border-dashed border-gray-800 flex justify-center">
                                <span className="text-[10px] text-gray-600 bg-black px-2 uppercase tracking-widest">Active Session History</span>
                            </div>
                        )}

                        {/* Current Session Commands & Responses */}
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "flex gap-2 py-0.5",
                                    log.type === "command" && "text-primary bg-primary/5 -mx-4 px-4 border-l-2 border-primary",
                                    log.type === "response" && "text-emerald-400",
                                    log.type === "error" && "text-red-400",
                                    log.type === "log" && "text-gray-400"
                                )}
                            >
                                <span className="text-gray-600 shrink-0 select-none">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                                {log.type === "command" && <ChevronRight className="h-4 w-4 mt-0.5 shrink-0" />}
                                <span className="whitespace-pre-wrap">{log.content}</span>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </Card>

            {!readOnly && (
                <div className="relative group">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <div className="absolute left-4 text-primary pointer-events-none">
                            <ChevronRight className="h-5 w-5" />
                        </div>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a server command..."
                            className="bg-black/40 backdrop-blur-xl border-gray-800 pl-10 pr-12 h-12 font-mono focus:ring-primary focus:border-primary transition-all rounded-xl"
                        />
                        <div className="absolute right-2 px-1">
                            <Button type="submit" size="sm" className="h-8 rounded-lg">
                                <Send className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </form>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500 -z-10" />
                </div>
            )}
        </div>
    );
}
