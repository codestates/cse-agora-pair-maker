const {WebClient} = require("@slack/web-api");
const TOKEN = "";
const client = new WebClient(TOKEN);
const CHANNEL_ID = "C026MQ2GV2T"

const requestMessage = async (message) => {
    try {
        await client.chat
        .postMessage({
            channel: CHANNEL_ID,
            text: message,
        })
        .then((res) => console.log(res));
    } catch (error) {
        console.log(error);
    }
}
