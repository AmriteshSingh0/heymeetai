# HeyMeet AI

HeyMeet AI is a full-stack AI meeting assistant that can join live calls, listen in real time, generate structured summaries, and let users chat with their meetings afterward.

Instead of leaving meetings as long recordings or messy notes, the app turns every session into a searchable, AI-powered knowledge asset.

### What it does

* An AI agent automatically joins the meeting when it starts.
* The conversation is transcribed live during the call.
* After the meeting ends, the transcript is processed in the background.
* OpenAI generates a structured summary with key points and sections.
* The meeting is saved in a dashboard where users can revisit it anytime.
* Users can chat with the AI to ask questions about what was discussed.

### Free vs Premium

The app includes a simple SaaS-style upgrade system:

* Free users can start meetings with the AI agent.
* Calls are automatically limited to a short duration.
* After the limit is reached, the call ends automatically.
* Premium users can upgrade to remove the call duration limits.

This is handled through:

* Subscription checks on the backend
* Automatic call cutoff using delayed background jobs
* A dedicated upgrade flow inside the app

The result is a complete end-to-end system:
**live AI meeting → transcript → summary → post-meeting chat → upgrade path.**


## 🚀 Live Demo

heymeetai.vercel.app



---

## ✨ Features

* AI agent that programmatically joins live video calls using Stream’s realtime SDK
* Live transcription pipeline streamed from the call to the backend
* Background job processing with Inngest to parse transcripts and generate summaries
* Structured meeting summaries generated with OpenAI
* Post-meeting chat interface that lets you query the meeting context
* Free vs premium logic with automatic call cutoff after 2.5 minutes
* Full meeting lifecycle: active → processing → completed
* Real-time dashboard showing meetings, summaries, and chat history
 📊 Meeting dashboard and history

---

## 🧠 How It Works

1. User starts a meeting.
2. AI agent joins the call.
3. Stream provides live transcription.
4. Inngest processes the transcript.
5. OpenAI generates a structured summary.
6. User can chat with the meeting afterward.

---

## 🛠 Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* TanStack React Query

### Backend

* tRPC
* Drizzle ORM
* PostgreSQL

### AI & Realtime

* OpenAI
* Stream Video
* Stream Chat

### Infrastructure

* Inngest (background jobs)
* Vercel (deployment)

---

## 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
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
STREAM_SECRET=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

Run the development server:

```bash
npm run dev
```

Start Inngest locally:

```bash
npx inngest-cli dev -u http://localhost:3000/api/inngest
```



## 📁 Project Structure

```
src/
 ├── app/
 ├── db/
 ├── modules/
 ├── inngest/
 ├── lib/
 └── trpc/
```




