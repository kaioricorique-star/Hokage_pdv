import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";
import { Bike } from "lucide-react";

export default function Entregas() {
  const [active, setActive] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", vehicle: "moto" });

  const load = async () => {
    try {
      const [a, p] = await Promise.all([api.get("/entregas/ativas"), api.get("/entregadores")]);
      setActive(a.data);
      setPeople(p.data);
    } catch (e) {
      toast.error("Erro ao carregar entregas");
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const addPerson = async (e) => {
    e.preventDefault();
    try {
      await api.post("/entregadores", form);
      toast.success("Entregador cadastrado");
      setForm({ name: "", phone: "", vehicle: "moto" });
      load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Erro ao cadastrar");
    }
  };

  const assign = async (orderId, deliveryId) => {
    try {
      await api.patch(`/pedidos/${orderId}/entregador/${deliveryId}`);
      toast.success("Entregador atribuído");
      load();
    } catch (e) {
      toast.error("Erro ao atribuir");
    }
  };

  return (
    <div data-testid="entregas-page">
      <PageHeader title="Entregas" subtitle="Gestão de entregadores e logística" />
      
      <div className="p-8 grid lg:grid-cols-3 gap-8">
        {/* Formulário de Cadastro */}
        <div className="bg-white p-6 border border-neutral-200">
          <h2 className="font-bold mb-4">Novo Entregador</h2>
          <form onSubmit={addPerson} className="space-y-3">
            <input required placeholder="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 text-sm" />
            <input required placeholder="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 text-sm" />
            <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className="w-full px-3 py-2 border border-neutral-300 text-sm">
              <option value="moto">Moto</option>
              <option value="bike">Bike</option>
              <option value="carro">Carro</option>
              <option value="pe">A pé</option>
            </select>
            <button className="w-full bg-neutral-900 text-white py-2 text-sm font-semibold hover:bg-neutral-800">Adicionar</button>
          </form>
        </div>

        {/* Lista de Entregadores */}
        <div className="lg:col-span-2 space-y-2">
          {people.map(p => (
            <div key={p.id} className="border border-neutral-200 p-4 flex justify-between items-center bg-white">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-neutral-500">{p.vehicle.toUpperCase()} · {p.phone}</p>
              </div>
              <Bike className="w-5 h-5 text-neutral-400" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}