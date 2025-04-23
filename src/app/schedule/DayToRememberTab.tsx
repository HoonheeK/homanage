"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs, { Dayjs } from "dayjs";
import { Solar, Lunar } from "lunar-javascript";

interface RememberDay {
  id: string;
  title: string;
  description: string;
  date: Timestamp;
  calendarType: "solar" | "lunar";
}

export default function DayToRememberTab() {
  const { user } = useAuth();
  const [days, setDays] = useState<RememberDay[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: dayjs(),
    calendarType: "solar" as "solar" | "lunar",
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "rememberDays"),
      where("userId", "==", user.uid),
      orderBy("date")
    );
    const unsub = onSnapshot(q, snap => {
      setDays(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as RememberDay)));
    });
    return () => unsub();
  }, [user]);

  const handleOpen = (d?: RememberDay) => {
    if (d) {
      setEditId(d.id);
      setForm({
        title: d.title,
        description: d.description,
        date: dayjs(d.date.toDate()),
        calendarType: d.calendarType,
      });
    } else {
      setEditId(null);
      setForm({ title: "", description: "", date: dayjs(), calendarType: "solar" });
    }
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleChange = (field: string, value: any) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  // 음력 변환 (입력값을 음력/양력으로 변환해서 저장)
  const getSaveDate = () => {
    if (form.calendarType === "solar") return Timestamp.fromDate(form.date.toDate());
    // lunar-javascript 사용
    const solar = Solar.fromDate(form.date.toDate());
    const lunar = solar.getLunar();
    // 음력 날짜를 양력으로 변환하여 저장(기념일 계산시 활용)
    return Timestamp.fromDate(lunar.getSolar().getDate());
  };

  const handleSubmit = async () => {
    if (!user) return;
    const data = {
      title: form.title,
      description: form.description,
      date: getSaveDate(),
      calendarType: form.calendarType,
      userId: user.uid,
    };
    if (editId) {
      await updateDoc(doc(db, "rememberDays", editId), data);
    } else {
      await addDoc(collection(db, "rememberDays"), data);
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "rememberDays", id));
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Day to Remember</Button>
      <List>
        {days.map(d => (
          <ListItem key={d.id} divider>
            <ListItemText
              primary={d.title}
              secondary={
                <>
                  <Typography variant="body2">{d.description}</Typography>
                  <Typography variant="caption">
                    {dayjs(d.date.toDate()).format("YYYY-MM-DD")} ({d.calendarType})
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpen(d)}><EditIcon /></IconButton>
              <IconButton edge="end" color="error" onClick={() => handleDelete(d.id)}><DeleteIcon /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Day to Remember" : "Add Day to Remember"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} fullWidth required />
          <TextField label="Description" value={form.description} onChange={e => handleChange("description", e.target.value)} fullWidth multiline minRows={2} />
          <DatePicker label="Date" value={form.date} onChange={v => handleChange("date", v)} />
          <ToggleButtonGroup
            value={form.calendarType}
            exclusive
            onChange={(_, v) => v && handleChange("calendarType", v)}
            sx={{ mt: 2 }}
          >
            <ToggleButton value="solar">Solar</ToggleButton>
            <ToggleButton value="lunar">Lunar</ToggleButton>
          </ToggleButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
