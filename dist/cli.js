#!/usr/bin/env node
"use strict";

var _index = require("./index.js");

_index.slack.post("#api-test", process.argv.slice(2), function (err, file) {
  if (err) {
    console.error(err.stack);
    return;
  }
  console.log(file.thumb_80);
});