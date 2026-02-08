"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Terminal, Users, FileText, Settings, LogOut, Power, Shield, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "Console", href: "/dashboard/console", icon: Terminal },
    { label: "Players", href: "/dashboard/players", icon: Users },
    { label: "Security", href: "/dashboard/security", icon: Shield },
    { label: "Files & Mods", href: "/dashboard/files", icon: FolderTree },
    { label: "Logs", href: "/dashboard/logs", icon: FileText },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-full w-64 bg-gray-950 border-r border-gray-800 flex flex-col">
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                    <Power className="h-6 w-6 text-green-500" />
                    <span>MC Admin</span>
                </h1>
            </div>

            <nav className="flex-1 p-4 space-y-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-gray-800 text-white"
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
                    Sign Out
                </Button>
            </div>
        </aside>
    );
}
