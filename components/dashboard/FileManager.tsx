"use client";
// File Manager Component


import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, File, ChevronRight, Loader2, FolderTree, Package, Settings as SettingsIcon, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "plugins", label: "Plugins", icon: FolderTree, description: "Manage server extensions" },
    { id: "mods", label: "Mods", icon: Package, description: "Modifications and engines" },
    { id: "config", label: "Config", icon: SettingsIcon, description: "Configuration files" },
    { id: "world", label: "World", icon: Folder, description: "World data and saves" },
];

function formatBytes(bytes: number, decimals = 2) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function FileManager() {
    const [currentDir, setCurrentDir] = useState("plugins");
    const [files, setFiles] = useState<{ name: string, isDirectory: boolean, size: number, mtime: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
        } catch (error) {
            console.error("Failed to fetch files", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles(currentDir);
    }, [currentDir]);

    return (
        <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1 space-y-3">
                {SECTIONS.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setCurrentDir(section.id)}
                        className={cn(
                            "w-full text-left p-4 rounded-xl border transition-all duration-200 group",
                            currentDir === section.id
                                ? "bg-primary/10 border-primary/50 ring-1 ring-primary/20"
                                : "bg-gray-950/40 border-gray-800 hover:border-gray-700 hover:bg-gray-900/40"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg transition-colors",
                                currentDir === section.id ? "bg-primary text-black" : "bg-gray-900 group-hover:bg-gray-800 text-gray-400"
                            )}>
                                <section.icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={cn("text-sm font-bold", currentDir === section.id ? "text-white" : "text-gray-400")}>{section.label}</p>
                                <p className="text-[10px] text-gray-500 uppercase tracking-tighter">{section.description}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            <Card className="lg:col-span-3 bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden flex flex-col shadow-2xl rounded-2xl">
                <CardHeader className="py-5 px-6 border-b border-gray-800 bg-gray-900/30">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                            <Folder className="h-4 w-4 text-primary" />
                            <span className="text-gray-500">Root /</span>
                            <span className="text-white">{currentDir}</span>
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={() => fetchFiles(currentDir)} className="h-8 text-xs font-bold gap-2">
                            <RotateCw className="h-3 w-3" /> Refresh
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4">
                            <Loader2 className="h-10 w-10 animate-spin text-primary opacity-50" />
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Scanning filesystem...</p>
                        </div>
                    ) : files.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-800/50 bg-gray-900/10">
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Name</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Size</th>
                                        <th className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Modified</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800/50">
                                    {files.map(file => (
                                        <tr key={file.name} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {file.isDirectory ? (
                                                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                                                            <Folder className="h-4 w-4" />
                                                        </div>
                                                    ) : (
                                                        <div className="p-2 rounded-lg bg-gray-800/50 text-gray-400">
                                                            {file.name.endsWith('.jar') ? <Package className="h-4 w-4 text-amber-500/70" /> : <File className="h-4 w-4" />}
                                                        </div>
                                                    )}
                                                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                                        {file.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs font-mono text-gray-500">
                                                    {file.isDirectory ? '--' : formatBytes(file.size)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-xs text-gray-600">
                                                    {new Date(file.mtime).toLocaleDateString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 gap-2 opacity-40">
                            <FolderTree className="h-12 w-12 text-gray-600" />
                            <p className="text-sm font-bold uppercase tracking-tighter text-gray-500">
                                Empty Sector Detected
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
