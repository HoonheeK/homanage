"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface CalendarLink {
  id: string;
  appName: string;
  url: string;
}

export default function ShareCalendarTab() {
  const { user } = useAuth();
  const [links, setLinks] = useState<CalendarLink[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    appName: "",
    url: "",
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "calendarLinks"),
      where("userId", "==", user.uid),
      orderBy("appName")
    );
    const unsub = onSnapshot(q, snap => {
      setLinks(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CalendarLink)));
    });
    return () => unsub();
  }, [user]);

  const handleOpen = (l?: CalendarLink) => {
    if (l) {
      setEditId(l.id);
      setForm({ appName: l.appName, url: l.url });
    } else {
      setEditId(null);
      setForm({ appName: "", url: "" });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    const data = {
      appName: form.appName,
      url: form.url,
      userId: user.uid,
    };
    if (editId) {
      await updateDoc(doc(db, "calendarLinks", editId), data);
    } else {
      await addDoc(collection(db, "calendarLinks"), data);
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "calendarLinks", id));
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Calendar Link</Button>
      <List>
        {links.map(l => (
          <ListItem key={l.id} divider>
            <ListItemText
              primary={l.appName}
              secondary={<Typography variant="body2" color="primary.main">{l.url}</Typography>}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpen(l)}><EditIcon /></IconButton>
              <IconButton edge="end" color="error" onClick={() => handleDelete(l.id)}><DeleteIcon /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Calendar Link" : "Add Calendar Link"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="App Name" value={form.appName} onChange={e => handleChange("appName", e.target.value)} fullWidth required />
          <TextField label="URL" value={form.url} onChange={e => handleChange("url", e.target.value)} fullWidth required />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
