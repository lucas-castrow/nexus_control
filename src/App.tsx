import { Suspense } from "react";
import { useRoutes, Routes, Route, Navigate } from "react-router-dom";
import Home from "./components/home";
import Login from "./components/auth/login";
import OrganizationView from "./components/dashboard/OrganizationView";
import RegisterCostRecord from "./components/driver/RegisterCostRecord";

function App() {
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
