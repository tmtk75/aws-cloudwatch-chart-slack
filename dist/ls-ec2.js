"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.to_filters = to_filters;
exports.tag_string_to_filters = tag_string_to_filters;
exports.ls_ec2 = ls_ec2;

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** */
function describe_instances() {
  var filters = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

  //AWS.config.update({region: "ap-northeast-1"})
  var ec2 = new _awsSdk2.default.EC2();
  var params = {
    Filters: [{ Name: "instance-state-name", Values: ["running"] }].concat(_toConsumableArray(filters))
  };
  return new Promise(function (resolve, reject) {
    return ec2.describeInstances(params, function (err, data) {
      return err ? reject(err) : resolve(data);
    });
  }).then(function (r) {
    return r.Reservations.map(function (e) {
      return e.Instances[0];
    });
  }).then(function (r) {
    return r.map(function (e) {
      return {
        InstanceId: e.InstanceId,
        InstanceType: e.InstanceType,
        Name: (_immutable2.default.List(e.Tags).find(function (e) {
          return e.Key === "Name";
        }) || {}).Value
      };
    });
  });
}

/**
 * in: tag:site=dev,role=webapp|db
 *
 * out: [
 *   {Name: "tag:site", Values: ["dev"]},
 *   {Name: "tag:role", Values: ["webapp", "db"]},
 * ]
 */
function to_filters(s) {
  return s.trim().split(",").map(function (e) {
    return e.trim().split("=");
  }).map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var k = _ref2[0];
    var v = _ref2[1];
    return { Name: "tag:" + k, Values: [].concat(_toConsumableArray(v.split("|"))) };
  });
}

function tag_string_to_filters(s) {
  if (!s) return [];
  var a = s.match("^tag:(.*)");
  return a ? to_filters(a[1]) : [];
}

function ls_ec2(f) {
  return describe_instances(to_filters(f)).then(function (e) {
    return e.map(function (s) {
      return s.InstanceId;
    });
  }).then(function (e) {
    return e.join(",");
  });
}

if (require.main === module) {
  var argv = (0, _minimist2.default)(process.argv.slice(2));
  _awsSdk2.default.config.update({ region: argv.region || process.env.AWS_DEFAULT_REGION || "ap-northeast-1" });
  describe_instances(tag_string_to_filters(argv._[0])).then(function (r) {
    return console.log(JSON.stringify(r, null, 2));
  }).catch(function (err) {
    return console.error(err.stack);
  });
}