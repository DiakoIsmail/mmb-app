import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import InstagramView from "../views/InstagramView.vue";
import VarBeratelseView from "../views/VarBeratelseView.vue";
import OrderView from "../views/OrderView.vue";
import BusinessView from "../views/BusinessView.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/mmb-app", component: HomeView },
    { path: "/instagram", component: InstagramView },
    { path: "/var-berattelse", component: VarBeratelseView },
    { path: "/bestall/:type", component: OrderView },
    { path: "/foretag", component: BusinessView },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
