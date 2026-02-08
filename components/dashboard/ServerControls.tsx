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
        <div className="flex gap-4">
            <Button
                onClick={() => handleControl("start")}
                disabled={active || isPending}
                className="bg-green-600 hover:bg-green-700"
            >
                <Play className="mr-2 h-4 w-4" /> Start
            </Button>
            <Button
                onClick={() => handleControl("stop")}
                disabled={!active || isPending}
                variant="destructive"
            >
                <Square className="mr-2 h-4 w-4" /> Stop
            </Button>
            <Button
                onClick={() => handleControl("restart")}
                disabled={!active || isPending}
                variant="secondary"
            >
                <RotateCcw className="mr-2 h-4 w-4" /> Restart
            </Button>
        </div>
    );
}
