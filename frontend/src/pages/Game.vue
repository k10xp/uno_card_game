<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { gameState, send, initSocket, pendingColorChoice } from "@/socket";
import ColorPicker from "@/components/ColorPicker.vue";

import GameTable from "@/components/GameTable.vue";
import Opponents from "@/components/Opponents.vue";
import PlayerHand from "@/components/PlayerHand.vue";

onMounted(() => {
  initSocket();
});

const selectedIndex = ref<number | null>(null);

const isMyTurn = computed(
  () => gameState.value?.yourTurn && !pendingColorChoice.value
);

const mustChooseColor = computed(
  () => gameState.value?.mustChooseColor ?? false
);

const isWaitingForColor = computed(
  () => gameState.value?.isWaitingForColor ?? false
);

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

function testGameOver() {
  send({ type: "FORCE_WIN" });
}
</script>

<template>
  <div v-if="gameState">
    <h1>UNO Game</h1>

    <GameTable
      :topCard="gameState.topCard"
      :currentColor="gameState.currentColor"
      :drawPileCount="gameState.drawPileCount ?? 0"
      :discardPileCount="gameState.discardPileCount ?? 0"
    />

    <Opponents :opponents="gameState.opponents" />

    <p v-if="mustChooseColor">🎨 Choose a color</p>
    <p v-else-if="isWaitingForColor">
      ⏳ Waiting for opponent to choose color...
    </p>
    <p v-else-if="isMyTurn">🎯 Your turn</p>
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

      <button @click="testGameOver" class="btn primary">TEST GAME OVER</button>
    </div>
    <ColorPicker v-if="pendingColorChoice" />
  </div>
  <div v-else>Loading game...</div>
</template>
