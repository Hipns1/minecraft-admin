
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatusCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    subtext?: string;
    variant?: "default" | "success" | "warning" | "destructive";
}

export function StatusCard({ title, value, icon: Icon, subtext, variant = "default" }: StatusCardProps) {
    const variantStyles = {
        default: "text-gray-100",
        success: "text-green-500",
        warning: "text-yellow-500",
        destructive: "text-red-500",
    }

    return (
        <Card className="bg-gray-950 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-gray-400">
                    {title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${variantStyles[variant]}`} />
            </CardHeader>
            <CardContent>
                <div className={`text-2xl font-bold ${variantStyles[variant]}`}>{value}</div>
                {subtext && (
                    <p className="text-xs text-gray-500 mt-1">
                        {subtext}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
