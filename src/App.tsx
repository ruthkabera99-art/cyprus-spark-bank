import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminRoute } from "@/components/AdminRoute";
import Index from "./pages/Index";
import PersonalBanking from "./pages/PersonalBanking";
import BusinessBanking from "./pages/BusinessBanking";
import Loans from "./pages/Loans";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Deposit from "./pages/Deposit";
import Withdraw from "./pages/Withdraw";
import LoanApplication from "./pages/LoanApplication";
import LoanStatus from "./pages/LoanStatus";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/personal" element={<PersonalBanking />} />
            <Route path="/business" element={<BusinessBanking />} />
            <Route path="/loans" element={<Loans />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/deposit" 
              element={<ProtectedRoute><Deposit /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/withdraw" 
              element={<ProtectedRoute><Withdraw /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/apply-loan" 
              element={<ProtectedRoute><LoanApplication /></ProtectedRoute>} 
            />
            <Route 
              path="/dashboard/loans" 
              element={<ProtectedRoute><LoanStatus /></ProtectedRoute>} 
            />
            <Route 
              path="/admin" 
              element={<AdminRoute><AdminDashboard /></AdminRoute>} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
