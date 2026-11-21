import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { ProtectedRoute } from "@/components/protected-route";
import { RouteChangeDetector } from "@/components/route-change-detector";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import UsersPage from "@/pages/users";
import GamesPage from "@/pages/games";
import TransactionsPage from "@/pages/transactions";
import DepositsPage from "@/pages/deposits";
import WithdrawalsPage from "@/pages/withdrawals";
import BonusesPage from "@/pages/bonuses";
import RolesPage from "@/pages/roles";
import PermissionsPage from "@/pages/permissions";
import ReferralsPage from "@/pages/referrals";
import ReferralConfigPage from "@/pages/referral-config";
import OrdersPage from "@/pages/orders";
import PackagesPage from "@/pages/packages";
import CryptoPaymentsPage from "@/pages/crypto-payments";
import PromotionsPage from "@/pages/promotions";
import CompliancePage from "@/pages/compliance";
import AccountsPage from "@/pages/accounts";
import ActivitiesPage from "@/pages/activities";
import AnalyticsPage from "@/pages/analytics";
import ContentPage from "@/pages/content";
import SupportPage from "@/pages/support";
import SecurityPage from "@/pages/security";
import SystemPage from "@/pages/system";
import ThemeStudioPage from "@/pages/theme-studio";
import NotificationsPage from "@/pages/notifications";
import EmailsPage from "@/pages/emails";
import DeveloperPage from "@/pages/developer";
import PasswordResetPage from "@/pages/password-reset";
import ContactSubmissionsPage from "@/pages/contact-submissions";
import DemoRequestsPage from "@/pages/demo-requests";
import NotFound from "@/pages/not-found";

function AuthenticatedApp() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <RouteChangeDetector />
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between p-4 border-b border-border bg-background">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-auto p-8 bg-background">
            <div className="max-w-7xl mx-auto">
              <Switch>
                <Route path="/">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/users">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent"]}>
                    <UsersPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/games">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <GamesPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/transactions">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent"]}>
                    <TransactionsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/deposits">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent"]}>
                    <DepositsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/withdrawals">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent"]}>
                    <WithdrawalsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/bonuses">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator"]}>
                    <BonusesPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/roles">
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <RolesPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/permissions">
                  <ProtectedRoute allowedRoles={["super_admin"]}>
                    <PermissionsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/referrals">
                  <ProtectedRoute allowedRoles={["super_admin", "admin", "operator", "agent", "user"]}>
                    <ReferralsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/referrals/config">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ReferralConfigPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/orders">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <OrdersPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/packages">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <PackagesPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/payments">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <CryptoPaymentsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/crypto-payments">
                  <Redirect to="/payments" />
                </Route>

                <Route path="/password-reset">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <PasswordResetPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/contact-submissions">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ContactSubmissionsPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/promotions">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <PromotionsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/compliance">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <CompliancePage />
                  </ProtectedRoute>
                </Route>
                <Route path="/accounts">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <AccountsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/activities">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ActivitiesPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/analytics">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <AnalyticsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/content">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ContentPage />
                  </ProtectedRoute>
                </Route>

                <Route path="/demo-requests">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <DemoRequestsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/support">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <SupportPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/security">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <SecurityPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/system">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <SystemPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/theme-studio">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <ThemeStudioPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/notifications">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <NotificationsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/emails">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <EmailsPage />
                  </ProtectedRoute>
                </Route>
                <Route path="/developer">
                  <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
                    <DeveloperPage />
                  </ProtectedRoute>
                </Route>

                <Route component={NotFound} />
              </Switch>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Switch>
              <Route path="/login" component={LoginPage} />
              <Route>
                <AuthenticatedApp />
              </Route>
            </Switch>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
