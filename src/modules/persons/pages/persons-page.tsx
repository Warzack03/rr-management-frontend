import { AddRounded, SearchRounded } from "@mui/icons-material";
import {
  Avatar,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import { normalizeSearchText } from "../../../shared/utils/normalize-search-text";
import type { PersonRoleType } from "../../../shared/types/api";
import { useSeasons } from "../../seasons/api/seasons-hooks";
import { useTreasuryPersons } from "../../treasury/api/treasury-hooks";
import { TreasuryPaymentStatusChip } from "../../treasury/components/treasury-payment-status-chip";
import { usePersons } from "../api/persons-hooks";
import { getDocumentStatusLabel, getPersonRoleLabel, personRoleOptions } from "../model/persons-ui";

const PAGE_SIZE = 20;

export function PersonsPage() {
  const personsQuery = usePersons();
  const seasonsQuery = useSeasons();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"" | PersonRoleType>("");
  const [activeFilter, setActiveFilter] = useState<"" | "true" | "false">("true");
  const [page, setPage] = useState(1);
  const persons = personsQuery.data ?? [];
  const defaultSeason =
    (seasonsQuery.data ?? []).find((season) => season.status === "CURRENT") ??
    (seasonsQuery.data ?? []).find((season) => season.status === "PLANNING") ??
    (seasonsQuery.data ?? [])[0] ??
    null;
  const treasuryQuery = useTreasuryPersons({
    seasonId: defaultSeason?.id
  });
  const treasuryByPersonId = useMemo(
    () => new Map((treasuryQuery.data ?? []).map((row) => [row.personId, row])),
    [treasuryQuery.data]
  );

  const filteredPersons = useMemo(() => {
    const normalizedSearch = normalizeSearchText(search);

    return persons.filter((person) => {
      const fullName = normalizeSearchText(`${person.firstName} ${person.lastName}`);
      const matchesSearch =
        normalizedSearch.length === 0 ||
        fullName.includes(normalizedSearch) ||
        normalizeSearchText(person.nifValue).includes(normalizedSearch);
      const matchesRole = roleFilter === "" || person.roles.includes(roleFilter);
      const matchesActive = activeFilter === "" || String(person.active) === activeFilter;

      return matchesSearch && matchesRole && matchesActive;
    });
  }, [activeFilter, persons, roleFilter, search]);

  const pageCount = Math.max(1, Math.ceil(filteredPersons.length / PAGE_SIZE));
  const paginatedPersons = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredPersons.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredPersons, page]);

  if (personsQuery.isLoading || seasonsQuery.isLoading || treasuryQuery.isLoading) {
    return (
      <PageContainer eyebrow="Operativa maestra" title="Personas">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (personsQuery.isError || seasonsQuery.isError || treasuryQuery.isError || !personsQuery.data) {
    return (
      <PageContainer eyebrow="Operativa maestra" title="Personas">
        <EmptyState
          description="No hemos podido cargar la base de personas. Revisa la sesion antes de seguir trabajando."
          title="Listado no disponible"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <Button component={Link} startIcon={<AddRounded />} to="/persons/new" variant="contained">
          Nueva persona
        </Button>
      }
      description="Base maestra de personas del club con lectura rapida, roles y acceso directo a ficha."
      eyebrow="Operativa maestra"
      title="Personas"
    >
      <Stack spacing={3}>
        <SectionCard subtitle="Busqueda y filtros sobre la base activa del club" title="Acciones rapidas">
          <Stack direction="row" spacing={2}>
            <TextField
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                )
              }}
              label="Buscar por nombre o NIF"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              value={search}
            />
            <TextField
              label="Rol"
              onChange={(event) => {
                setRoleFilter(event.target.value as "" | PersonRoleType);
                setPage(1);
              }}
              select
              sx={{ minWidth: 180 }}
              value={roleFilter}
            >
              <MenuItem value="">Todos</MenuItem>
              {personRoleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Activo"
              onChange={(event) => {
                setActiveFilter(event.target.value as "" | "true" | "false");
                setPage(1);
              }}
              select
              sx={{ minWidth: 160 }}
              value={activeFilter}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="true">Activos</MenuItem>
              <MenuItem value="false">Inactivos</MenuItem>
            </TextField>
          </Stack>
        </SectionCard>

        <SectionCard subtitle={`${filteredPersons.length} resultados visibles`} title="Listado">
          {filteredPersons.length === 0 ? (
            <EmptyState
              description="No hay personas que cumplan los filtros actuales. Prueba a limpiar la busqueda o a crear un nuevo registro."
              title="Sin resultados"
            />
          ) : (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Persona</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Documentacion</TableCell>
                    <TableCell>Tesoreria</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPersons.map((person) => {
                    const treasurySummary = treasuryByPersonId.get(person.id);

                    return (
                      <TableRow key={person.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "primary.main" }}>{person.firstName.slice(0, 1)}</Avatar>
                            <Stack spacing={0.35}>
                              <Typography component={Link} sx={{ color: "primary.main", fontWeight: 600 }} to={`/persons/${person.id}`}>
                                {person.firstName} {person.lastName}
                              </Typography>
                              <Typography color="text.secondary" variant="body2">
                                {person.nifType} - {person.nifValue}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                            {person.roles.map((role) => (
                              <Chip key={role} label={getPersonRoleLabel(role)} size="small" />
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell>{getDocumentStatusLabel(person.documentStatus)}</TableCell>
                        <TableCell>
                          {treasurySummary ? (
                            <TreasuryPaymentStatusChip overdueAmount={treasurySummary.totalOverdue} pendingAmount={treasurySummary.totalPending} />
                          ) : (
                            <Chip label="Sin dato" size="small" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>{person.active ? "Activo" : "Inactivo"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Stack sx={{ mt: 2, alignItems: "center" }}>
                <Pagination count={pageCount} onChange={(_event, value) => setPage(value)} page={page} />
              </Stack>
            </>
          )}
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
