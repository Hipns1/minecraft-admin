import { auth } from "@/lib/auth";
import { getSystemStatus } from "@/lib/system";
import { getRconClient } from "@/lib/rcon";
import { StatusCard } from "@/components/dashboard/StatusCard";
import { ServerControls } from "@/components/dashboard/ServerControls";
import { Activity, Cpu, HardDrive, Users, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    // Fetch data
    const status = await getSystemStatus();

    let playerCount = 0;
    let maxPlayers = 0;

    if (status.active) {
        try {
            const rcon = await getRconClient();
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
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatusCard
                    title="Status"
                    value={status.active ? "Online" : "Offline"}
                    icon={Activity}
                    variant={status.active ? "success" : "destructive"}
                />
                <StatusCard
                    title="Players"
                    value={`${playerCount} / ${maxPlayers}`}
                    icon={Users}
                    subtext={status.active ? "Connected" : "Server offline"}
                />
                <StatusCard
                    title="Uptime"
                    value={status.uptime || "0s"}
                    icon={Clock}
                />
                <StatusCard
                    title="CPU / Mem"
                    value={status.active ? `${status.cpu} / ${status.memory}` : "Idle"}
                    icon={Cpu}
                    subtext={status.active ? "Current resource usage" : "Service stopped"}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4 bg-gray-950 rounded-xl border border-gray-800 p-6">
                    <h3 className="font-semibold mb-4">Server Controls</h3>
                    {/* We need a client component for controls */}
                    <ServerControls active={status.active} />
                </div>
            </div>
        </div>
    );
}


