<script setup lang="ts">
import Card from "./Card.vue";
import type { Card as CardType } from "../types/card";

defineProps<{
  topCard: CardType;
  drawPileCount: number;
  discardPileCount: number;
}>();
</script>

<template>
  <div class="table">
    <div class="pile">
      <h3>Discard</h3>

      <Card :card="topCard" />

      <small>{{ discardPileCount }} played</small>
    </div>

    <div class="pile">
      <h3>Draw</h3>
      <div class="card back">🂠</div>
      <small>{{ drawPileCount }} left</small>
    </div>
  </div>
</template>

<style scoped>
.table {
  display: flex;
  justify-content: center;
  gap: 40px;
  margin: 20px 0;
}

.pile {
  text-align: center;
}

</style>