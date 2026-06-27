import { useEffect, useState } from "react";
import { api } from "../lib/api";
import PageHeader from "../components/PageHeader";

export default function Pedidos() {
  // 1. Estados da página
  const [pedidos, setPedidos] = useState([]);

  // 2. Carregamento de dados (o que vai aparecer na rota)
  const carregarPedidos = async () => {
    try {
      const { data } = await api.get("/pedidos");
      setPedidos(data);
    } catch (err) {
      console.error("Erro ao carregar pedidos", err);
    }
  };

  useEffect(() => {
    carregarPedidos();
  }, []);

  // 3. Renderização da página
  return (
    <div data-testid="pedidos-page">
      <PageHeader title="Pedidos" subtitle="Gestão de pedidos em tempo real" />
      <div className="p-8">
        {/* Aqui entra o seu conteúdo JSX */}
        <h1>Lista de Pedidos</h1>
        {/* ... */}
      </div>
    </div>
  );
}