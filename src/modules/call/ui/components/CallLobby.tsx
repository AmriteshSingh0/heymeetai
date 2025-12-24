import React from "react";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  DefaultVideoPlaceholder,
  StreamVideoParticipant,
  ToggleAudioPreviewButton,
  ToggleVideoPreviewButton,
  useCallStateHooks,
  VideoPreview,
} from "@stream-io/video-react-sdk";

import { generatedAvatarUri } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-clients";

interface Props {
  onJoin: () => void;
}

const CallLobby = ({ onJoin }: Props) => {
  const { useCameraState, useMicrophoneState } = useCallStateHooks();
  const { hasBrowserPermission: hasCameraPermission } = useCameraState();
  const { hasBrowserPermission: hasMicPermission } = useMicrophoneState();

  const hasBrowserMediaPermission = hasCameraPermission && hasMicPermission;

  const disableVideoPreview = () => {
    const { data } = authClient.useSession();
    return (
      <DefaultVideoPlaceholder
        participant={
          {
            name: data?.user.name || "",
            image:
              data?.user.image ??
              generatedAvatarUri({
                seed: data?.user.name || "",
                variant: "initials",
              }),
          } as StreamVideoParticipant
        }
      />
    );
  };

  const AllowBrowserPermission = () => {
    return (
      <p className="text-sm mx-auto">
        Please grant your browser a permission to access your camera and
        microphone to join.
      </p>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-radial from-sidebar-accent to-siedebar">
      <div className="flex flex-1 items-center justify-center py-4 px-8 ">
        <div className="flex flex-col items-center justify-center gap-y-6 bg-background rounded-lg p-10 shadow-sm">
          <div className="flex flex-col gap-y-2 text-center">
            <h6 className="text-lg font-medium">Ready to join?</h6>
            <p className="text-sm">Set up your call before joining</p>
          </div>
          <VideoPreview
            DisabledVideoPreview={
              hasBrowserMediaPermission
                ? disableVideoPreview
                : AllowBrowserPermission
            }
          />
          <div className="flex gap-2">
            <ToggleAudioPreviewButton />
            <ToggleVideoPreviewButton />
          </div>
          <div className="flex justify-between w-full">
            <Button variant={"ghost"}>
              <Link href={"/meetings"}>Cancel</Link>
            </Button>
            <Button onClick={onJoin}>
              <LogInIcon /> Join Call
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallLobby;