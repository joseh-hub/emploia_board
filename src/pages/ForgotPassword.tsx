import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
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

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message,
      });
      setLoading(false);
      return;
    }

    setSent(true);
    toast({
      title: "Email enviado!",
      description: "Verifique sua caixa de entrada para redefinir a senha.",
    });
    setLoading(false);
  };

  if (sent) {
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

        {/* Sucesso */}
        <div className="space-y-4 text-center">
          <div
            className="mx-auto flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              backgroundColor: "rgba(63,23,87,0.4)",
              border: "1.5px solid rgba(203,197,234,0.25)",
            }}
          >
            <Mail style={{ color: "#CBC5EA" }} className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h2
              style={{
                fontFamily: "'Krona One', sans-serif",
                fontSize: "1.5rem",
                color: "#FFFFFF",
                lineHeight: 1.3,
              }}
            >
              Verifique seu email
            </h2>
            <p
              style={{
                fontFamily: "'Lexend Deca', sans-serif",
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.5)",
                fontWeight: 400,
              }}
            >
              Enviamos um link para <span style={{ color: "rgba(255,255,255,0.8)" }}>{email}</span> para redefinir sua senha.
            </p>
          </div>
        </div>

        <Link
          to="/login"
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.9375rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            height: "46px",
            borderRadius: "8px",
            border: "1.5px solid #2E2A3B",
            backgroundColor: "transparent",
            color: "rgba(255,255,255,0.8)",
            textDecoration: "none",
            transition: "border-color 0.15s ease, color 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#3F1757";
            e.currentTarget.style.color = "#FFFFFF";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#2E2A3B";
            e.currentTarget.style.color = "rgba(255,255,255,0.8)";
          }}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </AuthLayout>
    );
  }

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
          Esqueceu a senha?
        </h2>
        <p
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.9rem",
            color: "rgba(255,255,255,0.5)",
            fontWeight: 400,
          }}
        >
          Digite seu email e enviaremos um link para redefinir sua senha.
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enviar link de recuperação"}
        </button>
      </form>

      {/* Footer */}
      <p className="text-center">
        <Link
          to="/login"
          style={{
            fontFamily: "'Lexend Deca', sans-serif",
            fontSize: "0.875rem",
            color: "rgba(255,255,255,0.5)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar ao login
        </Link>
      </p>
    </AuthLayout>
  );
}
