import { AutoFixHighRounded, SaveRounded } from "@mui/icons-material";
import {
  Alert,
  Button,
  Checkbox,
  CircularProgress,
  Grid2,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import { useSeasons } from "../../seasons/api/seasons-hooks";
import { useGenerateTreasuryBaseMutation, useTreasuryConfig, useUpdateTreasuryConfigMutation } from "../api/treasury-hooks";
import { formatCurrency, getTreasuryConceptLabel, getTreasuryPlayerConditionLabel } from "../model/treasury-ui";

export function TreasuryConfigPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const seasonId = searchParams.get("seasonId");
  const resolvedSeasonId = seasonId ? Number(seasonId) : undefined;
  const { showSuccess } = useAppFeedback();
  const seasonsQuery = useSeasons();
  const configQuery = useTreasuryConfig(resolvedSeasonId);
  const updateConfigMutation = useUpdateTreasuryConfigMutation(resolvedSeasonId);
  const generateBaseMutation = useGenerateTreasuryBaseMutation();
  const [rules, setRules] = useState<Record<string, { defaultAmount: number; defaultDueDays: number; active: boolean }>>({});

  useEffect(() => {
    if (!configQuery.data) {
      return;
    }

    setRules(
      Object.fromEntries(
        configQuery.data.rules.map((rule) => [
          `${rule.economicBlockId}-${rule.playerCondition}-${rule.conceptCode}`,
          {
            defaultAmount: rule.defaultAmount,
            defaultDueDays: rule.defaultDueDays,
            active: rule.active
          }
        ])
      )
    );
  }, [configQuery.data]);

  if (configQuery.isLoading || seasonsQuery.isLoading) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Configuracion economica">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (configQuery.isError || !configQuery.data || !seasonsQuery.data) {
    return (
      <PageContainer eyebrow="Tesoreria V2" title="Configuracion economica">
        <EmptyState description="No hemos podido cargar la configuracion economica de temporada." title="Configuracion no disponible" />
      </PageContainer>
    );
  }

  const config = configQuery.data;
  const groupedRuleSummaries = Object.values(
    config.rules
      .filter((rule) => rule.conceptCode !== "EXTRA_EQUIPMENT")
      .reduce<Record<string, { economicBlockCode: string; playerConditionLabel: string; totalAmount: number }>>((acc, rule) => {
        const key = `${rule.economicBlockId}-${rule.playerCondition}`;
        const currentRule = rules[`${rule.economicBlockId}-${rule.playerCondition}-${rule.conceptCode}`] ?? {
          defaultAmount: rule.defaultAmount,
          active: rule.active
        };

        if (!currentRule.active) {
          return acc;
        }

        if (!acc[key]) {
          acc[key] = {
            economicBlockCode: rule.economicBlockCode,
            playerConditionLabel: getTreasuryPlayerConditionLabel(rule.playerCondition),
            totalAmount: 0
          };
        }

        acc[key].totalAmount += currentRule.defaultAmount;
        return acc;
      }, {})
  );
  const seasonError =
    updateConfigMutation.error instanceof HttpClientError
      ? updateConfigMutation.error.payload?.message ?? updateConfigMutation.error.message
      : updateConfigMutation.error?.message;
  const generateError =
    generateBaseMutation.error instanceof HttpClientError
      ? generateBaseMutation.error.payload?.message ?? generateBaseMutation.error.message
      : generateBaseMutation.error?.message;

  const handleSeasonChange = (nextSeasonId?: string) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!nextSeasonId) {
      nextParams.delete("seasonId");
    } else {
      nextParams.set("seasonId", nextSeasonId);
    }
    setSearchParams(nextParams);
  };

  const onSave = async () => {
    await updateConfigMutation.mutateAsync({
      rules: config.rules.map((rule) => {
        const edited = rules[`${rule.economicBlockId}-${rule.playerCondition}-${rule.conceptCode}`];
        return {
          id: rule.id,
          economicBlockId: rule.economicBlockId,
          playerCondition: rule.playerCondition,
          conceptCode: rule.conceptCode,
          defaultAmount: edited?.defaultAmount ?? rule.defaultAmount,
          defaultDueDays: edited?.defaultDueDays ?? rule.defaultDueDays,
          active: edited?.active ?? rule.active
        };
      })
    });
    showSuccess("Configuracion economica guardada correctamente.");
  };

  const onGenerateBase = async () => {
    await generateBaseMutation.mutateAsync(config.seasonId);
    showSuccess("Generacion base de deuda completada.");
  };

  return (
    <PageContainer
      actions={
        <Button component={Link} to={resolvedSeasonId ? `/treasury?seasonId=${resolvedSeasonId}` : "/treasury"} variant="outlined">
          Volver a tesoreria
        </Button>
      }
      description="Ajusta reglas economicas por bloque y condicion antes de lanzar la generacion base."
      eyebrow="Tesoreria V2"
      title="Configuracion economica"
    >
      <Stack spacing={3}>
        <SectionCard
          action={<AutoFixHighRounded color="primary" />}
          subtitle="Esta configuracion se aplica a la temporada operativa seleccionada."
          title="Contexto de temporada"
        >
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                fullWidth
                label="Temporada"
                select
                value={resolvedSeasonId ?? ""}
                onChange={(event) => handleSeasonChange(event.target.value || undefined)}
              >
                <MenuItem value="">Temporada por defecto</MenuItem>
                {seasonsQuery.data.map((season) => (
                  <MenuItem key={season.id} value={season.id}>
                    {season.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 7 }}>
              <Stack spacing={0.5} sx={{ height: "100%", justifyContent: "center" }}>
                <Typography fontWeight={600}>{config.seasonName}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Estado actual: {config.seasonStatus}
                </Typography>
              </Stack>
            </Grid2>
          </Grid2>
          {config.readOnly && (
            <Alert severity="warning">
              La temporada esta cerrada. Puedes consultar la configuracion, pero no modificarla ni regenerar deuda base.
            </Alert>
          )}
          {seasonError && <Alert severity="error">{seasonError}</Alert>}
          {generateError && <Alert severity="error">{generateError}</Alert>}
        </SectionCard>

        <SectionCard
          subtitle="Cada fila define importe y vencimiento por defecto para una combinacion de bloque, condicion y concepto."
          title="Reglas economicas"
        >
          {config.rules.length === 0 ? (
            <EmptyState description="No hay reglas economicas disponibles para esta temporada." title="Sin reglas" />
          ) : (
            <Stack spacing={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Bloque</TableCell>
                    <TableCell>Condicion</TableCell>
                    <TableCell>Concepto</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell align="right">Vence en dias</TableCell>
                    <TableCell align="center">Activa</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {config.rules.map((rule) => {
                    const key = `${rule.economicBlockId}-${rule.playerCondition}-${rule.conceptCode}`;
                    const currentRule = rules[key] ?? {
                      defaultAmount: rule.defaultAmount,
                      defaultDueDays: rule.defaultDueDays,
                      active: rule.active
                    };

                    return (
                      <TableRow key={key}>
                        <TableCell>{rule.economicBlockCode}</TableCell>
                        <TableCell>{getTreasuryPlayerConditionLabel(rule.playerCondition)}</TableCell>
                        <TableCell>{getTreasuryConceptLabel(rule.conceptCode)}</TableCell>
                        <TableCell align="right" sx={{ minWidth: 160 }}>
                          <TextField
                            disabled={config.readOnly}
                            inputProps={{ min: 0, step: 0.01 }}
                            size="small"
                            type="number"
                            value={currentRule.defaultAmount}
                            onChange={(event) =>
                              setRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...currentRule,
                                  defaultAmount: Number(event.target.value)
                                }
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 160 }}>
                          <TextField
                            disabled={config.readOnly}
                            inputProps={{ min: 1, step: 1 }}
                            size="small"
                            type="number"
                            value={currentRule.defaultDueDays}
                            onChange={(event) =>
                              setRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...currentRule,
                                  defaultDueDays: Number(event.target.value)
                                }
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={currentRule.active}
                            disabled={config.readOnly}
                            onChange={(_event, checked) =>
                              setRules((prev) => ({
                                ...prev,
                                [key]: {
                                  ...currentRule,
                                  active: checked
                                }
                              }))
                            }
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <Typography color="text.secondary" variant="body2">
                Referencia rapida: las reglas con importe 0 no generaran deuda base al lanzar el proceso.
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                <Button
                  disabled={config.readOnly || generateBaseMutation.isPending}
                  onClick={onGenerateBase}
                  variant="outlined"
                >
                  Generar base
                </Button>
                <Button
                  disabled={config.readOnly || updateConfigMutation.isPending}
                  onClick={onSave}
                  startIcon={<SaveRounded />}
                  variant="contained"
                >
                  Guardar configuracion
                </Button>
              </Stack>
            </Stack>
          )}
        </SectionCard>

        <SectionCard subtitle="Vista rapida del total base por bloque y condicion, sin contar extras variables" title="Resumen de importes">
          <Grid2 container spacing={2}>
            {groupedRuleSummaries.map((summary) => (
              <Grid2 key={`${summary.economicBlockCode}-${summary.playerConditionLabel}`} size={{ xs: 12, md: 6, xl: 4 }}>
                <Stack
                  spacing={0.35}
                  sx={{
                    border: "1px dashed #D8E0EA",
                    borderRadius: 2,
                    px: 2,
                    py: 1.5
                  }}
                >
                  <Typography fontWeight={600}>{summary.economicBlockCode}</Typography>
                  <Typography color="text.secondary" variant="body2">
                    {summary.playerConditionLabel}
                  </Typography>
                  <Typography>{formatCurrency(summary.totalAmount)}</Typography>
                </Stack>
              </Grid2>
            ))}
          </Grid2>
        </SectionCard>
      </Stack>
    </PageContainer>
  );
}
