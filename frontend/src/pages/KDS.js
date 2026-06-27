import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";
import { Flame } from "lucide-react";

// Função para calcular tempo decorrido
function elapsed(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 60000;
  return Math.max(0, Math.floor(diff));
}

export default function KDS() {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/kds");
      setOrders(data);
    } catch (err) {
      console.error("Erro ao carregar KDS:", err);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 5000); // Atualiza a cada 5 segundos
    return () => clearInterval(id);
  }, []);

  const bump = async (id, status) => {
    try {
      await api.patch(`/pedidos/${id}/status`, { status });
      toast.success("Pedido atualizado");
      load();
    } catch (err) {
      toast.error("Erro ao atualizar status");
    }
  };

  // Organização das colunas
  const cols = {
    pendente: orders.filter((o) => o.status === "pendente"),
    preparando: orders.filter((o) => o.status === "preparando"),
    pronto: orders.filter((o) => o.status === "pronto"),
  };

  return (
    <div data-testid="kds-page" className="min-h-screen bg-neutral-100">
      <PageHeader title="KDS" subtitle="Gestão de preparo de pedidos" />
      
      <div className="grid grid-cols-3 gap-4 p-6 h-[calc(100vh-100px)]">
        {Object.entries(cols).map(([key, list]) => (
          <div key={key} className="flex flex-col gap-4">
            <h2 className="font-bold uppercase tracking-widest text-sm text-neutral-500 mb-2">
              {key} ({list.length})
            </h2>
            
            {list.map((o) => {
              const min = elapsed(o.created_at);
              const nextStatus = key === "pendente" ? "preparando" : key === "preparando" ? "pronto" : "entregue";
              
              return (
                <div key={o.id} className="bg-white p-4 border border-neutral-200 shadow-sm" data-testid={`kds-card-${o.id}`}>
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-mono font-black text-lg">#{o.order_number}</p>
                    <p className="text-xs font-mono font-semibold flex items-center gap-1">
                      <Flame className={`w-3 h-3 ${min > 15 ? "text-red-600" : "text-orange-500"}`} />
                      {min}min
                    </p>
                  </div>
                  
                  <p className="text-[10px] uppercase tracking-wider text-neutral-500 mb-2">
                    {o.type} {o.table_number ? `· Mesa ${o.table_number}` : ""}
                  </p>

                  <ul className="text-sm space-y-1 mb-3">
                    {o.items.map((i, idx) => (
                      <li key={idx}>
                        <span className="font-bold">{i.quantity}×</span> {i.name}
                        {i.notes && <p className="text-xs text-neutral-500 italic ml-4">{i.notes}</p>}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => bump(o.id, nextStatus)} 
                    className="w-full bg-neutral-900 text-white py-2 text-xs font-bold uppercase tracking-wider hover:bg-neutral-800"
                    data-testid={`kds-bump-${o.id}`}
                  >
                    {key === "pendente" ? "Iniciar Preparo" : key === "preparando" ? "Marcar Pronto" : "Marcar Entregue"}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}