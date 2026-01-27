"use client";

import { ErrorState } from "@/components/error-state";
import { LoadingState } from "@/components/loading-state";
import { DataTable } from "@/modules/agents/ui/components/data-tables";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { columns } from "../components/columns";
import { EmptyState } from "@/components/empty-state";
import { useRouter } from "next/navigation";
import { useMeetingsFilters } from "../../hooks/use-meetings-filters";
import { MeetingStatus } from "../../types";
import DataPagination from "@/components/data-pagination";

export const MeetingsView = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const [filters, setfilters] = useMeetingsFilters();
  const normalizedFilters = {
    ...filters,
    status: filters.status ? (filters.status as MeetingStatus) : null,
  };

  const { data } = useSuspenseQuery(
    trpc.meetings.getMany.queryOptions(normalizedFilters),
  );

  return (
    <div>
      <DataTable
        data={data.items}
        columns={columns}
        onaRowClick={(row) => router.push(`/meetings/${row.id}`)}
      />
      <DataPagination
        page={filters.page}
        totalPages={data.totalPages}
        onPageChange={(page) => setfilters({ page })}
      />
      {data.items.length === 0 && (
        <EmptyState
          title="Create your first meeting"
          description="Schedule meetings to start interacting with your agents. Each meeting allows your agents to follow your instructions and engage with participants during the call."
        />
      )}
    </div>
  );
};

export const MeetingsViewLoading = () => {
  return (
    <LoadingState
      title="Loading Meetings"
      description="Please wait while we load your agents."
    />
  );
};
export const MeetingViewError = () => {
  return (
    <ErrorState
      title="Error in Meeting"
      description="There was an error please try again later"
    />
  );
};
