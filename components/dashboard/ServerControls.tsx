"use client";

import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export function ServerControls({ active }: { active: boolean }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleControl = async (action: "start" | "stop" | "restart") => {
        startTransition(async () => {
            try {
                const res = await fetch("/api/minecraft/control", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action }),
                });

                if (!res.ok) throw new Error("Failed to execute command");

                toast({
                    title: "Command Sent",
                    description: `Server ${action} command executed successfully.`,
                });

                // Refresh the page to update status
                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to control server.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-4">
            <Button
                onClick={() => handleControl("start")}
                disabled={active || isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white border-b-4 border-emerald-800 active:border-b-0 active:translate-y-[2px] transition-all h-12 px-6 font-bold"
            >
                <Play className="mr-2 h-5 w-5 fill-current" /> Initialize Server
            </Button>
            <Button
                onClick={() => handleControl("stop")}
                disabled={!active || isPending}
                variant="destructive"
                className="bg-rose-600 hover:bg-rose-500 text-white border-b-4 border-rose-800 active:border-b-0 active:translate-y-[2px] transition-all h-12 px-6 font-bold"
            >
                <Square className="mr-2 h-5 w-5 fill-current" /> Terminate Process
            </Button>
            <Button
                onClick={() => handleControl("restart")}
                disabled={!active || isPending}
                className="bg-gray-800 hover:bg-gray-700 text-white border-b-4 border-gray-950 active:border-b-0 active:translate-y-[2px] transition-all h-12 px-6 font-bold"
            >
                <RotateCcw className="mr-2 h-5 w-5" /> Reboot System
            </Button>

            {isPending && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary animate-pulse ml-auto">
                    Executing Command...
                </div>
            )}
        </div>
    );
}
