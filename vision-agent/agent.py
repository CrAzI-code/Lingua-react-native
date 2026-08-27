"""Stream-powered, voice-only OpenRouter language teacher."""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Mapping

from dotenv import load_dotenv
from vision_agents.core import Agent, Runner, User
from vision_agents.core.agents import AgentLauncher
from vision_agents.plugins import deepgram, elevenlabs, getstream, openrouter


ROOT_ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(ROOT_ENV_FILE)

AGENT_USER = User(id="language-teacher", name="Language Teacher")
DEFAULT_OPENROUTER_MODEL = "openrouter/auto"

INSTRUCTIONS = """
You are a warm, encouraging voice-only language teacher for beginner learners.

Always speak English when explaining, encouraging, correcting, asking questions,
or giving instructions. Teach the selected target language through English. You
may say target-language words and phrases as examples, then explain them in
English. Keep each turn short, natural, and conversational. Teach one small idea
at a time, model it slowly, invite the learner to repeat it, wait for their reply,
and offer gentle, specific feedback. Do not mention video, screens, buttons, or
text that the learner cannot access in this audio lesson.
""".strip()


def require_environment() -> None:
    missing = [
        name
        for name in (
            "STREAM_API_KEY",
            "STREAM_API_SECRET",
            "OPENROUTER_API_KEY",
            "DEEPGRAM_API_KEY",
            "ELEVENLABS_API_KEY",
        )
        if not os.getenv(name)
    ]
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")


def configured_openrouter_model() -> str:
    """Keep the provider model selection in one server-side setting."""
    return os.getenv("OPENROUTER_MODEL", DEFAULT_OPENROUTER_MODEL)


@dataclass(frozen=True)
class LessonContext:
    ai_teacher_prompt: str
    goal: str
    language: str
    lesson: str
    phrases: tuple[str, ...]
    vocabulary: tuple[str, ...]


def as_mapping(value: object) -> Mapping[str, Any]:
    return value if isinstance(value, Mapping) else {}


def format_language_items(value: object, primary_key: str) -> tuple[str, ...]:
    if not isinstance(value, list):
        return ()

    items: list[str] = []
    for item in value:
        item_data = as_mapping(item)
        primary = item_data.get(primary_key)
        translation = item_data.get("translation")

        if isinstance(primary, str) and isinstance(translation, str):
            items.append(f"{primary} ({translation})")
        elif isinstance(primary, str):
            items.append(primary)

    return tuple(items)


def call_context(call_response: Any) -> LessonContext:
    """Read the complete teaching context stored in the Stream call custom data."""
    custom = as_mapping(call_response.data.call.custom)
    language_data = as_mapping(custom.get("language"))
    lesson_data = as_mapping(custom.get("lesson"))
    goals = custom.get("goals")
    goal = next((item for item in goals if isinstance(item, str)), "") if isinstance(goals, list) else ""

    return LessonContext(
        ai_teacher_prompt=str(custom.get("ai_teacher_prompt", lesson_data.get("ai_teacher_prompt", ""))),
        goal=goal or str(lesson_data.get("goal", "")),
        language=str(language_data.get("name", custom.get("language_id", "the selected language"))),
        lesson=str(lesson_data.get("title", custom.get("lesson_title", "the current lesson"))),
        phrases=format_language_items(custom.get("phrases"), "text"),
        vocabulary=format_language_items(custom.get("vocabulary"), "term"),
    )


def lesson_start_prompt(context: LessonContext) -> str:
    vocabulary = ", ".join(context.vocabulary) or "No additional vocabulary was provided."
    phrases = "; ".join(context.phrases) or "No additional phrases were provided."
    goal = context.goal or "Help the learner practise the selected lesson."
    teacher_prompt = context.ai_teacher_prompt or "Keep the lesson encouraging and beginner-friendly."

    return (
        "Start the lesson now using only this call context. "
        f"Target language: {context.language}. Lesson: {context.lesson}. Goal: {goal}. "
        f"Vocabulary: {vocabulary}. Phrases: {phrases}. Teacher guidance: {teacher_prompt}. "
        "Speak English except when modelling the target language. Begin with a friendly greeting, "
        "teach the first phrase slowly, and invite the learner to repeat it."
    )


async def create_agent(**_: object) -> Agent:
    require_environment()
    return Agent(
        edge=getstream.Edge(),
        agent_user=AGENT_USER,
        instructions=INSTRUCTIONS,
        # OpenRouter supplies the text model; Deepgram and ElevenLabs provide
        # the speech input/output required by this voice-only call.
        llm=openrouter.LLM(model=configured_openrouter_model()),
        stt=deepgram.STT(),
        tts=elevenlabs.TTS(),
    )


async def join_call(agent: Agent, call_type: str, call_id: str, **_: object) -> None:
    """Join one Stream call and keep the agent alive until that call ends."""
    call = await agent.create_call(call_type, call_id)
    call_response = await call.get()
    context = call_context(call_response)

    async with agent.join(call):
        await agent.simple_response(lesson_start_prompt(context))
        await agent.finish()


runner = Runner(
    AgentLauncher(
        create_agent=create_agent,
        join_call=join_call,
        max_sessions_per_call=1,
    )
)


if __name__ == "__main__":
    runner.cli()
