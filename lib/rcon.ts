import { Rcon } from "rcon-client";

// Global variable to maintain connection in development (HMR)
declare global {
    var rconClient: Rcon | undefined;
}

const RCON_HOST = process.env.RCON_HOST || "localhost";
const RCON_PORT = parseInt(process.env.RCON_PORT || "25575");
const RCON_PASSWORD = process.env.RCON_PASSWORD || "";

export async function getRconClient() {
    if (global.rconClient && global.rconClient.authenticated) {
        return global.rconClient;
    }

    try {
        const rcon = await Rcon.connect({
            host: RCON_HOST,
            port: RCON_PORT,
            password: RCON_PASSWORD,
        });

        global.rconClient = rcon;

        rcon.on("end", () => {
            console.log("RCON connection closed");
            global.rconClient = undefined;
        });

        rcon.on("error", (err) => {
            console.error("RCON error:", err);
            global.rconClient = undefined;
        });

        return rcon;
    } catch (error) {
        console.error("Failed to connect to RCON:", error);
        throw new Error("Could not connect to Minecraft Server RCON");
    }
}

export async function sendRconCommand(command: string): Promise<string> {
    let client;
    try {
        client = await getRconClient();
        const response = await client.send(command);
        return response;
    } catch (error) {
        console.error(`Error sending command "${command}":`, error);
        // Attempt reconnect once
        if (global.rconClient) {
            global.rconClient = undefined;
            try {
                client = await getRconClient();
                return await client.send(command);
            } catch (retryError) {
                throw new Error(`Failed to execute command: ${command}`);
            }
        }
        throw error;
    }
}
