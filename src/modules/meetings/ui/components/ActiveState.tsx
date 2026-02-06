import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { VideoIcon } from "lucide-react";
import Link from "next/link";
import React from "react";


interface Props {
  meetingId: string;
}

const ActiveState = ({ meetingId }: Props) => {
  return (
    <div className="bg-background rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
      <EmptyState
        title="Meeting is Active"
        description="Meeting will end once all participants leave"
        image="/upcoming.svg"
      />

      <div className="flex flex-col-reverse lg:flex-row items-center lg:justify-end gap-2 w-full">
        <Button asChild className="w-full lg:w-auto">
          <Link href={`/call/${meetingId}`}>
            <VideoIcon />
            Join Meeting
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default ActiveState;