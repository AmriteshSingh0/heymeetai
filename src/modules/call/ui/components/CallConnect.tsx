"use client";

import React, { useEffect, useRef, useState } from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Call,
  CallingState,
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import { LoaderIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import CallUi from "./CallUi";

interface Props {
  meetingId: string;
  meetingName: string;
  userId: string;
  userName: string;
  userImage: string;
}

const CallConnect = ({
  meetingId,
  meetingName,
  userId,
  userName,
  userImage,
}: Props) => {
  const trpc = useTRPC();
  const { mutateAsync: generateToken } = useMutation(
    trpc.meetings.generateToken.mutationOptions()
  );

  // 🔒 Stream SDK objects MUST live in refs (never in state)
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);

  // ✅ User intent (NOT Stream state)
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 🔥 STREAM SETUP
   * Runs ONLY when user clicks Join
   * NEVER on initial render
   */
  useEffect(() => {
    if (!joined) return;

    let cancelled = false;

    const connect = async () => {
      // 🛑 Guard: StrictMode protection
      if (clientRef.current) return;

      setLoading(true);

      // ✅ Token is generated ONLY at join time
      const token: string = await generateToken();

      console.log("STREAM TOKEN:", token);
      console.log("TOKEN TYPE:", typeof token);

      if (cancelled) return;

      // ✅ Create Stream client ONCE
      const client = new StreamVideoClient({
        apiKey: process.env.NEXT_PUBLIC_STREAM_VIDEO_API_KEY!,
        user: {
          id: userId,
          name: userName,
          image: userImage,
        },
        token,
      });

      clientRef.current = client;

      // ⚠️ Create call ONLY after join intent
      const call = client.call("default", meetingId);
      call.camera.disable();
      call.microphone.disable();

      callRef.current = call;
      setLoading(false);
    };

    connect();

    // 🚫 DO NOT destroy Stream objects here
    // React StrictMode will unmount/remount in dev
    return () => {
      cancelled = true;
    };
  }, [joined, meetingId, userId, userName, userImage, generateToken]);

  /**
   * ✅ CLEANUP — USER INTENT ONLY
   * This runs when user clicks Leave
   */
  const handleLeave = async () => {
    if (callRef.current?.state.callingState !== CallingState.LEFT) {
      await callRef.current?.leave();
      await callRef.current?.endCall();
    }

    await clientRef.current?.disconnectUser();

    callRef.current = null;
    clientRef.current = null;

    setJoined(false);
  };

  /**
   * 🧑‍💻 PRE-JOIN UI (preview)
   * NO Stream SDK mounted here
   */
  if (!joined) {
    return (
      <CallUi
        meetingName={meetingName}
        onJoin={() => setJoined(true)} // 🔥 user intent
      />
    );
  }

  /**
   * ⏳ CONNECTING STATE
   */
  if (loading || !clientRef.current || !callRef.current) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  /**
   * ✅ ACTIVE CALL
   * Stream mounts ONLY after Join
   */
  return (
    <StreamVideo client={clientRef.current}>
      <StreamCall call={callRef.current}>
        <CallUi
          meetingName={meetingName}
          onLeave={handleLeave} // 🔥 cleanup happens HERE
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default CallConnect;
