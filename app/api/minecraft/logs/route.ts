import { auth } from "@/lib/auth";
import { getLatestLogs } from "@/lib/system";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file") || "latest.log";

    try {
        const logs = await getLatestLogs(200, fileName);
        return NextResponse.json({ logs });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
    }
}
