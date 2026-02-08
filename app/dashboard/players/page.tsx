
import { auth } from "@/lib/auth";
import { getSystemStatus } from "@/lib/system";
import { getRconClient } from "@/lib/rcon";
import { PlayerList } from "@/components/dashboard/PlayerList";
import { redirect } from "next/navigation";

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
            // Parse: "There are X of a max of Y players online: A, B, C"
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Player Management</h1>
            <PlayerList players={players} max={maxPlayers} online={playerCount} />
        </div>
    );
}
