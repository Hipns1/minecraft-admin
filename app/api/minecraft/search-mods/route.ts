import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const MODRINTH_API_BASE = "https://api.modrinth.com/v2";

interface ModrinthSearchParams {
    query: string;
    mcVersion: string;
    loader: string;
    limit?: number;
}

interface ModrinthProject {
    project_id: string;
    slug: string;
    title: string;
    description: string;
    categories: string[];
    versions: string[];
    downloads: number;
    icon_url: string;
    project_type: "mod" | "plugin";
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query") || "";
        const mcVersion = searchParams.get("mcVersion") || "1.19.2";
        const loader = searchParams.get("loader") || "fabric";
        const limit = parseInt(searchParams.get("limit") || "20");

        // Determine project type based on loader
        const projectType = ["fabric", "forge", "quilt"].includes(loader) ? "mod" : "plugin";

        // Build facets for filtering
        const facets = JSON.stringify([
            [`project_type:${projectType}`],
            [`categories:${loader}`],
            [`versions:${mcVersion}`]
        ]);

        // Search Modrinth
        const searchUrl = `${MODRINTH_API_BASE}/search?query=${encodeURIComponent(query)}&facets=${encodeURIComponent(facets)}&limit=${limit}&index=downloads`;

        const response = await fetch(searchUrl, {
            headers: {
                'User-Agent': 'minecraft-admin-panel/1.0 (contact@example.com)'
            }
        });

        if (!response.ok) {
            throw new Error(`Modrinth API error: ${response.statusText}`);
        }

        const data = await response.json();

        // Transform response to our format
        const projects = data.hits.map((hit: any) => ({
            id: hit.project_id,
            slug: hit.slug,
            name: hit.title,
            description: hit.description,
            downloads: hit.downloads,
            iconUrl: hit.icon_url,
            type: hit.project_type,
            categories: hit.categories,
            supportedVersions: hit.versions
        }));

        return NextResponse.json({
            projects,
            total: data.total_hits,
            offset: data.offset,
            limit: data.limit
        });

    } catch (error) {
        console.error("Failed to search mods/plugins:", error);
        return NextResponse.json({
            error: "Failed to search mods/plugins",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
