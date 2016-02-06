"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.METRICS = undefined;
exports.searchMetric = searchMetric;
exports.nsToDimName = nsToDimName;
exports.toMax = toMax;
exports.toMin = toMin;
exports.toAxisYLabel = toAxisYLabel;
exports.toY = toY;
exports.find_stat_name = find_stat_name;
exports.calc_period = calc_period;
exports.to_axis_x_label_text = to_axis_x_label_text;

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var metricsRDS = [{ MetricName: "BinLogDiskUsage", Statistics: ["Maximum"] }, { MetricName: "CPUUtilization", Statistics: ["Maximum"] }, { MetricName: "DatabaseConnections", Statistics: ["Maximum"] }, { MetricName: "DiskQueueDepth", Statistics: ["Maximum"] }, { MetricName: "FreeStorageSpace", Statistics: ["Maximum"] }, { MetricName: "FreeableMemory", Statistics: ["Minimum"] }, { MetricName: "NetworkReceiveThroughput", Statistics: ["Maximum"] }, { MetricName: "NetworkTransmitThroughput", Statistics: ["Maximum"] }, { MetricName: "ReadIOPS", Statistics: ["Maximum"] }, { MetricName: "ReadLatency", Statistics: ["Maximum"] }, { MetricName: "ReadThroughput", Statistics: ["Maximum"] }, { MetricName: "SwapUsage", Statistics: ["Maximum"] }, { MetricName: "WriteIOPS", Statistics: ["Maximum"] }, { MetricName: "WriteLatency", Statistics: ["Maximum"] }, { MetricName: "WriteThroughput", Statistics: ["Maximum"] }];

var metricsEC2 = [{ MetricName: "CPUCreditUsage", Statistics: ["Maximum"] }, { MetricName: "CPUCreditBalance", Statistics: ["Maximum"] }, { MetricName: "CPUUtilization", Statistics: ["Maximum"] }, { MetricName: "DiskReadOps", Statistics: ["Maximum"] }, { MetricName: "DiskWriteOps", Statistics: ["Maximum"] }, { MetricName: "DiskReadBytes", Statistics: ["Maximum"] }, { MetricName: "DiskWriteBytes", Statistics: ["Maximum"] }, { MetricName: "NetworkIn", Statistics: ["Maximum"] }, { MetricName: "NetworkOut", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed_Instance", Statistics: ["Maximum"] }, { MetricName: "StatusCheckFailed_System", Statistics: ["Maximum"] }];

"Seconds | Microseconds | Milliseconds | Bytes | Kilobytes | Megabytes | Gigabytes | Terabytes | Bits | Kilobits | Megabits | Gigabits | Terabits | Percent | Count | Bytes/Second | Kilobytes/Second | Megabytes/Second | Gigabytes/Second | Terabytes/Second | Bits/Second | Kilobits/Second | Megabits/Second | Gigabits/Second | Terabits/Second | Count/Second | None";
"Minimum | Maximum | Sum | Average | SampleCount";

var METRICS = exports.METRICS = {
  "AWS/EC2": metricsEC2,
  "AWS/RDS": metricsRDS
};

function searchMetric(ns, metricName) {
  var a = METRICS[ns].filter(function (_ref) {
    var n = _ref.MetricName;
    return n.match(new RegExp(metricName, "i"));
  });
  return a[0];
}

function nsToDimName(ns) {
  return {
    "AWS/RDS": "DBInstanceIdentifier",
    "AWS/EC2": "InstanceId"
  }[ns];
}

function toMax(metrics) {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 100.0;
  }
  return null;
}

function toMin(metrics) {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 0.0;
  }
  return null;
}

function toAxisYLabel(metrics, bytes) {
  if (metrics.Datapoints[0].Unit === "Bytes" && !bytes) {
    return "Megabytes";
  }
  return metrics.Datapoints[0].Unit;
}

function toY(metric, bytes) {
  var e = metric["Maximum"] || metric["Average"] || metric["Minimum"] || metric["Sum"] || metric["SampleCount"];
  if (metric.Unit === "Bytes" && !bytes) {
    return e / (1024 * 1024); // Megabytes
  }
  return e;
}

var _stats = _immutable2.default.Set(["Maximum", "Average", "Minimum", "Sum", "SampleCount"]);
function find_stat_name(datapoints) {
  if (!(datapoints && datapoints.length > 0)) return null;
  var dp = datapoints[0];
  return _immutable2.default.List(Object.keys(dp)).find(function (e) {
    return _stats.has(e);
  });
}

function calc_period(datapoints) {
  var measurement = arguments.length <= 1 || arguments[1] === undefined ? "minutes" : arguments[1];

  if (!(datapoints && datapoints.length > 1)) return null;

  var _datapoints$sort = datapoints.sort(function (a, b) {
    return a.Timestamp.localeCompare(b.Timestamp);
  });

  var _datapoints$sort2 = _slicedToArray(_datapoints$sort, 2);

  var a = _datapoints$sort2[0];
  var b = _datapoints$sort2[1];

  return (0, _moment2.default)(b.Timestamp).diff((0, _moment2.default)(a.Timestamp), measurement);
}

function to_axis_x_label_text(datapoints, utc) {
  var dp = datapoints.sort(function (a, b) {
    return a.Timestamp.localeCompare(b.Timestamp);
  });
  var last = (0, _moment2.default)(dp[dp.length - 1].Timestamp);
  var f = last.format("YYYY-MM-DD HH:mm");
  var tz = utc ? "UTC" : new Date().getTimezoneOffset() / 60 + "h";
  var d = last.diff((0, _moment2.default)(dp[0].Timestamp));
  var df = _moment2.default.duration(d).humanize();
  return find_stat_name(datapoints) + " every " + calc_period(datapoints) + "minutes from " + f + " (tz:" + tz + ") to " + df + " ago";
}

//
if (require.main === module) {
  console.log(JSON.stringify(METRICS, null, 2));
}