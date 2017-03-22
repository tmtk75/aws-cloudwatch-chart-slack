"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mimic = mimic;
exports.toY = toY;

var _metrics = require("./metrics.js");

var m = _interopRequireWildcard(_metrics);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

/**
 * Returns true if stat is exactly in a condition.
 */
function mimic(stat) {
  return stat.Namespace === "AWS/DynamoDB" && stat.Period === 60 && (stat.Label === "ConsumedReadCapacityUnits" || stat.Label === "ConsumedWriteCapacityUnits") && stat.Datapoints[0].Sum !== undefined;
}
function toY(e) {
  var bytes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  return m.toY(e, bytes) / 60;
}

exports.default = {
  mimic: mimic,
  toY: toY
};