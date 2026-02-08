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

        const fileList = await Promise.all(files.map(async (file) => {
            const filePath = path.join(targetPath, file.name);
            let size = 0;
            let mtime = new Date();

            try {
                const stats = await fs.stat(filePath);
                size = stats.size;
                mtime = stats.mtime;
            } catch (e) {
                // Ignore if we can't get stats
            }

            return {
                name: file.name,
                isDirectory: file.isDirectory(),
                size: size,
                mtime: mtime,
            };
        }));

        return NextResponse.json({ files: fileList });
    } catch (error) {
        console.error("Failed to list files:", error);
        return NextResponse.json({ error: "Could not read directory" }, { status: 500 });
    }
}
