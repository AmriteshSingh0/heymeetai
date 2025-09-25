"use client"
import { StarIcon, BotIcon, VideoIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Separator } from "@radix-ui/react-context-menu";


const firstSection = [
    {
        icon: VideoIcon,
        label: "Meetings",
        href: "/meetings"
    },
    {
        icon: BotIcon,
        label: "Agents",
        href: "/agents"
    }
]

const SecondSection = [
    {
        icon: StarIcon,
        label: "Upgrade",
        href: "/upgrade"
    }
]


import { usePathname } from "next/navigation";

export const DashboardSidebar = () => {
    const pathname = usePathname();


    return (
        <Sidebar>
            <SidebarHeader>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.svg" alt="HeyMeetAi" width={32} height={32} />
                    <p className="text-2xl font-semibold ">HeyMeetAi</p>
                </Link>
            </SidebarHeader>
            <div className="px-4 py-2">
                <Separator className=" opacity-10 text-[#5D6B68]" />
            </div>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1 px-2">
                       {firstSection.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    className={cn(
                      "w-full rounded-md px-3 py-2  ",
                      pathname === item.href &&
                        "bg-gray-800 text-white transition-colors duration-200"
                    )}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3"
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    )
}

