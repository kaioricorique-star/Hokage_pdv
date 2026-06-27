import { NavLink, useNavigate } from \"react-router-dom\";
import { useAuth } from \"../lib/auth\";
import {
  LayoutDashboard, ShoppingCart, Package, ClipboardList, ChefHat,
  Armchair, Bike, DollarSign, FileText, Sparkles, LogOut, Settings,
} from \"lucide-react\";

const items = [
  { to: \"/\", label: \"Dashboard\", icon: LayoutDashboard, testid: \"nav-dashboard\" },
  { to: \"/pdv\", label: \"PDV\", icon: ShoppingCart, testid: \"nav-pdv\" },
  { to: \"/pedidos\", label: \"Pedidos\", icon: ClipboardList, testid: \"nav-pedidos\" },
  { to: \"/kds\", label: \"KDS Cozinha\", icon: ChefHat, testid: \"nav-kds\" },
  { to: \"/mesas\", label: \"Mesas\", icon: Armchair, testid: \"nav-mesas\" },
  { to: \"/entregas\", label: \"Entregas\", icon: Bike, testid: \"nav-entregas\" },
  { to: \"/produtos\", label: \"Produtos\", icon: Package, testid: \"nav-produtos\" },
  { to: \"/financeiro\", label: \"Financeiro\", icon: DollarSign, testid: \"nav-financeiro\" },
  { to: \"/fiscal\", label: \"Fiscal\", icon: FileText, testid: \"nav-fiscal\" },
  { to: \"/ia\", label: \"IA Insights\", icon: Sparkles, testid: \"nav-ia\" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <aside className=\"w-60 bg-white border-r border-neutral-200 flex flex-col min-h-screen\" data-testid=\"sidebar\">
      <div className=\"p-5 border-b border-neutral-200\">
        <div className=\"flex items-center gap-2\">
          <div className=\"w-8 h-8 bg-neutral-900 flex items-center justify-center\">
            <span className=\"text-white font-display font-black text-sm\">H</span>
          </div>
          <div>
            <h1 className=\"font-display font-black text-base leading-none\">HOKAGE</h1>
            <p className=\"overline text-[10px] mt-1\">PDV SaaS</p>
          </div>
        </div>
      </div>

      <nav className=\"flex-1 p-3 space-y-1\">
        {items.map(({ to, label, icon: Icon, testid }) => (
          <NavLink key={to} to={to} end={to === \"/\"} className={({ isActive }) => `nav-link ${isActive ? \"active\" : \"\"}`} data-testid={testid}>
            <Icon className=\"w-4 h-4\" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className=\"p-3 border-t border-neutral-200 space-y-1\">
        <div className=\"px-3 py-2 text-xs\">
          <p className=\"font-semibold text-neutral-900\" data-testid=\"user-name\">{user?.name}</p>
          <p className=\"text-neutral-500 truncate\" data-testid=\"user-email\">{user?.email}</p>
        </div>
        <button onClick={() => { logout(); nav(\"/login\"); }} className=\"nav-link w-full text-left\" data-testid=\"logout-btn\">
          <LogOut className=\"w-4 h-4\" /> Sair
        </button>
      </div>
    </aside>
  );
}
"
Observation: Create successful: /app/frontend/src/components/Sidebar.js