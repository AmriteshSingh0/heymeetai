# HeyMeet AI

A full-stack SaaS AI meeting assistant — users create AI agents with custom instructions, start video calls, and the AI joins the call in real-time. After the call, it generates summaries and lets users chat with the AI about what was discussed.

## Live Demo

heymeetai.vercel.app

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS v4, Radix UI |
| **API** | tRPC (type-safe RPC) + Next.js API routes |
| **Database** | PostgreSQL (Neon serverless) + Drizzle ORM |
| **Auth** | better-auth (Google & GitHub OAuth + email/password) |
| **Payments** | Polar SDK (free tier: 3 agents/3 meetings, premium: unlimited) |
| **Background Jobs** | Inngest (event-driven) |
| **Deployment** | Vercel |

---

## Features

- AI agent that joins live video calls using Stream's realtime SDK
- Live transcription pipeline streamed from the call to the backend
- Background job processing with Inngest to parse transcripts and generate summaries
- Structured meeting summaries generated with OpenAI (GPT-4o-mini)
- Post-meeting chat interface powered by GPT-4o to query meeting context
- Free vs premium logic with automatic limits (3 agents, 3 meetings on free tier)
- Full meeting lifecycle: upcoming → active → processing → completed
- Real-time dashboard showing meetings, summaries, and chat history

---

## Meeting Lifecycle

```
Create Agent → Start Meeting → Join Call (WebRTC)
       ↓
  Stream webhook: session_started
       ↓
  OpenAI Realtime API connects (AI joins call)
       ↓
  User leaves → 3s grace period → call.endCall()
       ↓
  Webhook: session_ended → status = "processing"
       ↓
  Webhook: transcription_ready → Inngest job
       ↓
  GPT-4o-mini summarizes → status = "completed"
       ↓
  User views: Summary | Transcript | Recording | Chat
```

---

## How Voice Becomes Text — The Full Architecture

Three separate AI/ML systems run simultaneously during a call. The app orchestrates all of them but performs none of the actual speech processing itself.

```
┌─────────────────────────────────────────────────────────┐
│                    DURING THE CALL                       │
│                                                         │
│  User's Browser                Stream's Cloud Servers   │
│  ┌──────────┐    WebRTC       ┌───────────────────┐    │
│  │ Mic/Cam  │───────────────→ │  Stream Video SFU │    │
│  │ (audio)  │  (UDP, SRTP)    │  (Selective       │    │
│  └──────────┘                 │   Forwarding Unit)│    │
│                               └─────┬─────────────┘    │
│                                     │                   │
│                          ┌──────────┼──────────┐        │
│                          ▼          ▼          ▼        │
│                    ┌──────────┐ ┌────────┐ ┌────────┐  │
│                    │ OpenAI   │ │ ASR    │ │ Record │  │
│                    │ Realtime │ │ Engine │ │ Engine │  │
│                    │ API      │ │(Speech │ │(1080p) │  │
│                    │(voice AI)│ │-to-Text│ │        │  │
│                    └──────────┘ └────────┘ └────────┘  │
│                         │           │           │       │
│                    AI speaks    JSONL file    MP4 file  │
│                    back on      saved to     saved to   │
│                    the call     Stream CDN   Stream CDN  │
└─────────────────────────────────────────────────────────┘
```

### System 1: OpenAI Realtime API (The AI Voice Agent)

The AI **talks and listens** on the call. Stream bridges its WebRTC audio stream directly to OpenAI's Realtime API over **WebSocket**. The `@stream-io/openai-realtime-api` library handles this bridge.

```
User's mic → WebRTC → Stream SFU → WebSocket → OpenAI Realtime API
                                                        │
OpenAI Realtime API → WebSocket → Stream SFU → WebRTC → User's speaker
```

From `src/app/api/webhook/route.ts`:
```typescript
const realtimeClient = await streamVideo.video.connectOpenAi({
  call,
  openAiApiKey: process.env.OPENAI_API_KEY!,
  agentUserId: existingAgent.id,
  validityInSeconds: 120,
});

realtimeClient.updateSession({
  instructions: existingAgent.instructions,
});
```

### System 2: Stream's Built-In Transcription (Speech-to-Text)

This is where voice actually becomes text. It's entirely **Stream's server-side ASR infrastructure** — the app doesn't do any STT itself.

When a call is created, transcription is configured as auto-on:
```typescript
settings_override: {
  transcription: {
    language: "en",
    mode: "auto-on",
    closed_caption_mode: "auto-on",
  },
}
```

Stream's SFU captures raw audio streams from all participants server-side, runs ASR (Automatic Speech Recognition) on those streams, and produces timestamped text segments per speaker. After the call ends, everything is packaged into a **JSONL file** hosted on Stream's CDN.

The transcript format:
```typescript
type StreamTranscriptItem = {
  speaker_id: string;  // Who said it
  type: string;        // Segment type
  text: string;        // What was said
  start_ts: number;    // Start timestamp
  end_ts: number;      // End timestamp
}
```

### System 3: Post-Call Summary (GPT-4o-mini via Inngest)

Takes the text transcript and turns it into a structured markdown summary:

```
Webhook: transcription_ready
    ↓
Inngest job triggered
    ↓
Step 1: fetch(transcriptUrl) → raw JSONL text
    ↓
Step 2: JSONL.parse() → array of StreamTranscriptItem
    ↓
Step 3: Enrich with speaker names (DB lookup)
    ↓
Step 4: GPT-4o-mini summarizes → structured markdown
    ↓
Step 5: Save summary to DB, status = "completed"
```

### Quick Reference

| Question | Answer |
|----------|--------|
| **What converts voice to text?** | Stream's server-side ASR engine — not app code, not OpenAI |
| **What protocol carries the audio?** | WebRTC (SRTP/UDP) from browser → Stream SFU servers |
| **Where does STT happen?** | On Stream's cloud servers, not in the browser |
| **Does OpenAI do the transcription?** | No. OpenAI Realtime API only powers the AI agent's voice. Stream handles transcription separately |
| **What format is the transcript?** | JSONL — one JSON object per speech segment with speaker ID + timestamps |

---

## Webhook Event Flow

The nerve center is `src/app/api/webhook/route.ts` — it handles all Stream events:

| Event | Action |
|-------|--------|
| `call.session_started` | Connect OpenAI Realtime agent to the call |
| `call.session_participants_left` | If human left, auto-end the call |
| `call.session_ended` | Update meeting status to "processing" |
| `call.transcription_ready` | Save transcript URL, trigger Inngest summary job |
| `call.recording_ready` | Save recording URL |
| `message.new` | Generate GPT-4o response for post-meeting chat |

---

## Post-Meeting Chat

After a meeting is completed, users can chat with the AI about what was discussed:

- Built on **Stream Chat SDK** (WebSocket-based messaging)
- When a user sends a message, the `message.new` webhook fires
- Server grabs: meeting summary + agent instructions + last 5 messages
- Sends to **GPT-4o** for a context-aware response
- AI response posted back via Stream Chat

---

## Database Schema

PostgreSQL (Neon serverless) with Drizzle ORM. Key tables:

| Table | Purpose |
|-------|---------|
| `user` | Auth users (better-auth managed) |
| `session` | Auth sessions |
| `account` | OAuth provider accounts (Google, GitHub) |
| `verification` | Email verification tokens |
| `agents` | AI agents with custom instructions |
| `meetings` | Meetings with status, transcript URL, recording URL, summary |

Meeting status enum: `upcoming` → `active` → `processing` → `completed` / `cancelled`

---

## Project Structure

```
src/
├── app/                          # Next.js app directory
│   ├── call/[meetingId]/         # Live call interface
│   ├── api/webhook/              # Stream Video webhooks (nerve center)
│   ├── api/inngest/              # Inngest event handler
│   ├── api/auth/[...all]/        # Auth routes
│   ├── (auth)/                   # Sign-in/Sign-up pages
│   └── (dashboard)/              # Dashboard, meetings, agents
│
├── modules/                      # Feature modules
│   ├── agents/                   # AI agent CRUD
│   ├── meetings/                 # Meeting management (core logic)
│   ├── call/                     # Call UI (lobby, active, ended states)
│   ├── premium/                  # Subscription/upgrade logic
│   ├── dashboard/                # Dashboard layout
│   └── auth/                     # Auth UI
│
├── db/
│   ├── schema.ts                 # Drizzle ORM schema
│   └── index.ts                  # DB connection (Neon)
│
├── trpc/                         # Type-safe API layer
│   ├── init.ts                   # Router setup, auth + premium middleware
│   ├── routers/_app.ts           # Combined app router
│   ├── server.tsx                # Server-side caller
│   └── client.tsx                # Client-side hooks
│
├── inngest/
│   ├── client.ts                 # Inngest client
│   └── functions.ts              # Background jobs (transcript → summary)
│
├── lib/
│   ├── auth.ts                   # better-auth config
│   ├── stream-video.ts           # Stream Video SDK init
│   ├── stream-chat.ts            # Stream Chat SDK init
│   └── polar.ts                  # Polar payment SDK
│
└── components/ui/                # Shadcn-style UI components
```

---

## Key Libraries

| Purpose | Library |
|---------|---------|
| Video calls | `@stream-io/video-react-sdk` |
| AI voice in calls | `@stream-io/openai-realtime-api` |
| Chat messaging | `stream-chat-react` |
| AI summaries/chat | `openai` (GPT-4o, GPT-4o-mini) |
| Forms | `react-hook-form` + `zod` |
| Data tables | `@tanstack/react-table` |
| Avatars | `@dicebear/core` |
| URL state | `nuqs` |
| Markdown rendering | `react-markdown` |

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/heymeetai.git
cd heymeetai
```

Install dependencies:

```bash
npm install --legacy-peer-deps
```

Create a `.env` file:

```env
DATABASE_URL=
OPENAI_API_KEY=
STREAM_API_KEY=
STREAM_SECRET_KEY=
STREAM_CHAT_API_KEY=
STREAM_CHAT_API_SECRET=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
POLAR_ACCESS_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=
NEXT_PUBLIC_STREAM_CHAT_API_KEY=
```

Push database schema:

```bash
npm run db:push
```

Run the development server:

```bash
npm run dev
```

Start Inngest locally:

```bash
npx inngest-cli@1.6.2 dev -u http://localhost:3000/api/inngest
```

---

## Security

- All webhooks verified via HMAC-SHA256 signature
- tRPC procedures gated by auth session middleware
- Premium features enforced server-side (agent/meeting count checks)
- Atomic DB updates with `isNull()` guards to prevent duplicate webhook processing




