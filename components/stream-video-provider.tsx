import { useAuth } from "@clerk/expo";
import {
  StreamVideo,
  StreamVideoClient,
  type StreamVideoClient as StreamVideoClientType,
} from "@stream-io/video-react-native-sdk";
import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from "react";

import { getStreamSession, type StreamUser } from "@/lib/stream-api";

type StreamConnectionState = "connecting" | "error" | "ready";

type StreamVideoContextValue = {
  client: StreamVideoClientType | null;
  error: string | null;
  retry: () => void;
  state: StreamConnectionState;
  user: StreamUser | null;
};

const StreamVideoContext = createContext<StreamVideoContextValue | null>(null);

export function StreamVideoProvider({ children }: PropsWithChildren) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const getTokenRef = useRef(getToken);
  const [client, setClient] = useState<StreamVideoClientType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [state, setState] = useState<StreamConnectionState>("connecting");
  const [user, setUser] = useState<StreamUser | null>(null);

  // Clerk can provide a new getToken function on a render. Keeping its latest
  // value in a ref prevents that identity change from reconnecting Stream.
  getTokenRef.current = getToken;

  useEffect(() => {
    let isActive = true;
    let streamClient: StreamVideoClientType | null = null;

    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      setClient(null);
      setError(null);
      setState("ready");
      setUser(null);
      return;
    }

    const connect = async () => {
      setClient(null);
      setError(null);
      setState("connecting");

      try {
        const session = await getStreamSession(() => getTokenRef.current());

        if (!isActive) {
          return;
        }

        streamClient = StreamVideoClient.getOrCreateInstance({
          apiKey: session.apiKey,
          token: session.token,
          tokenProvider: async () => (await getStreamSession(() => getTokenRef.current())).token,
          user: session.user,
        });

        if (!isActive) {
          await streamClient.disconnectUser();
          return;
        }

        setClient(streamClient);
        setState("ready");
        setUser(session.user);
      } catch (caughtError) {
        if (!isActive) {
          return;
        }

        setError(caughtError instanceof Error ? caughtError.message : "Could not connect to Stream.");
        setState("error");
      }
    };

    void connect();

    return () => {
      isActive = false;

      if (streamClient) {
        void streamClient.disconnectUser();
      }
    };
  }, [isLoaded, isSignedIn, reloadKey]);

  const value: StreamVideoContextValue = {
    client,
    error,
    retry: () => setReloadKey((value) => value + 1),
    state,
    user,
  };

  return (
    <StreamVideoContext.Provider value={value}>
      {client ? <StreamVideo client={client}>{children}</StreamVideo> : children}
    </StreamVideoContext.Provider>
  );
}

export function useStreamVideoConnection() {
  const context = useContext(StreamVideoContext);

  if (!context) {
    throw new Error("useStreamVideoConnection must be used inside StreamVideoProvider.");
  }

  return context;
}
