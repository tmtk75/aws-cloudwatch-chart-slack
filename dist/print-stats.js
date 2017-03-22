"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _cloudwatch = require("./cloudwatch.js");

var _cloudwatch2 = _interopRequireDefault(_cloudwatch);

var _metrics = require("./metrics.js");

var _time = require("./time.js");

var _lsEc = require("./ls-ec2.js");

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

  _awsSdk2.default.config.update({ region: region });

  var watch = function watch(instanceID) {
    return new _cloudwatch2.default().endTime(argv["end-time"]).duration(argv.duration || "1day").period(period).statistics(stats).metricStatistics(ns, instanceID, metricName).then(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
          sep = _ref2[0],
          data = _ref2[1];

      return _extends(_defineProperty({
        Namespace: ns
      }, dimName, instanceID), sep, data);
    });
  };

  var a = instIDs.match("^tag:(.*)");
  if (a && ns === "AWS/RDS") return Promise.reject(new Error("filters is not supported AWS/RDS"));

  var p = a ? (0, _lsEc.ls_ec2)(a[1]) : Promise.resolve(instIDs);
  return p.then(function (s) {
    return s.split(",");
  }).then(function (s) {
    return Promise.all(s.map(function (e) {
      return watch(e.trim());
    }));
  });
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