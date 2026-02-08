import { auth } from "@/lib/auth";
import { getLatestLogs } from "@/lib/system";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const logs = await getLatestLogs(100);
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
