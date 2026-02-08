"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, UserMinus, UserCheck, Ban, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function SecurityManager() {
    const [whitelist, setWhitelist] = useState<string[]>([]);
    const [bans, setBans] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newUsername, setNewUsername] = useState("");
    const { toast } = useToast();

    const fetchSecurityData = async () => {
        setIsLoading(true);
        try {
            // Fetch Whitelist
            const wlRes = await fetch("/api/minecraft/rcon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: "whitelist list" }),
            });
            const wlData = await wlRes.json();
            if (wlData.response) {
                // Parsing "There are 2 whitelisted players: player1, player2"
                const players = wlData.response.split(":")[1]?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
                setWhitelist(players);
            }

            // Fetch Bans
            const banRes = await fetch("/api/minecraft/rcon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command: "banlist players" }),
            });
            const banData = await banRes.json();
            if (banData.response) {
                const players = banData.response.split(":")[1]?.split(",").map((s: string) => s.trim()).filter(Boolean) || [];
                setBans(players);
            }
        } catch (error) {
            console.error("Failed to fetch security data", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const runAction = async (command: string, successMsg: string) => {
        try {
            const res = await fetch("/api/minecraft/rcon", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ command }),
            });
            const data = await res.json();
            if (data.response) {
                toast({ title: "Success", description: successMsg });
                fetchSecurityData();
                setNewUsername("");
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to execute command", variant: "destructive" });
        }
    };

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-6xl mx-auto">
            <Card className="bg-black/40 backdrop-blur-xl border-gray-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="bg-gray-900/40 border-b border-gray-800 p-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <UserCheck className="h-5 w-5" />
                        </div>
                        Lista de Acceso (WL)
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Usuarios autorizados para ingresar</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Nombre de usuario"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="bg-gray-950/50 border-gray-800 h-10 text-sm focus:ring-primary/50"
                        />
                        <Button
                            onClick={() => runAction(`whitelist add ${newUsername}`, `Se ha añadido a ${newUsername} a la lista`)}
                            className="bg-primary text-black font-black text-xs px-6 hover:bg-primary/90"
                        >
                            AÑADIR
                        </Button>
                    </div>
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                            </div>
                        ) : whitelist.length > 0 ? (
                            whitelist.map(player => (
                                <div key={player} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 group hover:border-emerald-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <span className="text-sm font-bold text-gray-200">{player}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg"
                                        onClick={() => runAction(`whitelist remove ${player}`, `Se ha eliminado a ${player} de la lista`)}
                                    >
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800/50 rounded-2xl opacity-40">
                                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sin usuarios registrados</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-black/40 backdrop-blur-xl border-gray-800 shadow-2xl rounded-2xl overflow-hidden flex flex-col">
                <CardHeader className="bg-gray-900/40 border-b border-gray-800 p-6">
                    <CardTitle className="flex items-center gap-3 text-lg font-black tracking-tight">
                        <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                            <Ban className="h-5 w-5" />
                        </div>
                        Usuarios Bloqueados
                    </CardTitle>
                    <CardDescription className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Identidades con acceso restringido</CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6 flex-1">
                    <div className="space-y-2 max-h-[464px] overflow-y-auto pr-2 no-scrollbar">
                        {isLoading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
                            </div>
                        ) : bans.length > 0 ? (
                            bans.map(player => (
                                <div key={player} className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/50 group hover:border-red-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                                        <span className="text-sm font-bold text-gray-200">{player}</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 text-[10px] font-black tracking-tighter text-emerald-400 hover:bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                                        onClick={() => runAction(`pardon ${player}`, `Se ha desbloqueado a ${player}`)}
                                    >
                                        PERDONAR
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800/50 rounded-2xl opacity-40">
                                <Shield className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sin objetivos restringidos</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
