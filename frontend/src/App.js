import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/auth";
import ProtectedLayout from "./components/ProtectedLayout"; // Verifique se este arquivo existe
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Pedidos from "./pages/Pedidos";
import KDS from "./pages/KDS";
import Mesas from "./pages/Mesas";
import Produtos from "./pages/Produtos";
import Financeiro from "./pages/Financeiro";
import Entregas from "./pages/Entregas";
import Fiscal from "./pages/Fiscal";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <Routes>
          <Route path="/Login" element={<Login />} />
          <Route path="/Register" element={<Register />} />
          <Route path="/" element={<ProtectedLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="Pedidos" element={<Pedidos />} />
            <Route path="KDS" element={<KDS />} />
            <Route path="Mesas" element={<Mesas />} />
            <Route path="Produtos" element={<Produtos />} />
            <Route path="Financeiro" element={<Financeiro />} />
            <Route path="Entregas" element={<Entregas />} />
            <Route path="Fiscal" element={<Fiscal />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}