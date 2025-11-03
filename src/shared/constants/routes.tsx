import {
  AllSet,
  ChangeProfile,
  CodeVerification,
  Main,
  Onboarding,
  PrivacyPolice,
  Profile,
  Progress,
  TermsOfUse,
  WelcomePage,
} from "@/pages";
import type { ReactElement } from "react";

export const ROUTES = {
  welcome: "/welcome",
  codeVerification: "/code-verification",
  onboarding: "/onboarding",
  allSet: "/all-set",
  main: "/",
  progress: "/progress",
  profile: "/profile",
  changePhone: "/change-profile",
  termsOfUse: "/terms-of-use",
  privacyPolice: "/privacy-police",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

// eslint-disable-next-line react-refresh/only-export-components
export const ROUTE_ELEMENT: Record<RouteKey, ReactElement> = {
  welcome: <WelcomePage />,
  codeVerification: <CodeVerification />,
  onboarding: <Onboarding />,
  allSet: <AllSet />,
  main: <Main />,
  progress: <Progress />,
  profile: <Profile />,
  changePhone: <ChangeProfile />,
  privacyPolice: <PrivacyPolice />,
  termsOfUse: <TermsOfUse />,
};
