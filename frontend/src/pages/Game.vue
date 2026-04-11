<script setup lang="ts">
import { ref, computed } from "vue";
import { gameState, send, initSocket } from "@/socket";

import GameTable from "@/components/GameTable.vue";
import Opponents from "@/components/Opponents.vue";
import PlayerHand from "@/components/PlayerHand.vue";

initSocket();

const selectedIndex = ref<number | null>(null);

const isMyTurn = computed(() => gameState.value?.yourTurn ?? false);

function selectCard(i: number) {
  if (!isMyTurn.value) return;
  selectedIndex.value = i;
}

function playCard() {
  if (selectedIndex.value === null) return;

  send({
    type: "PLAY_CARD",
    card: gameState.value.hand[selectedIndex.value],
  });

  selectedIndex.value = null;
}

function drawCard() {
  send({ type: "DRAW_CARD" });
}
</script>

<template>
  <div v-if="gameState">
    <h1>UNO Game</h1>

    <GameTable
      :topCard="gameState.topCard"
      :drawPileCount="gameState.drawPileCount ?? 0"
      :discardPileCount="gameState.discardPileCount ?? 0"
    />

    <Opponents :opponents="gameState.opponents" />

    <p v-if="isMyTurn">🎯 Your turn</p>
    <p v-else>⏳ Waiting...</p>

    <PlayerHand
      :hand="gameState.hand"
      :selectedIndex="selectedIndex"
      :isMyTurn="isMyTurn"
      @select="selectCard"
    />

    <div class="actions center">
      <button class="btn play" @click="playCard" :disabled="!isMyTurn">
        PLAY CARD
      </button>

      <button class="btn secondary" @click="drawCard" :disabled="!isMyTurn">
        DRAW CARD
      </button>
    </div>
  </div>

  <div v-else>Loading game...</div>
</template>


