import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { getRouteConfig } from "@/router/route.utils";
import Root from "@/layouts/Root";
import Loading from "@/components/ui/Loading";
import Layout from "@/components/organisms/Layout";
// Lazy loaded components
const Dashboard = lazy(() => import("@/components/pages/Dashboard"));
const Analytics = lazy(() => import("@/components/pages/Analytics"));
const Tasks = lazy(() => import("@/components/pages/Tasks"));
const CalendarView = lazy(() => import("@/components/pages/CalendarView"));
const Contacts = lazy(() => import("@/components/pages/Contacts"));
const Leads = lazy(() => import("@/components/pages/Leads"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));
const Deals = lazy(() => import("@/components/pages/Deals"));
const Activities = lazy(() => import("@/components/pages/Activities"));
const MyAssignments = lazy(() => import("@/components/pages/MyAssignments"));
const AssignmentRules = lazy(() => import("@/components/pages/AssignmentRules"));

// Authentication pages
const Login = lazy(() => import("@/components/pages/Login"));
const Signup = lazy(() => import("@/components/pages/Signup"));
const Callback = lazy(() => import("@/components/pages/Callback"));
const ErrorPage = lazy(() => import("@/components/pages/ErrorPage"));
const ResetPassword = lazy(() => import("@/components/pages/ResetPassword"));
const PromptPassword = lazy(() => import("@/components/pages/PromptPassword"));
// Helper function to create routes with access control
const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<LoadingFallback />}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading PipelineFlow...</p>
    </div>
  </div>
);
// Main application routes
const mainRoutes = [
  createRoute({ index: true, element: <Dashboard /> }),
  createRoute({ path: "dashboard", element: <Dashboard /> }),
  createRoute({ path: "tasks", element: <Tasks /> }),
  createRoute({ path: "contacts", element: <Contacts /> }),
  createRoute({ path: "leads", element: <Leads /> }),
  createRoute({ path: "deals", element: <Deals /> }),
  createRoute({ path: "activities", element: <Activities /> }),
  createRoute({ path: "analytics", element: <Analytics /> }),
  createRoute({ path: "my-assignments", element: <MyAssignments /> }),
  createRoute({ path: "assignment-rules", element: <AssignmentRules /> }),
  createRoute({ path: "calendar", element: <CalendarView /> }),
];
// Router configuration
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // Authentication routes
      createRoute({ path: "login", element: <Login /> }),
      createRoute({ path: "signup", element: <Signup /> }),
      createRoute({ path: "callback", element: <Callback /> }),
      createRoute({ path: "error", element: <ErrorPage /> }),
      createRoute({ path: "prompt-password/:appId/:emailAddress/:provider", element: <PromptPassword /> }),
      createRoute({ path: "reset-password/:appId/:fields", element: <ResetPassword /> }),
      
      // Protected application routes
      {
        path: "/",
        element: <Layout />,
        children: [...mainRoutes]
      },
      
      // Catch all route
      createRoute({ path: "*", element: <NotFound /> })
    ]
  }
]);