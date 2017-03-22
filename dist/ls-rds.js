"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ls_rds = ls_rds;

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

var _lsEc = require("./ls-ec2.js");

var ec2 = _interopRequireWildcard(_lsEc);

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/** */
function describe_db_instances() {
  var filters = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  //AWS.config.update({region: "ap-northeast-1"})
  var rds = new _awsSdk2.default.RDS();
  var params = {
    Filters: [].concat(_toConsumableArray(filters))
  };
  return new Promise(function (resolve, reject) {
    return rds.describeDBInstances(params, function (err, data) {
      return err ? reject(err) : resolve(data);
    });
  }).then(function (r) {
    return r;
  });
}

function ls_rds(f) {
  return describe_db_instances(ec2.to_filters(f)).then(function (e) {
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
  describe_db_instances(ec2.tag_string_to_filters(argv._[0])).then(function (r) {
    return console.log(JSON.stringify(r, null, 2));
  }).catch(function (err) {
    return console.error(err.stack);
  });
}