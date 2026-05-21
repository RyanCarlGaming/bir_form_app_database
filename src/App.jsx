import { useEffect, useState } from "react";
import { Switch, Route, useLocation, useParams } from "wouter";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import Records from "./pages/Records";
import Reports from "./pages/Reports";
import MyDrafts from "./pages/MyDrafts";
import IssuedTINs from "./pages/IssuedTINs";
import VerificationQueue from "./pages/VerificationQueue";
import Registry from "./pages/Registry";
import DataDictionary from "./pages/DataDictionary";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function RequireAuth({ children }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!localStorage.getItem("authed")) navigate("/sign-in");
  }, [navigate]);
  if (!localStorage.getItem("authed")) return null;
  return <>{children}</>;
}

function RootRoute() {
  const [, navigate] = useLocation();
    useEffect(() => {
      navigate("/sign-in");
    }, [navigate]);
    return null;
}

function LayoutRoute({ path, section, component: Component }) {
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
  const { id } = useParams();
  return <ApplicationDetail id={id} />;
}

export default function App() {
  return (
    <Switch>
      <Route path="/" component={RootRoute} />
      <Route path="/sign-in" component={SignIn} />
      <LayoutRoute path="/dashboard" section="Dashboard" component={Dashboard} />
      <LayoutRoute path="/applications/new" section="Applications" component={NewApplication} />
      <LayoutRoute path="/applications/:id" section="Applications" component={ApplicationDetailRoute} />
      <LayoutRoute path="/applications" section="Applications" component={ApplicationsList} />
      <LayoutRoute path="/records" section="Records" component={Reports} />
      <LayoutRoute path="/reports" section="Reports" component={Reports} />
      <LayoutRoute path="/drafts" section="My Drafts" component={MyDrafts} />
      <LayoutRoute path="/issued-tins" section="Issued TINs" component={IssuedTINs} />
      <LayoutRoute path="/verification-queue" section="Verification Queue" component={VerificationQueue} />
      <LayoutRoute path="/registry" section="Registry" component={Registry} />
      <LayoutRoute path="/data-dictionary" section="Data Dictionary" component={DataDictionary} />
      <LayoutRoute path="/settings" section="Settings" component={Settings} />
      <Route>
        <Layout>
          <NotFound />
        </Layout>
      </Route>
    </Switch>
  );
}
