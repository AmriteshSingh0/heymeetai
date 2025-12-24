import { EmptyState } from "@/components/empty-state";

import React from "react";

const ProcessingState = () => {
  return (
    <div className="bg-background rounded-lg px-4 py-5 flex flex-col items-center justify-center gap-y-8">
      <EmptyState
        title="Meeting is Completed"
        description="Meeting was completed. You can review the summary and recording soon"
        image="/processing.svg"
      />
    </div>
  );
};

export default ProcessingState;