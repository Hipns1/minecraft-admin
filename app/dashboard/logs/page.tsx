
import ConsoleInterface from "@/components/dashboard/Console";

export default function LogsPage() {
    return (
        <div className="space-y-6 h-full">
            <h1 className="text-3xl font-bold">System Logs</h1>
            <p className="text-gray-400">Viewing content of latest.log</p>
            <ConsoleInterface readOnly />
        </div>
    );
}
