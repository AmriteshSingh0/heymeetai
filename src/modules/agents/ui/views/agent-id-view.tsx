"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { LoadingState } from "@/components/loading-state";
import { ErrorState } from "@/components/error-state";
import AgentIdViewHeader from "../components/agent-id-view-header";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { Badge } from "@/components/ui/badge";
import { VideoIcon } from "lucide-react";
import { toast } from "sonner";
import { TRPCError } from "@trpc/server";
import { useRouter } from "next/navigation";
import { useConfirm } from "../../hooks/use-confirm";
import UpdateAgentDialog from "../components/update-agent-dialog";
import { useState } from "react";

interface Props {
  agentId: string;
};

export const AgentIdView = ({ agentId }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(trpc.agents.getOne.queryOptions({ id: agentId }));
  const router = useRouter();


const removeAgent = useMutation(
    trpc.agents.remove.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.agents.getMany.queryOptions({}));
            await queryClient.invalidateQueries(
            trpc.premium.getFreeUsage.queryOptions(), 
      );
        router.push("/agents");
      },
      onError: (error) => {
        if (error instanceof TRPCError) {
          toast.error(error.message);
        }
        console.log(error);
      },
    })
  );



  const [openUpdateAgentDialog, setOpenUpdateAgentDialog] = useState(false)


  const [RemoveConfirmation, confirmRemove] = useConfirm(
    "Are you sure you want to remove this agent?",
    `The following can remove ${data.meetingCount} meetings`
  );

  const handleRemoveConfirmation = async () => {
    const ok = await confirmRemove();
    if (ok) {
      removeAgent.mutateAsync({ id: agentId });
    }
    return;
  };


  return (
    <>
    <RemoveConfirmation />
    <UpdateAgentDialog open={openUpdateAgentDialog} onOpenChange={setOpenUpdateAgentDialog} agent={data} />
    <div className="flex-1 py-4 px-4 md:px-8 flex flex-col gap-y-4">
      <AgentIdViewHeader 
      agentId={agentId}
      agentName={data.name}
      onEdit={()=>setOpenUpdateAgentDialog(true)}
      onRemove={handleRemoveConfirmation}
      />
      <div className="bg-white rounded-lg border">
       <div className="px-4 py-5 gap-y-5 flex flex-col col-span-5">
         <div className="flex items-center gap-x-3">
           <GeneratedAvatar
               variant="botttsNeutral"
                seed={data.name}
                className="size-10"
            />
      
      <h2 className="text-2xl font-medium">{data.name}</h2>
          </div>
           <Badge
           variant="outline"
           className="flex items-center gap-x-2 [&>svg]:size-4"
           >
            <VideoIcon />
            {data.meetingCount}{data.meetingCount === 1 ? " Meeting" : " Meetings"}   
            </Badge>
            <div className="flex flex-col gap-y-4">
                  <p className="text-lg font-medium">Instructions</p>
                  <p className="text-neutral-800">{data.instructions}</p>
            </div>
         </div>
       </div>
     
    </div>
    </>
  );
};

export const AgentsViewLoading = ()=>{
    return (
        <LoadingState
        title="Loading Agents"
        description="Please wait while we load your agents."
        />
    )
}


 export const AgentsViewError = () => {
 return (
     <ErrorState
     title="Error in loading"
     description="There was an error please try again later"
     />
 
   
   );
  }

export { ErrorState, LoadingState };
