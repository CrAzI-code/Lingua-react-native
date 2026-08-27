const VISION_AGENT_REQUEST_TIMEOUT_MS = 15_000;

type AgentServerSession = {
  session_id?: unknown;
};

const getVisionAgentServerUrl = () => {
  const url = process.env.VISION_AGENT_SERVER_URL?.replace(/\/$/, "");

  if (!url) {
    throw new Error("Missing VISION_AGENT_SERVER_URL.");
  }

  return url;
};

const getAgentServerError = async (response: Response) => {
  const payload: unknown = await response.json().catch(() => null);

  if (typeof payload === "object" && payload !== null && "detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  return `Vision Agent server request failed (${response.status}).`;
};

const requestVisionAgent = async (path: string, options: RequestInit) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VISION_AGENT_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getVisionAgentServerUrl()}${path}`, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(await getAgentServerError(response));
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The Vision Agent server did not respond in time.");
    }

    throw error instanceof Error ? error : new Error("Could not reach the Vision Agent server.");
  } finally {
    clearTimeout(timeout);
  }
};

export const startVisionAgentSession = async (callId: string, callType: string) => {
  const response = await requestVisionAgent(`/calls/${encodeURIComponent(callId)}/sessions`, {
    body: JSON.stringify({ call_type: callType }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });
  const payload = (await response.json()) as AgentServerSession;

  if (typeof payload.session_id !== "string" || !payload.session_id) {
    throw new Error("The Vision Agent server did not return a session id.");
  }

  return payload.session_id;
};

export const stopVisionAgentSession = async (callId: string, sessionId: string) => {
  await requestVisionAgent(
    `/calls/${encodeURIComponent(callId)}/sessions/${encodeURIComponent(sessionId)}`,
    { method: "DELETE" },
  );
};
