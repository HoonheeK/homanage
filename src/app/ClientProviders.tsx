"use client";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useEffect, useMemo, useState } from "react";
import AuthProvider from "./components/AuthProvider";
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"light" | "dark" | "color">("light");
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("themeMode") : null;
    if (saved && (saved === "light" || saved === "dark" || saved === "color")) setMode(saved as "light" | "dark" | "color");
  }, []);
  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode === "color" ? "light" : mode,
      ...(mode === "color" && {
        primary: { main: "#1976d2" },
        secondary: { main: "#d32f2f" },
        background: { default: "#f2efe5" },
      }),
    },
  }), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthProvider>{children}</AuthProvider>
      </LocalizationProvider>
    </ThemeProvider>
  );
}
