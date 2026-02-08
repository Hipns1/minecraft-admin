"use client";

import { Sidebar } from "@/components/dashboard/Sidebar";
import { useState } from "react";
import { Menu, Power } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 border-b border-gray-800 bg-gray-950 flex items-center justify-between px-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <Power className="h-6 w-6 text-green-500" />
                        <span className="font-bold">MC Admin</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:ml-0">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
