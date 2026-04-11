<script setup lang="ts">
import Card from "./Card.vue";

defineProps<{
  hand: any[];
  selectedIndex: number | null;
  isMyTurn: boolean;
}>();

const emit = defineEmits(["select"]);
</script>

<template>
  <div class="hand">
    <Card
      v-for="(card, i) in hand"
      :key="i"
      :card="card"
      :selected="selectedIndex === i"
      @click="emit('select', i)"
    />
  </div>
</template>

<style scoped>
.hand {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
