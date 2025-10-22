"use client";

import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StatusHeader } from "@/components/monitoring/status-header";
import { LogOut, Settings, User } from "lucide-react";

export function Header() {
  const { data: session } = useSession();

  const handleSignOut = () => {
    // Clear guest access if present
    localStorage.removeItem('guestAccess');
    localStorage.removeItem('guestUser');
    signOut({ callbackUrl: "/login" });
  };

  const handleGuestSignOut = () => {
    localStorage.removeItem('guestAccess');
    localStorage.removeItem('guestUser');
    window.location.href = '/login';
  };

  const getUserInitials = (username: string) => {
    return username
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "ACQUISITIONS":
        return "bg-black text-white hover:bg-gray-800";
      case "SALES":
        return "bg-gray-100 text-black hover:bg-gray-200";
      default:
        return "bg-gray-100 text-black hover:bg-gray-200";
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-black">Flipstackk 3.0</h1>
          <Badge variant="outline" className="text-xs border-gray-300 text-black">
            CRM System
          </Badge>
          <StatusHeader 
            variant="flag" 
            showTooltip={true}
            className="ml-2"
          />
        </div>

        <div className="flex items-center space-x-4">
          {session?.user ? (
            <>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome back,</span>
                <span className="text-sm font-medium text-black">
                  {session.user.username}
                </span>
                <Badge
                  variant="secondary"
                  className={getRoleBadgeColor(session.user.role)}
                >
                  {session.user.role}
                </Badge>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-red-600 text-white text-xs">
                        {getUserInitials(session.user.username)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.username}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Guest user display
            (() => {
              const guestAccess = typeof window !== 'undefined' ? localStorage.getItem('guestAccess') : null;
              const guestUser = typeof window !== 'undefined' ? localStorage.getItem('guestUser') : null;
              
              if (guestAccess === 'true' && guestUser) {
                const guest = JSON.parse(guestUser);
                return (
                  <>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Welcome,</span>
                      <span className="text-sm font-medium text-black">
                        {guest.username}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-gray-100 text-black hover:bg-gray-200"
                      >
                        GUEST
                      </Badge>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-gray-100">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-black text-white text-xs">
                              GU
                            </AvatarFallback>
                          </Avatar>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {guest.username}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              Guest Access
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleGuestSignOut}>
                          <LogOut className="mr-2 h-4 w-4" />
                          <span>Exit Guest Mode</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                );
              }
              return null;
            })()
          )}
        </div>
      </div>
    </header>
  );
}