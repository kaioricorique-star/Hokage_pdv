import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import Sidebar from "./Sidebar";

export default function ProtectedLayout() {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" />;
}