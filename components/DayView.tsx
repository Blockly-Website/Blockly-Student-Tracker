"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import RestaurantRoundedIcon from "@mui/icons-material/RestaurantRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { supabase } from "@/lib/supabase";
import { ScheduleBlock, ScheduleType, Task } from "@/lib/types";
import { blockColor, HOLIDAY_COLOR } from "@/components/AppProviders";
import { formatTime, usePreferences } from "@/lib/preferences";

/* ── helpers ───────────────────────────────────────────────────────── */

interface RawOverride {
  id: string;
  override_date: string;
  schedule_type_id: string;
}

const AB_A = ["day a", "a day", "a-day"];
const AB_B = ["day b", "b day", "b-day"];

function findABTypes(types: ScheduleType[]) {
  return {
    typeA: types.find((t) => AB_A.some((k) => t.name.toLowerCase().includes(k))),
    typeB: types.find((t) => AB_B.some((k) => t.name.toLowerCase().includes(k))),
  };
}

function defaultSchedule(date: string, types: ScheduleType[]) {
  const { typeA, typeB } = findABTypes(types);
  if (typeA && typeB) {
    const off = dayjs(date).diff(dayjs("2024-01-01"), "day");
    return off % 2 === 0 ? typeA : typeB;
  }
  return types[0];
}

/* ── component ─────────────────────────────────────────────────────── */

interface DayViewProps {
  onGoToSetup?: () => void;
  onGoToTasks?: () => void;
}

export function DayView({ onGoToSetup, onGoToTasks }: DayViewProps) {
  const { prefs } = usePreferences();
  const [dateOffset, setDateOffset] = useState(0);
  const selectedDate = useMemo(() => dayjs().add(dateOffset, "day").format("YYYY-MM-DD"), [dateOffset]);

  const [types, setTypes] = useState<ScheduleType[]>([]);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [overrides, setOverrides] = useState<RawOverride[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [quickTask, setQuickTask] = useState("");

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured."); return; }
    setError(null);
    const [tRes, bRes, oRes, tkRes] = await Promise.all([
      supabase.from("schedule_types").select("*").order("created_at"),
      supabase.from("schedule_blocks").select("*").order("block_index"),
      supabase.from("schedule_overrides").select("id, override_date, schedule_type_id").order("override_date"),
      supabase.from("tasks").select("*").eq("due_date", selectedDate).order("created_at", { ascending: false }),
    ]);
    if (tRes.error || bRes.error || oRes.error || tkRes.error) {
      setError(tRes.error?.message ?? bRes.error?.message ?? oRes.error?.message ?? tkRes.error?.message ?? "Load failed");
      return;
    }
    setTypes(tRes.data as ScheduleType[]);
    setBlocks(bRes.data as ScheduleBlock[]);
    setOverrides(oRes.data as RawOverride[]);
    setTasks(tkRes.data as Task[]);
  }, [selectedDate]);

  useEffect(() => { void load(); }, [load]);

  /* keyboard navigation: arrow keys to change day */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") setDateOffset((d) => d - 1);
      if (e.key === "ArrowRight") setDateOffset((d) => d + 1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const isWeekend = useMemo(() => [0, 6].includes(dayjs(selectedDate).day()), [selectedDate]);

  const activeType = useMemo(() => {
    if (isWeekend || types.length === 0) return undefined;
    const ov = overrides.find((o) => o.override_date === selectedDate);
    if (ov) return types.find((t) => t.id === ov.schedule_type_id);
    if (prefs.defaultScheduleId) {
      const manual = types.find((t) => t.id === prefs.defaultScheduleId);
      if (manual) return manual;
    }
    return defaultSchedule(selectedDate, types);
  }, [isWeekend, overrides, types, selectedDate, prefs.defaultScheduleId]);

  const dayBlocks = useMemo(
    () => blocks.filter((b) => b.schedule_type_id === activeType?.id).sort((a, b) => a.block_index - b.block_index),
    [activeType?.id, blocks],
  );

  const isHoliday = activeType?.name.toLowerCase().includes("holiday") ?? false;
  const isToday = dateOffset === 0;
  const dayLabel = dayjs(selectedDate);

  /* ── current-class indicator ─────────────────────────────────────── */
  const now = dayjs();
  const nowMinutes = now.hour() * 60 + now.minute();
  const currentBlockId = useMemo(() => {
    if (!isToday) return null;
    for (const b of dayBlocks) {
      const [sh, sm] = b.start_time.split(":").map(Number);
      const [eh, em] = b.end_time.split(":").map(Number);
      if (nowMinutes >= sh * 60 + sm && nowMinutes < eh * 60 + em) return b.id;
    }
    return null;
  }, [isToday, dayBlocks, nowMinutes]);

  const nextBlockId = useMemo(() => {
    if (!isToday || currentBlockId) return null;
    for (const b of dayBlocks) {
      const [sh, sm] = b.start_time.split(":").map(Number);
      if (nowMinutes < sh * 60 + sm) return b.id;
    }
    return null;
  }, [isToday, dayBlocks, nowMinutes, currentBlockId]);

  const greeting = useMemo(() => {
    const h = now.hour();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }, [now]);

  const dayProgress = useMemo(() => {
    if (!isToday || dayBlocks.length === 0) return null;
    const [sh, sm] = dayBlocks[0].start_time.split(":").map(Number);
    const [eh, em] = dayBlocks[dayBlocks.length - 1].end_time.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    if (nowMinutes < startMin) return 0;
    if (nowMinutes >= endMin) return 100;
    return Math.round(((nowMinutes - startMin) / (endMin - startMin)) * 100);
  }, [isToday, dayBlocks, nowMinutes]);

  const addQuickTask = useCallback(async () => {
    if (!supabase || !quickTask.trim()) return;
    const { error: e } = await supabase.from("tasks").insert({ title: quickTask.trim(), due_date: selectedDate, schedule_block_id: null });
    if (e) { setError(e.message); return; }
    setQuickTask("");
    await load();
  }, [quickTask, selectedDate, load]);

  return (
    <Stack spacing={2.5}>
      {/* ── date header ─────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          {isToday && (
            <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 600, mb: 0.25 }}>
              {greeting}
            </Typography>
          )}
          <Typography variant="h1" sx={{ lineHeight: 1.15 }}>
            {dayLabel.format("dddd")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {dayLabel.format("MMMM D, YYYY")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {!isToday && (
            <Chip
              label="Today"
              size="small"
              color="primary"
              onClick={() => setDateOffset(0)}
              sx={{ mr: 1 }}
            />
          )}
          <IconButton onClick={() => setDateOffset((d) => d - 1)} size="small">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton onClick={() => setDateOffset((d) => d + 1)} size="small">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* ── schedule label ──────────────────────────────────────── */}
      {activeType && !isWeekend && (
        <Chip
          label={isHoliday ? "Holiday — No Classes" : activeType.name}
          sx={{
            alignSelf: "flex-start",
            background: isHoliday ? HOLIDAY_COLOR.gradient : "primary.main",
            color: "#fff",
            fontWeight: 700,
            px: 1,
          }}
        />
      )}

      {/* ── day progress ────────────────────────────────────────── */}
      {dayProgress !== null && (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {dayProgress === 100 ? "Day complete!" : dayProgress === 0 ? "Day hasn\u2019t started" : "Day progress"}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: dayProgress === 100 ? "success.main" : "primary.main" }}>
              {dayProgress}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={dayProgress}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                ...(dayProgress === 100 && { bgcolor: "success.main" }),
              },
            }}
          />
        </Box>
      )}

      {/* ── block timeline ──────────────────────────────────────── */}
      {isWeekend ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: 2.5,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            🎉
          </Typography>
          <Typography variant="h3" color="text.secondary">
            No classes — enjoy your weekend!
          </Typography>
        </Box>
      ) : isHoliday ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: 2.5,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="h2" sx={{ mb: 0.5 }}>
            🏖️
          </Typography>
          <Typography variant="h3" color="text.secondary">
            Holiday — relax!
          </Typography>
        </Box>
      ) : dayBlocks.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 8,
            borderRadius: 2.5,
            bgcolor: "action.hover",
          }}
        >
          <Typography variant="h3" color="text.secondary" sx={{ mb: 2 }}>
            No blocks yet \u2014 set up your schedule to get started.
          </Typography>
          {onGoToSetup && (
            <Button variant="contained" size="small" startIcon={<SettingsRoundedIcon />} onClick={onGoToSetup}>
              Go to Setup
            </Button>
          )}
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {dayBlocks.map((block, idx) => {
            const color = blockColor(idx, block.is_lunch);
            const isCurrent = block.id === currentBlockId;
            const isNext = block.id === nextBlockId;
            return (
              <Box
                key={block.id}
                sx={{
                  display: "flex",
                  gap: 2,
                  alignItems: "stretch",
                  position: "relative",
                  ...(isCurrent && { transform: "scale(1.02)", zIndex: 1 }),
                  ...(isNext && { transform: "scale(1.01)" }),
                  transition: "transform .2s",
                }}
              >
                {/* time column */}
                <Box
                  sx={{
                    width: 56,
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    pt: 1.5,
                    pr: 0.5,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: color.bg, lineHeight: 1.2 }}>
                    {formatTime(block.start_time, prefs.use24h)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.2, mt: 0.25 }}>
                    {formatTime(block.end_time, prefs.use24h)}
                  </Typography>
                </Box>

                {/* colour bar */}
                <Box
                  sx={{
                    width: 4,
                    flexShrink: 0,
                    borderRadius: 2,
                    background: color.gradient,
                  }}
                />

                {/* card */}
                <Box
                  sx={{
                    flex: 1,
                    background: color.gradient,
                    borderRadius: 2,
                    px: 2.5,
                    py: 1.75,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    boxShadow: isCurrent
                      ? `0 4px 20px ${color.bg}55`
                      : isNext
                        ? `0 3px 12px ${color.bg}33`
                        : `0 2px 8px ${color.bg}22`,
                    ...(isCurrent && { outline: "2px solid #fff", outlineOffset: 2 }),
                    ...(isNext && { opacity: 0.88 }),
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>
                      {block.name}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.25, opacity: 0.85 }}>
                      <AccessTimeRoundedIcon sx={{ fontSize: 14 }} />
                      <Typography variant="body2" sx={{ color: "inherit" }}>
                        {formatTime(block.start_time, prefs.use24h)} – {formatTime(block.end_time, prefs.use24h)}
                      </Typography>
                    </Stack>
                  </Box>
                  {block.is_lunch && <RestaurantRoundedIcon sx={{ fontSize: 22, opacity: 0.85 }} />}
                  {isCurrent && (
                    <Chip
                      label="NOW"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,.25)",
                        color: "#fff",
                        fontWeight: 800,
                        fontSize: "0.65rem",
                        height: 22,
                      }}
                    />
                  )}
                  {isNext && (
                    <Chip
                      label="UP NEXT"
                      size="small"
                      sx={{
                        bgcolor: "rgba(255,255,255,.2)",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.6rem",
                        height: 20,
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {/* ── tasks ───────────────────────────────────────────────── */}
      {tasks.length > 0 && (
        <Box>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Typography variant="h3">Tasks Due</Typography>
            {onGoToTasks && (
              <Chip label="View all" size="small" variant="outlined" onClick={onGoToTasks} sx={{ cursor: "pointer" }} />
            )}
          </Stack>
          <Stack spacing={1}>
            {tasks.map((task) => (
              <Box
                key={task.id}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  px: 2,
                  py: 1.25,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 500,
                    textDecoration: task.is_completed ? "line-through" : "none",
                    opacity: task.is_completed ? 0.55 : 1,
                  }}
                >
                  {task.title}
                </Typography>
                <Chip
                  size="small"
                  label={task.is_completed ? "Done" : "Open"}
                  color={task.is_completed ? "success" : "default"}
                />
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* ── quick-add task ──────────────────────────────────────── */}
      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder={`Add a task for ${isToday ? "today" : dayLabel.format("MMM D")}\u2026`}
          value={quickTask}
          onChange={(e) => setQuickTask(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void addQuickTask(); }}
          fullWidth
          sx={{ "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
        />
        <IconButton
          onClick={() => void addQuickTask()}
          disabled={!quickTask.trim()}
          sx={{
            bgcolor: "primary.main",
            color: "#fff",
            borderRadius: 2,
            "&:hover": { bgcolor: "primary.dark" },
            "&.Mui-disabled": { bgcolor: "action.disabledBackground", color: "text.disabled" },
          }}
        >
          <AddRoundedIcon />
        </IconButton>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
