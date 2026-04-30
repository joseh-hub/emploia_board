import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { AuthLayout } from "@/components/layout/AuthLayout";
import emploiaLogoBranco from "../../img/emploia-horizontal-branco@2x.png";

const darkInput: React.CSSProperties = {
  fontFamily: "'Lexend Deca', sans-serif",
  fontSize: "0.9rem",
  width: "100%",
  height: "44px",
  padding: "0 14px",
  border: "1.5px solid #2E2A3B",
  borderRadius: "8px",
  outline: "none",
  color: "#FFFFFF",
  backgroundColor: "#1C1929",
  transition: "border-color 0.15s ease",
  boxSizing: "border-box",
};

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao cadastrar",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Conta criada!",
      description: "Verifique seu email para confirmar o cadastro.",
    });
    navigate("/login");
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Lexend Deca', sans-serif",
    fontSize: "0.8125rem",
    fontWeight: 500,
    color: "rgba(255,255,255,0.8)",
    display: "block",
  };

  return (
    <AuthLayout>
      {/* Logo */}
      <div style={{ padding: "8px 0" }}>
        <img
          src={emploiaLogoBranco}
          alt="emplo.ia"
          style={{ width: 160, height: "auto" }}
          draggable={false}
        />
      </div>

      {/* Cabeçalho */}
      <div className="space-y-1">
        <h2
          style={{
            fontFamily: "'Krona One', sans-serif",
            fontSize: "1.5rem",
            color: "#FFFFFF",
            lineHeight: 1.3,
          }}
        >
          Criar conta
        </h2>
        <p
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
          }}
        >
          Cadastre-se para acessar a plataforma
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="email" style={labelStyle}>Email</label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={darkInput}
            className="auth-input"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3F1757")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2E2A3B")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" style={labelStyle}>Senha</label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            style={darkInput}
            className="auth-input"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3F1757")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2E2A3B")}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" style={labelStyle}>Confirmar senha</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            style={darkInput}
            className="auth-input"
            onFocus={(e) => (e.currentTarget.style.borderColor = "#3F1757")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "#2E2A3B")}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.9375rem",
            fontWeight: 700,
            width: "100%",
            height: "46px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: loading ? "#f0a899" : "#ED6A5A",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.15s ease, transform 0.1s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            letterSpacing: "0.01em",
          }}
          onMouseEnter={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#e55a49";
          }}
          onMouseLeave={(e) => {
            if (!loading) e.currentTarget.style.backgroundColor = "#ED6A5A";
          }}
          onMouseDown={(e) => {
            if (!loading) e.currentTarget.style.transform = "scale(0.98)";
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
        </button>
      </form>

      {/* Footer */}
      <p
        className="text-center"
        style={{
          fontFamily: "'Lexend Deca', sans-serif",
          fontSize: "0.875rem",
          color: "rgba(255,255,255,0.5)",
        }}
      >
        Já tem uma conta?{" "}
        <Link
          to="/login"
          style={{ color: "#FFFFFF", fontWeight: 600, textDecoration: "none" }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Entrar
        </Link>
      </p>
    </AuthLayout>
  );
}
