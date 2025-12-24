import { not } from "drizzle-orm";

function verifySignatureWithSDK(body: string, signature: string): boolean {
  return streamVideo.verifyWebhook(body, signature);
};

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature");
  const apiKey = req.headers.get("x-api-key");

  if (!signature || !apiKey) {
    return NextResponse.json(
      { error: "Missing signature or API key" },
      { status: 400 }
    );
  }
}

const body = await req.text();

if (!verifySignatureWithSDK(body, signature)) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}

let payload: unknown;
try {
  payload = JSON.parse(body) as Record<string, unknown>;
} catch {
  return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
}

const eventType = (payload as Record<string, unknown>)?.type; 


if (eventType === "call.session_started") {
  const event = payload as CallSessionStartedEvent;
  const meetingId = event.call.custom?.meetingId;

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
  }
  const [existingAgent] = await db
          .select()
          .from(agents)
          .where(
            eq(agents.id, createdmeetings.agentId)
            not(eq(meetings.status , "completed"))
            not(eq(meetings.status , "active"))
            not(eq(meetings.status , "cancelled"))  
            not(eq(meetings.status , "processing"))
        );


    if (!existingMeeting) {
  return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
}

await db
  .update(meetings)
  .set({
    status: "active",
    startedAt: new Date(),
  })
  .where(eq(meetings.id, existingMeeting.id));    


  const [existingAgent] = await db
  .select()
  .from(agents)
  .where(eq(agents.id, existingMeeting.agentId));

if (!existingAgent) {
  return NextResponse.json({ error: "Agent not found" }, { status: 404 });
}

const call = streamVideo.video.call("default", meetingId);
const realtimeClient = await streamVideo.video.connectOpenAi({
  call,
  openAiApiKey: process.env.OPENAI_API_KEY!,
  agentUserId: existingAgent.id,
});

realtimeClient.updateSession({
  instructions: existingAgent.instructions,
});
else if (eventType === "call.session_participants_left") {
  cosnt event = payload as CallSessionParticipantsLeftEvent;
  const meetingId = event.call_cid.split(":")[1];

    if (!meetingId) {
        return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
}

   const call = streamVideo.video.call("default", meetingId);
   await call.end();
}else if (eventType === "call.transcription_ready") {
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
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }
  await inngest.sendEvent("meetings/processing", {
    meetingId: updatedMeeting.id,
    transcriptUrl: updatedMeeting.transcriptUrl!,
  });

  
}else if (eventType === "call.recording_ready") {
  const event = payload as CallRecordingReadyEvent;
  const meetingId = event.call_cid.split(":")[1]; 

  await db
    .update(meetings)
    .set({
      recordingUrl: event.call_recording.url,
    })
    .where(eq(meetings.id, meetingId));
}


return NextResponse.json({ status: "ok" });