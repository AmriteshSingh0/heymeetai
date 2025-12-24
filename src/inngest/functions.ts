import JSONL from "jsonl-parse-stringify";

import { inngest } from "@/inngest/client";

export const meetingsProcessing = inngest.createFunction(
  { id: "meetings/processing" },
  { event: "meetings/processing" },
  async ({ event, step }) => {
    const response = await step.fetch(event.data.transcriptUrl);

    const transcript = await step.run("parse-transcript", async () => {
      const text = await response.text();
      return JSONL.parse<Stream>(text);
    });
    const transcriptWithSpeakers = await step.run("add-speakers", async () => {
  const speakerIds = [
    ...new Set(transcript.map((item) => item.speaker_id)),
  ];
   const agentSpeakers = await db
    .select()
    .from(agents)
    .where(inArray(agents.id, speakerIds))
    .then((agents) =>
      agents.map((agent) => ({
        ...agent,
      }))

   const speakers = [...userSpeakers, ...agentSpeakers];

  return transcript.map((item) => {
    const speaker = speakers.find(
      (speaker) => speaker.id === item.speaker_id
    );

    if(!speaker) {
      return {
        ...item,
        user:{
          name: "Unknown boss",
        }
      }
    }
    if(speaker) {
      return {
        ...item,
        user:{
          name: speaker.name,
        }
      }
    }
    
  })

})
  },
);