import { createRouter, createWebHistory } from "vue-router";
import Home from "@/pages/Home.vue";
import Game from "@/pages/Game.vue";
import GameOver from "@/pages/GameOver.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/game", component: Game },
  { path: "/game-over", component: GameOver },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
