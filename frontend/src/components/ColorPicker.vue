<script setup lang="ts">
import { send } from "@/socket";

const colors = ["red", "yellow", "green", "blue"];

function choose(color: string) {
  send({
    type: "CHOOSE_COLOR",
    color,
  });
}
</script>

<template>
  <div class="overlay">
    <div class="picker">
      <h2>Choose a color</h2>

      <div class="colors">
        <button
          v-for="color in colors"
          :key="color"
          :class="['btn', 'color-btn', color]"
          @click="choose(color)"
        />
      </div>
    </div>
  </div>
</template>


