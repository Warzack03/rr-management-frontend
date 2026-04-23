import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  FormGroup,
  Grid2,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { DocumentStatus, PersonRoleType } from "../../../shared/types/api";
import { useAddPersonRolesMutation, usePerson, useUpdatePersonMutation } from "../api/persons-hooks";
import {
  documentStatusOptions,
  documentTypeOptions,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
  getPersonRoleLabel,
  personRoleOptions
} from "../model/persons-ui";

const addRolesSchema = z.object({
  roles: z.array(z.enum(["JUGADOR", "ENTRENADOR", "STAFF"])).min(1, "Selecciona al menos un rol")
});

const updatePersonSchema = z.object({
  firstName: z.string().trim().min(1, "Introduce el nombre"),
  lastName: z.string().trim().min(1, "Introduce los apellidos"),
  nifType: z.enum(["DNI", "NIE", "PASAPORTE"]),
  nifValue: z.string().trim().min(1, "Introduce el documento"),
  birthDate: z.string().optional(),
  contact: z.string().optional(),
  address: z.string().optional(),
  active: z.boolean(),
  documentStatus: z.enum(["COMPLETO", "PENDIENTE", "NO_APLICA"]).nullable(),
  notes: z.string().optional()
});

type AddRolesFormValues = z.infer<typeof addRolesSchema>;
type UpdatePersonFormValues = z.infer<typeof updatePersonSchema>;

type DetailFieldProps = {
  label: string;
  value: string;
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <Stack spacing={0.35}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography>{value}</Typography>
    </Stack>
  );
}

export function PersonDetailPage() {
  const { personId } = useParams();
  const { showSuccess } = useAppFeedback();
  const detailQuery = usePerson(personId ?? "");
  const addRolesMutation = useAddPersonRolesMutation(personId ?? "");
  const updatePersonMutation = useUpdatePersonMutation(personId ?? "");
  const rolesForm = useForm<AddRolesFormValues>({
    resolver: zodResolver(addRolesSchema),
    defaultValues: {
      roles: []
    }
  });
  const editForm = useForm<UpdatePersonFormValues>({
    resolver: zodResolver(updatePersonSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nifType: "DNI",
      nifValue: "",
      birthDate: "",
      contact: "",
      address: "",
      active: true,
      documentStatus: null,
      notes: ""
    }
  });

  useEffect(() => {
    if (!detailQuery.data) {
      return;
    }

    editForm.reset({
      firstName: detailQuery.data.firstName,
      lastName: detailQuery.data.lastName,
      nifType: detailQuery.data.nifType,
      nifValue: detailQuery.data.nifValue,
      birthDate: detailQuery.data.birthDate ?? "",
      contact: detailQuery.data.contact ?? "",
      address: detailQuery.data.address ?? "",
      active: detailQuery.data.active,
      documentStatus: detailQuery.data.documentStatus,
      notes: detailQuery.data.notes ?? ""
    });
  }, [detailQuery.data, editForm]);

  if (detailQuery.isLoading) {
    return (
      <PageContainer eyebrow={`Persona #${personId ?? "?"}`} title="Ficha de persona">
        <Stack sx={{ minHeight: 320, alignItems: "center", justifyContent: "center" }}>
          <CircularProgress />
        </Stack>
      </PageContainer>
    );
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <PageContainer eyebrow={`Persona #${personId ?? "?"}`} title="Ficha de persona">
        <EmptyState
          description="No hemos podido cargar la ficha. Revisa que la persona exista y que la sesion siga activa."
          title="Ficha no disponible"
        />
      </PageContainer>
    );
  }

  const person = detailQuery.data;
  const availableRoles = personRoleOptions.filter((option) => !person.roles.includes(option.value));
  const selectedRoles = rolesForm.watch("roles");
  const addRolesError =
    addRolesMutation.error instanceof HttpClientError
      ? addRolesMutation.error.payload?.message ?? addRolesMutation.error.message
      : addRolesMutation.error?.message;
  const updateError =
    updatePersonMutation.error instanceof HttpClientError
      ? updatePersonMutation.error.payload?.message ?? updatePersonMutation.error.message
      : updatePersonMutation.error?.message;

  const onAddRoles = rolesForm.handleSubmit(async (values) => {
    await addRolesMutation.mutateAsync({ roles: values.roles });
    rolesForm.reset({ roles: [] });
    showSuccess("Roles anadidos correctamente.");
  });

  const onUpdate = editForm.handleSubmit(async (values) => {
    await updatePersonMutation.mutateAsync({
      firstName: values.firstName,
      lastName: values.lastName,
      nifType: values.nifType,
      nifValue: values.nifValue,
      birthDate: values.birthDate?.trim() || undefined,
      contact: values.contact?.trim() || undefined,
      address: values.address?.trim() || undefined,
      active: values.active,
      documentStatus: values.documentStatus ?? undefined,
      notes: values.notes?.trim() || undefined
    });
    showSuccess("Persona actualizada correctamente.");
  });

  const resetEditForm = () => {
    editForm.reset({
      firstName: person.firstName,
      lastName: person.lastName,
      nifType: person.nifType,
      nifValue: person.nifValue,
      birthDate: person.birthDate ?? "",
      contact: person.contact ?? "",
      address: person.address ?? "",
      active: person.active,
      documentStatus: person.documentStatus,
      notes: person.notes ?? ""
    });
  };

  return (
    <PageContainer
      actions={
        <Button component={Link} to="/persons" variant="outlined">
          Volver a personas
        </Button>
      }
      description="Lectura clara de identidad, estado administrativo y cobertura de roles de la persona."
      eyebrow={`Persona #${person.id}`}
      title={`${person.firstName} ${person.lastName}`}
    >
      <Stack spacing={3}>
        <SectionCard subtitle={`${getDocumentTypeLabel(person.nifType)} - ${person.nifValue}`} title="Resumen">
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            {person.roles.map((role) => (
              <Chip key={role} label={getPersonRoleLabel(role)} />
            ))}
            <Chip color={person.active ? "success" : "default"} label={person.active ? "Activo" : "Inactivo"} />
          </Stack>
        </SectionCard>

        <Grid2 container spacing={3}>
          <Grid2 size={{ xs: 12, lg: 6.5 }}>
            <SectionCard subtitle="Identidad, contacto y estado documental" title="Datos personales">
              <Grid2 container spacing={2}>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Nombre" value={person.firstName} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Apellidos" value={person.lastName} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Tipo documento" value={getDocumentTypeLabel(person.nifType)} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Documento" value={person.nifValue} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Nacimiento" value={person.birthDate || "Sin informar"} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Contacto" value={person.contact || "Sin informar"} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Estado documental" value={getDocumentStatusLabel(person.documentStatus)} />
                </Grid2>
                <Grid2 size={{ xs: 12, md: 6 }}>
                  <DetailField label="Estado" value={person.active ? "Activo" : "Inactivo"} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <DetailField label="Direccion" value={person.address || "Sin informar"} />
                </Grid2>
                <Grid2 size={{ xs: 12 }}>
                  <DetailField label="Notas" value={person.notes || "Sin notas"} />
                </Grid2>
              </Grid2>
            </SectionCard>
          </Grid2>

          <Grid2 size={{ xs: 12, lg: 5.5 }}>
            <Stack spacing={3}>
              <SectionCard subtitle="Edita datos personales y administrativos de forma controlada" title="Editar persona">
                <Stack component="form" noValidate onSubmit={onUpdate} spacing={2}>
                  {updateError && <Alert severity="error">{updateError}</Alert>}

                  <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        {...editForm.register("firstName")}
                        error={!!editForm.formState.errors.firstName}
                        fullWidth
                        helperText={editForm.formState.errors.firstName?.message}
                        label="Nombre"
                        required
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        {...editForm.register("lastName")}
                        error={!!editForm.formState.errors.lastName}
                        fullWidth
                        helperText={editForm.formState.errors.lastName?.message}
                        label="Apellidos"
                        required
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        label="Tipo documento"
                        required
                        select
                        value={editForm.watch("nifType")}
                        onChange={(event) =>
                          editForm.setValue("nifType", event.target.value as UpdatePersonFormValues["nifType"], {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                      >
                        {documentTypeOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 8 }}>
                      <TextField
                        {...editForm.register("nifValue")}
                        error={!!editForm.formState.errors.nifValue}
                        fullWidth
                        helperText={editForm.formState.errors.nifValue?.message}
                        label="Documento"
                        required
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        {...editForm.register("birthDate")}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        label="Fecha de nacimiento"
                        type="date"
                      />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField {...editForm.register("contact")} fullWidth label="Contacto" />
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                      <TextField {...editForm.register("address")} fullWidth label="Direccion" />
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Estado documental"
                        select
                        value={editForm.watch("documentStatus") ?? ""}
                        onChange={(event) =>
                          editForm.setValue("documentStatus", (event.target.value || null) as DocumentStatus | null, {
                            shouldDirty: true
                          })
                        }
                      >
                        <MenuItem value="">Sin definir</MenuItem>
                        {documentStatusOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid2>
                    <Grid2 size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        label="Estado"
                        required
                        select
                        value={String(editForm.watch("active"))}
                        onChange={(event) =>
                          editForm.setValue("active", event.target.value === "true", {
                            shouldDirty: true,
                            shouldValidate: true
                          })
                        }
                      >
                        <MenuItem value="true">Activo</MenuItem>
                        <MenuItem value="false">Inactivo</MenuItem>
                      </TextField>
                    </Grid2>
                    <Grid2 size={{ xs: 12 }}>
                      <TextField {...editForm.register("notes")} fullWidth label="Notas" minRows={4} multiline />
                    </Grid2>
                  </Grid2>

                  <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
                    <Button onClick={resetEditForm} variant="outlined">
                      Revertir
                    </Button>
                    <Button disabled={updatePersonMutation.isPending} type="submit" variant="contained">
                      Guardar cambios
                    </Button>
                  </Stack>
                </Stack>
              </SectionCard>

              <SectionCard subtitle="Amplia la cobertura de roles de la persona" title="Anadir roles">
                {addRolesError && <Alert severity="error">{addRolesError}</Alert>}
                {availableRoles.length === 0 ? (
                  <EmptyState
                    description="La persona ya tiene todos los roles disponibles del MVP. No hace falta ninguna ampliacion adicional."
                    title="No quedan roles por anadir"
                  />
                ) : (
                  <Stack component="form" noValidate onSubmit={onAddRoles} spacing={2}>
                    <FormGroup>
                      {availableRoles.map((option) => (
                        <FormControlLabel
                          key={option.value}
                          control={
                            <Switch
                              checked={selectedRoles.includes(option.value)}
                              onChange={(event) => {
                                const nextRoles = event.target.checked
                                  ? [...selectedRoles, option.value]
                                  : selectedRoles.filter((role) => role !== option.value);

                                rolesForm.setValue("roles", nextRoles as PersonRoleType[], {
                                  shouldDirty: true,
                                  shouldValidate: true
                                });
                              }}
                            />
                          }
                          label={getPersonRoleLabel(option.value)}
                        />
                      ))}
                    </FormGroup>
                    {rolesForm.formState.errors.roles && <Alert severity="warning">{rolesForm.formState.errors.roles.message}</Alert>}
                    <Button disabled={addRolesMutation.isPending} type="submit" variant="contained">
                      Anadir roles
                    </Button>
                  </Stack>
                )}
              </SectionCard>
            </Stack>
          </Grid2>
        </Grid2>
      </Stack>
    </PageContainer>
  );
}
