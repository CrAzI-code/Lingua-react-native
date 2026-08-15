/** JavaScript-friendly copies of the Lingua NativeWind tokens. */
export const colors = {
  linguaPurple: "#6C4EF5",
  linguaDeepPurple: "#5B3BF6",
  linguaBlue: "#4D8BFF",
  linguaGreen: "#21C16B",
  success: "#21C16B",
  warning: "#FFC800",
  streak: "#FF8A00",
  error: "#FF4D4F",
  info: "#4D8BFF",
  textPrimary: "#0D132B",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
  surface: "#F6F7FB",
  background: "#FFFFFF",
} as const;

export const typography = {
  h1: { fontFamily: "Poppins-Bold", fontSize: 32, lineHeight: 38.4 },
  h2: { fontFamily: "Poppins-SemiBold", fontSize: 24, lineHeight: 31.2 },
  h3: { fontFamily: "Poppins-SemiBold", fontSize: 20, lineHeight: 26 },
  h4: { fontFamily: "Poppins-Medium", fontSize: 16, lineHeight: 22.4 },
  bodyLarge: { fontFamily: "Poppins-Regular", fontSize: 16, lineHeight: 25.6 },
  bodyMedium: { fontFamily: "Poppins-Regular", fontSize: 14, lineHeight: 22.4 },
  bodySmall: { fontFamily: "Poppins-Regular", fontSize: 13, lineHeight: 20.8 },
  caption: { fontFamily: "Poppins-Regular", fontSize: 11, lineHeight: 15.4 },
} as const;
