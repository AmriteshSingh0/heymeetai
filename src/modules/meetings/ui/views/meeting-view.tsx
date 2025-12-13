"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { useTRPC } from "@/trpc/client";
import {  useSuspenseQuery } from "@tanstack/react-query";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.meetings.getMany.queryOptions({}));

  return (
    <div>
      TODO:Data table
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