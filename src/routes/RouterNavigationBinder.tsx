import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { setNavigate } from "@/lib/navigation";

// Registers the router's navigate function into the navigation singleton so
// non-React code (e.g. the axios 401 interceptor) can perform client-side
// redirects without a full-page reload. Renders <Outlet /> for child routes.
export function RouterNavigationBinder() {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  return <Outlet />;
}
