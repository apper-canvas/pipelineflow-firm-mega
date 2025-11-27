import React, { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import Loading from "@/components/ui/Loading";
import Layout from "@/components/organisms/Layout";

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

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-900 dark:to-slate-800">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-slate-600 dark:text-slate-400 font-medium">Loading PipelineFlow...</p>
    </div>
  </div>
);

const AssignmentRules = lazy(() => import("@/components/pages/AssignmentRules"));

const mainRoutes = [
  {
    path: "",
    index: true,
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Dashboard />
      </Suspense>
    )
  },
  {
    path: "contacts",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Contacts />
      </Suspense>
    )
  },
  {
    path: "leads",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Leads />
      </Suspense>
    )
  },
  {
    path: "deals",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Deals />
      </Suspense>
    )
  },
  {
    path: "activities",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Activities />
      </Suspense>
    )
  },
  {
    path: "calendar",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <CalendarView />
      </Suspense>
    )
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Analytics />
      </Suspense>
    )
  },
  {
    path: "tasks",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <Tasks />
      </Suspense>
    )
  },
  {
    path: "my-assignments",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <MyAssignments />
      </Suspense>
    )
  },
  {
    path: "assignment-rules",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <AssignmentRules />
      </Suspense>
    )
  },
  {
    path: "*",
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <NotFound />
      </Suspense>
    )
  }
];

const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [...mainRoutes]
  }
];

export const router = createBrowserRouter(routes);