"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Provider } from "@supabase/supabase-js";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";
import { supabase } from "@/lib/supabase";
import { useThemeMode } from "@/components/AppProviders";
import { BlocklyLogo } from "@/components/BlocklyLogo";

/* ── supported OAuth providers ─────────────────────────────────────── */

const SUPPORTED_PROVIDERS: Provider[] = [
  "apple", "azure", "bitbucket", "discord", "facebook", "figma",
  "github", "gitlab", "google", "kakao", "keycloak", "linkedin",
  "linkedin_oidc", "notion", "slack", "spotify", "twitch", "twitter",
  "workos", "zoom",
];

const PROVIDER_LABELS: Partial<Record<Provider, string>> = {
  apple: "Apple", azure: "Microsoft", discord: "Discord", github: "GitHub",
  gitlab: "GitLab", google: "Google", linkedin_oidc: "LinkedIn",
  twitter: "X / Twitter", facebook: "Facebook", spotify: "Spotify",
};

const providers: Provider[] = (process.env.NEXT_PUBLIC_SUPABASE_AUTH_PROVIDERS ?? "")
  .split(",")
  .map((p) => p.trim().toLowerCase())
  .filter((p): p is Provider => SUPPORTED_PROVIDERS.includes(p as Provider));

/* ── component ─────────────────────────────────────────────────────── */

export function SupabaseSignIn() {
  const { mode } = useThemeMode();
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  /* check for existing session + listen for auth changes */
  useEffect(() => {
    if (!supabase) { setIsCheckingSession(false); return; }

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/");
    }).finally(() => setIsCheckingSession(false));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/");
    });

    return () => { listener.subscription.unsubscribe(); };
  }, [router]);

  /* ── actions ─────────────────────────────────────────────────────── */

  const handleEmailAuth = async () => {
    if (!supabase || !email.trim() || !password) return;
    setLoading(true);
    setError(null);
    setInfo(null);

    const { error: e } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (e) { setError(e.message); }
    // onAuthStateChange handles redirect
  };

  const handleOAuth = async (provider: Provider) => {
    if (!supabase) return;
    setError(null);
    const { error: e } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (e) setError(e.message);
  };

  /* ── guards ──────────────────────────────────────────────────────── */

  if (!supabase) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center", p: 2 }}>
        <Card sx={{ width: "100%", maxWidth: 460 }}>
          <CardContent>
            <Alert severity="error">
              Missing Supabase environment variables. See the README for setup instructions.
            </Alert>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (isCheckingSession) {
    return (
      <Box sx={{ minHeight: "100dvh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  /* ── render ──────────────────────────────────────────────────────── */

  const heading = "Welcome Back";
  const submitLabel = "Sign In";

  return (
    <Box
      sx={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: (theme) =>
          mode === "dark"
            ? `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.primary.dark}22)`
            : `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.primary.light}22)`,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5} alignItems="center">
            <BlocklyLogo size={64} />
            <Typography variant="h1" align="center">
              Blockly
            </Typography>
            <Typography variant="h3" align="center" color="text.secondary" sx={{ fontWeight: 500 }}>
              {heading}
            </Typography>
          </Stack>

          <Stack
            spacing={2}
            component="form"
            sx={{ mt: 3 }}
            onSubmit={(e) => { e.preventDefault(); void handleEmailAuth(); }}
          >
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              fullWidth
              required
            />

            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              fullWidth
              required
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {error && <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>}
            {info && <Alert severity="success" onClose={() => setInfo(null)}>{info}</Alert>}

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || !email.trim() || !password}
              fullWidth
              sx={{ py: 1.25 }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : submitLabel}
            </Button>
          </Stack>

          {/* OAuth providers */}
          {providers.length > 0 && (
            <>
              <Divider sx={{ my: 2.5 }}>
                <Typography variant="body2" color="text.secondary">
                  or continue with
                </Typography>
              </Divider>
              <Stack spacing={1}>
                {providers.map((p) => (
                  <Button
                    key={p}
                    variant="outlined"
                    fullWidth
                    onClick={() => void handleOAuth(p)}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {PROVIDER_LABELS[p] ?? p}
                  </Button>
                ))}
              </Stack>
            </>
          )}

          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" align="center">
            Forgot your password? Reset it in the Supabase dashboard under Authentication → Users.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
