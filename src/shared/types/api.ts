export type ApiError = {
  code: string;
  message: string;
  details: Record<string, unknown>;
};

export type AuthUser = {
  id: number;
  username: string;
  role: "ADMIN";
};

export type PersonRoleType = "JUGADOR" | "ENTRENADOR" | "STAFF";

export type DocumentType = "DNI" | "NIE" | "PASAPORTE";

export type DocumentStatus = "COMPLETO" | "PENDIENTE" | "NO_APLICA";

export type Person = {
  id: number;
  firstName: string;
  lastName: string;
  nifType: DocumentType;
  nifValue: string;
  birthDate: string | null;
  address: string | null;
  contact: string | null;
  active: boolean;
  documentStatus: DocumentStatus | null;
  notes: string | null;
  roles: PersonRoleType[];
  hasPlayerProfile: boolean;
};

export type CreatePersonPayload = {
  firstName: string;
  lastName: string;
  nifType: DocumentType;
  nifValue: string;
  birthDate: string;
  address?: string;
  contact?: string;
  active: boolean;
  documentStatus?: DocumentStatus;
  notes?: string;
  roles: PersonRoleType[];
};

export type UpdatePersonPayload = {
  firstName: string;
  lastName: string;
  nifType: DocumentType;
  nifValue: string;
  birthDate?: string;
  address?: string;
  contact?: string;
  active: boolean;
  documentStatus?: DocumentStatus;
  notes?: string;
};

export type AddPersonRolesPayload = {
  roles: PersonRoleType[];
};

export type DashboardChecklistItem = {
  code: string;
  label: string;
  count: number;
};

export type Team = {
  id: number;
  code: string;
  name: string;
  active: boolean;
  displayOrder: number | null;
};

export type CreateTeamPayload = {
  code: string;
  name: string;
  displayOrder: number;
  active: boolean;
};

export type UpdateTeamPayload = {
  code: string;
  name: string;
  displayOrder: number;
  active: boolean;
};

export type Season = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

export type DashboardTeamSummary = {
  teamId: number;
  teamCode: string;
  teamName: string;
  activePlayers: number;
};

export type DashboardPositionSummary = {
  position: string;
  activePlayers: number;
};

export type DashboardSummary = {
  activePlayers: number;
  playersWithoutTeam: number;
  incompletePlayers: number;
  averageLevel: number | null;
  activePlayersWithoutTrainingPreference: number;
  activePlayersWithoutMatchPreference: number;
  playersWithObservations: number;
  teamSummary: DashboardTeamSummary[];
  positionSummary: DashboardPositionSummary[];
  checklist: DashboardChecklistItem[];
};

export type DashboardTeamInfo = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type DashboardTeamView = {
  team: DashboardTeamInfo;
  activePlayers: number;
  averageLevel: number | null;
  activePlayersWithoutTrainingPreference: number;
  activePlayersWithoutMatchPreference: number;
  playersWithObservations: number;
  positionSummary: DashboardPositionSummary[];
};

export type CurrentTeamAssignmentPerson = {
  id: number;
  firstName: string;
  lastName: string;
  nifValue: string;
  roles: PersonRoleType[];
};

export type CurrentTeamAssignmentTeam = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type CurrentTeamAssignmentSeason = {
  id: number;
  name: string;
  active: boolean;
} | null;

export type CurrentTeamAssignment = {
  assignmentId: number;
  startDate: string;
  endDate: string | null;
  active: boolean;
  person: CurrentTeamAssignmentPerson;
  team: CurrentTeamAssignmentTeam;
  season: CurrentTeamAssignmentSeason;
};

export type PendingTeamAssignment = {
  personId: number;
  firstName: string;
  lastName: string;
  nifValue: string;
  roles: PersonRoleType[];
};

export type CreateTeamAssignmentPayload = {
  personId: number;
  teamId: number;
  seasonId?: number;
  startDate?: string;
};

export type ChangeTeamPayload = {
  teamId: number;
  seasonId?: number;
  startDate?: string;
};

export type PlayerPosition =
  | "PORTERO"
  | "DEFENSA_CENTRAL"
  | "DEFENSA_LATERAL"
  | "CENTROCAMPISTA"
  | "BANDA"
  | "DELANTERO";

export type TrainingPreference =
  | "LUNES_Y_MIERCOLES_16_30_18_00"
  | "MIERCOLES_20_00_21_00_Y_VIERNES_19_00_21_00"
  | "INDIFERENTE";

export type MatchPreference = "SABADO_TARDE" | "DOMINGO_MANANA" | "DOMINGO_TARDE" | "INDIFERENTE";

export type PlayerProfilePerson = {
  id: number;
  firstName: string;
  lastName: string;
  nifValue: string;
  active: boolean;
  roles: PersonRoleType[];
};

export type PlayerProfileCurrentTeam = {
  id: number;
  code: string;
  name: string;
} | null;

export type PlayerProfile = {
  profileId: number;
  person: PlayerProfilePerson;
  currentTeam: PlayerProfileCurrentTeam;
  primaryPosition: PlayerPosition | null;
  secondaryPosition: PlayerPosition | null;
  tertiaryPosition: PlayerPosition | null;
  trainingPreference: TrainingPreference | null;
  matchPreference: MatchPreference | null;
  level: number | null;
  sportsNotes: string | null;
  incomplete: boolean;
};

export type UpdatePlayerProfilePayload = {
  primaryPosition?: PlayerPosition;
  secondaryPosition?: PlayerPosition;
  tertiaryPosition?: PlayerPosition;
  trainingPreference?: TrainingPreference;
  matchPreference?: MatchPreference;
  level?: number;
  sportsNotes?: string;
};
