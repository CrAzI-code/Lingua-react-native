import { createClerkClient, verifyToken } from "@clerk/backend";
import { StreamClient } from "@stream-io/node-sdk";

import { lessons } from "@/data/lessons";
import { languages } from "@/data/languages";
import type { LanguageId } from "@/types/learning";

export const corsHeaders = {
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "OPTIONS, POST",
  "Access-Control-Allow-Origin": "*",
};

type ServerEnvironmentVariable = "CLERK_SECRET_KEY" | "STREAM_API_KEY" | "STREAM_API_SECRET";

const getRequiredEnvironmentValue = (name: ServerEnvironmentVariable) => {
  const environment = {
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    STREAM_API_KEY: process.env.STREAM_API_KEY,
    STREAM_API_SECRET: process.env.STREAM_API_SECRET,
  };
  const value = environment[name];

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
};

const getClerkSecretKey = () => getRequiredEnvironmentValue("CLERK_SECRET_KEY");

export const getStreamClient = () =>
  new StreamClient(
    getRequiredEnvironmentValue("STREAM_API_KEY"),
    getRequiredEnvironmentValue("STREAM_API_SECRET"),
  );

export const getStreamApiKey = () => getRequiredEnvironmentValue("STREAM_API_KEY");

const getBearerToken = (request: Request) => {
  const authorization = request.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    throw new Error("Sign in to start an audio lesson.");
  }

  return authorization.slice("Bearer ".length);
};

export const getAuthenticatedUser = async (request: Request) => {
  const verifiedToken = await verifyToken(getBearerToken(request), {
    secretKey: getClerkSecretKey(),
  });

  if (!verifiedToken?.sub) {
    throw new Error("Your session could not be verified.");
  }

  const clerkClient = createClerkClient({ secretKey: getClerkSecretKey() });
  const user = await clerkClient.users.getUser(verifiedToken.sub);
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "Learner";

  return {
    id: user.id,
    ...(user.imageUrl ? { image: user.imageUrl } : {}),
    name,
  };
};

export const getLessonForCall = (lessonId: string, languageId: string) => {
  const lesson = lessons.find(
    (item) => item.id === lessonId && item.languageId === (languageId as LanguageId),
  );
  const language = languages.find((item) => item.id === (languageId as LanguageId));

  if (!lesson || !language) {
    throw new Error("That lesson is no longer available.");
  }

  return { language, lesson };
};

export const lessonCallId = (lessonId: string, userId: string) =>
  `audio-${lessonId}-${userId}`.replace(/[^a-zA-Z0-9_-]/g, "-");
