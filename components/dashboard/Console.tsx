"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, Trash2, ChevronRight, Terminal as TerminalIcon, RotateCw, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogLine {
    id: string;
    content: string;
    type: "log" | "command" | "response" | "error";
    timestamp: Date;
}

export default function ConsoleInterface({
    readOnly = false,
    mode = "console"
}: {
    readOnly?: boolean,
    mode?: "console" | "logs"
}) {
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
        ].slice(-200));
    };

    const fetchLogs = async () => {
        if (mode !== "logs") return;
        try {
            const res = await fetch("/api/minecraft/logs");
            const data = await res.json();
            if (data.logs && Array.isArray(data.logs)) {
                setServerLogLines(data.logs);
            }
        } catch (e) {
            console.error("Error al cargar logs");
        }
    };

    useEffect(() => {
        if (mode === "logs") {
            fetchLogs();
            const interval = setInterval(fetchLogs, 3000);
            return () => clearInterval(interval);
        }
    }, [mode]);

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
            addLog("Error al conectar con el servidor RCON", "error");
        }
    };

    const clearConsole = () => {
        setLogs([]);
        if (mode === "logs") setServerLogLines([]);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] md:h-[calc(100vh-12rem)] gap-3 md:gap-4">
            <Card className="flex-1 bg-black/40 backdrop-blur-xl border-gray-800 p-0 overflow-hidden flex flex-col shadow-2xl rounded-xl">
                <div className="flex justify-between items-center px-3 md:px-4 py-2 bg-gray-900/50 border-b border-gray-800 shrink-0">
                    <div className="flex items-center gap-2">
                        <TerminalIcon className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary" />
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-500">
                            {mode === "console" ? "Terminal de Comandos" : "Visor de Registros (latest.log)"}
                        </span>
                    </div>
                    <div className="flex gap-1 md:gap-2">
                        {mode === "logs" && (
                            <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-500 hover:text-white" onClick={fetchLogs}>
                                <RotateCw className="h-3.5 w-3.5" />
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 text-gray-500 hover:text-red-400" onClick={clearConsole}>
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-3 md:p-4 font-mono text-[10px] md:text-sm" ref={logContainerRef}>
                    {mode === "logs" && serverLogLines.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                            <FileText className="h-12 w-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">No hay registros disponibles</p>
                        </div>
                    )}

                    {mode === "console" && logs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                            <TerminalIcon className="h-12 w-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Esperando instrucciones...</p>
                        </div>
                    )}

                    <div className="space-y-0.5 md:space-y-1">
                        {mode === "logs" && serverLogLines.map((line, i) => (
                            <div key={`server-${i}`} className="text-gray-500 whitespace-pre-wrap leading-tight break-all md:break-normal">
                                {line}
                            </div>
                        ))}

                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "flex gap-2 py-0.5 transition-colors",
                                    log.type === "command" && "text-primary bg-primary/5 -mx-4 px-4 border-l-2 border-primary",
                                    log.type === "response" && "text-emerald-400 font-bold",
                                    log.type === "error" && "text-red-400",
                                    log.type === "log" && "text-gray-400"
                                )}
                            >
                                <span className="text-gray-600 shrink-0 select-none opacity-50">[{log.timestamp.toLocaleTimeString([], { hour12: false })}]</span>
                                {log.type === "command" && <ChevronRight className="h-3.5 w-3.5 md:h-4 md:w-4 mt-0.5 shrink-0" />}
                                <span className="whitespace-pre-wrap break-all md:break-normal">{log.content}</span>
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </Card>

            {mode === "console" && !readOnly && (
                <div className="relative group shrink-0">
                    <form onSubmit={handleSend} className="relative flex items-center">
                        <div className="absolute left-3 md:left-4 text-primary pointer-events-none">
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enviar comando al servidor..."
                            className="bg-black/40 backdrop-blur-xl border-gray-800 pl-9 md:pl-10 pr-12 h-11 md:h-12 font-mono text-xs md:text-sm focus:ring-primary/50 focus:border-primary transition-all rounded-xl"
                        />
                        <div className="absolute right-1.5 md:right-2">
                            <Button type="submit" size="sm" className="h-8 md:h-9 px-3 rounded-lg bg-primary hover:bg-primary/90 text-black font-black">
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


