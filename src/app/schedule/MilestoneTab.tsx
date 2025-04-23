"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Switch, FormControlLabel, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs, { Dayjs } from "dayjs";

interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate: Timestamp;
  endDate?: Timestamp;
  time?: string;
  notify: boolean;
  notifyBeforeHours?: number;
}

export default function MilestoneTab() {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: dayjs(),
    endDate: null as Dayjs | null,
    time: "",
    notify: false,
    notifyBeforeHours: 1,
  });

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "milestones"),
      where("userId", "==", user.uid),
      orderBy("startDate")
    );
    const unsub = onSnapshot(q, snap => {
      setMilestones(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Milestone)));
    });
    return () => unsub();
  }, [user]);

  const handleOpen = (m?: Milestone) => {
    if (m) {
      setEditId(m.id);
      setForm({
        title: m.title,
        description: m.description,
        startDate: dayjs(m.startDate.toDate()),
        endDate: m.endDate ? dayjs(m.endDate.toDate()) : null,
        time: m.time || "",
        notify: m.notify,
        notifyBeforeHours: m.notifyBeforeHours || 1,
      });
    } else {
      setEditId(null);
      setForm({ title: "", description: "", startDate: dayjs(), endDate: null, time: "", notify: false, notifyBeforeHours: 1 });
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
      title: form.title,
      description: form.description,
      startDate: Timestamp.fromDate(form.startDate.toDate()),
      endDate: form.endDate ? Timestamp.fromDate(form.endDate.toDate()) : undefined,
      time: form.time,
      notify: form.notify,
      notifyBeforeHours: form.notify ? form.notifyBeforeHours : undefined,
      userId: user.uid,
    };
    if (editId) {
      await updateDoc(doc(db, "milestones", editId), data);
    } else {
      await addDoc(collection(db, "milestones"), data);
    }
    setOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "milestones", id));
  };

  return (
    <Box>
      <Button variant="contained" onClick={() => handleOpen()} sx={{ mb: 2 }}>Add Milestone</Button>
      <List>
        {milestones.map(m => (
          <ListItem key={m.id} divider>
            <ListItemText
              primary={m.title}
              secondary={
                <>
                  <Typography variant="body2">{m.description}</Typography>
                  <Typography variant="caption">
                    {dayjs(m.startDate.toDate()).format("YYYY-MM-DD")}
                    {m.endDate && ` ~ ${dayjs(m.endDate.toDate()).format("YYYY-MM-DD")}`}
                    {m.time && ` ${m.time}`}
                    {m.notify && ` (Notify ${m.notifyBeforeHours}h before)`}
                  </Typography>
                </>
              }
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" onClick={() => handleOpen(m)}><EditIcon /></IconButton>
              <IconButton edge="end" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} fullWidth required />
          <TextField label="Description" value={form.description} onChange={e => handleChange("description", e.target.value)} fullWidth multiline minRows={2} />
          <DatePicker label="Start Date" value={form.startDate} onChange={v => handleChange("startDate", v)} />
          <DatePicker label="End Date" value={form.endDate} onChange={v => handleChange("endDate", v)} />
          <TimePicker label="Time" value={form.time ? dayjs(form.time, "HH:mm") : null} onChange={v => handleChange("time", v ? v.format("HH:mm") : "")} />
          <FormControlLabel control={<Switch checked={form.notify} onChange={e => handleChange("notify", e.target.checked)} />} label="Email Notification" />
          {form.notify && (
            <TextField label="Notify Before (hours)" type="number" value={form.notifyBeforeHours} onChange={e => handleChange("notifyBeforeHours", Number(e.target.value))} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
