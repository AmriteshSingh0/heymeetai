"use client";

import { Button } from "@/components/ui/button";
import {  PlusIcon, XCircleIcon } from "lucide-react";
import { NewAgentDialog } from "./agents-list-dialog";
import { useState } from "react";
import { useAgentsFilters } from "../../hooks/use-agent-filters";
import AgentSearchFilter from "./agents-search-filters";
import { DEFAULT_PAGE } from "@/constants";

export const AgentsListHeader = () => {

  const [isDaialogOpen, setIsDialogOpen] = useState(false);
  const [filters , setfilters] = useAgentsFilters();

  const isAnyFilterApplied = !!filters.search;

  const onClearFilters=()=>{
    setfilters({
      search: '',
      page: DEFAULT_PAGE,
    });
  }
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
      <div className="flex items-center gap-x-2 p-1">
        <AgentSearchFilter/>
        {isAnyFilterApplied && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
            <XCircleIcon />
          Clear
          </Button>
        )}
      </div>
    </div>
    </>
  );
};