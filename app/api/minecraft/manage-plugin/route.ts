import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Plugin/Mod download sources with their download URLs
const PLUGIN_SOURCES: Record<string, { url: string, fileName: string }> = {
    "EssentialsX": {
        url: "https://ci.ender.zone/job/EssentialsX/lastSuccessfulBuild/artifact/jars/EssentialsX-2.20.1.jar",
        fileName: "EssentialsX.jar"
    },
    "WorldEdit": {
        url: "https://dev.bukkit.org/projects/worldedit/files/latest",
        fileName: "WorldEdit.jar"
    },
    "LuckPerms": {
        url: "https://download.luckperms.net/1515/bukkit/loader/LuckPerms-Bukkit-5.4.102.jar",
        fileName: "LuckPerms.jar"
    },
    "Vault": {
        url: "https://github.com/MilkBowl/Vault/releases/download/1.7.3/Vault.jar",
        fileName: "Vault.jar"
    },
    "CoreProtect": {
        url: "https://github.com/PlayPro/CoreProtect/releases/download/21.3/CoreProtect-21.3.jar",
        fileName: "CoreProtect.jar"
    }
};

const MOD_SOURCES: Record<string, { url: string, fileName: string }> = {
    "Sodium": {
        url: "https://cdn.modrinth.com/data/AANobbMI/versions/mc1.19.2-0.4.4/sodium-fabric-mc1.19.2-0.4.4+build.18.jar",
        fileName: "sodium-fabric.jar"
    },
    "Lithium": {
        url: "https://cdn.modrinth.com/data/gvQqBUqZ/versions/mc1.19.2-0.11.1/lithium-fabric-mc1.19.2-0.11.1.jar",
        fileName: "lithium-fabric.jar"
    },
    "Phosphor": {
        url: "https://cdn.modrinth.com/data/hEOCdOgW/versions/mc1.19.x-0.8.1/phosphor-fabric-mc1.19.x-0.8.1.jar",
        fileName: "phosphor-fabric.jar"
    }
};

async function downloadFile(url: string, destinationPath: string): Promise<void> {
    const response = await fetch(url, {
        redirect: 'follow',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);
}

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

        // Security check
        const allowedTypes = ["plugins", "mods"];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid type" }, { status: 403 });
        }

        // Get the appropriate source
        const sources = type === "plugins" ? PLUGIN_SOURCES : MOD_SOURCES;
        const source = sources[pluginName];

        if (!source) {
            return NextResponse.json({
                error: `${pluginName} no está disponible para descarga automática. Por favor, descárgalo manualmente desde su sitio oficial.`
            }, { status: 404 });
        }

        // Get base path
        const basePath = process.env.MC_LOG_FILE
            ? path.dirname(path.dirname(process.env.MC_LOG_FILE))
            : "/opt/minecraft";

        const targetDir = path.join(basePath, type);
        const targetPath = path.join(targetDir, source.fileName);

        // Ensure directory exists
        await fs.mkdir(targetDir, { recursive: true });

        // Check if file already exists
        try {
            await fs.access(targetPath);
            return NextResponse.json({
                error: `${pluginName} ya está instalado.`
            }, { status: 409 });
        } catch {
            // File doesn't exist, proceed with download
        }

        // Download the file
        try {
            await downloadFile(source.url, targetPath);
            return NextResponse.json({
                success: true,
                message: `${pluginName} instalado correctamente.`,
                fileName: source.fileName
            });
        } catch (downloadError) {
            console.error("Download failed:", downloadError);
            return NextResponse.json({
                error: `Error al descargar ${pluginName}. Por favor, intenta nuevamente o descárgalo manualmente.`
            }, { status: 500 });
        }

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
