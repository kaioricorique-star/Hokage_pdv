import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";
import { FileText, Download } from "lucide-react";

export default function Fiscal() {
  const [notas, setNotas] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/fiscal/notas");
      setNotas(data);
    } catch (err) {
      toast.error("Erro ao carregar dados fiscais");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div data-testid="fiscal-page">
      <PageHeader title="Fiscal" subtitle="Gestão de notas e obrigações" />
      
      <div className="p-8">
        <div className="bg-white border border-neutral-200">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 text-xs uppercase text-neutral-500">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Número</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {notas.map((n) => (
                <tr key={n.id}>
                  <td className="p-4">{new Date(n.created_at).toLocaleDateString()}</td>
                  <td className="p-4 font-mono font-bold">{n.number}</td>
                  <td className="p-4">R$ {n.total.toFixed(2)}</td>
                  <td className="p-4">{n.status}</td>
                  <td className="p-4">
                    <button className="text-neutral-600 hover:text-black">
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}