<script setup lang="ts">
defineProps<{
  opponents: { id: string; name: string; cardCount: number }[];
}>();
</script>

<template>
  <div class="opponents">
    <h3>Opponents</h3>

    <div v-for="opp in opponents" :key="opp.id" class="opp">
      {{ opp.name }} — 🂠 {{ opp.cardCount }}
    </div>
  </div>
</template>

<style scoped>
.opponents {
  margin: 10px 0;
}

.opp {
  margin: 4px 0;
}
</style>