import ConsoleInterface from "@/components/dashboard/Console";
import { FileText } from "lucide-react";

export default function LogsPage() {
    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-xl bg-primary/10 text-primary">
                        <FileText className="h-6 w-6" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter">Registros del Sistema</h1>
                </div>
                <p className="text-gray-500 font-medium ml-12">Visualizando contenido en tiempo real de latest.log</p>
            </div>

            <ConsoleInterface readOnly mode="logs" />
        </div>
    );
}
