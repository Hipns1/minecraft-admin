import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import SecurityManager from "@/components/dashboard/SecurityManager";

export default async function SecurityPage() {
    const session = await auth();
    if (!session) {
        redirect("/");
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Security & Access</h1>
                <p className="text-gray-400 mt-2">Manage whitelist, bans, and operator status.</p>
            </div>
            <SecurityManager />
        </div>
    );
}
