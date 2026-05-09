import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface DashboardCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
}

export function DashboardCard({ title, icon: Icon, href }: DashboardCardProps) {
  return (
    <Link href={href} className="block group">
      <Card className="overflow-hidden transition-all hover:shadow-md border-2 border-transparent hover:border-blue-200">
        <CardHeader className="bg-blue-600 py-3 px-4">
          <CardTitle className="text-white text-sm font-medium tracking-wide truncate">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8 bg-white group-hover:bg-slate-50 transition-colors">
          <Icon className="h-12 w-12 text-slate-900" />
        </CardContent>
      </Card>
    </Link>
  );
}
