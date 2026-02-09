import {
 // Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
 // CommandSeparator,
  CommandResponsiveDialog
} from "@/components/ui/command";
import React, { Dispatch } from "react";
import { useRouter } from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import { useState} from "react";
//import { useTRPC } from "@/trpc/client";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { useTRPC } from "@/trpc/client";
// import { trpc } from "@/trpc/server";

//import { Command } from "lucide-react";

type Props = {
  commandOpen: boolean;
  setCommandOpen: Dispatch<React.SetStateAction<boolean>>;
};

export const DashboardCommand = ({ commandOpen, setCommandOpen }: Props) => {

const router = useRouter();
const [search, setSearch] = useState("");
    const trpc = useTRPC();
  const meetings = useQuery(
        trpc.meetings.getMany.queryOptions({
            search,
            pageSize: 100,
        })
    );

    const agents = useQuery(
        trpc.agents.getMany.queryOptions({
            search,
            pageSize: 100,
        })
    );

  return (
        <CommandResponsiveDialog shouldFilter={false} open={commandOpen} onOpenChange={setCommandOpen}>
            <CommandInput
            placeholder="Find a meeting or agent..."
            value={search}
            onValueChange={(value) => {
                setSearch(value);
            }}
            />
            <CommandList>
                <CommandGroup heading="Meetings">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No meetings found
                        </span>
                    </CommandEmpty>
                    {meetings.data?.items.map((meeting) => (
                        <CommandItem onSelect={() => {
                            setCommandOpen(false);
                            router.push(`/meetings/${meeting.id}`);
                        }} key={meeting.id}>
                            {meeting.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Agents">
                    <CommandEmpty>
                        <span className="text-muted-foreground text-sm">
                            No agents found
                        </span>
                    </CommandEmpty>
                    {agents.data?.items.map((agent) => (
                        <CommandItem onSelect={() => {
                            setCommandOpen(false);
                            router.push(`/agents/${agent.id}`);
                        }} key={agent.id}>
                            <GeneratedAvatar
                                seed={agent.name}
                                variant="botttsNeutral"
                                className="size-5"
                            />
                            {agent.name}
                        </CommandItem>
                    ))}
                </CommandGroup>
            </CommandList>
        </CommandResponsiveDialog>
    );
};


