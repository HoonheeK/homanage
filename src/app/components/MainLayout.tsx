"use client";
import { useState } from "react";
import { Drawer, List, ListItemIcon, ListItemText, Box, Toolbar, Typography, Divider } from "@mui/material";
import ListItemButton from "@mui/material/ListItemButton";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
// import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

const menu = [
  { label: "Schedule", icon: <CalendarMonthIcon />, href: "/schedule" },
  { label: "Settings", icon: <SettingsIcon />, href: "/settings" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  // const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen] = useState(true);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer variant="permanent" open={drawerOpen} sx={{ width: 220, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: 220, boxSizing: 'border-box' } }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">HomeManage</Typography>
        </Toolbar>
        <Divider />
        <List>
          {menu.map(item => (
            <ListItemButton
              component={Link}
              href={item.href}
              key={item.label}
              selected={pathname.startsWith(item.href)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ mt: "auto" }} />
        <List>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
