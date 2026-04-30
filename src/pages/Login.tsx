import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  boxSizing: "border-box",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description:
          error.message === "Invalid login credentials"
            ? "Email ou senha incorretos"
            : error.message,
      });
      setLoading(false);
      return;
    }

    toast({
      title: "Bem-vindo!",
      description: "Login realizado com sucesso.",
    });
    navigate(from, { replace: true });
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
          Bem-vindo de volta
        </h2>
        <p
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
          }}
        >
          Entre com sua conta para continuar
        </p>
      </div>

      {/* Formulário */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            style={{
              fontFamily: "'Lexend Deca', sans-serif",
              fontSize: "0.8125rem",
              fontWeight: 500,
              color: "rgba(255,255,255,0.8)",
              display: "block",
            }}
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            style={{
              ...darkInput,
              // @ts-ignore — placeholder color via CSS custom property not supported inline
            }}
            className="auth-input"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#CBC5EA"; // Lilás complementar
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(203,197,234,0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#2E2A3B";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              style={{
                fontFamily: "'Lexend Deca', sans-serif",
                fontSize: "0.8125rem",
                fontWeight: 500,
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Senha
            </label>
            <Link
              to="/forgot-password"
              style={{
                fontFamily: "'Lexend Deca', sans-serif",
                fontSize: "0.8125rem",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 500,
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#FFFFFF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              Esqueceu a senha?
            </Link>
          </div>
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#CBC5EA"; // Lilás complementar
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(203,197,234,0.15)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#2E2A3B";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
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
        Não tem uma conta?{" "}
        <Link
          to="/register"
          style={{
            color: "#FFFFFF",
            fontWeight: 600,
            textDecoration: "none",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  );
}
