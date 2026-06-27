import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import {
  LayoutDashboard, ShoppingCart, Package, ClipboardList, ChefHat,
  Armchair, Bike, DollarSign, FileText, Sparkles, LogOut,
} from "lucide-react";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, testid: "nav-dashboard" },
  { to: "/pdv", label: "PDV", icon: ShoppingCart, testid: "nav-pdv" },
  { to: "/pedidos", label: "Pedidos", icon: ClipboardList, testid: "nav-pedidos" },
  { to: "/kds", label: "KDS Cozinha", icon: ChefHat, testid: "nav-kds" },
  { to: "/mesas", label: "Mesas", icon: Armchair, testid: "nav-mesas" },
  { to: "/entregas", label: "Entregas", icon: Bike, testid: "nav-entregas" },
  { to: "/produtos", label: "Produtos", icon: Package, testid: "nav-produtos" },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign, testid: "nav-financeiro" },
  { to: "/fiscal", label: "Fiscal", icon: FileText, testid: "nav-fiscal" },
  { to: "/ia", label: "IA Insights", icon: Sparkles, testid: "nav-ia" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <aside className="w-60 bg-white border-r border-neutral-200 flex flex-col min-h-screen">
      <div className="p-5 border-b border-neutral-200">
        <h1 className="font-black text-base">HOKAGE</h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className="nav-link flex items-center gap-2 p-2">
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t">
        <p className="text-xs">{user?.name}</p>
        <button onClick={() => { logout(); nav("/login"); }} className="text-left w-full mt-2">
          <LogOut className="w-4 h-4 inline" /> Sair
        </button>
      </div>
    </aside>
  );
}