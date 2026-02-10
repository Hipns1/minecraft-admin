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
    { id: "logs", label: "Registros", icon: FileText },
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

    const handleAdd = async (pluginName: string) => {
        setActionLoading(pluginName);
        try {
            const res = await fetch('/api/minecraft/manage-plugin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pluginName, type: currentDir })
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ type: 'success', message: data.message || `${pluginName} instalado correctamente` });
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
    const isLogs = currentDir === "logs";

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

                            {/* Available Section */}
                            <CustomCard title={`Buscar en Modrinth`} icon={<Search className="h-4 w-4" />}>
                                <div className="p-8 flex flex-col items-center justify-center text-center gap-6">
                                    <div className="p-4 rounded-full bg-primary/10 text-primary">
                                        <Package className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black text-white">¿Buscas algo nuevo?</h3>
                                        <p className="text-sm text-gray-500 max-w-[280px] mx-auto">
                                            Explora miles de {currentDir === "plugins" ? "plugins" : "mods"} directamente desde la API oficial de Modrinth.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => setShowSearchDialog(true)}
                                        className="w-full max-w-[200px] bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-xl shadow-lg shadow-primary/20"
                                    >
                                        <Search className="mr-2 h-5 w-5" />
                                        BUSCAR {currentDir.toUpperCase()}
                                    </Button>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                                        Resultados en tiempo real • API Oficial
                                    </p>
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
