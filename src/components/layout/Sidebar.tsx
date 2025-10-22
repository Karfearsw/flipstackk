"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc-client";
import {
  Home,
  Users,
  Building,
  CheckSquare,
  FileText,
  BarChart3,
  Settings,
  UserPlus,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  
  // Get task notifications
  const { data: overdueTasks = [] } = trpc.tasks.getOverdueTasks.useQuery();
  const { data: todayTasks = [] } = trpc.tasks.getTasksDueToday.useQuery();
  
  const taskNotificationCount = overdueTasks.length + todayTasks.length;

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      current: false,
    },
    {
      name: "Leads",
      href: "/leads",
      icon: UserPlus,
      current: false,
      badge: "New",
    },
    {
      name: "Buyers",
      href: "/buyers",
      icon: Users,
      current: false,
    },
    {
      name: "Properties",
      href: "/properties",
      icon: Building,
      current: false,
    },
    {
      name: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
      current: false,
      badge: taskNotificationCount > 0 ? taskNotificationCount.toString() : undefined,
    },
    {
      name: "Offers",
      href: "/offers",
      icon: FileText,
      current: false,
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart3,
      current: false,
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      current: false,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
        <div className="flex flex-1 flex-col">
          <nav className="flex-1 space-y-1 px-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    isActive
                      ? "bg-red-50 border-red-600 text-red-700"
                      : "border-transparent text-black hover:bg-gray-50 hover:text-red-600",
                    "group flex items-center px-2 py-2 text-sm font-medium border-l-4 transition-colors duration-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? "text-red-600"
                        : "text-gray-600 group-hover:text-red-600",
                      "mr-3 h-5 w-5 flex-shrink-0"
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-2 text-xs",
                        item.name === "Tasks" && taskNotificationCount > 0
                          ? "bg-red-100 text-red-800"
                          : "bg-black text-white"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="flex flex-shrink-0 border-t border-gray-200 p-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-xs font-medium text-black">
              Flipstackk CRM v3.0
            </p>
            <p className="text-xs font-medium text-gray-600">
              Real Estate Management
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}