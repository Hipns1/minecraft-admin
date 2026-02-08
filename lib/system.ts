import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

const SERVICE_NAME = process.env.MC_SERVICE_NAME || "minecraft";
const LOG_FILE_PATH = process.env.MC_LOG_FILE || "/opt/minecraft/logs/latest.log";

export type ServerStatus = "online" | "offline" | "starting" | "stopping" | "unknown";

export async function getSystemStatus(): Promise<{
    active: boolean;
    uptime: string;
    cpu: string;
    memory: string;
}> {
    try {
        // Check systemd status
        const { stdout } = await execAsync(`systemctl is-active ${SERVICE_NAME}`);
        const active = stdout.trim() === "active";

        let uptime = "0";
        let cpu = "0%";
        let memory = "0%";

        if (active) {
            try {
                const { stdout: statusOutput } = await execAsync(`systemctl status ${SERVICE_NAME}`);

                // Parse Uptime
                const activeMatch = statusOutput.match(/Active: active \(running\) since (.+);/);
                if (activeMatch) {
                    const startTime = new Date(activeMatch[1]);
                    const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
                    const hours = Math.floor(diff / 3600);
                    const minutes = Math.floor((diff % 3600) / 60);
                    uptime = `${hours}h ${minutes}m`;
                }

                // Parse Memory
                const memMatch = statusOutput.match(/Memory: ([\d.]+[KMG])/);
                if (memMatch) {
                    memory = memMatch[1];
                }

                // Parse CPU (usually shows total time, but we can try to get current % if available)
                // Systemd 'CPU:' field is total CPU time. For % we might need 'top' or 'ps'.
                // Let's stick to total time or a simple ps check.
                const { stdout: psOutput } = await execAsync(`ps -C java -o %cpu,%mem --no-headers | head -n 1`);
                const psMatch = psOutput.trim().split(/\s+/);
                if (psMatch.length >= 2) {
                    cpu = `${psMatch[0]}%`;
                    // If we want more accurate memory than systemd's Memory: field
                    // memory = `${psMatch[1]}%`; 
                }
            } catch (e) {
                console.error("Error parsing system status details:", e);
            }
        }

        return { active, uptime, cpu, memory };
    } catch (error) {
        return { active: false, uptime: "0", cpu: "0%", memory: "0MB" };
    }
}

export async function controlServer(action: "start" | "stop" | "restart") {
    const allowedActions = ["start", "stop", "restart"];
    if (!allowedActions.includes(action)) {
        throw new Error("Invalid action");
    }

    // Uses sudo. Ensure the user running the web app has passwordless sudo for these specific commands.
    try {
        await execAsync(`sudo systemctl ${action} ${SERVICE_NAME}`);
        return true;
    } catch (error) {
        console.error(`Failed to ${action} server:`, error);
        throw error;
    }
}

export async function getLatestLogs(lines: number = 50): Promise<string[]> {
    try {
        // Read the last N lines of the file
        // Using 'tail' command is efficient for large files
        const { stdout } = await execAsync(`tail -n ${lines} ${LOG_FILE_PATH}`);
        return stdout.split("\n");
    } catch (error) {
        console.error("Failed to read logs:", error);
        // Fallback: try reading file directly if tail fails (e.g. windows dev env)
        try {
            const content = await fs.readFile(LOG_FILE_PATH, 'utf-8');
            return content.split('\n').slice(-lines);
        } catch (fsError) {
            return ["Error reading logs or log file not found."];
        }
    }
}
