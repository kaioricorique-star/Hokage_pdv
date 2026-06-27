import { useEffect, useState } from "react";
import { api, BRL } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";

export default function Financeiro() {
  const [resumo, setResumo] = useState(null);
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState({ type: "receita", category: "Outros", amount: "", description: "" });

  const load = async () => {
    try {
      const [r, e] = await Promise.all([api.get("/financeiro/resumo"), api.get("/financeiro/lancamentos")]);
      setResumo(r.data);
      setEntries(e.data);
    } catch (e) {
      toast.error("Erro ao carregar financeiro");
    }
  };

  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/financeiro/lancamentos", { ...form, amount: Number(form.amount) });
      toast.success("Lançamento registrado");
      setForm({ type: "receita", category: "Outros", amount: "", description: "" });
      load();
    } catch (err) { toast.error(err.response?.data?.detail || "Erro"); }
  };

  if (!resumo) return <div className="p-8">Carregando…</div>;

  return (
    <div data-testid="financeiro-page">
      <PageHeader title="Financeiro" subtitle="Fluxo de caixa" />
      
      <div className="p-8 grid lg:grid-cols-3 gap-8">
        {/* Resumo */}
        <div className="bg-neutral-900 text-white p-6">
          <p className="text-xs uppercase opacity-70">Saldo Atual</p>
          <h2 className="text-3xl font-black mt-1">{BRL(resumo.saldo)}</h2>
          <div className="mt-6 space-y-2 text-sm">
            <p className="flex justify-between">Receitas: <span className="text-green-400">{BRL(resumo.total_receitas)}</span></p>
            <p className="flex justify-between">Despesas: <span className="text-red-400">{BRL(resumo.total_despesas)}</span></p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={add} className="bg-white p-6 border border-neutral-200 space-y-3">
          <h3 className="font-bold">Novo Lançamento</h3>
          <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})} className="w-full p-2 border border-neutral-300">
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
          <input required placeholder="Valor" type="number" step="0.01" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} className="w-full p-2 border border-neutral-300" />
          <input required placeholder="Descrição" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} className="w-full p-2 border border-neutral-300" />
          <button className="w-full bg-neutral-900 text-white py-2 font-bold">Registrar</button>
        </form>
      </div>
    </div>
  );
}