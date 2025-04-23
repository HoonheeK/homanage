"use client";
import { useAuth } from "../components/AuthProvider";

export default function SettingsPage() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Settings</h1>
      <p>여기에 설정 관련 UI를 구현하세요.</p>
    </div>
  );
}