import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Lock, CheckCircle } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ variant: "destructive", title: "Erro", description: "As senhas não coincidem." });
      return;
    }

    if (password.length < 6) {
      toast({ variant: "destructive", title: "Erro", description: "A senha deve ter pelo menos 6 caracteres." });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast({ variant: "destructive", title: "Erro", description: error.message });
      setLoading(false);
      return;
    }

    setSuccess(true);
    toast({ title: "Senha redefinida!", description: "Sua senha foi atualizada com sucesso." });
    setTimeout(() => navigate("/login"), 3000);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
        <Card className="w-full max-w-md shadow-clickup-lg border-0">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success" />
            </div>
            <CardTitle className="text-2xl font-bold">Senha redefinida!</CardTitle>
            <CardDescription>Você será redirecionado para o login em instantes...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-md shadow-clickup-lg border-0">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold text-xl flex items-center justify-center shadow-clickup-md">
              <Lock className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Redefinir senha</CardTitle>
          <CardDescription className="text-muted-foreground">
            Digite sua nova senha abaixo.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Nova senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="h-10"
              />
            </div>
          </CardContent>
          <CardFooter className="pt-2">
            <Button type="submit" className="w-full h-10" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Redefinir senha"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
