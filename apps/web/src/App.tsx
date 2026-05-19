import { Switch, Route, type RouteComponentProps } from "wouter";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import NewApplication from "./pages/NewApplication";
import ApplicationsList from "./pages/ApplicationsList";
import ApplicationDetail from "./pages/ApplicationDetail";
import Registry from "./pages/Registry";

// Layout wrappers defined at module scope to avoid remount on re-render
const DashboardPage        = () => <Layout section="Dashboard"><Dashboard /></Layout>;
const NewApplicationPage   = () => <Layout section="New Application"><NewApplication /></Layout>;
const ApplicationsListPage = () => <Layout section="Applications"><ApplicationsList /></Layout>;
const RegistryPage         = () => <Layout section="Registry"><Registry /></Layout>;
const ApplicationDetailPage = ({ params }: RouteComponentProps<{ id: string }>) => (
  <Layout section="Applications"><ApplicationDetail id={params.id} /></Layout>
);

export default function App() {
  return (
    <Switch>
      <Route path="/sign-in"           component={SignIn} />
      <Route path="/applications/new"  component={NewApplicationPage} />
      <Route path="/applications/:id"  component={ApplicationDetailPage} />
      <Route path="/applications"      component={ApplicationsListPage} />
      <Route path="/registry"          component={RegistryPage} />
      <Route path="/"                  component={DashboardPage} />
      <Route>
        <div className="flex h-screen items-center justify-center text-muted text-lg">
          404 — Page not found
        </div>
      </Route>
    </Switch>
  );
}
