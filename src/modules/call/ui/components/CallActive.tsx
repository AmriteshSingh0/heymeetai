import { CallControls, SpeakerLayout } from "@stream-io/video-react-sdk";
import Link from "next/link";
import React from "react";

interface Props {
  onLeave: () => void;
  meetingName: string;
}

const CallActive = ({ onLeave, meetingName }: Props) => {
  return (
    <div className="h-full flex flex-col justify-between p-4 text-primary">
      <div className="bg-background rounded-full p-4  flex items-center gap-4">
        <Link
          href={"/"}
          className="flex items-center justify-center p-1 bg-white/10  rounded-full w-fit"
        >
          <h1>Meet Ai</h1>
        </Link>

        <h6 className="text-base">{meetingName}</h6>
      </div>
      <SpeakerLayout />
      <div className="rounded-full px-4 bg-background">
        <CallControls onLeave={onLeave} />
      </div>
    </div>
  );
};

export default CallActive;