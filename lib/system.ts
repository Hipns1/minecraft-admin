import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

const SERVICE_NAME = process.env.MC_SERVICE_NAME || "minecraft";
const LOG_FILE_PATH = process.env.MC_LOG_FILE || "/opt/minecraft/logs/latest.log";

import os from "os";

export type ServerStatus = "online" | "offline" | "starting" | "stopping" | "unknown";

import net from "net";

const RCON_HOST = process.env.RCON_HOST || "127.0.0.1";
const RCON_PORT = parseInt(process.env.RCON_PORT || "25575");

async function isPortOpen(port: number, host: string): Promise<boolean> {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        const timeout = 1000;

        socket.setTimeout(timeout);
        socket.once('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host, () => {
            socket.end();
            resolve(true);
        });
    });
}

export async function getSystemStatus(): Promise<{
    active: boolean;
    uptime: string;
    cpu: string;
    memory: string;
}> {
    let active = false;
    let uptime = "0";
    let cpu = "0%";
    let memory = "0MB";

    // Global System Stats as base
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const usedMem = totalMem - freeMem;
    const cpuLoad = os.loadavg()[0]; // 1 min load
    const cpuCount = os.cpus().length;

    // Default fallback values (Host stats)
    memory = `${Math.round(usedMem / 1024 / 1024 / 1024)}GB`;
    cpu = `${Math.round((cpuLoad / cpuCount) * 100)}%`;

    try {
        // 1. Try systemd status
        const { stdout } = await execAsync(`systemctl is-active ${SERVICE_NAME}`).catch(() => ({ stdout: "" }));
        active = stdout.trim() === "active";

        if (active) {
            try {
                const { stdout: statusOutput } = await execAsync(`systemctl status ${SERVICE_NAME}`);
                const activeMatch = statusOutput.match(/Active: active \(running\) since (.+);/);
                if (activeMatch) {
                    const startTime = new Date(activeMatch[1]);
                    const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    uptime = `${hours}h ${minutes}m`;
                }
                const memMatch = statusOutput.match(/Memory: ([\d.]+[KMG])/);
                if (memMatch) memory = memMatch[1];

                const { stdout: psOutput } = await execAsync(`ps -C java -o %cpu,%mem --no-headers | head -n 1`).catch(() => ({ stdout: "" }));
                const psMatch = psOutput.trim().split(/\s+/);
                if (psMatch.length >= 2) cpu = `${psMatch[0]}%`;
            } catch (e) {
                // Keep the global stats if specific process stats fail
            }
        } else {
            // 2. Fallback: Check if RCON port is open (Useful for Docker)
            const rconOpen = await isPortOpen(RCON_PORT, RCON_HOST);
            if (rconOpen) {
                active = true;
                uptime = "En ejecución (Contenedor)";
            }
        }

        return { active, uptime, cpu, memory };
    } catch (error) {
        // Last resort fallback
        const rconOpen = await isPortOpen(RCON_PORT, RCON_HOST);
        return { active: rconOpen, uptime: rconOpen ? "En línea" : "0", cpu, memory };
    }
}

const CONTROL_METHOD = process.env.MC_CONTROL_METHOD || "systemd";
const CONTAINER_NAME = process.env.MC_CONTAINER_NAME || "minecraft_server";

export async function controlServer(action: "start" | "stop" | "restart") {
    const allowedActions = ["start", "stop", "restart"];
    if (!allowedActions.includes(action)) {
        throw new Error("Invalid action");
    }

    try {
        if (CONTROL_METHOD === "docker") {
            const command = action === "restart" ? `docker restart ${CONTAINER_NAME}` :
                action === "stop" ? `docker stop ${CONTAINER_NAME}` :
                    `docker start ${CONTAINER_NAME}`;
            await execAsync(command);
        } else if (os.platform() === 'win32') {
            // Basic fallback for Windows development
            console.log(`[DEV] Mocking ${action} on Windows`);
        } else {
            // Default systemd
            await execAsync(`sudo systemctl ${action} ${SERVICE_NAME}`);
        }
        return true;
    } catch (error) {
        console.error(`Failed to ${action} server using ${CONTROL_METHOD}:`, error);
        throw error;
    }
}

export async function getLatestLogs(lines: number = 50, fileName: string = "latest.log"): Promise<string[]> {
    const customLogPath = path.join(path.dirname(LOG_FILE_PATH), fileName);
    try {
        const { stdout } = await execAsync(`tail -n ${lines} ${customLogPath}`);
        return stdout.split("\n");
    } catch (error) {
        console.error("Failed to read logs:", error);
        try {
            const content = await fs.readFile(customLogPath, 'utf-8');
            return content.split('\n').slice(-lines);
        } catch (fsError) {
            return ["Error reading logs or log file not found."];
        }
    }
}
