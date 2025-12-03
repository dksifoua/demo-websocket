const WEB_SOCKET_URL = "ws://localhost:3000/ws"


// const ws = new WebSocket("ws://localhost:3000", {
//     headers: {
//         "X-Access-Token": token
//     }
// })
//
// ws.addEventListener("open", event => {
//
// })
//
// ws.addEventListener("message", event => {
//     console.log(event.data)
// })
//
// ws.addEventListener("close", event => {
//     console.log("Connection closed!")
//     process.exit()
// })
//
//
// for await (const line of console) {
//     if (ws.readyState === 1) {
//         ws.send(line)
//     } else {
//         ws.terminate()
//         break
//     }
// }