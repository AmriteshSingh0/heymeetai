import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandResponsiveDialog
} from "@/components/ui/command";
import React, { Dispatch } from "react";

//import { Command } from "lucide-react";

type Props = {
  commandOpen: boolean;
  setCommandOpen: Dispatch<React.SetStateAction<boolean>>;
};

export const DashboardCommand = ({ commandOpen, setCommandOpen }: Props) => {


  
  return (
  <CommandResponsiveDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      className="rounded-lg border shadow-md md:min-w-[450px]"
    >
    <Command>
      <CommandInput
       placeholder="Type a command or Search" 
              />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>Calendar</CommandItem>
          <CommandItem>Docs</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <CommandItem>Profile</CommandItem>
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </CommandResponsiveDialog>
  );
};


