"use client";

import {  useSuspenseQuery } from "@tanstack/react-query";
import { ErrorState } from "@/components/error-state";


import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";

export const AgentsView = () => {
  const trpc = useTRPC();
  const { data} = useSuspenseQuery(trpc.agents.getMany.queryOptions());

  
  return (
    <div>
      {JSON.stringify(data, null, 2)}
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