"use client";

import { Button } from "@/components/ui/button";
import {  PlusIcon } from "lucide-react";
import { NewAgentDialog } from "./agents-list-dialog";
import { useState } from "react";

export const AgentsListHeader = () => {

  const [isDaialogOpen, setIsDialogOpen] = useState(false);
  return (
    <>
    <NewAgentDialog
    open={isDaialogOpen}
    onOpenChange={setIsDialogOpen}
    />
    <div className="py-4 px-4 md:px-8 flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <h5>My Agents</h5>
        <Button onClick={()=> setIsDialogOpen(true)} >
          <PlusIcon className="mr-2 h-4 w-4" />
          New Agent
        </Button>
      </div>
    </div>
    </>
  );
};