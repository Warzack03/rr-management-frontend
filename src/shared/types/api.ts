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
  branch: "MAD" | "CAT";
  hasActivePlayersInCurrentSeason: boolean;
};

export type CreateTeamPayload = {
  name: string;
  displayOrder: number;
  active: boolean;
  branch: "MAD" | "CAT";
};

export type UpdateTeamPayload = {
  name: string;
  displayOrder: number;
  active: boolean;
  branch: "MAD" | "CAT";
};

export type Season = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: "CURRENT" | "PLANNING" | "CLOSED";
};

export type CreateSeasonPayload = {
  name: string;
  startDate: string;
  endDate: string;
  status: "CURRENT" | "PLANNING" | "CLOSED";
};

export type UpdateSeasonPayload = CreateSeasonPayload;

export type SeasonCopyModule = "ASSIGNMENTS" | "PLAYER_PROFILES" | "EQUIPMENT" | "STOCK";

export type CopySeasonModulesPayload = {
  sourceSeasonId: number;
  modules: SeasonCopyModule[];
};

export type DashboardTeamSummary = {
  teamId: number;
  teamCode: string;
  teamName: string;
  activePlayers: number;
  averageLevel: number | null;
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
  branch: "MAD" | "CAT";
};

export type DashboardTeamPlayerSummary = {
  personId: number;
  fullName: string;
  level: number | null;
  primaryPosition: PlayerPosition | null;
};

export type DashboardTeamView = {
  team: DashboardTeamInfo;
  activePlayers: number;
  averageLevel: number | null;
  activePlayersWithoutTrainingPreference: number;
  activePlayersWithoutMatchPreference: number;
  playersWithObservations: number;
  positionSummary: DashboardPositionSummary[];
  players: DashboardTeamPlayerSummary[];
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

export type UpdateTeamAssignmentPayload = {
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
  | "MIERCOLES_20_00_21_00_Y_VIERNES_20_30_22_30"
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
  primaryPosition: PlayerPosition | null;
  secondaryPosition: PlayerPosition | null;
  tertiaryPosition: PlayerPosition | null;
  trainingPreference: TrainingPreference | null;
  matchPreference: MatchPreference | null;
  level: number | null;
  sportsNotes: string | null;
};

export type TreasuryEconomicBlock = {
  id: number;
  code: string;
  name: string;
  active: boolean;
};

export type TreasuryPlayerCondition = "NEW" | "RETURNING";

export type TreasuryConceptCode = "FIRST_SEASON_PAYMENT" | "SECOND_SEASON_PAYMENT" | "EXTRA_EQUIPMENT";

export type TreasuryPaymentMethod = "CASH" | "TRANSFER" | "BIZUM";

export type TreasuryObligationStatus = "OPEN" | "PARTIALLY_PAID" | "PAID";

export type TreasurySeasonRule = {
  id: number | null;
  economicBlockId: number;
  economicBlockCode: string;
  economicBlockName: string;
  playerCondition: TreasuryPlayerCondition;
  conceptCode: TreasuryConceptCode;
  defaultAmount: number;
  defaultDueDays: number;
  active: boolean;
};

export type TreasuryConfig = {
  seasonId: number;
  seasonName: string;
  seasonStatus: Season["status"];
  readOnly: boolean;
  economicBlocks: TreasuryEconomicBlock[];
  rules: TreasurySeasonRule[];
};

export type TreasurySummary = {
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  peopleWithDebt: number;
  peopleUpToDate: number;
};

export type TreasuryPersonSummary = {
  personId: number;
  fullName: string;
  nifValue: string;
  currentTeamName: string | null;
  currentTeamCode: string | null;
  economicBlockCode: string;
  economicBlockName: string;
  playerCondition: TreasuryPlayerCondition;
  manualOverride: boolean;
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  notes: string | null;
};

export type TreasuryPersonProfile = {
  id: number | null;
  economicBlockId: number;
  economicBlockCode: string;
  economicBlockName: string;
  playerCondition: TreasuryPlayerCondition;
  manualOverride: boolean;
  notes: string | null;
};

export type TreasuryObligation = {
  id: number;
  conceptCode: TreasuryConceptCode;
  teamName: string | null;
  expectedAmount: number;
  collectedAmount: number;
  pendingAmount: number;
  activatedAt: string;
  dueDate: string;
  status: TreasuryObligationStatus;
  overdue: boolean;
  deletable: boolean;
  notes: string | null;
};

export type TreasuryMovementAllocation = {
  obligationId: number;
  obligationConceptCode: TreasuryConceptCode;
  allocatedAmount: number;
};

export type TreasuryMovement = {
  id: number;
  movementType: "CHARGE" | "PAYMENT" | "ADJUSTMENT";
  paymentMethod: TreasuryPaymentMethod | null;
  amount: number;
  movementDate: string;
  receivedByName: string | null;
  notes: string | null;
  allocations: TreasuryMovementAllocation[];
};

export type TreasuryPersonDetail = {
  personId: number;
  fullName: string;
  nifValue: string;
  active: boolean;
  currentTeamName: string | null;
  currentTeamCode: string | null;
  profile: TreasuryPersonProfile;
  totalExpected: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  obligations: TreasuryObligation[];
  movements: TreasuryMovement[];
};

export type TreasuryStaffReceiver = {
  id: number;
  fullName: string;
};

export type UpdateTreasuryConfigPayload = {
  rules: Array<{
    id?: number | null;
    economicBlockId: number;
    playerCondition: TreasuryPlayerCondition;
    conceptCode: TreasuryConceptCode;
    defaultAmount: number;
    defaultDueDays: number;
    active: boolean;
  }>;
};

export type UpdateTreasuryPersonProfilePayload = {
  economicBlockId?: number;
  playerCondition?: TreasuryPlayerCondition;
  manualOverride?: boolean;
  notes?: string;
};

export type UpdateTreasuryObligationPayload = {
  expectedAmount?: number;
  dueDate?: string;
  notes?: string;
};

export type CreateTreasuryChargePayload = {
  personId: number;
  seasonId: number;
  conceptCode: TreasuryConceptCode;
  teamId?: number;
  amount: number;
  activatedAt?: string;
  dueDate?: string;
  notes?: string;
};

export type CreateTreasuryPaymentPayload = {
  personId: number;
  seasonId: number;
  paymentMethod: TreasuryPaymentMethod;
  amount: number;
  movementDate?: string;
  receivedByPersonId?: number;
  notes?: string;
  allocations?: Array<{
    obligationId: number;
    amount: number;
  }>;
};

export type LogisticsKitMode = "PLAYER" | "GOALKEEPER";

export type LogisticsEquipmentStatus = "NO_TEAM" | "INCOMPLETE" | "READY";

export type LogisticsEquipmentSummary = {
  profileId: number | null;
  personId: number;
  fullName: string;
  nifValue: string;
  currentTeamId: number | null;
  currentTeamCode: string | null;
  currentTeamName: string | null;
  originTeamId: number | null;
  originTeamCode: string | null;
  originTeamName: string | null;
  kitMode: LogisticsKitMode | null;
  shirtName: string | null;
  shirtNumber: number | null;
  shirtSize: string | null;
  pantsSize: string | null;
  jacketSize: string | null;
  socksSize: string | null;
  status: LogisticsEquipmentStatus;
  incomplete: boolean;
};

export type LogisticsEquipmentDetail = LogisticsEquipmentSummary & {
  active: boolean;
  notes: string | null;
};

export type UpdateLogisticsEquipmentPayload = {
  kitMode?: LogisticsKitMode | null;
  shirtName?: string | null;
  shirtNumber?: number | null;
  shirtSize?: string | null;
  pantsSize?: string | null;
  jacketSize?: string | null;
  socksSize?: string | null;
  notes?: string | null;
};

export type LogisticsGarmentCategory =
  | "MATCH_SHIRT"
  | "MATCH_PANTS"
  | "MATCH_SOCKS"
  | "TRAINING_SHIRT"
  | "TRAINING_PANTS"
  | "TRACK_JACKET"
  | "TRACK_PANTS";

export type LogisticsRequestType = "BASE" | "EXTRA";

export type LogisticsRequestStatus = "PENDING_STOCK" | "PARTIALLY_RESERVED" | "RESERVED_FROM_STOCK" | "DELIVERED";

export type LogisticsChargeMode = "INCLUDED" | "CHARGEABLE" | "CLUB_ASSUMED";

export type LogisticsStockMovementType = "MANUAL_IN" | "MANUAL_ADJUSTMENT" | "RESERVE" | "RELEASE" | "ORDER_RECEIPT" | "DELIVERY";
export type LogisticsStockSurplusReviewStatus = "PENDING" | "SENT_TO_STOCK";

export type LogisticsRequest = {
  id: number;
  seasonId: number;
  personId: number | null;
  fullName: string | null;
  nifValue: string | null;
  externalRecipientId: number | null;
  externalRecipientName: string | null;
  originTeamId: number | null;
  originTeamName: string | null;
  requestType: LogisticsRequestType;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  nameCustomization: string | null;
  numberCustomization: number | null;
  quantityRequested: number;
  quantityReserved: number;
  quantityDelivered: number;
  status: LogisticsRequestStatus;
  chargeMode: LogisticsChargeMode;
  unitAmount: number;
  totalAmount: number;
  treasuryObligationId: number | null;
  notes: string | null;
};

export type LogisticsStockBalance = {
  id: number;
  seasonId: number;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  personalized: boolean;
  nameCustomization: string | null;
  numberCustomization: number | null;
  quantityAvailable: number;
  quantityReserved: number;
  quantityDelivered: number;
  location: string | null;
};

export type LogisticsStockMovement = {
  id: number;
  stockBalanceId: number;
  requestId: number | null;
  movementType: LogisticsStockMovementType;
  quantity: number;
  movementDate: string;
  performedByName: string | null;
  notes: string | null;
};

export type LogisticsStockSurplusReview = {
  id: number;
  seasonId: number;
  orderId: number;
  orderName: string;
  supplierName: string;
  orderLineId: number;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  personalized: boolean;
  nameCustomization: string | null;
  numberCustomization: number | null;
  quantity: number;
  status: LogisticsStockSurplusReviewStatus;
  stockBalanceId: number | null;
  processedAt: string | null;
  notes: string | null;
};

export type CreateLogisticsRequestPayload = {
  seasonId: number;
  personId?: number;
  externalRecipientId?: number;
  externalRecipientName?: string;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  quantity: number;
  chargeMode: LogisticsChargeMode;
  unitAmount: number;
  notes?: string;
};

export type ReserveLogisticsRequestPayload = {
  quantity?: number;
};

export type ManualLogisticsStockEntryPayload = {
  seasonId: number;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  quantity: number;
  location?: string;
  notes?: string;
};

export type ManualLogisticsStockAdjustmentPayload = {
  stockBalanceId: number;
  delta: number;
  notes?: string;
};

export type LogisticsOrderStatus = "DRAFT" | "SENT" | "PARTIALLY_RECEIVED" | "RECEIVED" | "CANCELLED";

export type LogisticsSupplierOrderLineRequest = {
  id: number;
  requestId: number;
  recipientName: string | null;
  quantity: number;
};

export type LogisticsSupplierOrderLine = {
  id: number;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  personalized: boolean;
  nameCustomization: string | null;
  numberCustomization: number | null;
  quantityOrdered: number;
  quantityReceived: number;
  quantityPending: number;
  unitPrice: number;
  notes: string | null;
  requestAllocations: LogisticsSupplierOrderLineRequest[];
};

export type LogisticsSupplierOrder = {
  id: number;
  seasonId: number;
  supplierName: string;
  name: string;
  orderDate: string;
  status: LogisticsOrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  totalQuantityOrdered: number;
  totalQuantityReceived: number;
  totalQuantityPending: number;
  notes: string | null;
  lines: LogisticsSupplierOrderLine[];
};

export type CreateLogisticsOrderPayload = {
  seasonId: number;
  requestIds: number[];
  supplierName?: string;
  name?: string;
  orderDate?: string;
  notes?: string;
};

export type UpdateLogisticsOrderPayload = {
  supplierName?: string;
  name?: string;
  requestIds: number[];
  notes?: string;
};

export type RegisterLogisticsOrderReceiptPayload = {
  receivedAt?: string;
  location?: string;
  notes?: string;
  lines?: Array<{
    orderLineId: number;
    quantity: number;
  }>;
};

export type LogisticsDeliveryLine = {
  id: number;
  requestId: number | null;
  garmentCategory: LogisticsGarmentCategory;
  sizeCode: string;
  quantity: number;
};

export type LogisticsDelivery = {
  id: number;
  seasonId: number;
  personId: number | null;
  externalRecipientId: number | null;
  recipientName: string;
  deliveredByPersonId: number | null;
  deliveredByName: string | null;
  deliveredAt: string;
  notes: string | null;
  lines: LogisticsDeliveryLine[];
};

export type CreateLogisticsDeliveryPayload = {
  seasonId: number;
  personId?: number;
  externalRecipientId?: number;
  externalRecipientName?: string;
  deliveredByPersonId?: number;
  deliveredAt?: string;
  notes?: string;
  lines: Array<{
    requestId: number;
    quantity: number;
  }>;
};

export type LogisticsExternalRecipient = {
  id: number;
  fullName: string;
  address: string;
  dniValue: string;
  provenance: string;
  notes: string | null;
};

export type UpsertLogisticsExternalRecipientPayload = {
  fullName: string;
  address: string;
  dniValue: string;
  provenance: string;
  notes?: string;
};
