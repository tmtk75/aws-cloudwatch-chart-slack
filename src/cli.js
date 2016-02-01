#!/usr/bin/env node
import {slack} from "./index.js"

slack.post("#api-test", process.argv.slice(2), (err, file) => {
  if (err) {
    console.error(err.stack);
    return
  }
  console.log(file.thumb_80);
})
