"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, X, Download, CheckCircle2, XCircle, Package, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModrinthProject {
    id: string;
    slug: string;
    name: string;
    description: string;
    downloads: number;
    iconUrl: string;
    type: "mod" | "plugin";
    categories: string[];
    supportedVersions: string[];
}

interface SearchModsDialogProps {
    type: "mods" | "plugins";
    onClose: () => void;
    onInstallSuccess: () => void;
}

export function SearchModsDialog({ type, onClose, onInstallSuccess }: SearchModsDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [mcVersion, setMcVersion] = useState("1.19.2");
    const [loader, setLoader] = useState(type === "mods" ? "fabric" : "paper");
    const [results, setResults] = useState<ModrinthProject[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [installing, setInstalling] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Auto-hide notification
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const params = new URLSearchParams({
                query: searchQuery,
                mcVersion,
                loader,
                limit: "20"
            });

            const res = await fetch(`/api/minecraft/search-mods?${params}`);
            const data = await res.json();

            if (res.ok) {
                setResults(data.projects || []);
            } else {
                setNotification({ type: 'error', message: data.error || 'Error al buscar' });
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Error de conexión' });
        } finally {
            setIsSearching(false);
        }
    };

    const handleInstall = async (project: ModrinthProject) => {
        setInstalling(project.slug);
        try {
            const res = await fetch('/api/minecraft/manage-plugin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectSlug: project.slug,
                    mcVersion,
                    loader,
                    type
                })
            });

            const data = await res.json();

            if (res.ok) {
                setNotification({ type: 'success', message: data.message });
                onInstallSuccess();
            } else {
                setNotification({ type: 'error', message: data.error });
            }
        } catch (e) {
            setNotification({ type: 'error', message: 'Error de conexión' });
        } finally {
            setInstalling(null);
        }
    };

    // Trigger search on Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const loaderOptions = type === "mods"
        ? ["fabric", "forge", "quilt"]
        : ["paper", "spigot", "bukkit", "purpur"];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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

            <Card className="bg-gray-950 border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <CardHeader className="border-b border-gray-800 bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Buscar {type === "mods" ? "Mods" : "Plugins"} en Modrinth
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={onClose}>
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                Versión de Minecraft
                            </label>
                            <Input
                                value={mcVersion}
                                onChange={(e) => setMcVersion(e.target.value)}
                                placeholder="1.19.2"
                                className="bg-black/40 border-gray-700"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                Loader
                            </label>
                            <select
                                value={loader}
                                onChange={(e) => setLoader(e.target.value)}
                                className="w-full h-10 px-3 rounded-md bg-black/40 border border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                {loaderOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                                Buscar
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Nombre del mod/plugin..."
                                    className="pl-10 bg-black/40 border-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="w-full mt-3 bg-primary hover:bg-primary/90 text-black font-black"
                    >
                        {isSearching ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Buscando...
                            </>
                        ) : (
                            <>
                                <Search className="mr-2 h-4 w-4" />
                                Buscar en Modrinth
                            </>
                        )}
                    </Button>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-y-auto">
                    {results.length === 0 && !isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30">
                            <Search className="h-16 w-16 mb-4" />
                            <p className="text-sm font-bold">Busca mods/plugins en Modrinth</p>
                            <p className="text-xs text-gray-600 mt-1">Resultados en tiempo real desde la API oficial</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-800/50">
                            {results.map((project) => (
                                <div key={project.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                                    <div className="flex gap-4">
                                        {project.iconUrl && (
                                            <img
                                                src={project.iconUrl}
                                                alt={project.name}
                                                className="w-16 h-16 rounded-lg object-cover shrink-0"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="font-bold text-white">{project.name}</h3>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {project.downloads.toLocaleString()} descargas
                                                    </p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleInstall(project)}
                                                    disabled={installing === project.slug}
                                                    className="bg-primary hover:bg-primary/90 text-black font-black shrink-0"
                                                >
                                                    {installing === project.slug ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Download className="mr-2 h-4 w-4" />
                                                            Instalar
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                            <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {project.categories.slice(0, 4).map(cat => (
                                                    <span
                                                        key={cat}
                                                        className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-400"
                                                    >
                                                        {cat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
