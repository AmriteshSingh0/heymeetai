"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { DataTable } from "@/modules/agents/ui/components/data-tables";
import { useTRPC } from "@/trpc/client";
import {  useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <div>
      <DataTable data={data.items} columns={columns}/>
    </div>
  );
};

export const MeetingsViewLoading = ()=>{
    return (
        <LoadingState
        title="Loading Meetings"
        description="Please wait while we load your agents."
        />
    )
}
 export const MeetingViewError = () => {
 return (
     <ErrorState
     title="Error in Meeting"
     description="There was an error please try again later"
     />
 
   
   );
  }