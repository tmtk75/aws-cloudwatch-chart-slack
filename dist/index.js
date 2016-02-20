#!/usr/bin/env node
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _render = require("./render.js");

var _upload = require("./upload.js");

var _lsEc = require("./ls-ec2.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function unlink(path) {
  return new Promise(function (resolve, reject) {
    return _fs2.default.unlink(path, function (err) {
      return err ? reject(err) : resolve(path);
    });
  });
}

function post(channel, args, callback) {
  var cb_ok = callback || function (err, data) {
    return console.log(data);
  };
  var cb_err = callback || function (err, data) {
    return console.error(err);
  };
  return (0, _render.render)(args).then(function (path) {
    return Promise.all([(0, _upload.upload)(channel, path), unlink(path)]);
  }).then(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var file = _ref2[0].file;
    var path = _ref2[1];
    return cb_ok(null, file);
  }).catch(function (err) {
    return cb_err(err);
  });
}

module.exports = {
  slack: {
    post: post
  },
  ls_ec2: _lsEc.ls_ec2,
  render: _render.render
};