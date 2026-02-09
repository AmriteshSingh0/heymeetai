"use client";

import React, { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import {  useRouter } from "next/navigation";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import MeetingIdViewHeader from "../components/meeting-id-view-header";
import { useConfirm } from "@/modules/agents/hooks/use-confirm";
import { UpdateMeetingDialog } from "../components/update-meeting-dialog";
import UpcomingState from "../components/UpcomingState";
import ActiveState from "../components/ActiveState";
import ProcessingState from "../components/ProcessingState";
import CancelledState from "../components/CancelledState";
import { CompletedState } from "../components/completed-state";

interface Props {
  meetingId: string;
};

export const MeetingIdView = ({ meetingId }: Props) => {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [openUpdateMeetingDialog, setOpenUpdateMeetingDialog] = useState(false);
  const [RemoveConfirmation , confirmRemove] = useConfirm(
    "Are you sure",
    "This action wil remove this meeting permanently."
  );

  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );
  const removeMeeting = useMutation(
     trpc.meetings.remove.mutationOptions({
    onSuccess: async() => {
      queryClient.invalidateQueries(trpc.meetings.getMany.queryOptions({}));
        await queryClient.invalidateQueries(
       trpc.premium.getFreeUsage.queryOptions(), 
      );
      router.push("/meetings");
    },
    onError: () => {}
  }),
);
const handleRemoveConfirmation = async () => {
    const ok = await confirmRemove();
    if (ok) {
    await  removeMeeting.mutateAsync({ id: meetingId });
    }
    
};

  const isUpcoming = data.status === "upcoming";
  const isCancelled = data.status === "cancelled";
  const isCompleted = data.status === "completed";
  const isActive = data.status === "active";
  const isProcessing = data.status === "processing";


  return (
   <>
   <RemoveConfirmation/>
   <UpdateMeetingDialog
        open={openUpdateMeetingDialog}
        onOpenChange={setOpenUpdateMeetingDialog}
        initialValues={data}
      />
    <div className="flex-1 pb-4 px-4 md:px-8 flex flex-col  gap-y-4">
       <MeetingIdViewHeader
          onEdit={()=>setOpenUpdateMeetingDialog(true)}
          onRemove={handleRemoveConfirmation}
          meetingName={data.name}
          meetingId={data.id}
        />
       {isUpcoming && (
          <UpcomingState
            meetingId={meetingId}
            
          />
        )}
        {isActive && <ActiveState meetingId={meetingId} />}
        {isProcessing && <ProcessingState />}
        {isCompleted && <CompletedState data={data} />}
        {isCancelled && <CancelledState />}
   
   </div>
   </>
  );
};

export const MeetingsIdViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meetings"
      description="Please wait while we load your agents."
    />
  );
};
export const MeetingIdViewError = () => {
  return (
    <ErrorState
      title="Error in Meeting"
      description="There was an error please try again later"
    />
  );
};