import { auth } from "@/lib/auth";
import { sendRconCommand } from "@/lib/rcon";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { command } = body;

        if (!command || typeof command !== 'string') {
            return NextResponse.json({ error: "Invalid command" }, { status: 400 });
        }

        // Basic sanitization: prevent empty or dangerous shell injections if somehow passed to shell (it's RCON but still)
        // RCON commands are generally safe if executed via RCON protocol, but we might want to block some.
        // However, as admin, we usually want full access.

        const response = await sendRconCommand(command);
        return NextResponse.json({ response });

    } catch (error) {
        console.error("RCON API Error:", error);
        return NextResponse.json({ error: "Failed to execute RCON command" }, { status: 500 });
    }
}
