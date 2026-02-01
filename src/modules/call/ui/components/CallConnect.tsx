"use client";

import React, { useEffect, useRef, useState } from "react";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import {
  Call,
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

  // 🔒 Stream SDK objects MUST live in refs
  const clientRef = useRef<StreamVideoClient | null>(null);
  const callRef = useRef<Call | null>(null);
  const connectingRef = useRef(false);

  // ✅ User intent
  const [joined, setJoined] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ===================== CONNECT ===================== */
  useEffect(() => {
    if (!joined || clientRef.current || connectingRef.current) return;

    let cancelled = false;

    const connect = async () => {
      try {
        connectingRef.current = true;
        setLoading(true);

        console.log("[L2] Join intent detected");

        // ✅ Token generated ONLY on join
        const token = await generateToken();
        if (cancelled) return;

        console.log("[L3] Stream token generated");

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

        const call = client.call("default", meetingId);

        // 🔥 Attach metadata BEFORE join
        await call.update({
          custom: { meetingId },
        });

        await call.join({ create: true });

        call.camera.disable();
        call.microphone.disable();

        callRef.current = call;

        console.log("[L7] Call joined successfully");
      } catch (err) {
        console.error("Error connecting to Stream:", err);
      } finally {
        setLoading(false);
        connectingRef.current = false;
      }
    };

    connect();

    return () => {
      cancelled = true;
    };
  }, [joined, meetingId, userId, userName, userImage, generateToken]);

  /* ===================== LEAVE (LAYER 1: USER INTENT) ===================== */
  const handleLeave = async () => {
    try {
      if (callRef.current) {
        console.log("[END] User clicked Leave — ending call");

         //  GRACE PERIOD TO END TO CALL TO HELP THE STREAM TO GET THE RECOERDING THE TANSCRIPTION (important)
         await new Promise((res) => setTimeout(res, 3000));


        await callRef.current.endCall(); // 🔥 AUTHORITATIVE END
      }
    } catch (err) {
      console.error("Error ending call:", err);
    } finally {
      await clientRef.current?.disconnectUser();

      callRef.current = null;
      clientRef.current = null;

      setJoined(false);
    }
  };

  /* ===================== FAILSAFE (LAYER 2: BROWSER LIFECYCLE) ===================== */
  useEffect(() => {
    const handleUnload = () => {
      if (callRef.current) {
        console.log("[END] Browser unload — ending call");
        callRef.current.endCall().catch(() => {});
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload); // Safari support

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, []);

  /* ===================== UI STATES ===================== */

  // 🧑‍💻 PRE-JOIN UI
  if (!joined) {
    return (
      <CallUi
        meetingName={meetingName}
        onJoin={() => setJoined(true)}
      />
    );
  }

  // ⏳ CONNECTING STATE
  if (loading || !clientRef.current || !callRef.current) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderIcon className="size-6 animate-spin" />
      </div>
    );
  }

  // ✅ ACTIVE CALL
  return (
    <StreamVideo client={clientRef.current}>
      <StreamCall call={callRef.current}>
        <CallUi
          meetingName={meetingName}
          onLeave={handleLeave}
        />
      </StreamCall>
    </StreamVideo>
  );
};

export default CallConnect;
