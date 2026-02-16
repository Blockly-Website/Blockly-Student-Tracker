"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import BeachAccessRoundedIcon from "@mui/icons-material/BeachAccessRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { supabase } from "@/lib/supabase";
import { ScheduleType } from "@/lib/types";
import { BLOCK_COLORS, HOLIDAY_COLOR } from "@/components/AppProviders";

/* ── types ─────────────────────────────────────────────────────────── */

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

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ── component ─────────────────────────────────────────────────────── */

export function CalendarManager() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [types, setTypes] = useState<ScheduleType[]>([]);
  const [overrides, setOverrides] = useState<RawOverride[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* dialog state */
  const [dialogDate, setDialogDate] = useState<string | null>(null);
  const [dialogTypeId, setDialogTypeId] = useState("");

  const theme = useTheme();

  const startOfMonth = useMemo(() => dayjs().add(monthOffset, "month").startOf("month"), [monthOffset]);

  /* ── data loading ────────────────────────────────────────────────── */

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured."); return; }
    setError(null);
    const [tRes, oRes] = await Promise.all([
      supabase.from("schedule_types").select("*").order("created_at"),
      supabase.from("schedule_overrides").select("id, override_date, schedule_type_id").order("override_date"),
    ]);
    if (tRes.error || oRes.error) {
      setError(tRes.error?.message ?? oRes.error?.message ?? "Load failed");
      return;
    }
    setTypes(tRes.data as ScheduleType[]);
    setOverrides(oRes.data as RawOverride[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  /* ── calendar grid ───────────────────────────────────────────────── */

  const calendarDays = useMemo(() => {
    const first = startOfMonth;
    const startDay = first.day(); // 0=Sun
    const daysInMonth = first.daysInMonth();
    const cells: (Dayjs | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 0; d < daysInMonth; d++) cells.push(first.add(d, "day"));
    // pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [startOfMonth]);

  /* ── lookups ─────────────────────────────────────────────────────── */

  const overrideMap = useMemo(() => {
    const m = new Map<string, RawOverride>();
    for (const o of overrides) m.set(o.override_date, o);
    return m;
  }, [overrides]);

  const scheduleFor = useCallback(
    (date: string) => {
      const ov = overrideMap.get(date);
      if (ov) return types.find((t) => t.id === ov.schedule_type_id);
      return defaultSchedule(date, types);
    },
    [overrideMap, types],
  );

  const typeColor = useCallback(
    (type: ScheduleType | undefined) => {
      if (!type) return undefined;
      if (type.name.toLowerCase().includes("holiday")) return HOLIDAY_COLOR;
      const idx = types.indexOf(type);
      return BLOCK_COLORS[((idx < 0 ? 0 : idx)) % BLOCK_COLORS.length];
    },
    [types],
  );

  /* ── ensure holiday type ─────────────────────────────────────────── */

  const ensureHolidayId = useCallback(async () => {
    if (!supabase) throw new Error("Missing client");
    const existing = types.find((t) => t.name.toLowerCase() === "holiday");
    if (existing) return existing.id;
    const { data, error: e } = await supabase
      .from("schedule_types")
      .insert({ name: "Holiday", lunch_enabled: false, lunch_start: null, lunch_end: null })
      .select("id")
      .single();
    if (e || !data) throw new Error(e?.message ?? "Unable to create Holiday type.");
    return data.id;
  }, [types]);

  /* ── actions ─────────────────────────────────────────────────────── */

  const openDialog = (date: string) => {
    const sched = scheduleFor(date);
    setDialogDate(date);
    setDialogTypeId(sched?.id ?? types[0]?.id ?? "");
  };

  const saveOverride = async () => {
    if (!supabase || !dialogDate || !dialogTypeId) return;
    setError(null);
    const existing = overrideMap.get(dialogDate);
    if (existing) {
      const { error: e } = await supabase.from("schedule_overrides").update({ schedule_type_id: dialogTypeId }).eq("id", existing.id);
      if (e) { setError(e.message); return; }
    } else {
      const { error: e } = await supabase.from("schedule_overrides").insert({ override_date: dialogDate, schedule_type_id: dialogTypeId });
      if (e) { setError(e.message); return; }
    }
    setDialogDate(null);
    await load();
  };

  const deleteOverride = async () => {
    if (!supabase || !dialogDate) return;
    const existing = overrideMap.get(dialogDate);
    if (!existing) { setDialogDate(null); return; }
    const { error: e } = await supabase.from("schedule_overrides").delete().eq("id", existing.id);
    if (e) { setError(e.message); return; }
    setDialogDate(null);
    await load();
  };

  const markHoliday = async (date: string) => {
    if (!supabase) return;
    setError(null);
    try {
      const holidayId = await ensureHolidayId();
      const existing = overrideMap.get(date);
      if (existing) {
        await supabase.from("schedule_overrides").update({ schedule_type_id: holidayId }).eq("id", existing.id);
      } else {
        await supabase.from("schedule_overrides").insert({ override_date: date, schedule_type_id: holidayId });
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
  };

  const removeHoliday = async (date: string) => {
    if (!supabase) return;
    const existing = overrideMap.get(date);
    if (!existing) return;
    await supabase.from("schedule_overrides").delete().eq("id", existing.id);
    await load();
  };

  const todayISO = dayjs().format("YYYY-MM-DD");

  /* ── render ──────────────────────────────────────────────────────── */

  return (
    <Stack spacing={2.5}>
      {/* header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h1" sx={{ lineHeight: 1.15 }}>
            Calendar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click any day to change its schedule or mark a holiday.
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {monthOffset !== 0 && (
            <Chip label="This month" size="small" color="primary" onClick={() => setMonthOffset(0)} sx={{ mr: 1 }} />
          )}
          <IconButton onClick={() => setMonthOffset((m) => m - 1)} size="small"><ChevronLeftIcon /></IconButton>
          <Typography sx={{ fontWeight: 700, minWidth: 130, textAlign: "center" }}>
            {startOfMonth.format("MMMM YYYY")}
          </Typography>
          <IconButton onClick={() => setMonthOffset((m) => m + 1)} size="small"><ChevronRightIcon /></IconButton>
        </Stack>
      </Stack>

      {/* legend */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {types.map((t) => {
          const c = typeColor(t);
          return (
            <Chip
              key={t.id}
              label={t.name}
              size="small"
              sx={{
                bgcolor: c?.bg ?? theme.palette.action.hover,
                color: c ? "#fff" : "text.primary",
                fontWeight: 600,
                fontSize: "0.688rem",
              }}
            />
          );
        })}
      </Stack>

      {/* calendar grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 0.5,
          borderRadius: 2.5,
          overflow: "hidden",
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          p: 1,
        }}
      >
        {/* weekday headers */}
        {WEEKDAY_LABELS.map((label) => (
          <Box key={label} sx={{ textAlign: "center", py: 0.75 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
              {label}
            </Typography>
          </Box>
        ))}

        {/* day cells */}
        {calendarDays.map((date, idx) => {
          if (!date) {
            return <Box key={`empty-${idx}`} sx={{ minHeight: 72 }} />;
          }

          const iso = date.format("YYYY-MM-DD");
          const isWeekend = date.day() === 0 || date.day() === 6;
          const sched = isWeekend ? undefined : scheduleFor(iso);
          const isHoliday = sched?.name.toLowerCase().includes("holiday") ?? false;
          const hasOverride = overrideMap.has(iso);
          const isToday = iso === todayISO;
          const color = isHoliday ? HOLIDAY_COLOR : typeColor(sched);

          return (
            <Box
              key={iso}
              onClick={() => !isWeekend && openDialog(iso)}
              sx={{
                minHeight: { xs: 56, md: 72 },
                borderRadius: 2.5,
                p: 0.75,
                cursor: isWeekend ? "default" : "pointer",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                transition: "background .15s",
                bgcolor: isWeekend
                  ? "action.disabledBackground"
                  : hasOverride
                    ? `${color?.bg ?? "transparent"}18`
                    : "transparent",
                "&:hover": !isWeekend ? { bgcolor: `${color?.bg ?? theme.palette.primary.main}22` } : {},
                ...(isToday && {
                  outline: `2px solid ${theme.palette.primary.main}`,
                  outlineOffset: -2,
                }),
              }}
            >
              {/* date number */}
              <Typography
                sx={{
                  fontWeight: isToday ? 800 : 500,
                  fontSize: "0.813rem",
                  color: isToday ? "primary.main" : isWeekend ? "text.secondary" : "text.primary",
                  lineHeight: 1,
                }}
              >
                {date.format("D")}
              </Typography>

              {/* schedule chip */}
              {sched && !isWeekend && (
                <Box
                  sx={{
                    mt: "auto",
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 1.5,
                    background: color?.gradient,
                    display: "inline-flex",
                    alignSelf: "flex-start",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.563rem",
                      fontWeight: 700,
                      color: "#fff",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: "100%",
                    }}
                  >
                    {isHoliday ? "🏖️" : sched.name}
                  </Typography>
                </Box>
              )}

              {/* override indicator dot */}
              {hasOverride && !isWeekend && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    bgcolor: color?.bg ?? "primary.main",
                  }}
                />
              )}
            </Box>
          );
        })}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {/* ── day dialog ──────────────────────────────────────────── */}
      <Dialog
        open={dialogDate !== null}
        onClose={() => setDialogDate(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2.5 } }}
      >
        {dialogDate && (() => {
          const sched = scheduleFor(dialogDate);
          const isH = sched?.name.toLowerCase().includes("holiday") ?? false;
          const hasOv = overrideMap.has(dialogDate);
          return (
            <>
              <DialogTitle sx={{ fontWeight: 700 }}>
                {dayjs(dialogDate).format("dddd, MMMM D")}
              </DialogTitle>
              <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <TextField
                    select
                    label="Schedule type for this day"
                    value={dialogTypeId}
                    onChange={(e) => setDialogTypeId(e.target.value)}
                    fullWidth
                  >
                    {types.map((t) => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </TextField>

                  {/* quick holiday buttons */}
                  {!isH ? (
                    <Button
                      variant="outlined"
                      color="warning"
                      startIcon={<BeachAccessRoundedIcon />}
                      onClick={async () => { await markHoliday(dialogDate); setDialogDate(null); }}
                      fullWidth
                    >
                      Mark as Holiday
                    </Button>
                  ) : (
                    <Button
                      variant="outlined"
                      color="info"
                      onClick={async () => { await removeHoliday(dialogDate); setDialogDate(null); }}
                      fullWidth
                    >
                      Remove Holiday
                    </Button>
                  )}

                  {hasOv && (
                    <Button
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={async () => { await deleteOverride(); }}
                      size="small"
                    >
                      Reset to default schedule
                    </Button>
                  )}
                </Stack>
              </DialogContent>
              <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setDialogDate(null)}>Cancel</Button>
                <Button variant="contained" onClick={saveOverride}>Save</Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Stack>
  );
}
