"use client";
// File Manager Component


import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, File, ChevronRight, Loader2, FolderTree, Package, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
    { id: "mods", label: "Mods", icon: Package },
    { id: "plugins", label: "Plugins", icon: FolderTree },
    { id: "config", label: "Config", icon: SettingsIcon },
];

export default function FileManager() {
    const [currentDir, setCurrentDir] = useState("mods");
    const [files, setFiles] = useState<{ name: string, isDirectory: boolean }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFiles = async (dir: string) => {
        setIsLoading(true);
        try {
            const res = await fetch(`/api/minecraft/files?dir=${dir}`);
            const data = await res.json();
            if (data.files) {
                setFiles(data.files);
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
        <div className="grid gap-6 md:grid-cols-4">
            <div className="md:col-span-1 space-y-2">
                {SECTIONS.map(section => (
                    <Button
                        key={section.id}
                        variant={currentDir === section.id ? "default" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => setCurrentDir(section.id)}
                    >
                        <section.icon className="h-4 w-4" />
                        {section.label}
                    </Button>
                ))}
            </div>

            <Card className="md:col-span-3 bg-gray-950 border-gray-800">
                <CardHeader className="py-4 border-b border-gray-800">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Folder className="h-4 w-4 text-blue-400" />
                        /{currentDir}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : files.length > 0 ? (
                        <div className="divide-y divide-gray-800">
                            {files.map(file => (
                                <div key={file.name} className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-default group">
                                    {file.isDirectory ? (
                                        <Folder className="h-4 w-4 text-blue-400" />
                                    ) : (
                                        <File className="h-4 w-4 text-gray-400" />
                                    )}
                                    <span className="text-sm flex-1">{file.name}</span>
                                    {!file.isDirectory && (
                                        <span className="text-[10px] text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Read-only
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            No files found in this directory.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
