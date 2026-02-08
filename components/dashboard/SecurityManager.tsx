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
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-green-500" />
                        Whitelist
                    </CardTitle>
                    <CardDescription>Only these players can join the server.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="bg-gray-900 border-gray-800"
                        />
                        <Button onClick={() => runAction(`whitelist add ${newUsername}`, `Added ${newUsername} to whitelist`)}>Add</Button>
                    </div>
                    <div className="space-y-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : whitelist.length > 0 ? (
                            whitelist.map(player => (
                                <div key={player} className="flex items-center justify-between p-2 rounded bg-gray-900/50 border border-gray-800">
                                    <span>{player}</span>
                                    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-950/30" onClick={() => runAction(`whitelist remove ${player}`, `Removed ${player} from whitelist`)}>
                                        <UserMinus className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm py-4">Whitelist is empty or disabled.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gray-950 border-gray-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Ban className="h-5 w-5 text-red-500" />
                        Banned Players
                    </CardTitle>
                    <CardDescription>Players who are explicitly blocked from joining.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        ) : bans.length > 0 ? (
                            bans.map(player => (
                                <div key={player} className="flex items-center justify-between p-2 rounded bg-gray-900/50 border border-gray-800">
                                    <span>{player}</span>
                                    <Button variant="ghost" size="sm" className="text-green-400 hover:bg-green-950/30" onClick={() => runAction(`pardon ${player}`, `Unbanned ${player}`)}>
                                        <Shield className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 text-sm py-4">No banned players.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
