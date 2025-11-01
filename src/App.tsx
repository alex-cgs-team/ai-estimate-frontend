import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout";
import { Providers } from "./providers/providers";
import { ROUTE_ELEMENT, ROUTES } from "./shared/constants/routes";
import { ProtectedRoute } from "./components";

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.welcome} element={ROUTE_ELEMENT.welcome} />
            <Route
              path={ROUTES.codeVerification}
              element={ROUTE_ELEMENT.codeVerification}
            />
            <Route element={<ProtectedRoute redirectTo={ROUTES.welcome} />}>
              <Route
                path={ROUTES.onboarding}
                element={ROUTE_ELEMENT.onboarding}
              />
              <Route path={ROUTES.allSet} element={ROUTE_ELEMENT.allSet} />
              <Route path={ROUTES.main} element={ROUTE_ELEMENT.main} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
