#!/usr/bin/env node
"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _render = require("./render.js");

var _upload = require("./upload.js");

var _lsEc = require("./ls-ec2.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unlink(file) {
  return new Promise(function (resolve, reject) {
    return _fs2.default.unlink(file.name, function (err) {
      return err ? reject(err) : resolve(file);
    });
  });
}

function post(channel, args, callback) {
  var cb0 = callback || function (err, data) {
    return console.log(data);
  };
  var cb1 = callback || function (err, data) {
    return console.error(err.stack);
  };
  return (0, _render.render)(args).then(function (path) {
    return (0, _upload.upload)(channel, path);
  }).then(function (e) {
    return unlink(e.file);
  }).then(function (file) {
    return cb0(null, file);
  }).catch(function (err) {
    return cb1(err);
  });
}

module.exports = {
  slack: {
    post: post
  },
  ls_ec2: _lsEc.ls_ec2
};