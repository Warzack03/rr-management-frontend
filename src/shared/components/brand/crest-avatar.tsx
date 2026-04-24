import { Avatar, Box } from "@mui/material";

type CrestAvatarProps = {
  alt: string;
  size: number;
  src: string;
};

export function CrestAvatar({ alt, size, src }: CrestAvatarProps) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        bgcolor: "rgba(58, 104, 168, 0.08)"
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
