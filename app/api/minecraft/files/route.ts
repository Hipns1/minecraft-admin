import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subDir = searchParams.get("dir") || "";

    // We only allow specific directories for security
    const allowedDirs = ["mods", "plugins", "config", "world", "logs", ""];
    if (!allowedDirs.includes(subDir)) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Use the base path from env or a sensible default
    // We know from earlier that it is /home/serveradmin/minecraft
    const basePath = process.env.MC_LOG_FILE
        ? path.dirname(path.dirname(process.env.MC_LOG_FILE))
        : "/opt/minecraft";

    try {
        const targetPath = path.join(basePath, subDir);
        const files = await fs.readdir(targetPath, { withFileTypes: true });

        const fileList = files.map(file => ({
            name: file.name,
            isDirectory: file.isDirectory(),
            size: 0, // We could get stats if needed
        }));

        return NextResponse.json({ files: fileList });
    } catch (error) {
        console.error("Failed to list files:", error);
        return NextResponse.json({ error: "Could not read directory" }, { status: 500 });
    }
}
