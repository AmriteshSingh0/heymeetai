import { MeetingsView, MeetingsViewLoading, MeetingViewError } from "@/modules/meetings/ui/views/meeting-view"
import { getQueryClient, trpc } from "@/trpc/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";

const Meeting = () => {
  const queryClient = getQueryClient();
void queryClient.prefetchQuery(
  trpc.meetings.getMany.queryOptions({})
);

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<MeetingsViewLoading/>}>
      <ErrorBoundary  fallback={<MeetingViewError/>}>
        <MeetingsView />
    </ErrorBoundary>
    </Suspense>
  </HydrationBoundary>
);
}

export default Meeting