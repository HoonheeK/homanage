"use client";
import MainLayout from "../components/MainLayout";
import { Tabs, Tab, Box } from "@mui/material";
import { useState } from "react";
import dynamic from "next/dynamic";

const MilestoneTab = dynamic(() => import("./MilestoneTab"), { ssr: false });
const DayToRememberTab = dynamic(() => import("./DayToRememberTab"), { ssr: false });
const ShareCalendarTab = dynamic(() => import("./ShareCalendarTab"), { ssr: false });

export default function SchedulePage() {
  const [tab, setTab] = useState(0);
  return (
    <MainLayout>
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label="Milestone" />
        <Tab label="A Day to Remember" />
        <Tab label="Share Calendar Link" />
      </Tabs>
      <Box mt={2}>
        {tab === 0 && <MilestoneTab />}
        {tab === 1 && <DayToRememberTab />}
        {tab === 2 && <ShareCalendarTab />}
      </Box>
    </MainLayout>
  );
}
