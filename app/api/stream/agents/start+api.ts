import { corsHeaders, getAuthenticatedUser, getLessonForCall, getStreamClient, lessonCallId } from "@/lib/server/stream";
import { startVisionAgentSession } from "@/lib/server/vision-agent";

const AGENT_USER = { id: "language-teacher", name: "Language Teacher" };

type StartAgentBody = {
  languageId?: string;
  lessonId?: string;
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartAgentBody;

    if (!body.lessonId || !body.languageId) {
      return Response.json({ error: "A lesson and language are required." }, { headers: corsHeaders, status: 400 });
    }

    const user = await getAuthenticatedUser(request);
    const { lesson } = getLessonForCall(body.lessonId, body.languageId);
    const callId = lessonCallId(lesson.id, user.id);
    const callType = "audio_room";
    const streamClient = getStreamClient();
    const streamCall = streamClient.video.call(callType, callId);

    await streamClient.upsertUsers([AGENT_USER]);
    await streamCall.updateCallMembers({
      update_members: [{ role: "admin", user_id: AGENT_USER.id }],
    });
    await streamCall.goLive();

    const sessionId = await startVisionAgentSession(callId, callType);

    return Response.json(
      { agentUserId: AGENT_USER.id, sessionId },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to start the AI teacher." },
      { headers: corsHeaders, status: error instanceof Error && error.message.startsWith("Missing ") ? 500 : 400 },
    );
  }
}
