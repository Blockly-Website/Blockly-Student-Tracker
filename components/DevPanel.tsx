"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import BugReportRoundedIcon from "@mui/icons-material/BugReportRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

/**
 * Lightweight dev-only floating panel.
 * Only renders when NODE_ENV === "development".
 * Provides quick actions for testing without affecting production.
 */
export function DevPanel() {
  const [open, setOpen] = useState(false);

  if (process.env.NODE_ENV !== "development") return null;

  const clearPrefs = () => {
    localStorage.removeItem("blockly-prefs");
    localStorage.removeItem("blockly-tab");
    window.location.reload();
  };

  const clearAllStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: { xs: 80, md: 16 },
        left: 12,
        zIndex: 9999,
      }}
    >
      <Collapse in={open}>
        <Box
          sx={{
            mb: 1,
            p: 2,
            borderRadius: 2,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "warning.main",
            boxShadow: 4,
            minWidth: 210,
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: "warning.main", letterSpacing: "0.08em" }}
              >
                DEV TOOLS
              </Typography>
              <IconButton size="small" onClick={() => setOpen(false)}>
                <CloseRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Shortcuts: Ctrl+1‑5 tabs, ←→ days
            </Typography>

            <Button size="small" variant="outlined" color="warning" onClick={clearPrefs} fullWidth>
              Reset preferences
            </Button>
            <Button size="small" variant="outlined" color="error" onClick={clearAllStorage} fullWidth>
              Clear all storage &amp; reload
            </Button>
          </Stack>
        </Box>
      </Collapse>

      <Tooltip title="Dev tools (development only)" placement="right">
        <IconButton
          onClick={() => setOpen((o) => !o)}
          size="small"
          sx={{
            bgcolor: "warning.main",
            color: "#fff",
            width: 32,
            height: 32,
            boxShadow: 2,
            opacity: open ? 1 : 0.4,
            transition: "opacity .2s",
            "&:hover": { opacity: 1, bgcolor: "warning.dark" },
          }}
        >
          <BugReportRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
