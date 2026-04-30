import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import Clientes from "@/pages/Clientes";
import Projetos from "@/pages/Projetos";
import Tarefas from "@/pages/Tarefas";
import Wiki from "@/pages/Wiki";
import Relatorios from "@/pages/Relatorios";
import Configuracoes from "@/pages/Configuracoes";
import Templates from "@/pages/Templates";
import Automacoes from "@/pages/Automacoes";
import Comunicacoes from "@/pages/Comunicacoes";
import CustomBoard from "@/pages/CustomBoard";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/projetos" element={<Projetos />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/wiki" element={<Wiki />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/automacoes" element={<Automacoes />} />
              <Route path="/comunicacoes" element={<Comunicacoes />} />
              <Route path="/relatorios" element={<Relatorios />} />
              <Route path="/configuracoes" element={<Configuracoes />} />
              <Route path="/boards/:slug" element={<CustomBoard />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
