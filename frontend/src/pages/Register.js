import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { toast } from "sonner";
import { Loader2, UserPlus, Mail, Lock, User } from "lucide-react";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/auth/register", form);
      toast.success("Usuário cadastrado com sucesso!");
      nav("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50" data-testid="register-page">
      <div className="w-full max-w-sm bg-white p-8 border border-neutral-200 shadow-sm">
        <h1 className="text-2xl font-black mb-6">Cadastrar</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Nome</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input type="text" required onChange={(e) => setForm({...form, name: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input type="email" required onChange={(e) => setForm({...form, email: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input type="password" required onChange={(e) => setForm({...form, password: e.target.value})} className="w-full pl-10 pr-4 py-2 border border-neutral-300 focus:outline-none focus:border-black" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-neutral-900 text-white py-3 font-bold uppercase tracking-wider flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Criar Conta"}
          </button>
        </form>
      </div>
    </div>
  );
}