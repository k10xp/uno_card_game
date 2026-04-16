import { ref } from "vue";
import router from "@/router";

//Global reactive state
export const gameState = ref<any>(null);
export const lobby = ref<any>(null);
export const gameStarted = ref(false);
export const gameOver = ref<{ winner: string } | null>(null);

//Test
export const isGameOver = ref(false);

//Internal socket instance
let socket: WebSocket | null = null;

//Init websocket connection
export function initSocket() {
  //Preventing multiple socket connections
  if (socket && socket.readyState === WebSocket.OPEN) {
    return socket;
  }

  if (socket && socket.readyState === WebSocket.CONNECTING) {
    return socket;
  }

  //Recreate socket if Closed or Closing
  if (socket) {
    socket.close();
    socket = null;
  }

  socket = new WebSocket("ws://localhost:3000");

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "LOBBY":
        isGameOver.value = false;
        lobby.value = data;
        break;

      case "GAME_STATE":
        isGameOver.value = false;
        gameState.value = data;
        gameStarted.value = true;
        break;

      case "GAME_OVER":
        handleGameOver(data);
        break;

      case "ERROR":
        console.error("Server error:", data.message);
        break;
    }
  };

  socket.onclose = () => {
    socket = null;
    resetClient(); //Reset frontend state
  };

  socket.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  return socket;
}

//Safely send messgae
export function send(msg: any) {
  //Test
  console.log("SEND:", msg, socket?.readyState);

  if (!socket) return;

  //Retry if socket still connecting
  if (socket.readyState === WebSocket.CONNECTING) {
    setTimeout(() => send(msg), 100);
    return;
  }

  if (socket.readyState !== WebSocket.OPEN) {
    console.warn("DROP:", socket.readyState);
    return;
  }

  socket.send(JSON.stringify(msg));
}

//GameOver
function handleGameOver(data: any) {
  if (isGameOver.value) return;

  isGameOver.value = true;

  gameOver.value = {
    winner: data.winner,
  };

  //Rest all other states
  gameState.value = null;
  gameStarted.value = false;
  lobby.value = null;

  router.push("/game-over");
}

//Reset client state on disconnect
function resetClient() {
  gameState.value = null;
  gameStarted.value = false;
  lobby.value = null;
  gameOver.value = null;
  isGameOver.value = false;

  //Not keeping old socket alive
  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }

  router.push("/"); //Send player back Home
}
