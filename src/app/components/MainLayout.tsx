"use client";
import { useState } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, AppBar, Toolbar, Typography, IconButton, Divider } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import EventIcon from "@mui/icons-material/Event";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

const menu = [
  { label: "Schedule", icon: <CalendarMonthIcon />, href: "/schedule" },
  { label: "Settings", icon: <SettingsIcon />, href: "/settings" },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(true);

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
            <Link href={item.href} key={item.label} passHref legacyBehavior>
              <ListItem button selected={pathname.startsWith(item.href)}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            </Link>
          ))}
        </List>
        <Divider sx={{ mt: "auto" }} />
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
