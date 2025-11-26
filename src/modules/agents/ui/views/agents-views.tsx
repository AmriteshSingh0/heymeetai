"use client";

import {  useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";
//import {ResponsiveDialog} from "@/components/reponsive-dialog";

import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { DataTable } from "../components/data-tables";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data} = useSuspenseQuery(trpc.agents.getMany.queryOptions({}));

  
  return (
     <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col gap-y-4">
        <DataTable data={data.items} columns={columns} />
        {data.items.length === 0 && (
          <EmptyState
           title="Create your first agent"
           description="Create an agent to join your meetings. Each agent will follow your instructions and can interact with participants during the call."
          />
        )}
     </div>
  );
};

export const AgentsViewLoading = ()=>{
    return (
        <LoadingState
        title="Loading Agents"
        description="Please wait while we load your agents."
        />
    )
}
 export const AgentsViewError = () => {
 return (
     <ErrorState
     title="Error in loading"
     description="There was an error please try again later"
     />
 
   
   );
  }