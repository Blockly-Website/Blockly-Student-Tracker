"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs, { Dayjs } from "dayjs";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { supabase } from "@/lib/supabase";
import { ScheduleBlock, ScheduleType } from "@/lib/types";
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

function mondayFor(d: Dayjs) {
  const day = d.day();
  return d.add(day === 0 ? -6 : 1 - day, "day").startOf("day");
}

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

export function WeekView() {
  const { prefs } = usePreferences();
  const [weekOffset, setWeekOffset] = useState(0);
  const [types, setTypes] = useState<ScheduleType[]>([]);
  const [allBlocks, setAllBlocks] = useState<ScheduleBlock[]>([]);
  const [overrides, setOverrides] = useState<RawOverride[]>([]);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down("md"));

  const monday = useMemo(() => mondayFor(dayjs()).add(weekOffset, "week"), [weekOffset]);
  const weekdays = useMemo(() => {
    const dayCount = prefs.showWeekends ? 7 : 5;
    const start = prefs.showWeekends ? monday.subtract(1, "day") : monday; // Sun if weekends
    return Array.from({ length: dayCount }, (_, i) => start.add(i, "day"));
  }, [monday, prefs.showWeekends]);
  const isThisWeek = weekOffset === 0;

  const load = useCallback(async () => {
    if (!supabase) { setError("Supabase not configured."); return; }
    setError(null);
    const [tRes, bRes, oRes] = await Promise.all([
      supabase.from("schedule_types").select("*").order("created_at"),
      supabase.from("schedule_blocks").select("*").order("block_index"),
      supabase.from("schedule_overrides").select("id, override_date, schedule_type_id").order("override_date"),
    ]);
    if (tRes.error || bRes.error || oRes.error) {
      setError(tRes.error?.message ?? bRes.error?.message ?? oRes.error?.message ?? "Load failed");
      return;
    }
    setTypes(tRes.data as ScheduleType[]);
    setAllBlocks(bRes.data as ScheduleBlock[]);
    setOverrides(oRes.data as RawOverride[]);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const scheduleFor = useCallback(
    (date: string) => {
      const ov = overrides.find((o) => o.override_date === date);
      if (ov) return types.find((t) => t.id === ov.schedule_type_id);
      if (prefs.defaultScheduleId) {
        const manual = types.find((t) => t.id === prefs.defaultScheduleId);
        if (manual) return manual;
      }
      return defaultSchedule(date, types);
    },
    [overrides, types, prefs.defaultScheduleId],
  );

  const blocksFor = useCallback(
    (typeId: string | undefined) =>
      typeId
        ? allBlocks.filter((b) => b.schedule_type_id === typeId).sort((a, b) => a.block_index - b.block_index)
        : [],
    [allBlocks],
  );

  /* ── render ──────────────────────────────────────────────────────── */

  return (
    <Stack spacing={2.5}>
      {/* header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography variant="h1" sx={{ lineHeight: 1.15 }}>
            Week
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weekdays[0].format("MMM D")} – {weekdays[weekdays.length - 1].format("MMM D, YYYY")}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          {!isThisWeek && (
            <Chip label="This week" size="small" color="primary" onClick={() => setWeekOffset(0)} sx={{ mr: 1 }} />
          )}
          <IconButton onClick={() => setWeekOffset((w) => w - 1)} size="small"><ChevronLeftIcon /></IconButton>
          <IconButton onClick={() => setWeekOffset((w) => w + 1)} size="small"><ChevronRightIcon /></IconButton>
        </Stack>
      </Stack>

      {/* week grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : `repeat(${weekdays.length}, 1fr)`,
          gap: 1.5,
        }}
      >
        {weekdays.map((date) => {
          const iso = date.format("YYYY-MM-DD");
          const isWeekend = date.day() === 0 || date.day() === 6;
          const sched = isWeekend ? undefined : scheduleFor(iso);
          const dayBlocks = isWeekend ? [] : blocksFor(sched?.id);
          const isHoliday = sched?.name.toLowerCase().includes("holiday") ?? false;
          const isToday = iso === dayjs().format("YYYY-MM-DD");

          return (
            <Box
              key={iso}
              sx={{
                borderRadius: 2.5,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: isToday ? "primary.main" : "divider",
                overflow: "hidden",
                ...(isToday && {
                  boxShadow: `0 0 0 2px ${theme.palette.primary.main}33`,
                }),
                transition: "transform .15s, box-shadow .15s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isToday
                    ? `0 4px 16px ${theme.palette.primary.main}33`
                    : "0 4px 16px rgba(0,0,0,.08)",
                },
              }}
            >
              {/* day header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: isToday ? "primary.main" : "text.secondary" }}>
                    {date.format("ddd")}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2, color: isToday ? "primary.main" : "text.primary" }}>
                    {date.format("D")}
                  </Typography>
                </Box>
                {sched && (
                  <Chip
                    label={isHoliday ? "Holiday" : sched.name}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: "0.625rem",
                      ...(isHoliday
                        ? { background: HOLIDAY_COLOR.gradient, color: "#fff" }
                        : { bgcolor: "primary.main", color: "#fff" }),
                    }}
                  />
                )}
              </Box>

              {/* blocks */}
              <Box sx={{ p: 1 }}>
                {isWeekend ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2, fontSize: "0.75rem" }}>
                    Weekend
                  </Typography>
                ) : isHoliday ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                    🏖️ Holiday
                  </Typography>
                ) : dayBlocks.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 2, fontSize: "0.75rem" }}>
                    No blocks
                  </Typography>
                ) : (
                  <Stack spacing={0.75}>
                    {dayBlocks.map((block, idx) => {
                      const color = blockColor(idx, block.is_lunch);
                      return (
                        <Box
                          key={block.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 2,
                            background: color.gradient,
                            color: "#fff",
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              bgcolor: "rgba(255,255,255,.5)",
                              flexShrink: 0,
                            }}
                          />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              sx={{
                                fontWeight: 600,
                                fontSize: "0.75rem",
                                lineHeight: 1.2,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {block.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.625rem", opacity: 0.8, lineHeight: 1.2 }}>
                              {formatTime(block.start_time, prefs.use24h)} – {formatTime(block.end_time, prefs.use24h)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
