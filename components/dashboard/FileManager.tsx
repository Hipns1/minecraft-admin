"use client";
// File Manager Component


import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, File, Loader2, FolderTree, Package, Box, Globe, Settings, FileText, RotateCw, Plus, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "plugins", label: "Plugins", icon: FolderTree },
    { id: "mods", label: "Mods", icon: Package },
    { id: "backups", label: "Backups", icon: Archive },
    { id: "config", label: "Configuración", icon: Settings },
    { id: "logs", label: "Registros", icon: FileText },
];

const AVAILABLE_PLUGINS = [
    { name: "EssentialsX", version: "2.19.0", description: "Utilidades de administración, economía y comandos básicos.", scope: "Global / Admin", type: "plugins" },
    { name: "WorldEdit", version: "7.2.10", description: "Editor de mapas masivo mediante comandos y herramientas.", scope: "Construcción", type: "plugins" },
    { name: "LuckPerms", version: "5.4.0", description: "Sistema avanzado de permisos para grupos y jugadores.", scope: "Seguridad / Rangos", type: "plugins" },
    { name: "Vault", version: "1.7.3", description: "API puente para conectar plugins de economía y chat.", scope: "Sistema", type: "plugins" },
    { name: "SkinRestorer", version: "14.2.3", description: "Permite restaurar y cambiar skins en servidores offline/no-premium.", scope: "Visual / Usuarios", type: "plugins" },
    { name: "ClearLag", version: "3.2.2", description: "Optimización remota de entidades y reducción de lag del servidor.", scope: "Rendimiento", type: "plugins" },
    { name: "Multiverse-Core", version: "4.3.1", description: "Gestión de múltiples mundos simultáneos en el servidor.", scope: "Mundos", type: "plugins" },
    { name: "ViaVersion", version: "4.4.2", description: "Permite que versiones más nuevas de Minecraft entren al servidor.", scope: "Compatibilidad", type: "plugins" },
];

const AVAILABLE_MODS = [
    { name: "JourneyMap", version: "1.19.2", description: "Mapa detallado en tiempo real con minimapa e interfaz completa.", scope: "Interfaz / Jugador", type: "mods" },
    { name: "JEI (Just Enough Items)", version: "10.0.0", description: "Visualizador de recetas y buscador de todos los bloques del juego.", scope: "Interfaz / Guía", type: "mods" },
    { name: "Mouse Tweaks", version: "2.22", description: "Mejoras drásticas de usabilidad para el inventario y cofres.", scope: "Jugabilidad", type: "mods" },
    { name: "AppleSkin", version: "2.4.0", description: "Muestra información de saturación y nutrición en la barra de comida.", scope: "Visual / HUD", type: "mods" },
    { name: "Clumps", version: "9.0.0", description: "Agrupa los orbes de experiencia en uno solo para reducir lag.", scope: "Rendimiento", type: "mods" },
    { name: "Simple Voice Chat", version: "2.3.2", description: "Chat de voz por proximidad integrado directamente en el juego.", scope: "Social / Audio", type: "mods" },
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
    const [currentDir, setCurrentDir] = useState("plugins");
    const [files, setFiles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

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
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentDir);
    }, [currentDir]);

    const isPluginsOrMods = currentDir === "plugins" || currentDir === "mods";
    const availableItems = currentDir === "plugins" ? AVAILABLE_PLUGINS : AVAILABLE_MODS;

    return (
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
                        <CustomCard title={`Instalados (${files.length})`} icon={<Box className="h-4 w-4" />}>
                            <div className="divide-y divide-gray-800/50">
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
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-8 text-[10px] font-black text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg">
                                                QUITAR
                                            </Button>
                                        </div>
                                    ))
                                ) : <EmptyState />}
                            </div>
                        </CustomCard>

                        {/* Available Section */}
                        <CustomCard title="Catálogo Disponible" icon={<Plus className="h-4 w-4" />}>
                            <div className="divide-y divide-gray-800/50">
                                {availableItems.map(item => (
                                    <div key={item.name} className="flex flex-col p-4 hover:bg-white/[0.02] transition-colors group gap-3">
                                        <div className="flex items-center justify-between min-w-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                                                    <Plus className="h-4 w-4" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-gray-200 truncate">{item.name}</p>
                                                    <p className="text-[10px] text-gray-500 uppercase font-bold">{item.version}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg shrink-0">
                                                AGREGAR
                                            </Button>
                                        </div>
                                        <div className="pl-11 space-y-1">
                                            <p className="text-xs text-gray-400 leading-tight">{item.description}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[9px] font-black uppercase text-gray-600 tracking-widest">Alcance:</span>
                                                <span className="text-[9px] font-black uppercase text-primary/60">{item.scope}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CustomCard>
                    </div>
                ) : (
                    <Card className="bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
                        <CardHeader className="py-4 px-6 border-b border-gray-800 bg-gray-900/30 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Folder className="h-4 w-4 text-primary" />
                                <span className="uppercase tracking-widest text-[10px] text-gray-500">Navegación /</span>
                                <span className="text-white">{currentDir}</span>
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => fetchFiles(currentDir)} className="h-8 text-[10px] font-bold gap-2">
                                <RotateCw className="h-3 w-3" /> Actualizar
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? <LoadingState /> : files.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[500px]">
                                        <thead>
                                            <tr className="border-b border-gray-800/50 bg-gray-900/10">
                                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre</th>
                                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Tamaño</th>
                                                <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800/50">
                                            {files.map(file => (
                                                <tr key={file.name} className="group hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-6 py-3 shrink-0">
                                                        <div className="flex items-center gap-3">
                                                            {file.isDirectory ? (
                                                                <Folder className="h-4 w-4 text-blue-400" />
                                                            ) : (
                                                                <File className="h-4 w-4 text-gray-500" />
                                                            )}
                                                            <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate">
                                                                {file.name}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className="text-[10px] font-mono text-gray-500">
                                                            {file.isDirectory ? '--' : formatBytes(file.size)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className="text-[10px] text-gray-600">
                                                            {new Date(file.mtime).toLocaleDateString()}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : <EmptyState />}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

function CustomCard({ title, icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <Card className="bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
            <CardHeader className="py-4 px-6 border-b border-gray-800 bg-gray-900/10">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                    {icon}
                    {title}
                </CardTitle>
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
