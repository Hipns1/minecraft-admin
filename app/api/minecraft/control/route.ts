import { auth } from "@/lib/auth";
import { controlServer } from "@/lib/system";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { action } = body;

        if (!action || !["start", "stop", "restart"].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        await controlServer(action);

        return NextResponse.json({ success: true, message: `Server ${action} command sent.` });
    } catch (error) {
        console.error("Control API Error:", error);
        return NextResponse.json({ error: "Failed to execute control command" }, { status: 500 });
    }
}
