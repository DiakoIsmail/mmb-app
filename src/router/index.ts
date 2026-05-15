import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import InstagramView from "../views/InstagramView.vue";
import VarBeratelseView from "../views/VarBeratelseView.vue";
import OrderView from "../views/OrderView.vue";
import BusinessView from "../views/BusinessView.vue";
import AdminLoginView from "../views/admin/AdminLoginView.vue";
import AdminDashboardView from "../views/admin/AdminDashboardView.vue";
import AdminProductsView from "../views/admin/AdminProductsView.vue";
import { supabase } from "../lib/supabase";
import { checkAdminRole, isAdmin } from "../composables/useAuth";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: HomeView },
    { path: "/mmb-app", component: HomeView },
    { path: "/instagram", component: InstagramView },
    { path: "/var-berattelse", component: VarBeratelseView },
    { path: "/bestall/:type", component: OrderView },
    { path: "/foretag", component: BusinessView },

    // Admin — login is public, no guard
    { path: "/admin/login", component: AdminLoginView },
    { path: "/admin", redirect: "/admin/login" },

    // Admin dashboard — protected
    {
      path: "/admin/dashboard",
      component: AdminDashboardView,
      meta: { requiresAdmin: true },
    },
    {
      path: "/admin/products",
      component: AdminProductsView,
      meta: { requiresAdmin: true },
    },
  ],
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach(async (to) => {
  if (!to.meta.requiresAdmin) return true;

  // Already verified in memory (just logged in) — skip Supabase round-trip
  if (isAdmin.value) return true;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return "/admin/login";
    const admin = await checkAdminRole(session.user.id);
    if (admin) { isAdmin.value = true; return true; }
    return "/admin/login";
  } catch {
    return "/admin/login";
  }
});

export default router;
