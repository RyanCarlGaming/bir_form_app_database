import { useGetFormsSummary } from "@workspace/api-client-react";
import { Layout } from "@/components/layout/Layout";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { FileText, Users, Receipt, AlertCircle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const COLORS = ['#0f172a', '#3b82f6', '#64748b', '#ef4444'];

export default function Dashboard() {
  const { data: summary, isLoading, error } = useGetFormsSummary();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !summary) {
    return (
      <Layout>
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load dashboard statistics. Please try again later.</p>
        </div>
      </Layout>
    );
  }

  const statusData = Object.entries(summary.formsByStatus).map(([name, value]) => ({ name, value }));
  const typeData = Object.entries(summary.formsByType).map(([name, value]) => ({ name, value }));

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">System Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of all BIR form submissions and taxpayer records.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Forms" 
          value={summary.totalForms.toString()} 
          icon={FileText} 
          trend="+12% from last month"
        />
        <StatCard 
          title="Registered Taxpayers" 
          value={summary.totalTaxpayers.toString()} 
          icon={Users} 
          trend="+4 new this week"
        />
        <StatCard 
          title="Total Tax Due" 
          value={formatCurrency(summary.totalTaxDue)} 
          icon={Receipt} 
          trend="Aggregated from filed forms"
          valueClassName="text-xl font-official"
        />
        <StatCard 
          title="Total Tax Payable" 
          value={formatCurrency(summary.totalTaxPayable)} 
          icon={AlertCircle} 
          trend="Outstanding balances"
          valueClassName="text-xl font-official text-destructive"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-6">Forms by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {statusData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-muted-foreground capitalize">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h3 className="font-semibold text-foreground mb-6">Forms by Type</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function StatCard({ title, value, icon: Icon, trend, valueClassName = "" }: { title: string, value: string, icon: any, trend: string, valueClassName?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className="p-2 bg-primary/5 text-primary rounded-lg">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="space-y-1">
        <p className={`text-3xl font-bold text-foreground tracking-tight ${valueClassName}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{trend}</p>
      </div>
    </div>
  );
}
