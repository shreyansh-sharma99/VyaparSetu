import {
  User,
  Settings,
  ChevronRight,
  LayoutDashboard,
  Building2,
  UserCheck,
  IndianRupee,
  CreditCard,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/layout/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/layout/collapsible";
import { Link } from "react-router-dom";

interface SubItem {
  title: string;
  icon: React.ElementType;
  url: string;
  isActive?: boolean;
}

interface MenuItem {
  title: string;
  icon: React.ElementType;
  url: string;
  isActive?: boolean;
  subItems?: SubItem[];
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard Overview",
    icon: LayoutDashboard,
    url: "/",
    isActive: true,
  },
  // {
  //   title: "User",
  //   icon: User,
  //   url: "#",
  //   subItems: [
  //     { title: "BA", icon: UserCheck, url: "#" },
  //     { title: "Company", icon: Building2, url: "#" },
  //   ],
  // },
  {
    title: "Admin",
    icon: User,
    url: "#",
    subItems: [
      { title: "Admin", icon: UserCheck, url: "/Admin" },
      { title: "Admin Management", icon: Building2, url: "/AdminManagement" },
    ],
  },
  {
    title: "Plans",
    icon: IndianRupee,
    url: "/Plans",
  },
  {
    title: "Subscriptions",
    icon: CreditCard,
    url: "/Subscriptions",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
];

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProfile } from "@/Pages/login/services/userSlice";
import type { RootState, AppDispatch } from "@/store";
import { useLocation } from "react-router-dom";

export function AppSidebar() {
  const dispatch = useDispatch<AppDispatch>();
  const { profile } = useSelector((state: RootState) => state.user);
  const location = useLocation();

  React.useEffect(() => {
    if (!profile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, profile]);

  const isItemActive = (url: string) => {
    if (url === "/" || url === "#") return location.pathname === url;
    return location.pathname === url || location.pathname.startsWith(url + "/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r bg-sidebar/50 backdrop-blur-xl">
      <SidebarHeader className="h-32 group-data-[collapsible=icon]:h-16 group-data-[collapsible=icon]:mt-0 flex items-center justify-center p-0 overflow-hidden mt-2">
        <div className="flex items-center w-full h-full">
          <div className="flex items-center justify-center w-full h-full group-data-[collapsible=icon]:hidden">
            <img
              src="/image/logos/bgLessLogo.png"
              alt="Logo"
              className="w-full h-full object-contain brightness-110 contrast-125 transition-all duration-300 hover:scale-105"
            />
          </div>

          <div className="hidden group-data-[collapsible=icon]:flex h-full w-full items-start pt-2 justify-center">
            <img
              src="/image/logos/bglessHeroIcon.png"
              alt="Hero Icon"
              className="w-full h-auto px-2 object-contain transition-all duration-300 hover:scale-110"
            />
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground/60 group-data-[collapsible=icon]:hidden mb-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-2 group-data-[collapsible=icon]:items-center">
              {menuItems.map((item) => {
                const isParentActive = item.subItems
                  ? item.subItems.some(sub => isItemActive(sub.url))
                  : isItemActive(item.url);

                return (
                  <div key={item.title}>
                    {item?.subItems ? (
                      <Collapsible
                        asChild
                        defaultOpen={isParentActive}
                        className="group/collapsible"
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} isActive={isParentActive}>
                              <item.icon className="h-[18px] w-[18px]" />
                              <span>{item.title}</span>
                              <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90 opacity-70 group-hover:opacity-100 group-data-[collapsible=icon]:hidden" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden">
                            <SidebarMenuSub className="mt-1.5 ml-5 border-l-2 border-primary/10">
                              {item.subItems.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title} className="group/menu-sub-item">
                                  <SidebarMenuSubButton asChild isActive={isItemActive(subItem.url)}>
                                    <Link to={subItem.url} className="flex items-center gap-3">
                                      <subItem.icon className="h-4 w-4 opacity-70 z-999999 group-hover/menu-sub-item:opacity-100" />
                                      <span>{subItem.title}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ) : (
                      <SidebarMenuItem>
                        <SidebarMenuButton asChild tooltip={item.title} isActive={isItemActive(item.url)}>
                          <Link to={item.url}>
                            <item.icon className="h-[18px] w-[18px]" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )}
                  </div>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 bg-transparent p-4 group-data-[collapsible=icon]:p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <div className="h-9 w-9 rounded-full bg-[#8A7BFE] flex shrink-0 items-center justify-center text-white text-sm font-semibold shadow-sm">
            {profile?.name?.charAt(0)?.toUpperCase() || "P"}
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-[13px] font-semibold text-sidebar-foreground truncate max-w-[130px] leading-tight">
              {profile?.name || "Platform Owner"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
              {profile?.role || "OWNER"}
            </span>

          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
