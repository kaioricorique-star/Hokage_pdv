import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";

const STATUS = { livre: "Livre", ocupada: "Ocupada", reservada: "Reservada" };
const COLORS = {
  livre: "bg-green-50 border-green-200 text-green-900",
  ocupada: "bg-red-50 border-red-300 text-red-900",
  reservada: "bg-yellow-50 border-yellow-200 text-yellow-900",
};

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [newNumber, setNewNumber] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/mesas");
      setMesas(data);
    } catch (err) {
      toast.error("Erro ao carregar mesas");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const change = async (id, status) => {
    try {
      await api.patch(`/mesas/${id}/status`, { status });
      toast.success("Mesa atualizada");
      load();
    } catch (err) {
      toast.error("Erro ao atualizar mesa");
    }
  };

  const create = async () => {
    if (!newNumber) return;
    try {
      await api.post("/mesas", { number: Number(newNumber), capacity: 4 });
      toast.success("Mesa criada");
      setNewNumber("");
      load();
    } catch (err) {
      toast.error("Erro ao criar mesa");
    }
  };

  return (
    <div data-testid="mesas-page">
      <PageHeader 
        title="Mesas" 
        subtitle="Gerenciamento de ocupação do salão" 
        actions={
          <div className="flex gap-2">
            <input 
              type="number" 
              placeholder="Nº" 
              value={newNumber} 
              onChange={(e) => setNewNumber(e.target.value)} 
              className="px-3 py-2 border border-neutral-300 w-20 text-sm" 
            />
            <button 
              onClick={create} 
              className="bg-neutral-900 text-white px-4 py-2 text-sm font-semibold hover:bg-neutral-800"
              data-testid="add-table"
            >
              + Mesa
            </button>
          </div>
        } 
      />

      <div className="p-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4" data-testid="mesas-grid">
          {mesas.map((m) => (
            <div 
              key={m.id} 
              className={`border p-4 transition-colors ${COLORS[m.status] || "bg-white"}`} 
              data-testid={`mesa-${m.number}`}
            >
              <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Mesa</p>
              <p className="font-black text-4xl mt-1">{m.number}</p>
              <p className="text-xs mt-2 font-semibold uppercase tracking-wider">{STATUS[m.status]}</p>
              <p className="text-xs opacity-70 mt-0.5 mb-3">{m.capacity} lugares</p>
              
              <select 
                value={m.status} 
                onChange={(e) => change(m.id, e.target.value)} 
                className="w-full text-xs px-2 py-1 border border-current bg-transparent focus:outline-none cursor-pointer"
                data-testid={`mesa-status-${m.number}`}
              >
                <option value="livre">Livre</option>
                <option value="ocupada">Ocupada</option>
                <option value="reservada">Reservada</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}