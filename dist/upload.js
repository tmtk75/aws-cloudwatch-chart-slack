#!/usr/bin/env node

"use strict";

var fs = require("fs");
var fetch = require("node-fetch");
var FormData = require("form-data");

function upload(channel, path) {
  return new Promise(function (resolve, reject) {
    var form = new FormData();
    form.append("channels", channel);
    form.append("token", process.env.SLACK_API_TOKEN);
    form.append("file", fs.createReadStream(path));

    return fetch("https://slack.com/api/files.upload", { method: "POST", body: form }).then(function (res) {
      return(
        /*
         * {ok: true, file: {...}}    See https://api.slack.com/types/file
         */
        res.json()
      );
    }).then(function (e) {
      return resolve(e);
    });
  });
}

module.exports = {
  upload: upload
};

if (require.main === module) {
  var channel = process.env.SLACK_CHANNEL_NAME || "#api-test";
  upload(channel, process.argv[2]).then(function (json) {
    return console.log(json);
  }).catch(function (err) {
    return console.error(err);
  });
}