"use client";
// File Manager Component

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, File, Loader2, FolderTree, Package, FileText, RotateCw, Plus, Search, X, Eye, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SearchModsDialog } from "./SearchModsDialog";

const SECTIONS = [
    { id: "plugins", label: "Plugins", icon: FolderTree },
    { id: "mods", label: "Mods", icon: Package },
];

const RECOMMENDED_PLUGINS = [
    {
        slug: "essentialsx",
        name: "EssentialsX",
        author: "TeamCity",
        description: "El conjunto de utilidades más popular. Añade más de 100 comandos esenciales como /spawn, /home y /warp, además de economía y kits.",
        icon: "https://cdn.modrinth.com/data/S9u9iM4r/icon.png"
    },
    {
        slug: "luckperms",
        name: "LuckPerms",
        author: "Luck",
        description: "Sistema de permisos avanzado y flexible. Gestiona rangos y acceso a comandos de forma sencilla mediante su potente editor web integrado.",
        icon: "https://cdn.modrinth.com/data/V9v62p4t/icon.png"
    },
    {
        slug: "worldedit",
        name: "WorldEdit",
        author: "EngineHub",
        description: "Herramienta de edición masiva de mapas. Imprescindible para constructores; permite copiar, pegar y generar estructuras gigantes en segundos.",
        icon: "https://cdn.modrinth.com/data/gv9p70le/icon.png"
    },
    {
        slug: "vault",
        name: "Vault",
        author: "MilkBowl",
        description: "Plugin 'puente' obligatorio. Permite que el sistema de economía, permisos y chat se comuniquen correctamente entre diferentes plugins.",
        icon: "https://cdn.modrinth.com/data/uS89pS7f/icon.png"
    },
    {
        slug: "geyser",
        name: "GeyserMC",
        author: "GeyserMC",
        description: "¡Multiplataforma total! Permite que los jugadores de Minecraft Bedrock (Consolas, Móvil) se unan a tu servidor de Java Edition.",
        icon: "https://cdn.modrinth.com/data/6S679N2n/icon.png"
    }
];

const RECOMMENDED_MODS = [
    {
        slug: "sodium",
        name: "Sodium",
        author: "jellysquid3",
        description: "Optimización extrema del rendimiento. Reemplaza el motor de renderizado de Minecraft para doblar o triplicar tus FPS sin perder calidad.",
        icon: "https://cdn.modrinth.com/data/AANobbMI/icon.png"
    },
    {
        slug: "iris",
        name: "Iris Shaders",
        author: "coderbot",
        description: "Soporte moderno para Shaders. Disfruta de gráficos increíbles con una compatibilidad total con Sodium y un rendimiento superior a Optifine.",
        icon: "https://cdn.modrinth.com/data/YL577FC6/icon.png"
    },
    {
        slug: "journeymap",
        name: "JourneyMap",
        author: "teamjm",
        description: "Mapa en tiempo real. Registra tu mundo mientras exploras, con minimapa en pantalla, puntos de interés (waypoints) y vista web.",
        icon: "https://cdn.modrinth.com/data/m6897Ejq/icon.png"
    },
    {
        slug: "jei",
        name: "Just Enough Items",
        author: "mezz",
        description: "El buscador de objetos definitivo. Permite ver todas las recetas de crafteo y usos de cualquier bloque del juego de forma instantánea.",
        icon: "https://cdn.modrinth.com/data/u6ms9Ejq/icon.png"
    },
    {
        slug: "voicechat",
        name: "Simple Voice Chat",
        author: "henkelmax",
        description: "Chat de voz por proximidad. Escucha a tus amigos más alto o más bajo según la distancia a la que estén de ti dentro del juego.",
        icon: "https://cdn.modrinth.com/data/896689/icon.png"
    }
];

function formatBytes(bytes: number, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function FileManager() {
    const router = useRouter();
    const [currentDir, setCurrentDir] = useState("plugins");
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [showSearchDialog, setShowSearchDialog] = useState(false);
    const [mcVersion, setMcVersion] = useState("1.19.2");
    const [loader, setLoader] = useState("fabric");
    const [isDetecting, setIsDetecting] = useState(true);

    // Auto-hide notification after 5 seconds
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchFiles = async (dir: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/minecraft/files?dir=${dir}`);
            const data = await res.json();
            if (data.files) {
                let processed = data.files;

                // Unified view for plugins/mods: Hide folders if a corresponding .jar exists
                if (dir === "plugins" || dir === "mods") {
                    const jarNames = new Set(processed.filter((f: any) => f.name.endsWith('.jar')).map((f: any) => f.name.replace('.jar', '').toLowerCase()));
                    processed = processed.filter((f: any) => {
                        if (f.isDirectory) {
                            // If there's a jar with same name, it's just the config folder
                            if (jarNames.has(f.name.toLowerCase())) return false;
                        } else {
                            // Only show .jar files in these folders for management
                            if (!f.name.endsWith('.jar')) return false;
                        }
                        return true;
                    });
                }

                const sorted = processed.sort((a: any, b: any) => {
                    if (a.isDirectory && !b.isDirectory) return -1;
                    if (!a.isDirectory && b.isDirectory) return 1;
                    return a.name.localeCompare(b.name);
                });
                setFiles(sorted);
            } else {
                setFiles([]);
            }
        } catch (e) {
            console.error("No se pudieron cargar los archivos");
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentDir);
    }, [currentDir]);

    // Autodetect on mount
    useEffect(() => {
        const detect = async () => {
            try {
                const res = await fetch('/api/minecraft/status');
                const data = await res.json();
                if (data.version && data.version !== "Unknown") setMcVersion(data.version);
                if (data.loader && data.loader !== "unknown") {
                    setLoader(data.loader.toLowerCase());
                } else {
                    setLoader(currentDir === "mods" ? "fabric" : "paper");
                }
            } catch (e) {
                console.error("Error detecting server status", e);
            } finally {
                setIsDetecting(false);
            }
        };
        detect();
    }, [currentDir]);

    const handleRemove = async (fileName: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar ${fileName}?`)) return;

        setActionLoading(fileName);
        try {
            const res = await fetch('/api/minecraft/manage-plugin', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileName, type: currentDir })
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ type: 'success', message: `${fileName} eliminado correctamente` });
                await fetchFiles(currentDir);
            } else {
                setNotification({ type: 'error', message: data.error || 'Error al eliminar el archivo' });
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Error de conexión al eliminar el archivo' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleAdd = async (projectSlug: string, projectName: string) => {
        setActionLoading(projectSlug);
        try {
            const res = await fetch('/api/minecraft/manage-plugin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectSlug,
                    type: currentDir,
                    mcVersion,
                    loader
                })
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ type: 'success', message: data.message || `${projectName} instalado correctamente` });
                await fetchFiles(currentDir);
            } else {
                setNotification({ type: 'error', message: data.error || 'Error al agregar el plugin/mod' });
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Error de conexión al agregar el plugin/mod' });
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewLog = (fileName: string) => {
        // Redirect to logs page with the selected file
        router.push(`/dashboard/logs?file=${encodeURIComponent(fileName)}`);
    };

    const isPluginsOrMods = currentDir === "plugins" || currentDir === "mods";

    return (
        <div className="flex flex-col gap-6">
            {/* Notification Toast */}
            {notification && (
                <div className={cn(
                    "fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border animate-in slide-in-from-top-5 duration-300",
                    notification.type === 'success'
                        ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                        : "bg-red-500/10 border-red-500/50 text-red-400"
                )}>
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : (
                        <XCircle className="h-5 w-5 shrink-0" />
                    )}
                    <span className="text-sm font-bold">{notification.message}</span>
                    <button
                        onClick={() => setNotification(null)}
                        className="ml-2 hover:opacity-70 transition-opacity"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="flex flex-col lg:grid gap-6 lg:grid-cols-4">
                {/* Sidebar / Tabs */}
                <div className="lg:col-span-1">
                    <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                        {SECTIONS.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setCurrentDir(section.id)}
                                className={cn(
                                    "flex-none lg:w-full min-w-[120px] text-left p-3 lg:p-4 rounded-2xl border transition-all duration-300 group",
                                    currentDir === section.id
                                        ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20"
                                        : "bg-gray-950/40 border-gray-800/50 hover:border-gray-700 hover:bg-gray-900/40"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "p-2 rounded-xl transition-colors shrink-0",
                                        currentDir === section.id ? "bg-primary text-black" : "bg-gray-900 group-hover:bg-gray-800 text-gray-500"
                                    )}>
                                        <section.icon className="h-4 w-4" />
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold tracking-tight",
                                        currentDir === section.id ? "text-white" : "text-gray-400"
                                    )}>
                                        {section.label}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {isPluginsOrMods ? (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {/* Installed Section */}
                            <CustomCard title={`Instalados (${files.length})`} icon={<Package className="h-4 w-4" />}>
                                <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
                                    {isLoading ? (
                                        <LoadingState />
                                    ) : files.length > 0 ? (
                                        files.map(file => (
                                            <div key={file.name} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                                                        <Package className="h-4 w-4" />
                                                    </div>
                                                    <div className="truncate">
                                                        <p className="text-sm font-bold text-gray-200 truncate">{file.name}</p>
                                                        <div className="flex gap-2">
                                                            <p className="text-[10px] text-gray-500 uppercase font-bold">{formatBytes(file.size)}</p>
                                                            <p className="text-[10px] text-primary/60 uppercase font-black tracking-tighter shrink-0">INSTALADO</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemove(file.name)}
                                                    disabled={actionLoading === file.name}
                                                    className="opacity-0 group-hover:opacity-100 h-8 text-[10px] font-black text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg disabled:opacity-50"
                                                >
                                                    {actionLoading === file.name ? <Loader2 className="h-3 w-3 animate-spin" /> : "QUITAR"}
                                                </Button>
                                            </div>
                                        ))
                                    ) : <EmptyState />}
                                </div>
                            </CustomCard>

                            {/* Available Section (Recommendations) */}
                            <CustomCard
                                title="Recomendados (Modrinth)"
                                icon={<Plus className="h-4 w-4" />}
                                action={
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowSearchDialog(true)}
                                        className="h-8 text-[10px] font-black text-primary hover:bg-primary/10 rounded-lg gap-2"
                                    >
                                        <Search className="h-3 w-3" />
                                        BUSCAR MÁS
                                    </Button>
                                }
                            >
                                <div className="divide-y divide-gray-800/50 max-h-[600px] overflow-y-auto">
                                    {(currentDir === "plugins" ? RECOMMENDED_PLUGINS : RECOMMENDED_MODS).map(item => {
                                        // Skip mods if it's a plugin loader
                                        const isPluginLoader = ["paper", "spigot", "bukkit", "purpur"].includes(loader);
                                        if (currentDir === "mods" && isPluginLoader) return null;

                                        return (
                                            <div key={item.slug} className="flex flex-col p-4 hover:bg-white/[0.02] transition-colors group gap-3">
                                                <div className="flex items-center justify-between min-w-0">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 overflow-hidden shrink-0 flex items-center justify-center">
                                                            <img
                                                                src={item.icon}
                                                                alt={item.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=111&color=fff&bold=true`;
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="truncate">
                                                            <p className="text-sm font-bold text-gray-200 truncate">{item.name}</p>
                                                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-tighter">{item.author}</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleAdd(item.slug, item.name)}
                                                        disabled={actionLoading === item.slug}
                                                        className="h-8 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg shrink-0 disabled:opacity-50"
                                                    >
                                                        {actionLoading === item.slug ? <Loader2 className="h-3 w-3 animate-spin" /> : "INSTALAR"}
                                                    </Button>
                                                </div>
                                                <div className="pl-[3.25rem]">
                                                    <p className="text-xs text-gray-400 leading-tight line-clamp-2">{item.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {currentDir === "mods" && ["paper", "spigot", "bukkit", "purpur"].includes(loader) && (
                                        <div className="p-8 text-center opacity-50 flex flex-col items-center gap-3">
                                            <Package className="h-8 w-8 text-gray-600" />
                                            <p className="text-xs font-bold text-gray-400">Tu servidor usa {loader.toUpperCase()}</p>
                                            <p className="text-[10px] uppercase tracking-tighter max-w-[200px]">Los motores de plugins no soportan mods de Fabric/Forge.</p>
                                        </div>
                                    )}


                                    <div className="p-6 text-center border-t border-gray-800/50">
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowSearchDialog(true)}
                                            className="w-full bg-gray-950/40 border-gray-800 hover:border-primary/50 text-[10px] font-black uppercase tracking-widest h-10"
                                        >
                                            <Search className="h-3 w-3 mr-2" />
                                            Explorar todo en Modrinth
                                        </Button>
                                    </div>
                                </div>
                            </CustomCard>
                        </div>
                    ) : null}
                </div>
            </div>
            {showSearchDialog && isPluginsOrMods && (
                <SearchModsDialog
                    type={currentDir as "mods" | "plugins"}
                    onClose={() => setShowSearchDialog(false)}
                    onInstallSuccess={() => {
                        fetchFiles(currentDir);
                        setShowSearchDialog(false);
                    }}
                />
            )}
        </div>
    );
}

function CustomCard({ title, icon, action, children }: { title: string, icon: any, action?: React.ReactNode, children: React.ReactNode }) {
    return (
        <Card className="bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
            <CardHeader className="py-4 px-6 border-b border-gray-800 bg-gray-900/10 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
                {action}
            </CardHeader>
            <CardContent className="p-0">
                {children}
            </CardContent>
        </Card>
    );
}

function LoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary opacity-50" />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 gap-2 opacity-30 text-center">
            <FolderTree className="h-8 w-8 text-gray-600 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sin Archivos</p>
        </div>
    );
}
