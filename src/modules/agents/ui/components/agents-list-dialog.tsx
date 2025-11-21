import { ResponsiveDialog } from "@/components/reponsive-dialog";
import { AgentForm } from "./agents-form";

interface NewAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const NewAgentDialog = ({
  open, 
  onOpenChange, 
}: NewAgentDialogProps) => {
  return (
    <ResponsiveDialog
      title="New Agent"
      description="Create a new agent"
      open={open}
        onOpenChange={onOpenChange}
    >
      <AgentForm
      onSucess={()=> onOpenChange(false)}
      onCancel={()=> onOpenChange(false)}/>
    </ResponsiveDialog>
  );
};