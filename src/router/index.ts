import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import InstagramView from "../views/InstagramView.vue";
import VarBeratelseView from "../views/VarBeratelseView.vue";
import OrderView from "../views/OrderView.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomeView },
    { path: "/mmb-app", component: HomeView },
    { path: "/instagram", component: InstagramView },
    { path: "/var-berattelse", component: VarBeratelseView },
    { path: "/bestall/:type", component: OrderView },
  ],
  scrollBehavior: () => ({ top: 0 }),
});
