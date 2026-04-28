import { Bell, Moon, Sun, Loader2 } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/layout/button";
import { SidebarTrigger } from "@/components/layout/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/layout/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/layout/avatar";
import type { RootState, AppDispatch } from "@/store";
import { toggleTheme } from "@/store/slices/uiSlice";
import { logoutUser } from "@/Pages/login/services/authSlice";

export function AppHeader() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const theme = useSelector((state: RootState) => state.ui.theme);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const { profile } = useSelector((state: RootState) => state.user);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await dispatch(logoutUser());
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 w-full items-center px-6 md:px-8 lg:px-10 relative">
        <div className="flex items-center">
          <SidebarTrigger className="-ml-3" />
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
          <span className="text-[28px] font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-800 bg-clip-text text-transparent transform hover:scale-[1.02] transition-transform duration-300">
            {/* {import.meta.env.VITE_PLATFORM_NAME} */}
            Vyapar<span style={{ color: "#ff5a1f" }}>Setu</span>
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="hidden lg:flex w-full max-w-sm items-center space-x-2">
          </div>

          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
              className="text-muted-foreground hover:text-primary transition-all duration-300 active:rotate-45"
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-background"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border-2 border-primary/10 p-0 hover:border-primary/30 transition-all">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                    <AvatarFallback>{profile?.name?.charAt(0) || "AD"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.name || "Admin User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {profile?.email || "admin@vyaparsetu.com"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => navigate("/settings")}>Settings</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 focus:text-red-500 cursor-pointer font-semibold flex items-center gap-2"
                  onSelect={(e) => {
                    e.preventDefault();
                    if (!isLoggingOut) handleLogout();
                  }}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Logging out...</span>
                    </>
                  ) : (
                    "Log out"
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
}
