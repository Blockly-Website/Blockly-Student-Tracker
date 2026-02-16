"use client";

import { useEffect, useState } from "react";
import {
  AppBar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Container,
  IconButton,
  Paper,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import TodayIcon from "@mui/icons-material/Today";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/components/AppProviders";
import { BlocklyLogo } from "@/components/BlocklyLogo";
import { DayView } from "@/components/DayView";
import { WeekView } from "@/components/WeekView";
import { CalendarManager } from "@/components/CalendarManager";
import { TaskManager } from "@/components/TaskManager";
import { ScheduleManager } from "@/components/ScheduleManager";
import { SettingsPanel } from "@/components/SettingsPanel";
import { DemoDataButton } from "@/components/DemoDataButton";
import { DevPanel } from "@/components/DevPanel";

const NAV_ITEMS = [
  { label: "Today", icon: <TodayIcon /> },
  { label: "Week", icon: <ViewWeekIcon /> },
  { label: "Calendar", icon: <CalendarMonthIcon /> },
  { label: "Tasks", icon: <AssignmentTurnedInIcon /> },
  { label: "Setup", icon: <SettingsIcon /> },
] as const;

const TAB_KEY = "blockly-tab";

function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return (
    <Box
      sx={{
        animation: "fadeSlideIn .2s ease-out",
        "@keyframes fadeSlideIn": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      }}
    >
      {children}
    </Box>
  );
}

interface DashboardProps {
  session: Session;
}

export function Dashboard({ session }: DashboardProps) {
  const [tab, setTab] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  /* persist active tab */
  useEffect(() => {
    const saved = localStorage.getItem(TAB_KEY);
    if (saved) {
      const n = parseInt(saved, 10);
      if (n >= 0 && n < NAV_ITEMS.length) setTab(n);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(TAB_KEY, String(tab));
  }, [tab, hydrated]);

  /* keyboard shortcuts: Ctrl/Cmd + 1-5 */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if ((e.ctrlKey || e.metaKey) && e.key >= "1" && e.key <= "5") {
        e.preventDefault();
        setTab(parseInt(e.key, 10) - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        pb: isMobile ? "80px" : 0,
        background: theme.palette.background.default,
      }}
    >
      {/* ── top bar ─────────────────────────────────────────────── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <BlocklyLogo size={28} />
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, flexGrow: 1, color: "text.primary" }}
          >
            Blockly
          </Typography>

          {/* desktop nav pills */}
          {!isMobile && (
            <Stack direction="row" spacing={0.5} sx={{ mr: 2 }}>
              {NAV_ITEMS.map((item, i) => (
                <Box
                  key={item.label}
                  onClick={() => setTab(i)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.75,
                    py: 0.85,
                    borderRadius: 2,
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.813rem",
                    color: tab === i ? "primary.main" : "text.secondary",
                    bgcolor: tab === i ? "primary.main" : "transparent",
                    ...(tab === i && {
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(99,102,241,.3)",
                    }),
                    transition: "all .2s",
                    "&:hover": {
                      bgcolor: tab === i ? "primary.main" : "action.hover",
                    },
                    "& .MuiSvgIcon-root": { fontSize: 18 },
                  }}
                >
                  {item.icon}
                  {item.label}
                </Box>
              ))}
            </Stack>
          )}

          <DemoDataButton />

          <IconButton size="small" onClick={toggleMode} sx={{ color: "text.secondary" }}>
            {mode === "light" ? <DarkModeRoundedIcon fontSize="small" /> : <LightModeRoundedIcon fontSize="small" />}
          </IconButton>

          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            onClick={handleSignOut}
            sx={{ cursor: "pointer", color: "text.secondary", "&:hover": { color: "error.main" } }}
          >
            <Typography
              variant="body2"
              sx={{ display: { xs: "none", sm: "inline" }, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {session.user.email}
            </Typography>
            <LogoutRoundedIcon fontSize="small" />
          </Stack>
        </Toolbar>
      </AppBar>

      {/* ── content ─────────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
        <TabPanel active={tab === 0}>
          <DayView onGoToSetup={() => setTab(4)} onGoToTasks={() => setTab(3)} />
        </TabPanel>
        <TabPanel active={tab === 1}>
          <WeekView />
        </TabPanel>
        <TabPanel active={tab === 2}>
          <CalendarManager />
        </TabPanel>
        <TabPanel active={tab === 3}>
          <TaskManager />
        </TabPanel>
        <TabPanel active={tab === 4}>
          <Stack spacing={2.5}>
            <SettingsPanel />
            <ScheduleManager />
          </Stack>
        </TabPanel>
      </Container>

      {/* ── mobile bottom nav ───────────────────────────────────── */}
      {isMobile && (
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1200,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: "background.paper",
          }}
        >
          <BottomNavigation
            value={tab}
            onChange={(_, v) => setTab(v)}
            showLabels
            sx={{
              height: 68,
              "& .MuiBottomNavigationAction-root": {
                minWidth: 0,
                py: 1,
                gap: 0.25,
                "& .MuiSvgIcon-root": { fontSize: 22 },
                "&.Mui-selected": { color: "primary.main" },
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.625rem",
                fontWeight: 600,
                "&.Mui-selected": { fontSize: "0.625rem" },
              },
            }}
          >
            {NAV_ITEMS.map((item) => (
              <BottomNavigationAction key={item.label} label={item.label} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      <DevPanel />
    </Box>
  );
}
