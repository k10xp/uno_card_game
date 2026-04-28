<script setup lang="ts">
import { watch, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { initSocket, send, lobby, gameStarted } from "@/socket";
import { generateName } from "@/composables/useNameGenerator";

initSocket();

const router = useRouter();
const tempName = ref("");
const nameAccepted = ref(false);

onMounted(() => {
  let first = generateName(); //First name will be the same value
  let second = generateName(); //Using one reroll for less likehood for name collision

  tempName.value = second;
});

function regenerate() {
  tempName.value = generateName();
}

function acceptName() {
  send({
    type: "SET_NAME",
    name: tempName.value,
  });

  nameAccepted.value = true;
}

function startGame() {
  send({ type: "START_GAME" });
}

function displayLobbyName(p: any) {
  if (p.role === "spectator") {
    return "Spectator";
  }

  if (p.name.startsWith("Player ")) {
    return "Selecting Name";
  }

  return p.name;
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

    <!-- NAME SECTION -->
    <div class="panel column">
      <p>
        Your name: <strong>{{ tempName }}</strong>
      </p>

      <div v-if="!nameAccepted" class="column">
        <button class="btn secondary" @click="regenerate">Regenerate</button>

        <button class="btn primary" @click="acceptName">Accept</button>
      </div>
    </div>

    <!-- START SECTION -->
    <div class="panel">
      <button class="btn primary" @click="startGame">START GAME</button>
    </div>

    <!-- LOBBY SECTION -->
    <div class="panel column" v-if="lobby?.players">
      <p>Players: {{ lobby.playerCount }}</p>

      <ul class="player-list">
        <li v-for="p in lobby.players" :key="p.id">
          {{ displayLobbyName(p) }}
        </li>
      </ul>
    </div>
  </div>
</template>
