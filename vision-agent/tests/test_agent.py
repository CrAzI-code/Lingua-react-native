import pytest

import agent


def test_call_context_reads_complete_stream_custom_data():
    response = type(
        "Response",
        (),
        {
            "data": type(
                "Data",
                (),
                {
                    "call": type(
                        "Call",
                        (),
                        {
                            "custom": {
                                "ai_teacher_prompt": "Speak slowly and encourage repetition.",
                                "goals": ["Greet someone politely."],
                                "language": {"name": "Spanish"},
                                "lesson": {"title": "Hello!"},
                                "phrases": [{"text": "Hola", "translation": "Hello"}],
                                "vocabulary": [{"term": "adios", "translation": "goodbye"}],
                            }
                        },
                    )()
                },
            )()
        },
    )()

    context = agent.call_context(response)

    assert context.language == "Spanish"
    assert context.lesson == "Hello!"
    assert context.goal == "Greet someone politely."
    assert context.vocabulary == ("adios (goodbye)",)
    assert context.phrases == ("Hola (Hello)",)
    assert "Speak slowly" in agent.lesson_start_prompt(context)


@pytest.mark.asyncio
async def test_create_agent_uses_openrouter_voice_pipeline(monkeypatch: pytest.MonkeyPatch):
    monkeypatch.setenv("STREAM_API_KEY", "test-key")
    monkeypatch.setenv("STREAM_API_SECRET", "test-secret")
    monkeypatch.setenv("OPENROUTER_API_KEY", "test-openrouter-key")
    monkeypatch.setenv("OPENROUTER_MODEL", "openrouter/auto")
    monkeypatch.setenv("DEEPGRAM_API_KEY", "test-deepgram-key")
    monkeypatch.setenv("ELEVENLABS_API_KEY", "test-elevenlabs-key")

    language_agent = await agent.create_agent()

    assert language_agent.agent_user.id == "language-teacher"
    assert language_agent.llm.model == "openrouter/auto"
    assert language_agent.stt is not None
    assert language_agent.tts is not None
