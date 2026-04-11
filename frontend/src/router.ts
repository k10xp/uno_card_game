import { createRouter, createWebHistory } from "vue-router";
import Home from "./pages/Home.vue";
import Game from "./pages/Game.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/game", component: Game },
  ],
});

export default router;