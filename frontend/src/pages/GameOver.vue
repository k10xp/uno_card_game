<script setup lang="ts">
import { computed } from "vue";
import { gameOver, send } from "@/socket";
import router from "@/router";

const winner = computed(() => gameOver.value?.winner);
function returnToLobby() {
  send({ type: "REJOIN_LOBBY" });
  router.push("/");
}
</script>

<template>
  <div class="game-over">
    <h1>Game Over</h1>

    <p v-if="winner">
      🏆 Player <strong>{{ winner }}</strong> wins!
    </p>

    <p v-else>No winner data received.</p>

    <button class="back-btn" @click="returnToLobby">Return to Lobby</button>
  </div>
</template>

<style scoped>
.game-over {
  text-align: center;
  margin-top: 80px;
}

.back-btn {
  margin-top: 20px;
  padding: 12px 18px;
  font-size: 14px;
  font-weight: bold;
  border-radius: 10px;
  border: none;
  cursor: pointer;

  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 0 #1d4ed8;
  transition: all 0.2s ease;
}

.back-btn:hover {
  transform: translateY(-2px);
  background: #2563eb;
}

.back-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #1d4ed8;
}
</style>
