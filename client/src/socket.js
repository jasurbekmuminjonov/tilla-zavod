import io from "socket.io-client";

const SOCKET_URL = `https://apitillazavod.balerion.uz`;
const socket = io(SOCKET_URL, { transports: ["websocket"] });

export default socket;
