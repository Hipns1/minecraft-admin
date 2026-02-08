import { auth } from "@/lib/auth";
import { getSystemStatus } from "@/lib/system";
import { getRconClient } from "@/lib/rcon";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const sysStatus = await getSystemStatus();

        let playerCount = 0;
        let maxPlayers = 0;
        let players: string[] = [];

        // Only try RCON if system is active
        if (sysStatus.active) {
            try {
                const rcon = await getRconClient();
                // Typically "list" command returns: "There are 2 of a max of 20 players online: Player1, Player2"
                const listResponse = await rcon.send("list");

                // Basic parsing logic
                const match = listResponse.match(/(\d+) of a max of (\d+)/);
                if (match) {
                    playerCount = parseInt(match[1]);
                    maxPlayers = parseInt(match[2]);
                }

                const playerPart = listResponse.split(":")[1];
                if (playerPart) {
                    players = playerPart.split(",").map(p => p.trim()).filter(p => p.length > 0);
                }
            } catch (e) {
                console.error("RCON status check failed", e);
                // Don't fail the whole status check if RCON is down but system is up
            }
        }

        return NextResponse.json({
            ...sysStatus,
            players: {
                online: playerCount,
                max: maxPlayers,
                list: players
            }
        });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
