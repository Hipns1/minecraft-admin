import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { pluginName, type } = body;

        if (!pluginName || !type) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // For now, this is a placeholder - in a real implementation, you would:
        // 1. Download the plugin/mod from a repository (e.g., SpigotMC, CurseForge)
        // 2. Verify the file integrity
        // 3. Place it in the appropriate directory

        return NextResponse.json({
            error: "La instalación automática no está implementada aún. Por favor, descarga y coloca el archivo manualmente en la carpeta correspondiente."
        }, { status: 501 });

    } catch (error) {
        console.error("Failed to add plugin/mod:", error);
        return NextResponse.json({ error: "Could not add plugin/mod" }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { fileName, type } = body;

        if (!fileName || !type) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Security check
        const allowedTypes = ["plugins", "mods"];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid type" }, { status: 403 });
        }

        // Get base path
        const basePath = process.env.MC_LOG_FILE
            ? path.dirname(path.dirname(process.env.MC_LOG_FILE))
            : "/opt/minecraft";

        const targetPath = path.join(basePath, type, fileName);

        // Security: Ensure the path doesn't escape the intended directory
        const resolvedPath = path.resolve(targetPath);
        const resolvedBase = path.resolve(path.join(basePath, type));
        if (!resolvedPath.startsWith(resolvedBase)) {
            return NextResponse.json({ error: "Invalid path" }, { status: 403 });
        }

        // Check if file exists
        try {
            await fs.access(targetPath);
        } catch {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        // Delete the file
        await fs.unlink(targetPath);

        // Also try to delete associated folder if it exists
        const folderName = fileName.replace('.jar', '');
        const folderPath = path.join(basePath, type, folderName);
        try {
            const stats = await fs.stat(folderPath);
            if (stats.isDirectory()) {
                await fs.rm(folderPath, { recursive: true, force: true });
            }
        } catch {
            // Folder doesn't exist, ignore
        }

        return NextResponse.json({ success: true, message: "Plugin/mod removed successfully" });

    } catch (error) {
        console.error("Failed to delete plugin/mod:", error);
        return NextResponse.json({ error: "Could not delete plugin/mod" }, { status: 500 });
    }
}
