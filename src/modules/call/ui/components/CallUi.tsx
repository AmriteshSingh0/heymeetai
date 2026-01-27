"use client";

import { StreamTheme } from "@stream-io/video-react-sdk";
import React, { useState } from "react";
import CallLobby from "./CallLobby";
import CallActive from "./CallActive";
import CallEnded from "./CallEnded";

interface Props {
  meetingName: string;
  onJoin?: () => void;
  onLeave?: () => void;
}

const CallUi = ({ meetingName, onJoin,onLeave }: Props) => {
  // ✅ FIX: initial UI depends on whether Stream exists
  const initialState = onJoin ? "lobby" : "call";
  const [show, setShow] = useState<"lobby" | "call" | "ended">(initialState);

  // ✅ FIX: Join is UI intent ONLY
  const handleJoin = () => {
    onJoin?.();     // before Stream → trigger setup
    setShow("call"); // after Stream → just show call UI
  };

  // ✅ FIX: Leave is UI-only
  const handleLeave = () => {
    onLeave?.();
    setShow("ended");
  };

  return (
    <StreamTheme>
      {show === "lobby" && <CallLobby onJoin={handleJoin} />}
      {show === "call" && (
        <CallActive meetingName={meetingName} onLeave={handleLeave} />
      )}
      {show === "ended" && <CallEnded />}
    </StreamTheme>
  );
};

export default CallUi;
