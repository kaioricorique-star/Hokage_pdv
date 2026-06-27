import { createContext, useContext, useState } from "react";
import { api } from "./api"; // Importa a instância do axios que configuramos

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // A função que estava faltando!
  const login = async (email, password) => {
    const { data } = await api.post("/login", { email, password });
    
    // Supondo que sua API retorna { token, user }
    localStorage.setItem("hokage_token", data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem("hokage_token");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);