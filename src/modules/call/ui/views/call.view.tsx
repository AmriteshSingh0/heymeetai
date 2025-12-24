"use client";

import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import React from "react";
import CallProvider from "../components/CallProvider";
import { ErrorState } from "@/components/error-state";

interface Props {
  meetingId: string;
}

const CallView = ({ meetingId }: Props) => {

  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.meetings.getOne.queryOptions({ id: meetingId })
  );
  console.log("The meeting is: " , data);

  if (data.status === "completed") {
    return (
      <div className="flex h-screen justify-center items-center">
        <ErrorState
          title="This Meeting has ended"
          description="you can no longer join this meeting"
        />
      </div>
    );
  }

  return <CallProvider meetingId={meetingId} meetingName={data.name} />;
};

export default CallView;