import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center h-24 w-24 rounded-2xl bg-primary/10 mb-4">
            <span className="text-5xl font-bold text-primary">404</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              Ir para o início
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
