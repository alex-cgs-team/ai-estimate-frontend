import {
  AllSet,
  CodeVerification,
  Main,
  Onboarding,
  Progress,
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
};
