import { Switch, Route } from "wouter";

export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route>
        <div className="flex h-screen items-center justify-center text-muted-foreground">
          404 — Page not found
        </div>
      </Route>
    </Switch>
  );
}

function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <h1 className="text-2xl font-semibold tracking-tight">BIR Form Manager</h1>
    </div>
  );
}
