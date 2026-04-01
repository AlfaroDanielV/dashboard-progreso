// src/config/brand.ts
export const colors = {
  terracotta: "#B97860",
  sage: "#6B9E8A",
  peach: "#F5C4B6",
  cream: "#FDF6F0",
  dark: "#3D3D3D",
  gold: "#D4A84B",
  lightSage: "#D4E8DE",
  lightTerra: "#E8C9B8",
  warmWhite: "#FEFCF9",
  muted: "#9B8E85",
};

export const fonts = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'DM Sans', sans-serif",
};

export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP || "50688888888";
export const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;