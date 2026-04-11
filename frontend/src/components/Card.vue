<script setup lang="ts">
import { computed } from "vue";
import type { Card } from "@/types/card";

// Before we get card images
import { getCardAsset } from "@/composables/useCardAssets";
// When we have images
// import { getCardImage } from "../composables/useCardAssets";

const props = defineProps<{
  card: Card;
  selected?: boolean;
}>();

// When we get images replace display to image
const display = computed(() => getCardAsset(props.card));
</script>

// Before we get card images
<template>
  <div class="card" :class="[card.color, { selected }]">
    {{ display }}
  </div>
</template>
// After we get card images
/*
template>
  div class="card" :class="[card.color, { selected }]">
    img :src="image" class="card-img" />
  /div>
/template>

*/
