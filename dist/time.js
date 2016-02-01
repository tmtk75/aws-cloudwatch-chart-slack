
"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.toSEP = toSEP;
exports.toSeconds = toSeconds;

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
 * Start End Period
 */
function toSEP() {
  var reltime = arguments.length <= 0 || arguments[0] === undefined ? "1day" : arguments[0];

  var a = reltime.match(/([0-9]+) *(.*)/);
  if (!a) {
    throw new Error(reltime);
  }

  var _a = _slicedToArray(a, 3);

  var _ = _a[0];
  var n = _a[1];
  var m = _a[2];

  var endTime = (0, _moment2.default)();
  var duration = _moment2.default.duration(parseInt(n), m);
  var startTime = endTime.clone().subtract(duration);
  var period = 60 * 30;

  return {
    EndTime: endTime.toDate(),
    StartTime: startTime.toDate(),
    Period: period
  };
}

function toSeconds(period) {
  var _period$match = period.match(/([0-9]+)(.+)/);

  var _period$match2 = _slicedToArray(_period$match, 3);

  var _ = _period$match2[0];
  var n = _period$match2[1];
  var u = _period$match2[2];

  return _moment2.default.duration(parseInt(n), u).asSeconds();
}

exports.default = {
  toSEP: toSEP,
  toSeconds: toSeconds
};