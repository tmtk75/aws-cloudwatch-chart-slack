#!/usr/bin/env node
// @flow
"use strict"
var fs = require("fs");
var fetch = require("node-fetch");
var FormData = require("form-data");

function upload(channel: string, path: string): Promise {
  return new Promise((resolve, reject) => {
    var form = new FormData();
    form.append("channels", channel);
    form.append("token",    process.env.SLACK_API_TOKEN);
    form.append("file",     fs.createReadStream(path))

    return fetch("https://slack.com/api/files.upload", {method: "POST", body: form})
      .then(res =>
        /*
         * {ok: true, file: {...}}    See https://api.slack.com/types/file
         */
        res.json()
      )
      .then(e => e.ok ? resolve(e) : reject(new Error(JSON.stringify(e))))
      .catch(err => reject(err))
  })
}

module.exports = {
  upload,
}

if (require.main === module) {
  let channel = process.env.SLACK_CHANNEL_NAME || "#api-test"
  upload(channel, process.argv[2])
    .then(json => console.log(json))
    .catch(err => console.error(err));
}

