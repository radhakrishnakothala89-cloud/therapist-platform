import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL ||
  "https://therapist-platform-backend.onrender.com"
);

export default socket;