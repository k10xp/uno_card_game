<script setup lang="ts">
import { computed } from "vue";
import Card from "@/components/Card.vue";
import type { Card as CardType, CardColor } from "@/types/card";

const props = defineProps<{
  topCard: CardType;
  currentColor: CardColor;
  drawPileCount: number;
  discardPileCount: number;
}>();

// If wild use currentColor for display
const displayCard = computed(() => {
  if (props.topCard.color === "wild") {
    return {
      ...props.topCard,
      color: props.currentColor, //override only for UI
    };
  }
  return props.topCard;
});
</script>

<template>
  <div class="table">
    <div class="pile">
      <h3>Discard</h3>

      <Card :card="displayCard" />

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
