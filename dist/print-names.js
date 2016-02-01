"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _cloudwatch = require("./cloudwatch.js");

var _cloudwatch2 = _interopRequireDefault(_cloudwatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = require("minimist")(process.argv.slice(2));
var region = argv.region || process.env.AWS_DEFAULT_REGION || "ap-northeast-1";
var namespace = argv.namespace || "AWS/EC2";

_cloudwatch2.default.region(region).names().then(function (r) {
  return r.Metrics;
}).then(function (r) {
  return [r.map(function (e) {
    return e.MetricName;
  }), r.map(function (_ref) {
    var _ref$Dimensions = _slicedToArray(_ref.Dimensions, 1);

    var d = _ref$Dimensions[0];
    return d;
  }).filter(function (e) {
    return e;
  })
  //.filter(d => d.Name === "DBInstanceIdentifier")  // declared in params
  .map(function (d) {
    return d ? d.Value : null;
  })];
}).then(function (_ref2) {
  var _ref3 = _slicedToArray(_ref2, 2);

  var a = _ref3[0];
  var b = _ref3[1];
  return [_immutable2.default.Set(a), _immutable2.default.Set(b)];
}).then(function (_ref4) {
  var _ref5 = _slicedToArray(_ref4, 2);

  var a = _ref5[0];
  var b = _ref5[1];
  return [a.sort()];
}). /*b.sort()*/then(function (r) {
  return console.log(JSON.stringify(r));
}).catch(function (err) {
  return console.log(err);
});