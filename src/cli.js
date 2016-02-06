#!/usr/bin/env node
import {slack} from "./index.js"

const channel_name = process.env.SLACK_CHANNEL_NAME || "#api-test"
slack.post(channel_name, process.argv.slice(2), (err, file) => {
  if (err) {
    console.error(err.stack);
    return
  }
  console.log(file.thumb_80);
})
