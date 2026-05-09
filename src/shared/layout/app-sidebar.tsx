import {
  AutoGraphRounded,
  AccountBalanceWalletRounded,
  CalendarMonthRounded,
  ChecklistRounded,
  CheckroomRounded,
  FlagRounded,
  GroupsRounded,
  Inventory2Rounded,
  LocalShippingRounded,
  LogoutRounded,
  SportsSoccerRounded,
  SwapHorizRounded
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  alpha,
  useTheme
} from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthMe, useLogoutMutation } from "../../modules/auth/api/auth-hooks";
import { CrestAvatar } from "../components/brand/crest-avatar";
import { tokens } from "../theme/tokens";

const navItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <AutoGraphRounded />
  },
  {
    label: "Personas",
    path: "/persons",
    icon: <GroupsRounded />
  },
  {
    label: "Asignaciones",
    path: "/assignments",
    icon: <SwapHorizRounded />
  },
  {
    label: "Equipos",
    path: "/teams",
    icon: <FlagRounded />
  },
  {
    label: "Tesoreria",
    path: "/treasury",
    icon: <AccountBalanceWalletRounded />
  },
  {
    label: "Logistica",
    path: "/logistics",
    icon: <Inventory2Rounded />
  },
  {
    label: "Stock excedente",
    path: "/logistics/stock",
    icon: <CheckroomRounded />
  },
  {
    label: "Pedidos",
    path: "/logistics/orders",
    icon: <ChecklistRounded />
  },
  {
    label: "Externos",
    path: "/logistics/external-recipients",
    icon: <Inventory2Rounded />
  },
  {
    label: "Entregas",
    path: "/logistics/deliveries",
    icon: <LocalShippingRounded />
  },
  {
    label: "Temporadas",
    path: "/seasons",
    icon: <CalendarMonthRounded />
  },
  {
    label: "Gestion deportiva",
    path: "/sports",
    icon: <SportsSoccerRounded />
  }
] as const;

type AppSidebarProps = {
  isDesktop: boolean;
  mobileOpen: boolean;
  onClose: () => void;
};

export function AppSidebar({ isDesktop, mobileOpen, onClose }: AppSidebarProps) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const authQuery = useAuthMe();
  const logoutMutation = useLogoutMutation();

  return (
    <Drawer
      anchor="left"
      ModalProps={{ keepMounted: true }}
      onClose={onClose}
      open={isDesktop ? true : mobileOpen}
      variant={isDesktop ? "permanent" : "temporary"}
      PaperProps={{
        sx: {
          width: { xs: "min(88vw, 304px)", lg: tokens.layout.sidebarWidth },
          px: 2,
          py: 2.5
        }
      }}
    >
      <Stack sx={{ height: "100%" }} spacing={3}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{
            alignItems: "center",
            px: 1
          }}
        >
          <Box
            sx={{
              "& .MuiAvatar-root": {
                bgcolor: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.09 : 0.14)
              }
            }}
          >
            <CrestAvatar alt="Rising Raimon" size={54} src={`${import.meta.env.BASE_URL}assets/brand/escudo.png`} />
          </Box>

          <Box>
            <Typography
              variant="h5"
              sx={{
                lineHeight: 0.95
              }}
            >
              Rising Raimon
            </Typography>
            <Typography sx={{ color: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.7 : 0.72), fontSize: 13 }}>
              Panel interno del club
            </Typography>
          </Box>
        </Stack>

        <List
          disablePadding
          sx={{
            display: "grid",
            gap: 0.75,
            overflowY: "auto",
            pr: 0.5,
            mr: -0.5
          }}
        >
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/dashboard" && location.pathname.startsWith(item.path));

            return (
              <ListItemButton
                key={item.path}
                component={NavLink}
                sx={{
                  borderRadius: tokens.radius.sm,
                  minHeight: 52,
                  bgcolor: isActive ? alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.16 : 0.18) : "transparent",
                  border: isActive ? `1px solid ${alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.26 : 0.28)}` : "1px solid transparent",
                  "&:hover": {
                    bgcolor: isActive
                      ? alpha(theme.palette.secondary.main, theme.palette.mode === "dark" ? 0.2 : 0.22)
                      : alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.06 : 0.08)
                  }
                }}
                to={item.path}
                onClick={() => {
                  if (!isDesktop) {
                    onClose();
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive ? "secondary.main" : alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.82 : 0.85)
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            borderTop: `1px solid ${alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.08 : 0.1)}`,
            pt: 2
          }}
        >
          <Stack spacing={1.25}>
            <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", px: 1 }}>
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.1 : 0.16),
                  color: "#FFF"
                }}
              >
                {authQuery.data?.username?.slice(0, 1).toUpperCase() ?? "A"}
              </Avatar>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{authQuery.data?.username ?? "Admin"}</Typography>
                <Typography sx={{ color: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.64 : 0.68), fontSize: 13 }}>
                  {authQuery.data?.role ?? "ADMIN"}
                </Typography>
              </Box>
            </Stack>

            <ListItemButton
              disabled={logoutMutation.isPending}
              onClick={() =>
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    onClose();
                    navigate("/login", { replace: true });
                  }
                })
              }
              sx={{
                borderRadius: tokens.radius.sm,
                color: alpha("#FFFFFF", theme.palette.mode === "dark" ? 0.74 : 0.78)
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: "inherit" }}>
                <LogoutRounded />
              </ListItemIcon>
              <ListItemText primary="Cerrar sesion" />
            </ListItemButton>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
  );
}
