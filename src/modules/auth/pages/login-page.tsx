import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowForwardRounded, VisibilityOffRounded, VisibilityRounded } from "@mui/icons-material";
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid2,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAuthMe, useLoginMutation } from "../api/auth-hooks";

const loginSchema = z.object({
  username: z.string().min(1, "Introduce tu usuario"),
  password: z.string().min(1, "Introduce tu contrasena")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const authQuery = useAuthMe();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await loginMutation.mutateAsync(values);
    navigate((location.state as { from?: string } | undefined)?.from ?? "/dashboard", {
      replace: true
    });
  });

  if (authQuery.data) {
    return <Navigate replace to="/dashboard" />;
  }

  const loginError =
    loginMutation.error instanceof HttpClientError
      ? loginMutation.error.payload?.message ?? loginMutation.error.message
      : loginMutation.error?.message;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 3,
        py: 4,
        background:
          "radial-gradient(circle at top right, rgba(237, 203, 80, 0.45), transparent 24%), linear-gradient(135deg, #17345B 0%, #2F5788 42%, #4877B5 100%)"
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 1280,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.22)",
          boxShadow: "0 30px 70px rgba(10, 24, 43, 0.24)"
        }}
      >
        <Grid2 container>
          <Grid2 size={{ xs: 12, md: 5.2 }}>
            <CardContent
              sx={{
                p: { xs: 4, md: 5 },
                minHeight: "100%",
                display: "flex",
                alignItems: "center"
              }}
            >
              <Box sx={{ width: "100%" }}>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <Box
                      component="img"
                      alt="Escudo Rising Raimon"
                      src="/assets/brand/escudo.png"
                      sx={{ width: 68, height: 68 }}
                    />
                    <Box>
                      <Typography variant="h4">Rising Raimon</Typography>
                      <Typography color="text.secondary">Gestion interna del club</Typography>
                    </Box>
                  </Stack>

                  <Box>
                    <Typography variant="h1" sx={{ maxWidth: 420 }}>
                      Rising Raimon
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 1.5, maxWidth: 460 }}>
                      Accede al panel interno para gestionar personas, asignaciones, informacion deportiva, tesoreria y
                      logistica.
                    </Typography>
                  </Box>

                  <Box component="form" noValidate onSubmit={onSubmit}>
                    <Stack spacing={2}>
                      {loginError && <Alert severity="error">{loginError}</Alert>}
                      <TextField
                        {...form.register("username")}
                        error={!!form.formState.errors.username}
                        fullWidth
                        helperText={form.formState.errors.username?.message}
                        label="Usuario"
                        placeholder="admin"
                      />
                      <TextField
                        {...form.register("password")}
                        error={!!form.formState.errors.password}
                        fullWidth
                        helperText={form.formState.errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton edge="end" onClick={() => setShowPassword((value) => !value)} type="button">
                                {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                              </IconButton>
                            </InputAdornment>
                          )
                        }}
                        label="Contrasena"
                        placeholder="********"
                        type={showPassword ? "text" : "password"}
                      />
                      <Button
                        disabled={loginMutation.isPending}
                        endIcon={<ArrowForwardRounded />}
                        fullWidth
                        size="large"
                        type="submit"
                        variant="contained"
                      >
                        Entrar al dashboard
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Grid2>

          <Grid2
            size={{ xs: 12, md: 6.8 }}
            sx={{
              position: "relative",
              display: { xs: "none", md: "block" },
              minHeight: 760,
              background:
                "radial-gradient(circle at top left, rgba(237, 203, 80, 0.42), transparent 28%), linear-gradient(160deg, #17345B 0%, #315C93 58%, #3E6FAD 100%)"
            }}
          >
            <Box
              component="img"
              alt="Escudo secundario"
              src="/assets/brand/escudo-negro.png"
              sx={{
                position: "absolute",
                inset: "8% auto auto 4%",
                width: 390,
                opacity: 0.06
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                p: 5,
                color: "#FFF"
              }}
            >
              <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
                <Box>
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      fontWeight: 700,
                      color: alpha("#FFFFFF", 0.72)
                    }}
                  >
                    Panel interno
                  </Typography>
                  <Typography variant="h2" sx={{ maxWidth: 420, mt: 1.5 }}>
                    Dashboard centralizado para la gestion interna de Rising Raimon.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={3} sx={{ alignItems: "flex-end", justifyContent: "flex-end" }}>
                  <Box
                    component="img"
                    alt="Mascota Rising Raimon"
                    src="/assets/brand/mascota-login.png"
                    sx={{
                      width: 360,
                      maxWidth: "44%",
                      filter: "drop-shadow(0 26px 42px rgba(8, 18, 36, 0.28))"
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          </Grid2>
        </Grid2>
      </Card>
    </Box>
  );
}
