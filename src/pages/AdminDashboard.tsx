import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, Image, Users, Activity } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  const { data: userData } = useQuery({
    queryKey: ["user-role", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (!loading && (!user || userData?.role !== "admin")) {
      navigate("/");
    }
  }, [user, loading, userData, navigate]);

  // Fetch payments
  const { data: payments, isLoading: paymentsLoading } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: userData?.role === "admin",
  });

  // Fetch posters
  const { data: posters, isLoading: postersLoading } = useQuery({
    queryKey: ["admin-posters"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posters")
        .select(`
          *,
          users (
            full_name,
            email
          )
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: userData?.role === "admin",
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [paymentsResult, postersResult, usersResult] = await Promise.all([
        supabase.from("payments").select("amount", { count: "exact" }),
        supabase.from("posters").select("id", { count: "exact" }),
        supabase.from("users").select("id", { count: "exact" }),
      ]);

      const totalRevenue = paymentsResult.data?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;

      return {
        totalRevenue,
        totalPayments: paymentsResult.count || 0,
        totalPosters: postersResult.count || 0,
        totalUsers: usersResult.count || 0,
      };
    },
    enabled: userData?.role === "admin",
  });

  if (loading || !user || userData?.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your FlierCraft platform</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">KES {stats?.totalRevenue || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Posters</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPosters || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalPayments || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>View all payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments?.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs">
                        {payment.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>KES {payment.amount || 0}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{payment.method || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            payment.status === "completed" ? "default" :
                            payment.status === "pending" ? "secondary" : "destructive"
                          }
                        >
                          {payment.status || "unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell>{payment.type || "N/A"}</TableCell>
                      <TableCell>
                        {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Posters Table */}
        <Card>
          <CardHeader>
            <CardTitle>Client Posters</CardTitle>
            <CardDescription>View all posters created by clients</CardDescription>
          </CardHeader>
          <CardContent>
            {postersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posters?.map((poster) => (
                    <TableRow key={poster.id}>
                      <TableCell className="font-medium">{poster.title || "Untitled"}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{poster.users?.full_name || "Unknown"}</div>
                          <div className="text-sm text-muted-foreground">{poster.users?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{poster.template_name || "Custom"}</TableCell>
                      <TableCell>
                        <Badge variant={poster.is_paid ? "default" : "secondary"}>
                          {poster.is_paid ? "Paid" : "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {poster.created_at ? new Date(poster.created_at).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell>
                        {poster.image_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={poster.image_url} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;