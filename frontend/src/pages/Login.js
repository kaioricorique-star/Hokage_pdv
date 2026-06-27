import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { toast } from "sonner";
import { Loader2, Lock, Mail } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      nav("/");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Erro ao realizar login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4" data-testid="login-page">
      <div className="w-full max-w-sm bg-white p-8 border border-neutral-200 shadow-sm">
        <h1 className="text-2xl font-black mb-6">Login</h1>
        
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                placeholder="exemplo@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-neutral-500 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 focus:outline-none focus:border-black"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-neutral-900 text-white py-3 font-bold uppercase tracking-wider hover:bg-neutral-800 disabled:bg-neutral-400 flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}