import { auth } from "@/lib/auth";
import { getSystemStatus } from "@/lib/system";
import { getRconClient } from "@/lib/rcon";
import { PlayerList } from "@/components/dashboard/PlayerList";
import SecurityManager from "@/components/dashboard/SecurityManager";
import { redirect } from "next/navigation";
import { Users, ShieldAlert } from "lucide-react";

export default async function PlayersPage() {
    const session = await auth();
    if (!session) redirect("/");

    const status = await getSystemStatus();
    let playerCount = 0;
    let maxPlayers = 0;
    let players: string[] = [];

    if (status.active) {
        try {
            const rcon = await getRconClient();
            const listResponse = await rcon.send("list");
            const match = listResponse.match(/(\d+) of a max of (\d+)/);
            if (match) {
                playerCount = parseInt(match[1]);
                maxPlayers = parseInt(match[2]);
            }
            const parts = listResponse.split(":");
            if (parts.length > 1 && parts[1].trim()) {
                players = parts[1].split(",").map(p => p.trim()).filter(p => p.length > 0);
            }
        } catch (e) {
            console.error("RCON failed in players page", e);
        }
    }

    return (
        <div className="space-y-10 max-w-7xl mx-auto pb-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Users className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Gestión de Entidades</h1>
                </div>
                <p className="text-gray-500 font-medium ml-12">Monitoreo y control de usuarios en tiempo real</p>
            </div>

            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Usuarios Conectados</h2>
                </div>
                <PlayerList players={players} max={maxPlayers} online={playerCount} />
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent my-8" />

            <section className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Control de Accesos</h2>
                </div>
                <SecurityManager />
            </section>
        </div>
    );
}
