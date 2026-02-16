"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { supabase } from "@/lib/supabase";
import { usePreferences } from "@/lib/preferences";
import { ScheduleType } from "@/lib/types";

export function SettingsPanel() {
  const { prefs, setPref } = usePreferences();
  const [types, setTypes] = useState<ScheduleType[]>([]);

  const loadTypes = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("schedule_types").select("*").order("created_at");
    if (data) setTypes(data as ScheduleType[]);
  }, []);

  useEffect(() => { void loadTypes(); }, [loadTypes]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <SettingsRoundedIcon sx={{ color: "primary.main" }} />
            <Typography variant="h2">Preferences</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary">
            These settings are saved locally in your browser.
          </Typography>

          {/* 24h clock */}
          <Box sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: "action.hover" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.use24h}
                  onChange={(e) => setPref("use24h", e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    24-hour clock
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prefs.use24h ? "Showing 14:30" : "Showing 2:30 PM"}
                  </Typography>
                </Box>
              }
              sx={{ mx: 0, width: "100%", justifyContent: "space-between" }}
              labelPlacement="start"
            />
          </Box>

          {/* Default schedule */}
          <Box>
            <TextField
              select
              label="Default schedule type"
              value={prefs.defaultScheduleId}
              onChange={(e) => setPref("defaultScheduleId", e.target.value)}
              fullWidth
              helperText="Leave on Auto to let the app pick based on A/B day patterns."
            >
              <MenuItem value="">Auto-detect</MenuItem>
              {types.map((t) => (
                <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Show weekends */}
          <Box sx={{ px: 1, py: 0.5, borderRadius: 2, bgcolor: "action.hover" }}>
            <FormControlLabel
              control={
                <Switch
                  checked={prefs.showWeekends}
                  onChange={(e) => setPref("showWeekends", e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Show weekends in Week view
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {prefs.showWeekends ? "Showing Sat & Sun" : "Mon–Fri only"}
                  </Typography>
                </Box>
              }
              sx={{ mx: 0, width: "100%", justifyContent: "space-between" }}
              labelPlacement="start"
            />
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
