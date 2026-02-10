"use client";

import ConsoleInterface from "@/components/dashboard/Console";
import { FileText, ChevronRight, Clock, Loader2, Radio, History } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function LogsContent() {
    const searchParams = useSearchParams();
    const fileFromUrl = searchParams.get("file");

    const [logFiles, setLogFiles] = useState<any[]>([]);
    const [selectedFile, setSelectedFile] = useState(fileFromUrl || "latest.log");
    const [isLoadingFiles, setIsLoadingFiles] = useState(true);
    const [viewMode, setViewMode] = useState<"live" | "history">(fileFromUrl ? "history" : "live");

    const fetchLogFiles = async () => {
        try {
            const res = await fetch("/api/minecraft/files?dir=logs");
            const data = await res.json();
            if (data.files) {
                // Sort logs by date (mtime) descending
                const sorted = data.files
                    .filter((f: any) => !f.isDirectory)
                    .sort((a: any, b: any) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());
                setLogFiles(sorted);
            }
        } catch (e) {
            console.error("Error fetching log files");
        } finally {
            setIsLoadingFiles(false);
        }
    };

    useEffect(() => {
        fetchLogFiles();
    }, []);

    // Update selected file when URL param changes
    useEffect(() => {
        if (fileFromUrl) {
            setSelectedFile(fileFromUrl);
            setViewMode("history");
        }
    }, [fileFromUrl]);

    // Switch to live mode
    const handleLiveMode = () => {
        setViewMode("live");
        setSelectedFile("latest.log");
    };

    // Switch to history mode
    const handleHistoryMode = () => {
        setViewMode("history");
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter">
                            {viewMode === "live" ? "Logs en Tiempo Real" : "Historial de Registros"}
                        </h1>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex gap-2 bg-black/40 backdrop-blur-xl border border-gray-800 rounded-xl p-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleLiveMode}
                            className={cn(
                                "h-9 gap-2 rounded-lg transition-all",
                                viewMode === "live"
                                    ? "bg-primary text-black hover:bg-primary/90 font-black"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                            )}
                        >
                            <Radio className={cn("h-4 w-4", viewMode === "live" && "animate-pulse")} />
                            En Vivo
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleHistoryMode}
                            className={cn(
                                "h-9 gap-2 rounded-lg transition-all",
                                viewMode === "history"
                                    ? "bg-primary text-black hover:bg-primary/90 font-black"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                            )}
                        >
                            <History className="h-4 w-4" />
                            Historial
                        </Button>
                    </div>
                </div>
                <p className="text-gray-500 font-medium ml-12">
                    {viewMode === "live"
                        ? "Visualizando latest.log con actualización automática cada 3 segundos"
                        : "Selecciona un archivo para visualizar su contenido"}
                </p>
            </div>

            {viewMode === "live" ? (
                // Live Mode - Full width console with 3-second refresh
                <div className="h-[calc(100vh-16rem)]">
                    <ConsoleInterface readOnly mode="logs" initialFile="latest.log" refreshInterval={3000} key="live-logs" />
                </div>
            ) : (
                // History Mode - Split view
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
                    {/* Log Files Sidebar */}
                    <div className="lg:col-span-1 bg-black/40 backdrop-blur-xl border border-gray-800 rounded-xl overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-800 bg-gray-900/30 flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Archivos disponibles</span>
                        </div>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {isLoadingFiles ? (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-5 w-5 animate-spin text-primary opacity-50" />
                                </div>
                            ) : logFiles.length > 0 ? (
                                <div className="divide-y divide-gray-800/30">
                                    {logFiles.map((file) => (
                                        <button
                                            key={file.name}
                                            onClick={() => setSelectedFile(file.name)}
                                            className={cn(
                                                "w-full text-left p-3 transition-all group flex items-start gap-3",
                                                selectedFile === file.name
                                                    ? "bg-primary/10 border-l-2 border-primary"
                                                    : "hover:bg-white/[0.02] border-l-2 border-transparent"
                                            )}
                                        >
                                            <div className={cn(
                                                "mt-1 p-1.5 rounded-lg shrink-0",
                                                selectedFile === file.name ? "bg-primary text-black" : "bg-gray-900 text-gray-600 group-hover:text-gray-400"
                                            )}>
                                                <FileText className="h-3 w-3" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        "text-xs font-bold truncate",
                                                        selectedFile === file.name ? "text-white" : "text-gray-400"
                                                    )}>{file.name}</p>
                                                    {file.name.endsWith('.gz') && (
                                                        <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 shrink-0">
                                                            GZ
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Clock className="h-2.5 w-2.5 text-gray-600" />
                                                    <span className="text-[9px] font-medium text-gray-600">
                                                        {new Date(file.mtime).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center opacity-20">
                                    <FileText className="h-8 w-8 mx-auto mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Sin archivos</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Log Content Viewer */}
                    <div className="lg:col-span-3">
                        <ConsoleInterface readOnly mode="logs" initialFile={selectedFile} key={`history-${selectedFile}`} />
                    </div>
                </div>
            )}
        </div>
    );
}

export default function LogsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <LogsContent />
        </Suspense>
    );
}
