"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { useAuth } from "../components/AuthProvider";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Switch, FormControlLabel, IconButton, Typography } from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import dayjs, { Dayjs } from "dayjs";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

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
  const { user, loading } = useAuth();
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
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: "success"|"error"|"info"|"warning"}>({open: false, message: '', severity: 'success'});

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

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

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
    // 필수 입력값 체크
    if (!form.title.trim()) {
      setSnackbar({open: true, message: "Title is required.", severity: "error"});
      return;
    }
    if (!form.startDate || !dayjs(form.startDate).isValid()) {
      setSnackbar({open: true, message: "Start Date is required.", severity: "error"});
      return;
    }
    // notify가 false일 때 notifyBeforeHours를 undefined로 명확히 지정
    const data = {
      title: form.title,
      description: form.description,
      startDate: Timestamp.fromDate(form.startDate.toDate()),
      // endDate: 값이 있을 때만 포함
      ...(form.endDate && dayjs(form.endDate).isValid() ? { endDate: Timestamp.fromDate(form.endDate.toDate()) } : {}),
      time: form.time,
      notify: form.notify,
      ...(form.notify ? { notifyBeforeHours: form.notifyBeforeHours } : {}),
      userId: user.uid,
    };
    try {
      if (editId) {
        await updateDoc(doc(db, "milestones", editId), data);
        setSnackbar({open: true, message: "Milestone updated!", severity: "success"});
      } else {
        await addDoc(collection(db, "milestones"), data);
        setSnackbar({open: true, message: "Milestone added!", severity: "success"});
      }
      setOpen(false);
      setForm({ title: "", description: "", startDate: dayjs(), endDate: null, time: "", notify: false, notifyBeforeHours: 1 });
    } catch (e) {
      console.error("Failed to save milestone:", e);
      setSnackbar({open: true, message: "Failed to save milestone.", severity: "error"});
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "milestones", id));
      setSnackbar({open: true, message: "Milestone deleted!", severity: "info"});
    } catch {
      setSnackbar({open: true, message: "Failed to delete milestone.", severity: "error"});
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight="bold">Milestones</Typography>
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Milestone
        </Button>
      </Box>
      {milestones.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 8 }}>
          No milestones yet. Click &apos;Add Milestone&apos; to create one!
        </Typography>
      ) : (
        <Box component="table" width="100%" sx={{ borderCollapse: 'collapse', mb: 3 }}>
          <Box component="thead" sx={{ bgcolor: '#f5f5f5' }}>
            <Box component="tr">
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Title</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Description</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Start</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>End</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Time</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}>Notify</Box>
              <Box component="th" sx={{ p: 1, border: '1px solid #ddd' }}></Box>
            </Box>
          </Box>
          <Box component="tbody">
            {milestones.map(m => (
              <Box component="tr" key={m.id}>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', fontWeight: 'bold', minWidth: 120 }}>{m.title}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', minWidth: 180 }}>{m.description}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{dayjs(m.startDate.toDate()).format("YYYY-MM-DD")}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{m.endDate ? dayjs(m.endDate.toDate()).format("YYYY-MM-DD") : '-'}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{m.time || '-'}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee' }}>{m.notify ? `Yes (${m.notifyBeforeHours}h)` : 'No'}</Box>
                <Box component="td" sx={{ p: 1, border: '1px solid #eee', minWidth: 80 }}>
                  <IconButton edge="end" onClick={() => handleOpen(m)}><EditIcon /></IconButton>
                  <IconButton edge="end" color="error" onClick={() => handleDelete(m.id)}><DeleteIcon /></IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{editId ? "Edit Milestone" : "Add Milestone"}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Title" value={form.title} onChange={e => handleChange("title", e.target.value)} fullWidth required autoFocus />
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
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(s => ({...s, open: false}))} anchorOrigin={{vertical:'bottom',horizontal:'center'}}>
        <Alert onClose={() => setSnackbar(s => ({...s, open: false}))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
