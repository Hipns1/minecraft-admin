"use client";

import { Button } from "@/components/ui/button";
import { Play, Square, RotateCw, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

                if (!res.ok) throw new Error("Error al ejecutar comando");

                toast({
                    title: "Comando Enviado",
                    description: `El comando ${action} se ha enviado correctamente.`,
                });

                router.refresh();
            } catch (error) {
                toast({
                    title: "Error",
                    description: "No se pudo controlar el servidor.",
                    variant: "destructive",
                });
            }
        });
    };

    return (
        <div className="flex flex-wrap gap-4">
            <Button
                size="lg"
                onClick={() => handleControl("start")}
                disabled={active || isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/20 flex-1 min-w-[140px]"
            >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Play className="mr-2 h-5 w-5" />}
                INICIAR
            </Button>
            <Button
                size="lg"
                variant="outline"
                onClick={() => handleControl("restart")}
                disabled={!active || isPending}
                className="border-gray-800 hover:bg-gray-800 text-gray-300 font-bold px-8 py-6 rounded-xl flex-1 min-w-[140px]"
            >
                <RotateCw className={cn("mr-2 h-5 w-5", isPending && "animate-spin")} />
                REINICIAR
            </Button>
            <Button
                size="lg"
                variant="destructive"
                onClick={() => handleControl("stop")}
                disabled={!active || isPending}
                className="bg-rose-600 hover:bg-rose-500 text-white font-black px-8 py-6 rounded-xl shadow-lg shadow-rose-500/20 flex-1 min-w-[140px]"
            >
                {isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Square className="mr-2 h-5 w-5" />}
                DETENER
            </Button>

            {isPending && (
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary animate-pulse ml-auto">
                    Ejecutando Comando...
                </div>
            )}
        </div>
    );
}
