"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { alpha, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { ThemeMode } from "@/lib/types";

/* ── Saturn-style block colour palette ─────────────────────────────── */
export const BLOCK_COLORS = [
  { bg: "#6366F1", gradient: "linear-gradient(135deg, #6366F1 0%, #818CF8 100%)" },
  { bg: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)" },
  { bg: "#EC4899", gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)" },
  { bg: "#F97316", gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)" },
  { bg: "#10B981", gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" },
  { bg: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)" },
  { bg: "#3B82F6", gradient: "linear-gradient(135deg, #3B82F6 0%, #60A5FA 100%)" },
  { bg: "#F43F5E", gradient: "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)" },
];
export const LUNCH_COLOR = {
  bg: "#F59E0B",
  gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
};
export const HOLIDAY_COLOR = {
  bg: "#94A3B8",
  gradient: "linear-gradient(135deg, #94A3B8 0%, #CBD5E1 100%)",
};

export function blockColor(index: number, isLunch: boolean) {
  if (isLunch) return LUNCH_COLOR;
  return BLOCK_COLORS[index % BLOCK_COLORS.length];
}

/* ── theme mode context ────────────────────────────────────────────── */
interface ThemeModeContextValue {
  mode: ThemeMode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>("light");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                primary: { main: "#6366F1", dark: "#4F46E5", light: "#A5B4FC", contrastText: "#fff" },
                secondary: { main: "#EC4899", dark: "#DB2777", light: "#F9A8D4" },
                text: { primary: "#1E293B", secondary: "#64748B" },
                background: { default: "#F1F5F9", paper: "#FFFFFF" },
                success: { main: "#10B981" },
                warning: { main: "#F59E0B" },
                error: { main: "#EF4444" },
                divider: alpha("#94A3B8", 0.18),
              }
            : {
                primary: { main: "#818CF8", dark: "#6366F1", light: "#C7D2FE", contrastText: "#0F172A" },
                secondary: { main: "#F472B6", dark: "#EC4899", light: "#FBCFE8" },
                text: { primary: "#F1F5F9", secondary: "#94A3B8" },
                background: { default: "#0F172A", paper: "#1E293B" },
                success: { main: "#34D399" },
                warning: { main: "#FBBF24" },
                error: { main: "#FB7185" },
                divider: alpha("#94A3B8", 0.14),
              }),
        },
        typography: {
          fontFamily: "var(--font-inter), Inter, sans-serif",
          h1: { fontFamily: "var(--font-outfit), Outfit, sans-serif", fontWeight: 700, fontSize: "2rem", letterSpacing: "-0.02em" },
          h2: { fontFamily: "var(--font-outfit), Outfit, sans-serif", fontWeight: 700, fontSize: "1.5rem", letterSpacing: "-0.01em" },
          h3: { fontFamily: "var(--font-outfit), Outfit, sans-serif", fontWeight: 600, fontSize: "1.17rem" },
          h6: { fontFamily: "var(--font-outfit), Outfit, sans-serif", fontWeight: 600, fontSize: "1rem" },
          body1: { fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 400, fontSize: "0.938rem", lineHeight: 1.6 },
          body2: { fontFamily: "var(--font-inter), Inter, sans-serif", fontWeight: 400, fontSize: "0.813rem", lineHeight: 1.55 },
          caption: {
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 500,
            fontSize: "0.688rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase" as const,
          },
          button: {
            fontFamily: "var(--font-inter), Inter, sans-serif",
            fontWeight: 600,
            textTransform: "none" as const,
            fontSize: "0.875rem",
          },
        },
        shape: { borderRadius: 10 },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              },
              "*::-webkit-scrollbar": { width: 6 },
              "*::-webkit-scrollbar-thumb": { background: "rgba(100,116,139,.25)", borderRadius: 3 },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: ({ theme: t }) => ({
                borderRadius: 14,
                border: `1px solid ${t.palette.divider}`,
                boxShadow:
                  t.palette.mode === "light"
                    ? "0 1px 3px rgba(15,23,42,.04), 0 4px 14px rgba(15,23,42,.06)"
                    : "0 1px 3px rgba(0,0,0,.3), 0 4px 14px rgba(0,0,0,.25)",
                transition: "box-shadow .2s, transform .2s",
              }),
            },
          },
          MuiButton: {
            styleOverrides: {
              root: { borderRadius: 10, paddingInline: 20, paddingBlock: 8 },
              containedPrimary: {
                boxShadow: "none",
                "&:hover": { boxShadow: "0 4px 12px rgba(99,102,241,.35)" },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: { root: { borderRadius: 10 } },
          },
          MuiChip: {
            styleOverrides: { root: { borderRadius: 8, fontWeight: 600, fontSize: "0.75rem" } },
          },
          MuiTab: {
            styleOverrides: {
              root: { minHeight: 48, borderRadius: 10, fontWeight: 600, fontSize: "0.813rem" },
            },
          },
          MuiTabs: {
            styleOverrides: { indicator: { height: 3, borderRadius: 3 } },
          },
          MuiTextField: { defaultProps: { size: "small" } },
          MuiOutlinedInput: {
            styleOverrides: { root: { borderRadius: 10 } },
          },
          MuiTooltip: {
            styleOverrides: { tooltip: { borderRadius: 8, fontSize: "0.75rem" } },
          },
        },
      }),
    [mode],
  );

  const value = useMemo(
    () => ({ mode, toggleMode: () => setMode((c) => (c === "light" ? "dark" : "light")) }),
    [mode],
  );

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error("useThemeMode must be used inside AppProviders");
  return ctx;
}
