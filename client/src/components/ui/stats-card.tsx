import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  change?: {
    value: string;
    positive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon,
  iconBgColor = "bg-temple-accent",
  change,
  subtitle,
  className
}: StatsCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", iconBgColor)}>
            {icon}
          </div>
        </div>
        {change && (
          <p className={cn(
            "text-sm mt-2",
            change.positive ? "text-green-600" : "text-red-600"
          )}>
            <i className={cn(
              "fas mr-1",
              change.positive ? "fa-arrow-up" : "fa-arrow-down"
            )}></i>
            {change.value}
          </p>
        )}
        {subtitle && (
          <p className="text-sm text-gray-600 mt-2">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}
