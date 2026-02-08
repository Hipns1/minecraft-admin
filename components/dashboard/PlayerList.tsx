"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ban, UserX, ShieldCheck, ShieldAlert } from "lucide-react";
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
            <div className="flex justify-between items-center bg-gray-900 p-4 rounded-lg">
                <span className="text-gray-400">Online: <strong className="text-white">{online}</strong> / {max}</span>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleWhitelist("on")}>
                        <ShieldCheck className="h-4 w-4 mr-1 text-green-500" /> WL On
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleWhitelist("off")}>
                        <ShieldAlert className="h-4 w-4 mr-1 text-red-500" /> WL Off
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleWhitelist("reload")}>
                        Reload
                    </Button>
                </div>
            </div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Username</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {players.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-500 py-8">
                                No players online
                            </TableCell>
                        </TableRow>
                    ) : (
                        players.map((player) => (
                            <TableRow key={player}>
                                <TableCell className="font-medium">{player}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="outline" size="sm" onClick={() => handleAction("kick", player)}>
                                        <UserX className="h-4 w-4 mr-1" /> Kick
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => handleAction("ban", player)}>
                                        <Ban className="h-4 w-4 mr-1" /> Ban
                                    </Button>
                                    <Button variant="secondary" size="sm" onClick={() => handleAction("op", player)}>
                                        <ShieldAlert className="h-4 w-4 mr-1" /> OP
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
