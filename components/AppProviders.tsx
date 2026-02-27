"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { alpha, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { ThemeMode } from "@/lib/types";

/* ── Saturn-style block colour palette ─────────────────────────────── */
export const BLOCK_COLORS = [
  { bg: "#2563EB", gradient: "linear-gradient(135deg, #2563EB 0%, #93C5FD 100%)" },
  { bg: "#8B5CF6", gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)" },
  { bg: "#EC4899", gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)" },
  { bg: "#F97316", gradient: "linear-gradient(135deg, #F97316 0%, #FB923C 100%)" },
  { bg: "#10B981", gradient: "linear-gradient(135deg, #10B981 0%, #34D399 100%)" },
  { bg: "#06B6D4", gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)" },
  { bg: "#1D4ED8", gradient: "linear-gradient(135deg, #1D4ED8 0%, #93C5FD 100%)" },
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
                primary: { main: "#2563EB", dark: "#1D4ED8", light: "#93C5FD", contrastText: "#fff" },
                secondary: { main: "#1D4ED8", dark: "#1D4ED8", light: "#93C5FD" },
                text: { primary: "#0F172A", secondary: "#6B7280" },
                background: { default: "#F8FAFC", paper: "#FFFFFF" },
                success: { main: "#10B981" },
                warning: { main: "#F59E0B" },
                error: { main: "#EF4444" },
                divider: alpha("#6B7280", 0.24),
              }
            : {
                primary: { main: "#2563EB", dark: "#1D4ED8", light: "#93C5FD", contrastText: "#F8FAFC" },
                secondary: { main: "#93C5FD", dark: "#2563EB", light: "#93C5FD" },
                text: { primary: "#F8FAFC", secondary: "#F8FAFC" },
                background: { default: "#0F172A", paper: "#1E293B" },
                success: { main: "#10B981" },
                warning: { main: "#F59E0B" },
                error: { main: "#EF4444" },
                divider: alpha("#6B7280", 0.28),
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
                "&:hover": { boxShadow: "0 4px 12px rgba(37,99,235,.35)" },
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
