import { auth } from "@/lib/auth";
import { getSystemStatus } from "@/lib/system";
import { getRconClient } from "@/lib/rcon";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ServerControls } from "@/components/dashboard/ServerControls";
import { Activity, Cpu, HardDrive, Users, Clock, Shield, FolderTree, Terminal as TerminalIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    // Fetch data
    const status = await getSystemStatus();

    let playerCount = 0;
    let maxPlayers = 0;
    let version = "Unknown";

    if (status.active) {
        try {
            const rcon = await getRconClient();

            // Fetch version
            const versionResponse = await rcon.send("version");
            const versionMatch = versionResponse.match(/MC: ([\d.]+)/);
            if (versionMatch) {
                version = versionMatch[1];
            } else {
                version = versionResponse.split("\n")[0].replace(/§[0-9a-fk-or]/gi, "").substring(0, 20).trim();
            }

            const listResponse = await rcon.send("list");
            const match = listResponse.match(/(\d+) of a max of (\d+)/);
            if (match) {
                playerCount = parseInt(match[1]);
                maxPlayers = parseInt(match[2]);
            }
        } catch (e) {
            console.error("RCON failed in dashboard", e);
        }
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Centro de Comando</h1>
                    <p className="text-gray-500 font-medium">Monitoreando operaciones de {process.env.MC_SERVICE_NAME || "Minecraft"}</p>
                </div>
                <div className="flex items-center gap-3 bg-gray-950/50 p-1.5 rounded-xl border border-gray-800">
                    <div className={cn(
                        "h-2 w-2 rounded-full animate-pulse ml-2",
                        status.active ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                    )} />
                    <span className="text-xs font-bold uppercase tracking-widest pr-2">
                        Sistema {status.active ? "En Línea" : "En Espera"}
                    </span>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                    title="Versión de Instancia"
                    value={status.active ? version : "Desconectado"}
                    icon={Shield}
                    variant={status.active ? "success" : "destructive"}
                    subtext={status.active ? "Versión Estable" : "Núcleo Suspendido"}
                />
                <StatusCard
                    title="Entidades Activas"
                    value={`${playerCount} / ${maxPlayers}`}
                    icon={Users}
                    variant={status.active && playerCount > 0 ? "warning" : "default"}
                    subtext={`${playerCount} usuarios sincronizados`}
                />
                <StatusCard
                    title="Persistencia"
                    value={status.uptime || "0s"}
                    icon={Clock}
                    subtext="Tiempo de operación continua"
                />
                <StatusCard
                    title="Carga del Sistema"
                    value={status.active ? `${status.cpu}` : "0%"}
                    icon={Cpu}
                    subtext={`Memoria: ${status.memory}`}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-full lg:col-span-4 space-y-6">
                    <Card className="bg-black/40 backdrop-blur-xl border-gray-800 overflow-hidden rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-gray-800 bg-gray-900/50">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <TerminalIcon className="h-5 w-5 text-primary" />
                                Gestión de Energía
                            </h3>
                        </div>
                        <div className="p-8">
                            <ServerControls active={status.active} />
                        </div>
                    </Card>
                </div>

                <div className="col-span-full lg:col-span-3">
                    <Card className="h-full bg-black/40 backdrop-blur-xl border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                            <h3 className="text-lg font-bold">Acciones Rápidas</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 gap-3">
                            <QuickAction icon={Shield} label="Seguridad" href="/dashboard/players" color="text-amber-500" />
                            <QuickAction icon={FolderTree} label="Archivos" href="/dashboard/files" color="text-blue-500" />
                            <QuickAction icon={Users} label="Usuarios" href="/dashboard/players" color="text-emerald-500" />
                            <QuickAction icon={TerminalIcon} label="Consola" href="/dashboard/console" color="text-primary" />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function QuickAction({ icon: Icon, label, href, color }: { icon: any, label: string, href: string, color: string }) {
    return (
        <a href={href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-800 bg-gray-900/40 hover:bg-gray-800/60 hover:border-gray-700 transition-all group">
            <Icon className={cn("h-6 w-6 mb-2 transition-transform group-hover:scale-110", color)} />
            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-500 group-hover:text-white">{label}</span>
        </a>
    );
}


