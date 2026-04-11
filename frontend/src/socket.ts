import { ref } from "vue";
import router from "./router";

export const gameState = ref<any>(null);
export const lobby = ref<any>(null);
export const gameStarted = ref(false);

let socket: WebSocket | null = null;

export function initSocket() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  socket = new WebSocket("ws://localhost:3000");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "LOBBY":
        lobby.value = data;
        break;

      case "GAME_STATE":
        gameState.value = data;
        gameStarted.value = true;
        break;

      case "GAME_OVER":
        resetClient();
        break;
    }
  };

  socket.onclose = () => {
    resetClient();
  };

  return socket;
}

// SAFE SEND
export function send(msg: any) {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.warn("Socket not ready");
    return;
  }

  socket.send(JSON.stringify(msg));
}

// RESET UI STATE
function resetClient() {
  gameState.value = null;
  gameStarted.value = false;
  lobby.value = null;

  router.push("/");
}