import { EmptyState } from "@/components/empty-state";
import React from "react";


const CancelledState = () => {
  return (
    <div className="bg-background rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
      <EmptyState
        title="Meeting Cancelled"
        description="This Meeting was Cancelled and will not take place"
        image="/cancelled.svg"
      />
    </div>
  );
};

export default CancelledState;