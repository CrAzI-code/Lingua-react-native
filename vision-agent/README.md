# Vision Agent

This service joins the Stream calls created by the Expo app and acts as a
voice-only language teacher. It uses Stream Edge for call transport and
OpenRouter, Deepgram, and ElevenLabs for its voice pipeline. OpenRouter creates
the lesson responses, Deepgram transcribes the learner, and ElevenLabs speaks
the teacher's response. The teacher explains in English and models only the
selected lesson language.

## Configuration

The service loads `../.env`, so it reuses the repository's existing
`STREAM_API_KEY` and `STREAM_API_SECRET`. Add this line to the root `.env`:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
# Optional; defaults to OpenRouter's Auto Router.
OPENROUTER_MODEL=openrouter/auto
DEEPGRAM_API_KEY=your_deepgram_api_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

`vision-agent/.env.example` intentionally contains only the new provider variables; it
does not duplicate the Stream secrets.

The Expo API routes also need this server-only root `.env` setting. Use the
private/internal address of the Vision Agent service; never prefix it with
`EXPO_PUBLIC_`:

```env
VISION_AGENT_SERVER_URL=http://127.0.0.1:8000
```

## Install and run

Use Python 3.10 through 3.13 (the Vision Agents scaffold does not support
Python 3.14 yet).

```powershell
cd vision-agent
py -3.13 -m venv .venv
.\.venv\Scripts\python -m pip install -e ".[dev]"
.\.venv\Scripts\python -m pytest
.\.venv\Scripts\python agent.py serve --host 0.0.0.0 --port 8000
```

For a one-call local test, use:

```powershell
.\.venv\Scripts\python agent.py run --call-type default --call-id test-call
```

The service reads the language, lesson, goal, vocabulary, phrases, and teacher
prompt from the Stream call's custom data, which is written server-side by
`app/api/stream/calls+api.ts`. The Expo server starts and closes each agent
session through the built-in Vision Agents HTTP API.

## Restart after changing providers

Stop any currently running agent process before synchronising dependencies, then
start it again. A running Python process locks its virtual environment on
Windows:

```powershell
cd vision-agent
uv sync --extra dev
uv run python agent.py serve --host 0.0.0.0 --port 8000
```

Keep all provider keys server-side in the root `.env`. Do not create
`EXPO_PUBLIC_` versions of them.
