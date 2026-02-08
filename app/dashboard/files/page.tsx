import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FileManager } from "@/components/dashboard/FileManager";

export default async function FilesPage() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Files & Management</h1>
                <p className="text-gray-400 mt-2">Browse mods, plugins, and configuration files.</p>
            </div>
            <FileManager />
        </div>
    );
}
