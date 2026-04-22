export const dashboardSummary = {
  activePlayers: 46,
  playersWithoutTeam: 5,
  incompletePlayers: 11,
  averageLevel: 6.8,
  activePlayersWithoutTrainingPreference: 7,
  activePlayersWithoutMatchPreference: 4,
  playersWithObservations: 9,
  teamSummary: [
    { teamId: 1, code: "SENIOR_A", name: "Senior A", activePlayers: 14 },
    { teamId: 2, code: "SENIOR_B", name: "Senior B", activePlayers: 12 },
    { teamId: 3, code: "SENIOR_C", name: "Senior C", activePlayers: 10 },
    { teamId: 4, code: "SENIOR_D", name: "Senior D", activePlayers: 10 }
  ],
  positionSummary: [
    { position: "PORTERO", activePlayers: 4 },
    { position: "DEFENSA_CENTRAL", activePlayers: 9 },
    { position: "DEFENSA_LATERAL", activePlayers: 7 },
    { position: "CENTROCAMPISTA", activePlayers: 10 },
    { position: "BANDA", activePlayers: 8 },
    { position: "DELANTERO", activePlayers: 8 }
  ],
  checklist: [
    { code: "PLAYERS_WITHOUT_TEAM", label: "Jugadores sin equipo", count: 5 },
    { code: "INCOMPLETE_PLAYERS", label: "Jugadores con dato incompleto", count: 11 },
    { code: "PLAYERS_WITHOUT_TRAINING_PREFERENCE", label: "Sin preferencia de entreno", count: 7 },
    { code: "PLAYERS_WITHOUT_MATCH_PREFERENCE", label: "Sin preferencia de partido", count: 4 },
    { code: "PLAYERS_WITHOUT_PRIMARY_POSITION", label: "Sin posicion principal", count: 6 },
    { code: "PLAYERS_WITHOUT_LEVEL", label: "Sin nivel", count: 3 }
  ]
};

export const teamDashboardMap = {
  "1": {
    team: { id: 1, code: "SENIOR_A", name: "Senior A", active: true },
    activePlayers: 14,
    averageLevel: 7.2,
    activePlayersWithoutTrainingPreference: 2,
    activePlayersWithoutMatchPreference: 1,
    playersWithObservations: 3,
    positionSummary: [
      { position: "PORTERO", activePlayers: 1 },
      { position: "DEFENSA_CENTRAL", activePlayers: 3 },
      { position: "DEFENSA_LATERAL", activePlayers: 2 },
      { position: "CENTROCAMPISTA", activePlayers: 3 },
      { position: "BANDA", activePlayers: 2 },
      { position: "DELANTERO", activePlayers: 3 }
    ]
  },
  "2": {
    team: { id: 2, code: "SENIOR_B", name: "Senior B", active: true },
    activePlayers: 12,
    averageLevel: 6.4,
    activePlayersWithoutTrainingPreference: 3,
    activePlayersWithoutMatchPreference: 1,
    playersWithObservations: 2,
    positionSummary: [
      { position: "PORTERO", activePlayers: 1 },
      { position: "DEFENSA_CENTRAL", activePlayers: 2 },
      { position: "DEFENSA_LATERAL", activePlayers: 2 },
      { position: "CENTROCAMPISTA", activePlayers: 3 },
      { position: "BANDA", activePlayers: 2 },
      { position: "DELANTERO", activePlayers: 2 }
    ]
  }
} as const;

export const personsPreview = [
  { id: 11, fullName: "Aitor Lopez", roles: ["JUGADOR"], team: "Senior A", status: "Activo" },
  { id: 12, fullName: "Unai Sanz", roles: ["JUGADOR", "STAFF"], team: "Sin equipo", status: "Activo" },
  { id: 13, fullName: "Mikel Garcia", roles: ["ENTRENADOR"], team: "Senior B", status: "Activo" }
];
