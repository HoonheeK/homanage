"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, IconButton, Typography, ToggleButtonGroup, ToggleButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs from "dayjs";
import { Solar } from "lunar-javascript";

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
    return Timestamp.fromDate(lunar.getSolar().toDate());
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
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Days to Remember</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Day
        </Button>
      </Box>
      {days.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 8 }}>
          No days yet. Click &apos;Add Day&apos; to create one!
        </Typography>
      ) : (
        <Box component="table" width="100%" sx={{ borderCollapse: 'collapse', mb: 3 }}>
          <Box component="thead" sx={{ bgcolor: '#f5f5f5' }}>
            <Box component="tr">
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Title</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Description</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Date</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Calendar</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}></Box>
            </Box>
          </Box>
          <Box component="tbody">
            {days.map(d => (
              <Box component="tr" key={d.id}>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', fontWeight: 'bold', minWidth: 120 }}>{d.title}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', minWidth: 180 }}>{d.description}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{dayjs(d.date.toDate()).format("YYYY-MM-DD")}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{d.calendarType === "solar" ? "Solar" : "Lunar"}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', minWidth: 80 }}>
                  <IconButton edge="end" onClick={() => handleOpen(d)}><EditIcon /></IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(d.id)}><DeleteIcon /></IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Day" : "Add Day"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} fullWidth required autoFocus />
          <TextField label="Description" value={form.description} onChange={e => handleChange("description", e.target.value)} fullWidth multiline minRows={2} />
          <DatePicker label="Date" value={form.date} onChange={v => handleChange("date", v)} />
          <ToggleButtonGroup color="primary" value={form.calendarType} exclusive onChange={(_, v) => v && handleChange("calendarType", v)}>
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
