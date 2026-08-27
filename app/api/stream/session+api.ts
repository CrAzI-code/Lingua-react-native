import { corsHeaders, getAuthenticatedUser, getStreamApiKey, getStreamClient } from "@/lib/server/stream";

export function OPTIONS() {
  return new Response(null, { headers: corsHeaders });
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request);
    const streamClient = getStreamClient();

    await streamClient.upsertUsers([{ id: user.id, image: user.image, name: user.name }]);

    return Response.json(
      {
        apiKey: getStreamApiKey(),
        token: streamClient.generateUserToken({ user_id: user.id, validity_in_seconds: 60 * 60 * 4 }),
        user,
      },
      { headers: corsHeaders },
    );
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unable to create a Stream session." },
      { headers: corsHeaders, status: error instanceof Error && error.message.startsWith("Missing ") ? 500 : 401 },
    );
  }
}
