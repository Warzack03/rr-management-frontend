import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppShell } from "../../shared/layout/app-shell";
import { AssignmentsPage } from "../../modules/assignments/pages/assignments-page";
import { AuthGuard } from "../../modules/auth/components/auth-guard";
import { LoginPage } from "../../modules/auth/pages/login-page";
import { DashboardPage } from "../../modules/dashboard/pages/dashboard-page";
import { TeamDashboardPage } from "../../modules/dashboard/pages/team-dashboard-page";
import { PersonCreatePage } from "../../modules/persons/pages/person-create-page";
import { PersonDetailPage } from "../../modules/persons/pages/person-detail-page";
import { PersonsPage } from "../../modules/persons/pages/persons-page";
import { SeasonsPage } from "../../modules/seasons/pages/seasons-page";
import { SportsPage } from "../../modules/sports/pages/sports-page";
import { TeamsPage } from "../../modules/teams/pages/teams-page";
import { TreasuryConfigPage } from "../../modules/treasury/pages/treasury-config-page";
import { TreasuryPage } from "../../modules/treasury/pages/treasury-page";
import { TreasuryPersonPage } from "../../modules/treasury/pages/treasury-person-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    element: <AuthGuard />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
            handle: {
              title: "Dashboard",
              subtitle: "Resumen operativo del club"
            }
          },
          {
            path: "dashboard/teams/:teamId",
            element: <TeamDashboardPage />,
            handle: {
              title: "Dashboard por equipo",
              subtitle: "Vista compacta y accionable"
            }
          },
          {
            path: "persons",
            element: <PersonsPage />,
            handle: {
              title: "Personas",
              subtitle: "Busqueda, filtros y acceso rapido a ficha"
            }
          },
          {
            path: "persons/new",
            element: <PersonCreatePage />,
            handle: {
              title: "Alta de persona",
              subtitle: "Registro maestro con validacion clara"
            }
          },
          {
            path: "persons/:personId",
            element: <PersonDetailPage />,
            handle: {
              title: "Ficha de persona",
              subtitle: "Datos maestros, asignacion y perfil deportivo"
            }
          },
          {
            path: "assignments",
            element: <AssignmentsPage />,
            handle: {
              title: "Asignaciones",
              subtitle: "Pendientes, cambios de equipo y situacion actual"
            }
          },
          {
            path: "teams",
            element: <TeamsPage />,
            handle: {
              title: "Equipos",
              subtitle: "Alta, edicion y baja logica de equipos"
            }
          },
          {
            path: "treasury",
            element: <TreasuryPage />,
            handle: {
              title: "Tesoreria",
              subtitle: "Seguimiento de deuda, cobros y extras por temporada"
            }
          },
          {
            path: "treasury/config",
            element: <TreasuryConfigPage />,
            handle: {
              title: "Configuracion economica",
              subtitle: "Reglas por bloque, condicion y concepto"
            }
          },
          {
            path: "treasury/persons/:personId",
            element: <TreasuryPersonPage />,
            handle: {
              title: "Detalle economico",
              subtitle: "Perfil, obligaciones y movimientos por persona"
            }
          },
          {
            path: "seasons",
            element: <SeasonsPage />,
            handle: {
              title: "Temporadas",
              subtitle: "Ciclo de campañas y copia modular entre temporadas"
            }
          },
          {
            path: "sports",
            element: <SportsPage />,
            handle: {
              title: "Gestion deportiva",
              subtitle: "Edicion rapida de perfil deportivo"
            }
          }
        ]
      }
    ]
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />
  }
]);
