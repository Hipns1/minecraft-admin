
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
        default: "text-gray-400 group-hover:text-white",
        success: "text-emerald-500",
        warning: "text-amber-500",
        destructive: "text-rose-500",
    }

    const glowStyles = {
        default: "group-hover:shadow-[0_0_20px_-12px_rgba(255,255,255,0.3)]",
        success: "shadow-[0_0_20px_-12px_rgba(16,185,129,0.3)]",
        warning: "shadow-[0_0_20px_-12px_rgba(245,158,11,0.3)]",
        destructive: "shadow-[0_0_20px_-12px_rgba(244,63,94,0.3)]",
    }

    return (
        <Card className={`relative overflow-hidden bg-black/40 backdrop-blur-xl border-gray-800 transition-all duration-300 group ${glowStyles[variant]}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-500 group-hover:text-gray-400 transition-colors">
                    {title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gray-900/50 border border-gray-800 transition-colors ${variantStyles[variant]}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-black tracking-tight mb-1">{value}</div>
                {subtext && (
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-600">
                        {subtext}
                    </p>
                )}
            </CardContent>

            {/* Background Accent */}
            <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${variant === 'success' ? 'bg-emerald-500' :
                    variant === 'destructive' ? 'bg-rose-500' :
                        variant === 'warning' ? 'bg-amber-500' : 'bg-gray-400'
                }`} />
        </Card>
    );
}
