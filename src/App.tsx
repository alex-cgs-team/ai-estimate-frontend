import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components";
import AppLayout from "./layout";
import { Providers } from "./providers/providers";
import { ROUTE_ELEMENT, ROUTES } from "./shared/constants/routes";

export default function App() {
  return (
    <Providers>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path={ROUTES.welcome} element={ROUTE_ELEMENT.welcome} />
            <Route path={ROUTES.signUp} element={ROUTE_ELEMENT.signUp} />
            <Route
              path={ROUTES.codeVerification}
              element={ROUTE_ELEMENT.codeVerification}
            />
            <Route
              path={ROUTES.privacyPolice}
              element={ROUTE_ELEMENT.privacyPolice}
            />
            <Route
              path={ROUTES.termsOfUse}
              element={ROUTE_ELEMENT.termsOfUse}
            />
            <Route
              path={ROUTES.confirmEmail}
              element={ROUTE_ELEMENT.confirmEmail}
            />
            <Route
              path={ROUTES.forgorPassword}
              element={ROUTE_ELEMENT.forgorPassword}
            />
            <Route path={ROUTES.sentEmail} element={ROUTE_ELEMENT.sentEmail} />
            <Route element={<ProtectedRoute redirectTo={ROUTES.welcome} />}>
              <Route
                path={ROUTES.onboarding}
                element={ROUTE_ELEMENT.onboarding}
              />
              <Route path={ROUTES.allSet} element={ROUTE_ELEMENT.allSet} />
              <Route path={ROUTES.main} element={ROUTE_ELEMENT.main} />
              <Route path={ROUTES.progress} element={ROUTE_ELEMENT.progress} />
              <Route path={ROUTES.profile} element={ROUTE_ELEMENT.profile} />
              <Route
                path={ROUTES.changePhone}
                element={ROUTE_ELEMENT.changePhone}
              />
              <Route
                path={ROUTES.changeEmail}
                element={ROUTE_ELEMENT.changeEmail}
              />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Providers>
  );
}
