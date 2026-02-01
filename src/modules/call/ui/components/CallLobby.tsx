"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogInIcon } from "lucide-react";
import Link from "next/link";



interface Props {
  onJoin: () => void;
}

/**
 * ✅ PRE-JOIN LOBBY
 * - Uses BROWSER media APIs (NOT Stream)
 * - Safe to run before Stream exists
 * - Shows camera preview
 */
const CallLobby = ({ onJoin }: Props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // 🎥 Start camera preview
  useEffect(() => {
    const startPreview = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError("Camera or microphone permission denied.");
        console.error("Error accessing media devices.", err);
      }
    };

    startPreview();

    // 🧹 Stop camera when leaving lobby
    return () => {
      mediaStreamCleanup();
    };
  }, []);

  const mediaStreamCleanup = () => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const handleJoin = () => {
    mediaStreamCleanup(); // stop preview before joining
    onJoin();
    console.log("[L1] Join button clicked");

  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h6 className="text-lg font-medium">Ready to join?</h6>

      {/* 🎥 Camera preview */}
      <div className="w-72 h-48 bg-black rounded overflow-hidden">
        {error ? (
          <p className="text-red-500 text-sm p-2">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
      </div>

      <div className="flex gap-4">
        <Button variant="ghost">
          <Link href="/meetings">Cancel</Link>
        </Button>

        <Button onClick={handleJoin}>
          <LogInIcon /> Join Call
        </Button>
      </div>
    </div>
  );
};

export default CallLobby;
