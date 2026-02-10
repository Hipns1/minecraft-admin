import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const MODRINTH_API_BASE = "https://api.modrinth.com/v2";

interface ModrinthVersion {
    id: string;
    project_id: string;
    name: string;
    version_number: string;
    version_type: "release" | "beta" | "alpha";
    loaders: string[];
    game_versions: string[];
    files: ModrinthFile[];
    downloads: number;
    date_published: string;
}

interface ModrinthFile {
    hashes: {
        sha512: string;
        sha1: string;
    };
    url: string;
    filename: string;
    primary: boolean;
    size: number;
}

async function downloadFile(url: string, destinationPath: string, expectedHash?: string): Promise<void> {
    const response = await fetch(url, {
        redirect: 'follow',
        headers: {
            'User-Agent': 'minecraft-admin-panel/1.0 (contact@example.com)'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate hash if provided
    if (expectedHash) {
        const hash = crypto.createHash('sha512');
        hash.update(buffer);
        const calculatedHash = hash.digest('hex');

        if (calculatedHash !== expectedHash) {
            throw new Error('Hash mismatch - file may be corrupted or tampered with');
        }
    }

    await fs.writeFile(destinationPath, buffer);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { projectSlug, mcVersion, loader, type } = body;

        if (!projectSlug || !mcVersion || !loader || !type) {
            return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
        }

        // Security check
        const allowedTypes = ["plugins", "mods"];
        if (!allowedTypes.includes(type)) {
            return NextResponse.json({ error: "Invalid type" }, { status: 403 });
        }

        // Step 1: Get project versions from Modrinth
        const params = new URLSearchParams({
            loaders: JSON.stringify([loader]),
            game_versions: JSON.stringify([mcVersion])
        });

        const versionsUrl = `${MODRINTH_API_BASE}/project/${projectSlug}/version?${params}`;

        const versionsResponse = await fetch(versionsUrl, {
            headers: {
                'User-Agent': 'minecraft-admin-panel/1.0 (contact@example.com)'
            }
        });

        if (!versionsResponse.ok) {
            if (versionsResponse.status === 404) {
                return NextResponse.json({
                    error: "Proyecto no encontrado en Modrinth"
                }, { status: 404 });
            }
            throw new Error(`Modrinth API error: ${versionsResponse.statusText}`);
        }

        const versions: ModrinthVersion[] = await versionsResponse.json();

        if (versions.length === 0) {
            return NextResponse.json({
                error: `No hay versiones disponibles para Minecraft ${mcVersion} con ${loader}`
            }, { status: 404 });
        }

        // Step 2: Get the latest stable version (prefer release over beta/alpha)
        const latestVersion = versions.find(v => v.version_type === "release") || versions[0];

        // Step 3: Get the primary file
        const primaryFile = latestVersion.files.find(f => f.primary) || latestVersion.files[0];

        if (!primaryFile) {
            return NextResponse.json({
                error: "No se encontró archivo descargable"
            }, { status: 404 });
        }

        // Step 4: Prepare download
        const basePath = process.env.MC_LOG_FILE
            ? path.dirname(path.dirname(process.env.MC_LOG_FILE))
            : "/opt/minecraft";

        const targetDir = path.join(basePath, type);
        const targetPath = path.join(targetDir, primaryFile.filename);

        // Ensure directory exists
        await fs.mkdir(targetDir, { recursive: true });

        // Check if file already exists
        try {
            await fs.access(targetPath);
            return NextResponse.json({
                error: `${primaryFile.filename} ya está instalado`
            }, { status: 409 });
        } catch {
            // File doesn't exist, proceed with download
        }

        // Step 5: Download and validate
        try {
            await downloadFile(
                primaryFile.url,
                targetPath,
                primaryFile.hashes.sha512
            );

            return NextResponse.json({
                success: true,
                message: `${latestVersion.name} instalado correctamente`,
                fileName: primaryFile.filename,
                version: latestVersion.version_number,
                size: primaryFile.size,
                downloads: latestVersion.downloads
            });
        } catch (downloadError) {
            console.error("Download failed:", downloadError);

            // Clean up partial download if it exists
            try {
                await fs.unlink(targetPath);
            } catch { }

            return NextResponse.json({
                error: `Error al descargar: ${downloadError instanceof Error ? downloadError.message : 'Unknown error'}`
            }, { status: 500 });
        }

    } catch (error) {
        console.error("Failed to install mod/plugin:", error);
        return NextResponse.json({
            error: "Error al instalar mod/plugin",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
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

        return NextResponse.json({
            success: true,
            message: `${fileName} eliminado correctamente`
        });

    } catch (error) {
        console.error("Failed to delete mod/plugin:", error);
        return NextResponse.json({ error: "Could not delete mod/plugin" }, { status: 500 });
    }
}
