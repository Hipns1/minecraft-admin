"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, UserX, ShieldCheck, ShieldAlert, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

interface PlayerListProps {
    players: string[];
    max: number;
    online: number;
}

export function PlayerList({ players, max, online }: PlayerListProps) {
    const { toast } = useToast();
    const router = useRouter();

    const handleAction = async (action: string, player: string) => {
        if (!confirm(`Are you sure you want to ${action} ${player}?`)) return;

        try {
            const command = `/${action} ${player}`;
            const res = await fetch("/api/minecraft/rcon", {
                method: "POST",
                body: JSON.stringify({ command }),
            });

            if (res.ok) {
                toast({ title: "Success", description: `Executed ${action} on ${player}` });
                router.refresh();
            } else {
                toast({ title: "Error", description: "Failed to execute command", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        }
    };

    const handleWhitelist = async (sub: string) => {
        try {
            const command = `/whitelist ${sub}`;
            const res = await fetch("/api/minecraft/rcon", {
                method: "POST",
                body: JSON.stringify({ command }),
            });

            if (res.ok) {
                toast({ title: "Whitelist", description: `Executed whitelist ${sub}` });
            } else {
                toast({ title: "Error", description: "Failed to update whitelist", variant: "destructive" });
            }
        } catch (e) {
            toast({ title: "Error", description: "Network error", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-gray-950 border border-gray-800 p-4 rounded-xl gap-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Estadísticas de Conexión</span>
                    <span className="text-sm text-gray-300">Sincronización Activa: <strong className="text-white text-lg">{online}</strong> / {max}</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="sm" onClick={() => handleWhitelist("on")} className="flex-1 sm:flex-none h-9 text-xs border-gray-800">
                        <ShieldCheck className="h-4 w-4 mr-2 text-green-500" /> WL Activar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleWhitelist("off")} className="flex-1 sm:flex-none h-9 text-xs border-gray-800">
                        <ShieldAlert className="h-4 w-4 mr-2 text-red-500" /> WL Desactivar
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleWhitelist("reload")} className="flex-1 sm:flex-none h-9 text-xs text-gray-500">
                        Recargar
                    </Button>
                </div>
            </div>

            <div className="bg-black/20 border border-gray-800 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="hidden sm:table-header-group">
                        <TableRow className="border-gray-800 hover:bg-transparent">
                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre de Usuario</TableHead>
                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-gray-500">Acciones Administrativas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {players.length === 0 ? (
                            <TableRow className="hover:bg-transparent border-none">
                                <TableCell colSpan={2} className="text-center py-16">
                                    <div className="flex flex-col items-center gap-2 opacity-30">
                                        <Users className="h-10 w-10 text-gray-600" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No hay entidades detectadas</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            players.map((player) => (
                                <TableRow key={player} className="border-gray-800 group hover:bg-white/[0.02] flex flex-col sm:table-row p-4 sm:p-0">
                                    <TableCell className="font-bold text-white py-2 sm:py-4 px-0 sm:px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                                {player[0]}
                                            </div>
                                            {player}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right py-2 sm:py-4 px-0 sm:px-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction("kick", player)}
                                                className="h-8 text-[10px] border-gray-800 hover:bg-amber-500/10 hover:text-amber-500 hover:border-amber-500/20"
                                            >
                                                <UserX className="h-3 w-3 mr-1.5" /> EXPULSAR
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction("ban", player)}
                                                className="h-8 text-[10px] border-gray-800 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20"
                                            >
                                                <Ban className="h-3 w-3 mr-1.5" /> BLOQUEAR
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction("op", player)}
                                                className="h-8 text-[10px] border-gray-800 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20"
                                            >
                                                <ShieldAlert className="h-3 w-3 mr-1.5" /> OP
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
