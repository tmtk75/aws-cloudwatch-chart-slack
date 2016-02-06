"use strict";

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _printStats = require("./print-stats.js");

var _child_process = require("child_process");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// workaround: prod.stdin.write doesn't pass for flow check
function write_to_stdin(proc, obj) {
  proc.stdin.write(JSON.stringify(obj));
  proc.stdin.end();
}

function render(args) {
  return (0, _printStats.print_stats)((0, _minimist2.default)(args)).then(function (r) {
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
  });
}

module.exports = {
  render: render
};

if (require.main === module) {
  render(process.argv.slice(2)).then(function (r) {
    return console.log(r);
  }).catch(function (err) {
    return console.error(err.stack);
  });
}