<script setup lang="ts">
import { watch } from "vue";
import { useRouter } from "vue-router";
import { initSocket, send, lobby, gameStarted } from "../socket";

initSocket(); 

const router = useRouter();

function startGame() {
  send({ type: "START_GAME" });
}

watch(gameStarted, (started) => {
  if (started) {
    router.push("/game");
  }
});
</script>

<template>
  <div class="home center column">
    <h1>UNO Game</h1>

    <button class="btn primary" @click="startGame">
      START GAME
    </button>

    <div class="lobby">
      Players: {{ lobby?.playerCount ?? 0 }}
    </div>
  </div>
</template>