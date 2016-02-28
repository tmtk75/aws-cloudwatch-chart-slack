"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.proc_gen_chart = proc_gen_chart;

var _child_process = require("child_process");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// workaround: prod.stdin.write doesn't pass for flow check
function write_to_stdin(proc, obj) {
  proc.stdin.write(JSON.stringify(obj));
  proc.stdin.end();
}

function proc_gen_chart(args) {
  return function (r) {
    return new Promise(function (resolve, reject) {
      var cmd = _path2.default.join(__dirname, "../node_modules/.bin/", "phantomjs");
      var js = _path2.default.join(__dirname, "gen-chart.js");
      var nmp = _path2.default.join(__dirname, "../node_modules");
      var p = (0, _child_process.spawn)(cmd, [js, "--node_modules_path", nmp].concat(args));
      write_to_stdin(p, r);
      var buf = "";
      var errbuf = "";
      p.stdout.on("data", function (data) {
        return buf += "" + data;
      }); // filename: String
      p.stderr.on("data", function (data) {
        return errbuf += "" + data;
      });
      p.on("close", function (code) {
        return code == 0 ? resolve(buf) : reject(new Error(errbuf));
      });
    });
  };
}