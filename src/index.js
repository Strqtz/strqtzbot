import Client from "./structures/client/Client.js";
const client = new Client();

try {
  client.run();
} catch (e) {
  console.log(e);
}
