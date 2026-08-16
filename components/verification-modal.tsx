import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Text,
  TextInput,
  View,
} from "react-native";
type VerificationModalProps = {
  visible: boolean;
  email: string;
  isLoading: boolean;
  onRequestClose: () => void;
  onVerify: (code: string) => Promise<void>;
};

export function VerificationModal({
  visible,
  email,
  isLoading,
  onRequestClose,
  onVerify,
}: VerificationModalProps) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");

  useEffect(() => {
    if (!visible) {
      setCode("");
      return;
    }

    const timeout = setTimeout(() => inputRef.current?.focus(), 250);
    return () => clearTimeout(timeout);
  }, [visible]);

  const handleCodeChange = (value: string) => {
    const nextCode = value.replace(/\D/g, "").slice(0, 6);
    setCode(nextCode);

    if (nextCode.length === 6 && !isLoading) {
      Keyboard.dismiss();
      void onVerify(nextCode);
    }
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={onRequestClose}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={process.env.EXPO_OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end bg-black/35 px-5 pb-5"
      >
        <View className="rounded-[30px] bg-white px-6 pb-8 pt-7">
          <Text className="text-center font-poppins-semibold text-[25px] text-text-primary">
            Check your email
          </Text>
          <Text className="mt-3 text-center font-poppins text-[15px] leading-6 text-text-secondary">
            We sent a 6-digit verification code to{"\n"}
            <Text className="font-poppins-medium text-text-primary">{email || "your email address"}</Text>
          </Text>

          <View className="relative mt-7 h-15 justify-center">
            <View className="flex-row justify-between gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  className={`h-13 flex-1 items-center justify-center rounded-[14px] border ${
                    code[index] ? "border-lingua-purple bg-[#F5F2FF]" : "border-[#E7E8EF]"
                  }`}
                  key={index}
                >
                  <Text className="font-poppins-semibold text-[21px] text-text-primary">
                    {code[index] ?? ""}
                  </Text>
                </View>
              ))}
            </View>
            <TextInput
              ref={inputRef}
              value={code}
              onChangeText={handleCodeChange}
              keyboardType="number-pad"
              maxLength={6}
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              className="absolute inset-0 opacity-0"
            />
          </View>
          <Text className="mt-5 text-center font-poppins text-[13px] text-text-secondary">
            Enter the code to continue
          </Text>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
