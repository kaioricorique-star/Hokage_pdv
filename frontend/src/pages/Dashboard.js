import { useEffect, useState } from "react";
import { api, BRL } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { TrendingUp, ShoppingBag, Users, Package, ArrowUpRight } from "lucide-react";

export default function Dashboard() {
  const [stats, setStats] = useState({
    total_vendas: 0,
    total_pedidos: 0,
    clientes_ativos: 0,
    estoque_baixo: 0
  });

  const loadDashboard = async () => {
    try {
      const { data } = await api.get("/dashboard/stats");
      setStats(data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <div data-testid="dashboard-page">
      <PageHeader title="Dashboard" subtitle="Visão geral do seu negócio" />
      
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card de Vendas */}
        <div className="bg-white p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase">Vendas Totais</p>
              <h3 className="text-2xl font-black mt-1">{BRL(stats.total_vendas)}</h3>
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
        </div>

        {/* Card de Pedidos */}
        <div className="bg-white p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase">Pedidos Hoje</p>
              <h3 className="text-2xl font-black mt-1">{stats.total_pedidos}</h3>
            </div>
            <ShoppingBag className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Card de Clientes */}
        <div className="bg-white p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase">Clientes Ativos</p>
              <h3 className="text-2xl font-black mt-1">{stats.clientes_ativos}</h3>
            </div>
            <Users className="w-5 h-5 text-purple-600" />
          </div>
        </div>

        {/* Card de Estoque */}
        <div className="bg-white p-6 border border-neutral-200 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold text-neutral-500 uppercase">Itens em Estoque</p>
              <h3 className="text-2xl font-black mt-1">{stats.estoque_baixo}</h3>
            </div>
            <Package className="w-5 h-5 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white border border-neutral-200 p-6">
          <h2 className="font-bold text-lg mb-4">Atividade Recente</h2>
          {/* Aqui você pode adicionar uma tabela ou lista de logs de atividades */}
          <p className="text-sm text-neutral-500 italic">Nenhuma atividade recente para exibir.</p>
        </div>
      </div>
    </div>
  );
}