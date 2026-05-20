import { useEffect, type ComponentType } from "react";
import { Switch, Route, useLocation, useParams } from "wouter";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import Registry from "./pages/Registry";
import AuditLog from "./pages/AuditLog";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!localStorage.getItem("authed")) navigate("/sign-in");
  }, [navigate]);
  if (!localStorage.getItem("authed")) return null;
  return <>{children}</>;
}

function LayoutRoute({
  path,
  section,
  component: Component,
}: {
  path: string;
  section?: string;
  component: ComponentType;
}) {
  return (
    <Route path={path}>
      <RequireAuth>
        <Layout section={section}>
          <Component />
        </Layout>
      </RequireAuth>
    </Route>
  );
}

function ApplicationDetailRoute() {
  const { id } = useParams<{ id: string }>();
  return <ApplicationDetail id={id!} />;
}

export default function App() {
  return (
    <Switch>
      <Route path="/sign-in" component={SignIn} />
      <LayoutRoute path="/applications/new" section="Applications" component={NewApplication} />
      <LayoutRoute path="/applications/:id" section="Applications" component={ApplicationDetailRoute} />
      <LayoutRoute path="/applications" section="Applications" component={ApplicationsList} />
      <LayoutRoute path="/registry" section="Registry" component={Registry} />
      <LayoutRoute path="/audit-log" section="Audit Log" component={AuditLog} />
      <LayoutRoute path="/" section="Dashboard" component={Dashboard} />
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}
