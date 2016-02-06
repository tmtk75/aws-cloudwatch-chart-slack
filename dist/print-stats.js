"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _cloudwatch = require("./cloudwatch.js");

var _cloudwatch2 = _interopRequireDefault(_cloudwatch);

var _metrics = require("./metrics.js");

var _time = require("./time.js");

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function print_stats(argv) {
  //let [ instID, metricName = 'CPUUtilization', ns = 'AWS/EC2'] = argv._;  // flow doesn't support
  var instIDs = argv._[0];
  var metricName = argv._[1] || "CPUUtilization";
  var ns = argv._[2] || "AWS/EC2";
  var dimName = (0, _metrics.nsToDimName)(ns);
  var region = argv.region || process.env.AWS_DEFAULT_REGION || "ap-northeast-1";
  var period = (0, _time.toSeconds)(argv.period || "30minutes");
  var stats = argv.statistics;

  if (!instIDs) {
    //throw new Error("instanceID is missing")
    return Promise.reject(new Error("InstanceId is missing"));
  }

  var watch = function watch(instanceID) {
    return new _cloudwatch2.default().region(region).duration(argv.duration || "1day").period(period).statistics(stats).metricStatistics(ns, instanceID, metricName).then(function (r) {
      return _extends(_defineProperty({
        Namespace: ns
      }, dimName, instanceID), r);
    });
  };

  return Promise.all(instIDs.split(",").map(function (e) {
    return watch(e.trim());
  }));
}

module.exports = {
  print_stats: print_stats
};

if (require.main === module) {
  print_stats(require("minimist")(process.argv.slice(2))).then(function (r) {
    return process.stdout.write(JSON.stringify(r));
  }).catch(function (err) {
    //process.stderr.write(JSON.stringify(err, null, 2));
    console.error(err);
    process.exit(1);
  });
}