export type StreamUser = {
  id: string;
  image?: string;
  name: string;
};

export type StreamSession = {
  apiKey: string;
  token: string;
  user: StreamUser;
};

export type LessonCall = {
  callId: string;
  callType: string;
};

export type LessonAgentSession = {
  agentUserId: string;
  sessionId: string;
};

type GetClerkToken = () => Promise<string | null>;

const REQUEST_TIMEOUT_MS = 45_000;

const getApiUrl = () => {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");

  if (!apiUrl || apiUrl.includes("your-api-domain.com")) {
    const message = __DEV__
      ? "Set EXPO_PUBLIC_API_URL to your Expo dev server's LAN URL (for example, http://192.168.1.10:8081), then restart Expo."
      : "Set EXPO_PUBLIC_API_URL to your deployed HTTPS API URL, then rebuild the app.";

    throw new Error(message);
  }

  return apiUrl;
};

const getErrorMessage = async (response: Response) => {
  const payload: unknown = await response.json().catch(() => null);

  if (typeof payload === "object" && payload !== null && "error" in payload) {
    const error = payload.error;

    if (typeof error === "string") {
      return error;
    }
  }

  return `Request failed (${response.status}).`;
};

const authorizedPost = async <T>(
  path: string,
  getToken: GetClerkToken,
  body?: Record<string, string>,
): Promise<T> => {
  const token = await getToken();

  if (!token) {
    throw new Error("Your session expired. Please sign in again.");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${getApiUrl()}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("The API did not respond. Check EXPO_PUBLIC_API_URL and your network connection.");
    }

    throw new Error("Could not reach the API. Check EXPO_PUBLIC_API_URL and your network connection.");
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as T;
};

export const getStreamSession = (getToken: GetClerkToken) =>
  authorizedPost<StreamSession>("/api/stream/session", getToken);

export const createLessonCall = (
  getToken: GetClerkToken,
  lessonId: string,
  languageId: string,
) =>
  authorizedPost<LessonCall>("/api/stream/calls", getToken, {
    languageId,
    lessonId,
  });

export const startLessonAgent = (
  getToken: GetClerkToken,
  lessonId: string,
  languageId: string,
) =>
  authorizedPost<LessonAgentSession>("/api/stream/agents/start", getToken, {
    languageId,
    lessonId,
  });

export const stopLessonAgent = (
  getToken: GetClerkToken,
  lessonId: string,
  languageId: string,
  agentSessionId: string,
) =>
  authorizedPost<{ stopped: boolean }>("/api/stream/agents/stop", getToken, {
    agentSessionId,
    languageId,
    lessonId,
  });
