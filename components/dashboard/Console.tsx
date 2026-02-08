"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Send, RotateCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface LogLine {
    id: string;
    content: string;
    type: "log" | "command" | "response" | "error";
    timestamp: string;
}

interface ConsoleInterfaceProps {
    readOnly?: boolean;
}

export default function ConsoleInterface({ readOnly = false }: ConsoleInterfaceProps) {
    const [input, setInput] = useState("");
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [autoScroll, setAutoScroll] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    const addLog = (content: string, type: LogLine["type"]) => {
        setLogs((prev) => [
            ...prev,
            {
                id: Math.random().toString(36).substring(7),
                content,
                type,
                timestamp: new Date().toLocaleTimeString(),
            },
        ]);
    };

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/minecraft/logs");
            const data = await res.json();
            if (data.logs) {
                setLogs(prev => {
                    // This is a naive implementation that replaces/merges. 
                    // For a real app, we'd want to dedup or only append new lines.
                    // For simplicity, we'll just show the last N lines from server as 'log' type
                    // But we want to keep our command history.
                    // So let's just stick to "server logs" in a separate view or just append simple check.
                    // Ideally, we just tail the file.

                    // Let's just map them to our format
                    const newLogs: LogLine[] = data.logs.map((l: string) => ({
                        id: Math.random().toString(36), // keys are unstable here but ok for now
                        content: l,
                        type: "log",
                        timestamp: new Date().toLocaleTimeString()
                    }));
                    return newLogs;
                })
            }
        } catch (e) {
            console.error("Failed to fetch logs");
        }
    }

    // Poll for logs every 5 seconds
    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const command = input;
        setInput("");
        addLog(`> ${command}`, "command");

        try {
            const res = await fetch("/api/minecraft/rcon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });

            const data = await res.json();

            if (data.error) {
                addLog(`Error: ${data.error}`, "error");
            } else {
                addLog(data.response, "response");
            }
        } catch (error) {
            addLog("Failed to send command", "error");
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-10rem)] gap-4">
            <Card className="flex-1 bg-gray-950 border-gray-800 p-4 overflow-hidden flex flex-col">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-sm font-semibold text-gray-400">Server Console / Logs</h2>
                    <Button variant="ghost" size="sm" onClick={fetchLogs}><RotateCw className="h-4 w-4" /></Button>
                </div>
                <ScrollArea className="flex-1 font-mono text-sm">
                    <div className="space-y-1 p-2">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className={cn(
                                    "break-all",
                                    log.type === "command" && "text-yellow-400 font-bold",
                                    log.type === "response" && "text-blue-400",
                                    log.type === "error" && "text-red-500",
                                    log.type === "log" && "text-gray-300"
                                )}
                            >
                                <span className="text-gray-600 mr-2">[{log.timestamp}]</span>
                                {log.content}
                            </div>
                        ))}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>
            </Card>

            {!readOnly && (
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Send command (e.g. /say Hello)"
                        className="bg-gray-900 border-gray-700 font-mono"
                    />
                    <Button type="submit">
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            )}
        </div>
    );
}
