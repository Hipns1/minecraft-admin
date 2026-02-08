import ConsoleInterface from "@/components/dashboard/Console";
import { Terminal } from "lucide-react";

export default function ConsolePage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <Terminal className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Consola de Comandos</h1>
                </div>
                <p className="text-gray-500 font-medium ml-12">Interacción directa con la instancia del servidor</p>
            </div>

            <ConsoleInterface mode="console" />
        </div>
    );
}
