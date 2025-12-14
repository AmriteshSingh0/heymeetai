import { ResponsiveDialog } from "@/components/reponsive-dialog";
import { MeetingForm } from "./meeting-form";

import { MeetingGetOne } from "../../types";

interface UpdateMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues:MeetingGetOne
}

export const UpdateMeetingDialog = ({
  open,
  onOpenChange,
  initialValues,
}: UpdateMeetingDialogProps) => {


  return (
    <ResponsiveDialog
      title="Edit Meeting"
      description="Edit the meeting deatils meeting"
      open={open}
      onOpenChange={onOpenChange}
    >
      <MeetingForm
        onSuccess={() => onOpenChange(false)}
        onCancel={() => onOpenChange(false)}
        initialValues={initialValues}
      />
    </ResponsiveDialog>
  );
};
