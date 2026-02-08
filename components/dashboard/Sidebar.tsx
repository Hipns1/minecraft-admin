"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Terminal, Users, FileText, Settings, LogOut, Power, Shield, FolderTree, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { label: "Resumen", href: "/dashboard", icon: LayoutDashboard },
    { label: "Consola", href: "/dashboard/console", icon: Terminal },
    { label: "Jugadores", href: "/dashboard/players", icon: Users },
    { label: "Archivos & Mods", href: "/dashboard/files", icon: FolderTree },
    { label: "Registros", href: "/dashboard/logs", icon: FileText },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-gray-950 border-r border-gray-800 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                        <Power className="h-6 w-6 text-green-500" />
                        <span>MC Admin</span>
                    </h1>
                    <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/20 text-primary border border-primary/20"
                                        : "text-gray-400 hover:text-white hover:bg-gray-900"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/20"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-5 w-5" />
                        Cerrar Sesión
                    </Button>
                </div>
            </aside>
        </>
    );
}
