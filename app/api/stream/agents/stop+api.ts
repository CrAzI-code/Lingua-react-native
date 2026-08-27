import { corsHeaders, getAuthenticatedUser, getLessonForCall, lessonCallId } from "@/lib/server/stream";
import { stopVisionAgentSession } from "@/lib/server/vision-agent";

type StopAgentBody = {
  agentSessionId?: string;
  languageId?: string;
  lessonId?: string;
};

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StopAgentBody;

    if (!body.agentSessionId || !body.lessonId || !body.languageId) {
      return Response.json({ error: "An agent session, lesson, and language are required." }, { headers: corsHeaders, status: 400 });
    }

    const user = await getAuthenticatedUser(request);
    const { lesson } = getLessonForCall(body.lessonId, body.languageId);
    const callId = lessonCallId(lesson.id, user.id);

    await stopVisionAgentSession(callId, body.agentSessionId);

    return Response.json({ stopped: true }, { headers: corsHeaders });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to stop the AI teacher." },
      { headers: corsHeaders, status: error instanceof Error && error.message.startsWith("Missing ") ? 500 : 400 },
    );
  }
}
