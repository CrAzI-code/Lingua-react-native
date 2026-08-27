import { corsHeaders, getAuthenticatedUser, getLessonForCall, getStreamClient, lessonCallId } from "@/lib/server/stream";

type CreateCallBody = {
  languageId?: string;
  lessonId?: string;
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateCallBody;

    if (!body.lessonId || !body.languageId) {
      return Response.json({ error: "A lesson and language are required." }, { headers: corsHeaders, status: 400 });
    }

    const user = await getAuthenticatedUser(request);
    const { language, lesson } = getLessonForCall(body.lessonId, body.languageId);
    const streamClient = getStreamClient();
    const callId = lessonCallId(lesson.id, user.id);
    const callType = "audio_room";

    await streamClient.upsertUsers([{ id: user.id, image: user.image, name: user.name }]);
    await streamClient.video.call(callType, callId).getOrCreate({
      data: {
        created_by_id: user.id,
        members: [{ role: "admin", user_id: user.id }],
        custom: {
          ai_teacher_prompt: lesson.aiTeacherPrompt,
          goals: [lesson.goal],
          language_id: language.id,
          language: {
            code: language.code,
            id: language.id,
            name: language.name,
            native_name: language.nativeName,
          },
          lesson_id: lesson.id,
          lesson: {
            ai_teacher_prompt: lesson.aiTeacherPrompt,
            description: lesson.description,
            goal: lesson.goal,
            id: lesson.id,
            title: lesson.title,
          },
          lesson_title: lesson.title,
          lesson_type: "audio",
          phrases: lesson.phrases,
          vocabulary: lesson.vocabulary,
        },
        settings_override: {
          audio: { default_device: "speaker", mic_default_on: true },
        },
      },
      video: false,
    });

    return Response.json({ callId, callType }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create the audio lesson." },
      { headers: corsHeaders, status: error instanceof Error && error.message.startsWith("Missing ") ? 500 : 400 },
    );
  }
}
