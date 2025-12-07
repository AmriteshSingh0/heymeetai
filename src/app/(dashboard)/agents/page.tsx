import { getQueryClient, trpc } from "@/trpc/server";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { AgentsView , AgentsViewLoading, AgentsViewError} from "@/modules/agents/ui/views/agents-views";
import { Suspense } from "react";
import { AgentsListHeader } from "@/modules/agents/ui/components/agents-list-header";
import { ErrorBoundary } from  "react-error-boundary"
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { loadSearchParams } from "@/modules/agents/params";
import { SearchParams } from "nuqs";

interface Props{
  searchParams: Promise<SearchParams>;
}

const Page = async ({searchParams}:Props) => {

  const filters = await loadSearchParams(await searchParams);
  const session = await auth.api.getSession({
        headers: await headers(),
     })
  
     if (!session) {
        redirect("/sign-in")
     }
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.agents.getMany.queryOptions({
    ...filters,
  }));

  return (
    <>
    <AgentsListHeader />
    <HydrationBoundary state={dehydrate(queryClient)}>
     <Suspense fallback={<AgentsViewLoading />}> 
      <ErrorBoundary fallback={<AgentsViewError />}>
      <AgentsView />
      </ErrorBoundary>
     </Suspense>
    </HydrationBoundary>
    </>
  );
};

export default Page;