import { useEffect, useState } from "react";
import { api, BRL } from "../lib/api";
import PageHeader from "../components/PageHeader";
import { toast } from "sonner";

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);

  const load = async () => {
    try {
      const { data } = await api.get("/produtos");
      setProdutos(data);
    } catch (err) {
      toast.error("Erro ao carregar produtos");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div data-testid="produtos-page">
      <PageHeader title="Produtos" subtitle="Gestão do seu catálogo de itens" />
      
      <div className="p-8">
        <table className="w-full bg-white border border-neutral-200">
          <thead className="bg-neutral-50 text-xs uppercase text-neutral-500 text-left">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">Categoria</th>
              <th className="p-4">Preço</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {produtos.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-bold">{p.name}</td>
                <td className="p-4 text-sm text-neutral-600">{p.category}</td>
                <td className="p-4 font-mono">{BRL(p.price)}</td>
                <td className="p-4 text-sm">
                  {p.active ? "Ativo" : "Inativo"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}