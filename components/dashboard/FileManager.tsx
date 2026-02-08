"use client";
// File Manager Component


import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, File, Loader2, FolderTree, Package, Box, Globe, Settings, FileText, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "plugins", label: "Plugins", icon: FolderTree, description: "Manage server extensions" },
    { id: "mods", label: "Mods", icon: Package, description: "Modifications and engines" },
    { id: "plugins", label: "Plugins", icon: Package, description: "Extensiones del servidor" },
    { id: "mods", label: "Mods", icon: Box, description: "Modificadores de juego" },
    { id: "world", label: "Mundo", icon: Globe, description: "Base de datos del mapa" },
    { id: "config", label: "Configuración", icon: Settings, description: "Archivos de sistema" },
    { id: "logs", label: "Registros", icon: FileText, description: "Historial de eventos" },
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
                // Sort: Directories first, then alphabetical
                const sorted = data.files.sort((a: any, b: any) => {
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

    return (
        <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1 flex flex-row overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 lg:space-y-3 no-scrollbar scroll-smooth">
                {SECTIONS.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setCurrentDir(section.id)}
                        className={cn(
                            "flex-none lg:w-full min-w-[140px] text-left p-3 lg:p-4 rounded-xl border transition-all duration-200 group",
                            currentDir === section.id
                                ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                                : "bg-gray-950/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/40"
                        )}
                    >
                        <div className="flex items-center lg:items-center gap-3">
                            <div className={cn(
                                "p-1.5 lg:p-2 rounded-lg transition-colors",
                                currentDir === section.id ? "bg-primary text-black" : "bg-gray-900 group-hover:bg-gray-800 text-gray-400"
                            )}>
                                <section.icon className="h-4 w-4 lg:h-5 lg:w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className={cn("text-xs lg:text-sm font-bold truncate", currentDir === section.id ? "text-white" : "text-gray-400")}>{section.label}</p>
                                <p className="hidden lg:block text-[10px] text-gray-500 uppercase tracking-tighter truncate">{section.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <Card className="lg:col-span-3 bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
                <CardHeader className="py-4 lg:py-5 px-4 lg:px-6 border-b border-gray-800 bg-gray-900/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xs lg:text-sm font-bold flex items-center gap-2 truncate">
                            <Folder className="h-4 w-4 text-primary shrink-0" />
                            <span className="text-gray-500 hidden sm:inline">Raíz /</span>
                            <span className="text-white truncate">{currentDir}</span>
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => fetchFiles(currentDir)} className="h-8 text-[10px] lg:text-xs font-bold gap-2 shrink-0">
                            <RotateCw className="h-3 w-3" /> Actualizar
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0 overflow-hidden flex flex-col">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Sincronizando Datos</p>
                        </div>
                    ) : files.length > 0 ? (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead>
                                    <tr className="border-b border-gray-800/50 bg-gray-900/10">
                                        <th className="px-4 lg:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Nombre</th>
                                        <th className="px-4 lg:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Tamaño</th>
                                        <th className="px-4 lg:px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Modificado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {files.map(file => (
                                        <tr key={file.name} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                                                <div className="flex items-center gap-3">
                                                    {file.isDirectory ? (
                                                        <div className="p-1.5 lg:p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                            <Folder className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-1.5 lg:p-2 rounded-lg bg-gray-800/50 text-gray-400">
                                                            {file.name.endsWith('.jar') ? <Package className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-amber-500/70" /> : <File className="h-3.5 w-3.5 lg:h-4 lg:w-4" />}
                                                        </div>
                                                    )}
                                                    <span className="text-xs lg:text-sm font-medium text-gray-300 group-hover:text-white transition-colors truncate max-w-[120px] sm:max-w-none">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                                <span className="text-[10px] lg:text-xs font-mono text-gray-500">
                                                    {file.isDirectory ? '--' : formatBytes(file.size)}
                                                </span>
                                            </td>
                                            <td className="px-4 lg:px-6 py-3 lg:py-4 text-right">
                                                <span className="text-[10px] lg:text-xs text-gray-600">
                                                    {new Date(file.mtime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-2 opacity-30">
                            <FolderTree className="h-10 w-10 text-gray-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                Sector Vacío
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
