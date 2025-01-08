import { Suspense, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/auth/login";
import OrganizationView from "./components/dashboard/OrganizationView";
import RegisterCostRecord from "./components/driver/RegisterCostRecord";
import { supabase } from "./lib/supabase";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && location.pathname === "/login") {
        navigate("/dashboard");
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/organization" element={<OrganizationView />} />
          <Route path=":company_id/registro" element={<RegisterCostRecord />} />
        </Routes>
      </>
    </Suspense>
  );
}

export default App;