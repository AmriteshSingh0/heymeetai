import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar";
import Image from "next/image";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { authClient } from "@/lib/auth-clients";
import { BotIcon, ChevronUp, StarIcon, VideoIcon } from "lucide-react";
import { useRouter } from "next/navigation";




export const DashboardUserButton = () => {

    const { data: session } = authClient.useSession();
    console.log(session);
    const router = useRouter();

    if (!session) {
        return (
            <SidebarMenuButton className="w-full flex items-center space-x-2 px-3 py-2 rounded-md">
                <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse" />
                <div className="flex flex-col gap-1 w-full">
                    <div className="h-4 w-3/4 rounded bg-gray-700 animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-gray-700 animate-pulse" />
                </div>
            </SidebarMenuButton>
        );
    }


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full  flex items-center space-x-2 px-3 py-2  rounded-md ">
                    {/* User Avatar */}
                    {session?.user.image ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                            <Image
                                src={session.user.image}
                                width={40}
                                height={40}
                                alt="User Image"
                                className="object-cover w-full h-full"
                                unoptimized={true}
                            />
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                            <GeneratedAvatar
                                seed={session.user.name || "Anonymous"}
                                variant="initials"
                                className="w-10 h-10"
                            />
                        </div>
                    )}

                    {/* User Info */}
                    <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-semibold truncate">
                            {session?.user.name || "Anonymous"}
                        </span>
                        <span className="text-xs text-gray-400 truncate">
                            {session?.user.email || "No email"}
                        </span>
                    </div>

                    {/* Chevron Icon */}
                    <ChevronUp className="ml-auto w-4 h-4 text-gray-400" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                className="w-[--radix-popper-anchor-width]"
            >
                <DropdownMenuItem
                    className="cursor-pointer text-center text-red-700" 
                    onClick={() => {
                        authClient.signOut({
                            fetchOptions: {
                                onSuccess: () => router.push("/sign-in"),
                            },
                        });
                    }}
                >
                    Sign out

                </DropdownMenuItem>
                <DropdownMenuItem className="bg-emerald-600 hover:bg-emerald-600  text-center cursor-pointer">Billing</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

