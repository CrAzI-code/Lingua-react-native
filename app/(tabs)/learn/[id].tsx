import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { CallingState, StreamCall, type Call } from "@stream-io/video-react-native-sdk";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";

import { useStreamVideoConnection } from "@/components/stream-video-provider";
import { images } from "@/constants/images";
import { languages } from "@/data/languages";
import { lessons } from "@/data/lessons";
import { createLessonCall, startLessonAgent, stopLessonAgent } from "@/lib/stream-api";

type AudioLessonCallState = "connecting" | "ended" | "error" | "joined" | "ready";
type AgentConnectionState = "connected" | "connecting" | "failed" | "idle";

export default function AudioLessonScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getToken } = useAuth();
  const { client, error: streamError, retry, state: streamState, user } = useStreamVideoConnection();
  const [call, setCall] = useState<Call | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [callState, setCallState] = useState<AudioLessonCallState>("ready");
  const [agentConnectionState, setAgentConnectionState] = useState<AgentConnectionState>("idle");
  const [agentError, setAgentError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showLessonDetails, setShowLessonDetails] = useState(false);
  const agentSessionIdRef = useRef<string | null>(null);
  const agentConnectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const agentParticipantSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);

  useEffect(() => {
    return () => {
      void cleanUpAudioLesson(call, false);
    };
  }, [call]);

  const lesson = lessons.find((item) => item.id === id);
  const language = lesson ? languages.find((item) => item.id === lesson.languageId) : undefined;

  const clearAgentConnectionWatch = () => {
    if (agentConnectionTimeoutRef.current) {
      clearTimeout(agentConnectionTimeoutRef.current);
      agentConnectionTimeoutRef.current = null;
    }

    agentParticipantSubscriptionRef.current?.unsubscribe();
    agentParticipantSubscriptionRef.current = null;
  };

  const stopAudioLessonAgent = async (updateUi: boolean) => {
    clearAgentConnectionWatch();
    const agentSessionId = agentSessionIdRef.current;
    agentSessionIdRef.current = null;

    if (!agentSessionId || !lesson || !language) {
      if (updateUi) {
        setAgentConnectionState("idle");
      }
      return null;
    }

    try {
      await stopLessonAgent(() => getToken(), lesson.id, language.id, agentSessionId);

      if (updateUi) {
        setAgentConnectionState("idle");
      }

      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not close the AI teacher session.";

      if (updateUi) {
        setAgentConnectionState("failed");
        setAgentError(message);
      }

      return message;
    }
  };

  const watchForTeacherConnection = (lessonCall: Call, agentUserId: string) => {
    clearAgentConnectionWatch();
    let teacherJoined = false;

    agentParticipantSubscriptionRef.current = lessonCall.state.participants$.subscribe((participants) => {
      const isTeacherInCall = participants.some((participant) => participant.userId === agentUserId);

      if (isTeacherInCall) {
        teacherJoined = true;
        if (agentConnectionTimeoutRef.current) {
          clearTimeout(agentConnectionTimeoutRef.current);
          agentConnectionTimeoutRef.current = null;
        }
        setAgentConnectionState("connected");
        setAgentError(null);
        return;
      }

      if (teacherJoined) {
        setAgentConnectionState("failed");
        setAgentError("The AI teacher left the audio room.");
      }
    });

    agentConnectionTimeoutRef.current = setTimeout(() => {
      if (!teacherJoined) {
        setAgentConnectionState("failed");
        setAgentError("The AI teacher could not join the audio room.");
      }
    }, 20_000);
  };

  const cleanUpAudioLesson = async (lessonCall: Call | null, updateUi: boolean) => {
    await stopAudioLessonAgent(updateUi);

    if (lessonCall && lessonCall.state.callingState !== CallingState.LEFT) {
      await lessonCall.leave().catch(() => undefined);
    }
  };

  if (!lesson || !language) {
    return <Redirect href="/(tabs)/learn" />;
  }

  const featuredPhrase = lesson.phrases[0] ?? {
    text: lesson.vocabulary[0]?.term ?? lesson.title,
    translation: lesson.vocabulary[0]?.translation ?? lesson.description,
  };

  const startAudioLesson = async () => {
    if (!client) {
      setCallError(streamError ?? "Your secure audio connection is still loading.");
      setCallState("error");
      return;
    }

    setCallError(null);
    setAgentError(null);
    setAgentConnectionState("idle");
    setCallState("connecting");
    let nextCall: Call | null = null;

    try {
      const lessonCall = await createLessonCall(() => getToken(), lesson.id, language.id);
      nextCall = client.call(lessonCall.callType, lessonCall.callId, { reuseInstance: true });

      setCall(nextCall);
      await nextCall.join({ create: false });
      await nextCall.camera.disable();
      setIsMuted(false);
      setAgentConnectionState("connecting");
      const agentSession = await startLessonAgent(() => getToken(), lesson.id, language.id);
      agentSessionIdRef.current = agentSession.sessionId;
      watchForTeacherConnection(nextCall, agentSession.agentUserId);
      setCallState("joined");
    } catch (error) {
      await cleanUpAudioLesson(nextCall, false);

      setCall(null);
      setAgentConnectionState("failed");
      setCallError(error instanceof Error ? error.message : "Unable to join this audio lesson.");
      setCallState("error");
    }
  };

  const toggleMicrophone = async () => {
    if (!call || callState !== "joined") {
      return;
    }

    try {
      await call.microphone.toggle();
      setIsMuted((value) => !value);
    } catch (error) {
      setCallError(error instanceof Error ? error.message : "Could not change microphone settings.");
    }
  };

  const endAudioLesson = async () => {
    if (!call) {
      router.replace("/(tabs)/learn");
      return;
    }

    setCallError(null);
    setCallState("connecting");

    try {
      const agentStopError = await stopAudioLessonAgent(true);
      await call.endCall();

      if (call.state.callingState !== CallingState.LEFT) {
        await call.leave();
      }

      setCall(null);
      setCallState("ended");

      if (agentStopError) {
        setCallError(agentStopError);
      }
    } catch (error) {
      setCallError(error instanceof Error ? error.message : "Could not end the audio lesson.");
      setCallState("joined");
    }
  };

  const getCallStatus = () => {
    if (streamState === "connecting") return "Securing your Stream connection...";
    if (streamState === "error") return "Secure audio connection unavailable";
    if (callState === "connecting") return call ? "Ending your audio lesson..." : "Joining your audio lesson...";
    if (callState === "joined" && agentConnectionState === "connecting") return "You joined - Connecting your AI teacher...";
    if (callState === "joined" && agentConnectionState === "failed") return "You joined, but the AI teacher is unavailable";
    if (callState === "joined") return isMuted ? "Joined - Your microphone is muted" : "Joined - Your microphone is on";
    if (callState === "ended") return "Audio lesson ended";
    if (callState === "error") return "Couldn't join the audio lesson";

    return "Ready to start your audio lesson";
  };

  const screen = (
    <View className="flex-1 bg-[#fbfaff]">
      <View className="flex-row items-center bg-white px-5 pb-4 pt-4">
        <Pressable
          accessibilityLabel="Return to lessons"
          accessibilityRole="button"
          className="mr-3 h-11 w-11 items-center justify-center active:opacity-70"
          onPress={() => router.replace("/(tabs)/learn")}
        >
          <Ionicons color="#0D132B" name="chevron-back" size={32} />
        </Pressable>

        <View className="flex-1">
          <Text className="font-poppins-semibold text-[25px] leading-8 text-text-primary">AI Teacher</Text>
          <View className="mt-0.5 flex-row items-center">
            <View className={`mr-2 h-3 w-3 rounded-full ${callState === "joined" ? "bg-[#22c632]" : "bg-[#ffad1f]"}`} />
            <Text className="font-poppins text-[15px] text-[#68748e]">
              {callState === "joined" ? "Online" : "Audio lesson"} - {language.name}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-2">
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Ionicons color="#0D132B" name="videocam-outline" size={24} />
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Text className="font-poppins-medium text-[20px] text-text-primary">12</Text>
          </View>
          <View className="h-12 w-12 items-center justify-center rounded-full border border-[#e7e9f1] bg-[#fbfbfd]">
            <Ionicons color="#0D132B" name="notifications-outline" size={23} />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 22 }} showsVerticalScrollIndicator={false}>
        <View className="mx-4 mt-5 h-[432px] overflow-hidden rounded-[30px] bg-[#e7e0dc]">
          <View className="absolute inset-0 bg-[#d7d0ca]" />
          <View className="absolute -right-10 top-20 h-48 w-48 rounded-full bg-[#c8c2bd] opacity-60" />
          <View className="absolute -left-8 bottom-0 h-44 w-44 rounded-full bg-[#eee4d9]" />
          <View className="absolute inset-0 items-center justify-center pb-12">
            <Image source={images.mascotWelcome} className="h-[365px] w-[365px]" resizeMode="contain" />
          </View>

          <View className="absolute bottom-5 left-5 right-5 rounded-[25px] bg-white px-5 py-4 shadow-sm">
            <View className="flex-row items-start">
              <View className="flex-1 pr-3">
                <Text className="font-poppins-semibold text-[21px] leading-7 text-text-primary">{featuredPhrase.text}</Text>
                <Text className="mt-1 font-poppins text-[16px] leading-6 text-text-primary">{featuredPhrase.translation}</Text>
              </View>
              <Pressable accessibilityLabel="Replay teacher phrase" accessibilityRole="button" className="mt-2 h-10 w-10 items-center justify-center rounded-full bg-[#f3f0ff] active:opacity-70">
                <Ionicons color="#6C4EF5" name="volume-high" size={25} />
              </Pressable>
            </View>
            <Text className="mt-2 font-poppins-medium text-[12px] text-[#6C4EF5]">{getCallStatus()}</Text>
          </View>
        </View>

        <View className="mt-5 bg-[#fbfaff] px-5 pb-4 pt-2">
          <View className="rounded-[22px] border border-[#e7e3f8] bg-white px-4 py-3">
            <View className="flex-row items-center">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-[#f1edff]">
                <Ionicons color="#6C4EF5" name="person" size={21} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="font-poppins-semibold text-[15px] text-text-primary">{user?.name ?? "Loading learner profile..."}</Text>
                <Text className="font-poppins text-[12px] text-text-secondary">{user ? "You - Stream audio learner" : "Securing your user session"}</Text>
              </View>
              {streamState === "connecting" || callState === "connecting" ? <ActivityIndicator color="#6C4EF5" /> : null}
            </View>

            <View className="mt-3 flex-row items-center rounded-xl bg-[#f6f3ff] px-3 py-2">
              <View className={`mr-2 h-2.5 w-2.5 rounded-full ${agentConnectionState === "connected" ? "bg-[#22c632]" : agentConnectionState === "failed" ? "bg-[#d6363e]" : agentConnectionState === "connecting" ? "bg-[#ffad1f]" : "bg-[#9ba3b5]"}`} />
              <Text className="font-poppins-medium text-[12px] text-text-secondary">
                AI teacher: {agentConnectionState === "connected" ? "Connected" : agentConnectionState === "connecting" ? "Connecting" : agentConnectionState === "failed" ? "Failed" : "Idle"}
              </Text>
            </View>

            {callError || agentError || streamError ? <Text className="mt-2 font-poppins-medium text-[12px] leading-5 text-[#d6363e]">{callError ?? agentError ?? streamError}</Text> : null}

            {callState !== "joined" && callState !== "connecting" ? (
              <Pressable
                accessibilityRole="button"
                className="mt-3 items-center rounded-2xl bg-lingua-purple py-3 active:opacity-80"
                disabled={streamState === "connecting"}
                onPress={streamState === "error" ? retry : () => void startAudioLesson()}
              >
                <Text className="font-poppins-semibold text-[15px] text-white">
                  {streamState === "error" ? "Retry secure connection" : callState === "ended" ? "Start another audio lesson" : callState === "error" ? "Try joining again" : "Start audio lesson"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View className="mt-5 flex-row justify-between">
            <AudioControl icon="videocam-outline" label="Camera" muted />
            <AudioControl active={callState === "joined" && !isMuted} disabled={callState !== "joined"} icon={isMuted ? "mic-off" : "mic"} label={callState !== "joined" ? "Mic" : isMuted ? "Unmute" : "Mute"} onPress={() => void toggleMicrophone()} />
            <AudioControl icon="language-outline" label="Subtitles" onPress={() => setShowLessonDetails(true)} />
            <AudioControl endCall disabled={!call} icon="call" label="End Call" onPress={() => void endAudioLesson()} />
          </View>

          <View className="mt-7 flex-row overflow-hidden rounded-[30px] bg-white py-7 shadow-sm">
            <FeedbackItem label="Speaking" value="Excellent" valueColor="text-[#22c632]" />
            <FeedbackItem label="Pronunciation" value="Great" valueColor="text-[#287aff]" bordered />
            <FeedbackItem label="Grammar" value="Good" valueColor="text-[#6C4EF5]" bordered />
          </View>
        </View>
      </ScrollView>

      <Modal animationType="slide" onRequestClose={() => setShowLessonDetails(false)} transparent visible={showLessonDetails}>
        <View className="flex-1 justify-end bg-[#0D132B]/35">
          <Pressable accessibilityLabel="Close lesson details" className="absolute inset-0" onPress={() => setShowLessonDetails(false)} />
          <View className="max-h-[78%] rounded-t-[32px] bg-white px-6 pb-8 pt-5">
            <View className="mb-4 h-1.5 w-12 self-center rounded-full bg-[#d8dce7]" />
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text className="h3 text-text-primary">{lesson.title}</Text>
                <Text className="mt-1 body-medium text-text-secondary">{language.name} audio lesson</Text>
              </View>
              <Pressable accessibilityLabel="Close subtitles" accessibilityRole="button" className="h-10 w-10 items-center justify-center rounded-full bg-[#f3f4f8]" onPress={() => setShowLessonDetails(false)}>
                <Ionicons color="#0D132B" name="close" size={22} />
              </Pressable>
            </View>

            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Today&apos;s goal</Text>
            <Text className="mt-1 body-medium text-text-secondary">{lesson.goal}</Text>
            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Phrases</Text>
            <View className="mt-2 gap-2">
              {lesson.phrases.map((phrase) => (
                <View key={phrase.text} className="rounded-2xl bg-[#f6f3ff] px-4 py-3">
                  <Text className="font-poppins-semibold text-[15px] text-text-primary">{phrase.text}</Text>
                  <Text className="mt-0.5 font-poppins text-[13px] text-text-secondary">{phrase.translation}</Text>
                </View>
              ))}
            </View>
            <Text className="mt-5 font-poppins-semibold text-[15px] text-text-primary">Teacher context</Text>
            <Text className="mt-1 body-small text-text-secondary">{lesson.aiTeacherPrompt}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );

  return call ? <StreamCall call={call}>{screen}</StreamCall> : screen;
}

type AudioControlProps = {
  active?: boolean;
  disabled?: boolean;
  endCall?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  muted?: boolean;
  onPress?: () => void;
};

function AudioControl({ icon, label, active = false, disabled = false, endCall = false, muted = false, onPress }: AudioControlProps) {
  const isDisabled = disabled || muted;

  return (
    <Pressable accessibilityLabel={label} accessibilityRole="button" accessibilityState={{ disabled: isDisabled, selected: active }} className="flex-1 items-center active:opacity-70" disabled={isDisabled} onPress={onPress}>
      <View className={`h-[78px] w-[78px] items-center justify-center rounded-full border-2 ${endCall ? isDisabled ? "border-[#f7b9bc] bg-[#f7b9bc]" : "border-[#ff343b] bg-[#ff343b]" : active ? "border-[#6C4EF5] bg-[#eee9ff]" : isDisabled ? "border-[#e4e7ef] bg-[#f8f9fc]" : "border-[#e4e7ef] bg-white"}`}>
        <Ionicons color={endCall ? "#FFFFFF" : isDisabled ? "#8993aa" : "#0D2454"} name={icon} size={34} />
      </View>
      <Text className={`mt-3 font-poppins-medium text-[16px] ${isDisabled ? "text-[#9ba3b5]" : "text-[#68748e]"}`}>{label}</Text>
    </Pressable>
  );
}

type FeedbackItemProps = {
  bordered?: boolean;
  label: string;
  value: string;
  valueColor: string;
};

function FeedbackItem({ label, value, valueColor, bordered = false }: FeedbackItemProps) {
  return (
    <View className={`flex-1 items-center ${bordered ? "border-l border-[#e8eaf1]" : ""}`}>
      <Text className="font-poppins-medium text-[16px] text-text-primary" numberOfLines={1} style={Platform.OS === "android" ? { fontSize: 14 } : undefined}>{label}</Text>
      <Text className={`mt-3 font-poppins-semibold text-[20px] ${valueColor}`}>{value}</Text>
    </View>
  );
}
