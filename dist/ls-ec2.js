
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ls_ec2 = ls_ec2;

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _immutable = require("immutable");

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** */
function ls_ec2() {
  _awsSdk2.default.config.update({ region: "ap-northeast-1" });
  var ec2 = new _awsSdk2.default.EC2();
  var params = {
    Filters: [{ Name: "instance-state-name", Values: ["running"] }]
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

if (require.main === module) {
  ls_ec2().then(function (r) {
    return console.log(JSON.stringify(r, null, 2));
  }).catch(function (err) {
    return console.error(err.stack);
  });
}