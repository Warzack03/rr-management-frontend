import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Checkbox, FormControlLabel, FormGroup, Grid2, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { HttpClientError } from "../../../shared/api/http-client";
import { useAppFeedback } from "../../../shared/components/feedback/app-feedback-provider";
import { SectionCard } from "../../../shared/components/data-display/section-card";
import { PageContainer } from "../../../shared/layout/page-container";
import type { DocumentStatus, PersonRoleType } from "../../../shared/types/api";
import { useCreatePersonMutation } from "../api/persons-hooks";
import { documentStatusOptions, documentTypeOptions, getPersonRoleLabel, personRoleOptions } from "../model/persons-ui";

const createPersonSchema = z.object({
  firstName: z.string().trim().min(1, "Introduce el nombre"),
  lastName: z.string().trim().min(1, "Introduce los apellidos"),
  nifType: z.enum(["DNI", "NIE", "PASAPORTE"]),
  nifValue: z.string().trim().min(1, "Introduce el documento"),
  birthDate: z.string().min(1, "Introduce la fecha de nacimiento"),
  address: z.string().optional(),
  contact: z.string().optional(),
  active: z.boolean(),
  documentStatus: z.enum(["COMPLETO", "PENDIENTE", "NO_APLICA"]).nullable(),
  notes: z.string().optional(),
  roles: z.array(z.enum(["JUGADOR", "ENTRENADOR", "STAFF"])).min(1, "Selecciona al menos un rol")
});

type CreatePersonFormValues = z.infer<typeof createPersonSchema>;

export function PersonCreatePage() {
  const navigate = useNavigate();
  const { showSuccess } = useAppFeedback();
  const createPersonMutation = useCreatePersonMutation();
  const form = useForm<CreatePersonFormValues>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      nifType: "DNI",
      nifValue: "",
      birthDate: "",
      address: "",
      contact: "",
      active: true,
      documentStatus: "PENDIENTE",
      notes: "",
      roles: ["JUGADOR"]
    }
  });

  const selectedRoles = form.watch("roles");

  const onSubmit = form.handleSubmit(async (values) => {
    const person = await createPersonMutation.mutateAsync({
      ...values,
      address: values.address?.trim() || undefined,
      contact: values.contact?.trim() || undefined,
      notes: values.notes?.trim() || undefined,
      documentStatus: values.documentStatus ?? undefined
    });

    showSuccess("Persona guardada correctamente.");
    navigate(`/persons/${person.id}`, { replace: true });
  });

  const createError =
    createPersonMutation.error instanceof HttpClientError
      ? createPersonMutation.error.payload?.message ?? createPersonMutation.error.message
      : createPersonMutation.error?.message;

  return (
    <PageContainer
      actions={
        <Button component={Link} to="/persons" variant="outlined">
          Volver a personas
        </Button>
      }
      description="Alta o ampliacion de persona sobre el maestro del club. Si el NIF ya existe con nuevos roles, el registro se ampliara."
      eyebrow="Operativa maestra"
      title="Alta de persona"
    >
      <Stack component="form" noValidate onSubmit={onSubmit} spacing={3}>
        {createError && <Alert severity="error">{createError}</Alert>}
        <Typography color="text.secondary">Los campos con * son obligatorios.</Typography>

        <SectionCard subtitle="Datos base del registro maestro" title="Identidad">
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                {...form.register("firstName")}
                error={!!form.formState.errors.firstName}
                fullWidth
                helperText={form.formState.errors.firstName?.message}
                label="Nombre"
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField
                {...form.register("lastName")}
                error={!!form.formState.errors.lastName}
                fullWidth
                helperText={form.formState.errors.lastName?.message}
                label="Apellidos"
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 3 }}>
              <TextField
                {...form.register("nifType")}
                error={!!form.formState.errors.nifType}
                fullWidth
                helperText={form.formState.errors.nifType?.message}
                label="Tipo documento"
                required
                select
              >
                {documentTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                {...form.register("nifValue")}
                error={!!form.formState.errors.nifValue}
                fullWidth
                helperText={form.formState.errors.nifValue?.message}
                label="Documento"
                required
              />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 5 }}>
              <TextField
                {...form.register("birthDate")}
                error={!!form.formState.errors.birthDate}
                fullWidth
                helperText={form.formState.errors.birthDate?.message}
                label="Fecha de nacimiento"
                required
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid2>
          </Grid2>
        </SectionCard>

        <SectionCard subtitle="Contactabilidad y estado administrativo" title="Datos complementarios">
          <Grid2 container spacing={2}>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField {...form.register("contact")} fullWidth label="Contacto" />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 6 }}>
              <TextField {...form.register("address")} fullWidth label="Direccion" />
            </Grid2>
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Estado documental"
                select
                value={form.watch("documentStatus") ?? ""}
                onChange={(event) =>
                  form.setValue("documentStatus", (event.target.value || null) as DocumentStatus | null, {
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
            <Grid2 size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Estado"
                required
                select
                value={String(form.watch("active"))}
                onChange={(event) =>
                  form.setValue("active", event.target.value === "true", {
                    shouldDirty: true,
                    shouldValidate: true
                  })
                }
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
            </Grid2>
            <Grid2 size={{ xs: 12, md: 12 }}>
              <TextField {...form.register("notes")} fullWidth label="Notas" minRows={4} multiline />
            </Grid2>
          </Grid2>
        </SectionCard>

        <SectionCard subtitle="Al menos un rol es obligatorio" title="Roles *">
          <FormGroup row sx={{ gap: 2 }}>
            {personRoleOptions.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(option.value)}
                    onChange={(event) => {
                      const nextRoles = event.target.checked
                        ? [...selectedRoles, option.value]
                        : selectedRoles.filter((role) => role !== option.value);

                      form.setValue("roles", nextRoles as PersonRoleType[], {
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
          {form.formState.errors.roles && <Alert severity="warning">{form.formState.errors.roles.message}</Alert>}
        </SectionCard>

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: "flex-end" }}>
          <Button component={Link} to="/persons" variant="outlined">
            Cancelar
          </Button>
          <Button disabled={createPersonMutation.isPending} type="submit" variant="contained">
            Guardar persona
          </Button>
        </Stack>
      </Stack>
    </PageContainer>
  );
}
