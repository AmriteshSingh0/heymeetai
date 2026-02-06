import { and, eq, isNull } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import {
  CallEndedEvent,
  CallTranscriptionReadyEvent,
  CallRecordingReadyEvent,
  CallSessionStartedEvent,
  CallSessionParticipantLeftEvent,
  MessageNewEvent,
} from "@stream-io/node-sdk";

import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { streamVideo } from "@/lib/stream-video";
import { inngest } from "@/inngest/client";
import { streamChat } from "@/lib/stream-chat";
import { generatedAvatarUri } from "@/lib/avatar";
import { ChatCompletionMessageParam } from "openai/resources/chat/index.mjs";
import OpenAI from "openai";




const openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
//`import { inngest } from "@/inngest/client";

/* ===================== IMPORTANT ===================== */
/* 🔒 FORCE NODE RUNTIME (MANDATORY FOR STREAM + OPENAI) */
export const runtime = "nodejs";
/* ===================================================== */


function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
}

export async function POST(req: NextRequest) {
    console.log("[TIME CHECK]", {
    serverTime: new Date().toISOString(),
    unix: Math.floor(Date.now() / 1000),
  });
  console.log("[L8] Webhook HIT");

  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }

  const body = await req.text();

  if (!verifySignatureWithSDK(body, signature)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventType = (payload as Record<string, unknown>)?.type;

  /* ===================== SESSION STARTED ===================== */
if (eventType === "call.session_started") {
  const event = payload as CallSessionStartedEvent;
  const meetingId = event.call.custom?.meetingId;

  console.log("[L8a] Session started event");
  console.log("[L8b] call.custom", event.call.custom);

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
  }

  // ATOMIC LOCK: only ONE webhook can win
  const updated = await db
    .update(meetings)
    .set({
      agentConnectedAt: new Date(),
      status: "active",
      startedAt: new Date(),
    })
    .where(
      and(
        eq(meetings.id, meetingId),
        isNull(meetings.agentConnectedAt)
      )
    )
    .returning();

  // If no rows updated, another webhook already handled it
  if (updated.length === 0) {
    console.log("[GUARD] Another webhook already connected the agent");
    return NextResponse.json({ status: "ok" });
  }

  const [existingMeeting] = updated;

  const [existingAgent] = await db
    .select()
    .from(agents)
    .where(eq(agents.id, existingMeeting.agentId));

  if (!existingAgent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const call = streamVideo.video.call("default", meetingId);
  console.log("[L9a] Connecting agent", { agentId: existingAgent.id });

  //LOG LOCAL SERVER CLOCK (THIS IS WHAT JWT USES)
  console.log("[LOCAL CLOCK]", {
    iso: new Date().toISOString(),
    unix: Math.floor(Date.now() / 1000),
  });

  await new Promise(res => setTimeout(res, 1500));

  const realtimeClient = await streamVideo.video.connectOpenAi({
    call,
    openAiApiKey: process.env.OPENAI_API_KEY!,
    agentUserId: existingAgent.id,


      validityInSeconds: 120,
  });

  realtimeClient.updateSession({
    instructions: existingAgent.instructions,
  });

  console.log("[L9b] Agent connected");
}
  

  /* ===================== PARTICIPANTS LEFT ===================== */
  else if (eventType === "call.session_participants_left") {
    const event = payload as CallSessionParticipantLeftEvent;
    const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
      return NextResponse.json(
        { error: "Missing meetingId" },
        { status: 400 }
      );
    }
    
  const leftUserId = event.participant?.user?.id;

  const [meeting] = await db
    .select()
    .from(meetings)
    .where(eq(meetings.id, meetingId));

  if (!meeting) {
    return NextResponse.json({ status: "ok" });
  }

  if (leftUserId && leftUserId !== meeting.agentId) {
    console.log("[END] Human left, ending call to stop billing");

    const call = streamVideo.video.call("default", meetingId);
    await call.end();
  }
  }
  ///////////////////////// CALL SESSION ENEDED /////////////////////////
  else if (eventType === "call.session_ended") {
  const event = payload as CallEndedEvent;
  const meetingId = event.call.custom?.meetingId;

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
  }

  await db
    .update(meetings)
    .set({
      status: "processing",
      endedAt: new Date(),
    })
    .where(and(eq(meetings.id, meetingId) , eq(meetings.status, "active")));
}
  /* ===================== TRANSCRIPTION READY ===================== */
  else if (eventType === "call.transcription_ready") {
    const event = payload as CallTranscriptionReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    const [updatedMeeting] = await db
      .update(meetings)
      .set({
        transcriptUrl: event.call_transcription.url,
      })
      .where(eq(meetings.id, meetingId))
      .returning();

    if (!updatedMeeting) {
      return NextResponse.json(
        { error: "Meeting not found" },
        { status: 404 }
      );
    }
    //=====CALLED INNGEST FOR THE MEEETNG SUMMARY RGHT HERE ======
    await inngest.send({
      name: "meetings/processing",
      data: {
        meetingId: updatedMeeting.id,
        transcriptUrl: updatedMeeting.transcriptUrl!,
      },
    });
  }
  
 

//   /* ===================== RECORDING READY ===================== */
  else if (eventType === "call.recording_ready") {
    const event = payload as CallRecordingReadyEvent;
    const meetingId = event.call_cid.split(":")[1];

    await db
      .update(meetings)
      .set({
        recordingUrl: event.call_recording.url,
      })
      .where(eq(meetings.id, meetingId));
  }


  //////////////////////CHAT  MESSAGES FOR THE COMPLETED MEETING /////////////////////////
  else if (eventType === "message.new") {
    const event = payload as MessageNewEvent;

    const userId = event.user?.id;
    const channelId = event.channel_id;
    const text = event.message?.text;

    if (!userId || !channelId || !text) {
      return NextResponse.json(
        { error: "Missing user ID, channel ID, or message text" },
        { status: 400 }
      );
    }

    const [existingMeeting] = await db
      .select()
      .from(meetings)
      .where(and(eq(meetings.id, channelId), eq(meetings.status, "completed")));

    if (!existingMeeting) {
      return NextResponse.json(
        { error: "Meeting not found or not completed" },
        { status: 404 }
      );
    }

    const [existingAgent] = await db
      .select()
      .from(agents)
      .where(eq(agents.id, existingMeeting.agentId));

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    if (userId !== existingAgent.id) {
      const instructions = `
      You are an AI assistant helping the user revisit a recently completed meeting.
      Below is a summary of the meeting, generated from the transcript:
      
      ${existingMeeting.summary}
      
      The following are your original instructions from the live meeting assistant. Please continue to follow these behavioral guidelines as you assist the user:
      
      ${existingAgent.instructions}
      
      The user may ask questions about the meeting, request clarifications, or ask for follow-up actions.
      Always base your responses on the meeting summary above.
      
      You also have access to the recent conversation history between you and the user. Use the context of previous messages to provide relevant, coherent, and helpful responses. If the user's question refers to something discussed earlier, make sure to take that into account and maintain continuity in the conversation.
      
      If the summary does not contain enough information to answer a question, politely let the user know.
      
      Be concise, helpful, and focus on providing accurate information from the meeting and the ongoing conversation.
      `;

      const channel = streamChat.channel("messaging", channelId);
      await channel.watch();

      const previousMessages = channel.state.messages
        .slice(-5)
        .filter((msg) => msg.text && msg.text.trim() !== "")
        .map<ChatCompletionMessageParam>((msg) => ({
          role: msg.user?.id === existingAgent.id ? "assistant" : "user",
          content: msg.text || "",
        }));

      const GPTResponse = await openaiClient.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: instructions,
          },
          ...previousMessages,
          {
            role: "user",
            content: text,
          },
        ],
      });

      const GPTResponseText = GPTResponse.choices[0].message?.content || "";

      if (!GPTResponseText) {
        return NextResponse.json(
          { error: "No response from AI" },
          { status: 400 }
        );
      }

      const avatarUrl = generatedAvatarUri({
        seed: existingAgent.name,
        variant: "botttsNeutral",
      });

      streamChat.upsertUser({
        id: existingAgent.id,
        name: existingAgent.name,
        image: avatarUrl,
      });

      const existingMessages = await channel.query({ messages: { limit: 10 } });

      const alreadyResponded = existingMessages.messages.some(
        (msg) =>
          msg.user?.id === existingAgent.id &&
          new Date(msg.created_at ?? 0).getTime() >
            new Date(event.message?.created_at ?? 0).getTime()
      );

      if (alreadyResponded) {
        return NextResponse.json({ status: "already responded" });
      }

      channel.sendMessage({
        text: GPTResponseText,
        user: {
          id: existingAgent.id,
          name: existingAgent.name,
          image: avatarUrl,
        },
      });
    }
  }

  return NextResponse.json({ status: "ok" });
}



