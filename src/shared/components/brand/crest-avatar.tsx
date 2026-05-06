import { alpha, Avatar, Box, useTheme } from "@mui/material";

type CrestAvatarProps = {
  alt: string;
  size: number;
  src: string;
};

export function CrestAvatar({ alt, size, src }: CrestAvatarProps) {
  const theme = useTheme();

  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.08)
      }}
    >
      <Box
        component="img"
        alt={alt}
        src={src}
        sx={{
          width: "100%",
          height: "100%",
          objectFit: "contain"
        }}
      />
    </Avatar>
  );
}
