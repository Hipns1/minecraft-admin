"use client";
// File Manager Component

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Folder, File, Loader2, FolderTree, Package, FileText, RotateCw, Plus, Search, X, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const SECTIONS = [
    { id: "plugins", label: "Plugins", icon: FolderTree },
    { id: "mods", label: "Mods", icon: Package },
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
    { name: "Dynmap", version: "3.4", description: "Mapa web en tiempo real del servidor con interfaz interactiva.", scope: "Web / Visual", type: "plugins" },
    { name: "ProtocolLib", version: "5.0.0", description: "Biblioteca para manipular paquetes de red de Minecraft.", scope: "Sistema / API", type: "plugins" },
    { name: "WorldGuard", version: "7.0.7", description: "Protección avanzada de regiones y control de permisos por área.", scope: "Seguridad / Protección", type: "plugins" },
    { name: "Citizens", version: "2.0.30", description: "Framework completo para crear y gestionar NPCs personalizados.", scope: "NPCs / Funcional", type: "plugins" },
    { name: "mcMMO", version: "2.1.215", description: "Sistema RPG con skills, niveles y habilidades especiales.", scope: "RPG / Jugabilidad", type: "plugins" },
    { name: "GriefPrevention", version: "16.18", description: "Protección automática de terrenos sin comandos complicados.", scope: "Protección / Claims", type: "plugins" },
    { name: "CoreProtect", version: "21.2", description: "Logger completo de bloques y acciones para rollback.", scope: "Admin / Seguridad", type: "plugins" },
    { name: "PlaceholderAPI", version: "2.11.2", description: "API para usar placeholders dinámicos en otros plugins.", scope: "Sistema / API", type: "plugins" },
    { name: "HolographicDisplays", version: "3.0.0", description: "Creación de textos flotantes y hologramas personalizables.", scope: "Visual / Decoración", type: "plugins" },
    { name: "ViaBackwards", version: "4.5.1", description: "Permite que versiones antiguas de Minecraft se conecten al servidor.", scope: "Compatibilidad", type: "plugins" },
    { name: "FastAsyncWorldEdit", version: "2.5.0", description: "Versión optimizada de WorldEdit para ediciones masivas.", scope: "Construcción / Performance", type: "plugins" },
    { name: "ChestShop", version: "3.12", description: "Sistema de tiendas con cofres para compraventa automática.", scope: "Economía / Comercio", type: "plugins" },
];

const AVAILABLE_MODS = [
    { name: "JourneyMap", version: "1.19.2-5.9.7", description: "Mapa detallado en tiempo real con minimapa e interfaz completa.", scope: "Interfaz / Jugador", type: "mods" },
    { name: "JEI (Just Enough Items)", version: "10.0.0", description: "Visualizador de recetas y buscador de todos los bloques del juego.", scope: "Interfaz / Guía", type: "mods" },
    { name: "Mouse Tweaks", version: "2.22", description: "Mejoras drásticas de usabilidad para el inventario y cofres.", scope: "Jugabilidad", type: "mods" },
    { name: "AppleSkin", version: "2.4.0", description: "Muestra información de saturación y nutrición en la barra de comida.", scope: "Visual / HUD", type: "mods" },
    { name: "Clumps", version: "9.0.0", description: "Agrupa los orbes de experiencia en uno solo para reducir lag.", scope: "Rendimiento", type: "mods" },
    { name: "Simple Voice Chat", version: "2.3.2", description: "Chat de voz por proximidad integrado directamente en el juego.", scope: "Social / Audio", type: "mods" },
    { name: "Sodium", version: "0.4.10", description: "Optimización extrema de renderizado y FPS.", scope: "Rendimiento / Gráficos", type: "mods" },
    { name: "Iris Shaders", version: "1.6.4", description: "Soporte completo para shaders con compatibilidad Sodium.", scope: "Gráficos / Visual", type: "mods" },
    { name: "Lithium", version: "0.11.1", description: "Optimización general del servidor y lógica del juego.", scope: "Rendimiento / Server", type: "mods" },
    { name: "Phosphor", version: "0.8.1", description: "Optimización del motor de iluminación del juego.", scope: "Rendimiento / Lighting", type: "mods" },
    { name: "Mod Menu", version: "6.1.0", description: "Interfaz para configurar mods instalados sin editar archivos.", scope: "Utilidad / Config", type: "mods" },
    { name: "Xaero's Minimap", version: "23.1.0", description: "Minimapa liviano y altamente personalizable.", scope: "Interfaz / Navegación", type: "mods" },
    { name: "Waystones", version: "11.4.0", description: "Puntos de teletransporte entre ubicaciones importantes.", scope: "Transporte / Funcional", type: "mods" },
    { name: "Farmers Delight", version: "1.2.1", description: "Expansión completa del sistema de agricultura y cocina.", scope: "Contenido / Farming", type: "mods" },
    { name: "Create", version: "0.5.1", description: "Mecánicas avanzadas de maquinaria y automatización.", scope: "Tecnología / Funcional", type: "mods" },
    { name: "Biomes O' Plenty", version: "17.1.2", description: "Añade más de 80 biomas nuevos al mundo.", scope: "Worldgen / Exploración", type: "mods" },
    { name: "Iron Chests", version: "14.2.5", description: "Cofres mejorados con mayor capacidad de almacenamiento.", scope: "Almacenamiento / QoL", type: "mods" },
    { name: "The Twilight Forest", version: "4.2.1518", description: "Nueva dimensión con jefes, mazmorras y estructuras.", scope: "Aventura / Dimensión", type: "mods" },
    { name: "Tinkers Construct", version: "3.6.4", description: "Sistema modular para crear herramientas personalizadas.", scope: "Herramientas / Crafting", type: "mods" },
    { name: "Pam's HarvestCraft", version: "9.1.0", description: "Cientos de nuevos cultivos, árboles y recetas de comida.", scope: "Farming / Comida", type: "mods" },
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
            setFiles([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentDir);
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

            if (res.ok) {
                await fetchFiles(currentDir);
            } else {
                alert('Error al eliminar el archivo');
            }
        } catch (e) {
            alert('Error al eliminar el archivo');
        } finally {
            setActionLoading(null);
        }
    };

    const handleAdd = async (pluginName: string) => {
        setActionLoading(pluginName);
        try {
            const res = await fetch('/api/minecraft/manage-plugin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pluginName, type: currentDir })
            });

            if (res.ok) {
                await fetchFiles(currentDir);
            } else {
                const data = await res.json();
                alert(data.error || 'Error al agregar el plugin/mod');
            }
        } catch (e) {
            alert('Error al agregar el plugin/mod');
        } finally {
            setActionLoading(null);
        }
    };

    const handleViewLog = (fileName: string) => {
        // Redirect to logs page with the selected file
        router.push(`/dashboard/logs?file=${encodeURIComponent(fileName)}`);
    };

    const isPluginsOrMods = currentDir === "plugins" || currentDir === "mods";
    const isLogs = currentDir === "logs";
    const availableItems = currentDir === "plugins" ? AVAILABLE_PLUGINS : AVAILABLE_MODS;

    // Filter available items based on search
    const filteredAvailableItems = availableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.scope.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

                        {/* Available Section */}
                        <CustomCard title="Catálogo Disponible" icon={<Plus className="h-4 w-4" />}>
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-800/50 bg-gray-900/20">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar plugins/mods..."
                                        className="pl-10 pr-10 bg-black/40 border-gray-700 focus:border-primary h-9 text-sm"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="divide-y divide-gray-800/50 max-h-[550px] overflow-y-auto">
                                {filteredAvailableItems.length > 0 ? (
                                    filteredAvailableItems.map(item => (
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
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleAdd(item.name)}
                                                    disabled={actionLoading === item.name}
                                                    className="h-8 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg shrink-0 disabled:opacity-50"
                                                >
                                                    {actionLoading === item.name ? <Loader2 className="h-3 w-3 animate-spin" /> : "AGREGAR"}
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
                                    ))
                                ) : (
                                    <div className="p-8 text-center opacity-30">
                                        <Search className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">No se encontraron resultados</p>
                                    </div>
                                )}
                            </div>
                        </CustomCard>
                    </div>
                ) : isLogs ? (
                    <Card className="bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
                        <CardHeader className="py-4 px-6 border-b border-gray-800 bg-gray-900/30 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" />
                                <span className="uppercase tracking-widest text-[10px] text-gray-500">Archivos de Registro</span>
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => fetchFiles(currentDir)} className="h-8 text-[10px] font-bold gap-2">
                                <RotateCw className="h-3 w-3" /> Actualizar
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            {isLoading ? <LoadingState /> : files.length > 0 ? (
                                <div className="divide-y divide-gray-800/50">
                                    {files.map(file => (
                                        <div
                                            key={file.name}
                                            className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                            onClick={() => handleViewLog(file.name)}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-bold text-gray-200 truncate">{file.name}</p>
                                                    <div className="flex gap-3">
                                                        <p className="text-[10px] text-gray-500 uppercase font-bold">{formatBytes(file.size)}</p>
                                                        <p className="text-[10px] text-gray-600">{new Date(file.mtime).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 h-8 text-[10px] font-black text-primary bg-primary/10 hover:bg-primary/20 rounded-lg gap-2"
                                            >
                                                <Eye className="h-3 w-3" />
                                                VER
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            ) : <EmptyState />}
                        </CardContent>
                    </Card>
                ) : null}
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
