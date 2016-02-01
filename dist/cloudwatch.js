
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _awsSdk = require("aws-sdk");

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _time = require("./time.js");

var _time2 = _interopRequireDefault(_time);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _metrics = require("./metrics.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CloudWatch = function () {
  function CloudWatch() {
    _classCallCheck(this, CloudWatch);
  }

  _createClass(CloudWatch, [{
    key: "region",

    /** */
    value: function region(r) {
      _awsSdk2.default.config.update({ region: r });
      return this;
    }

    /** */

  }, {
    key: "duration",
    value: function duration(d) {
      this._duration = d;
      return this;
    }

    /** */

  }, {
    key: "period",
    value: function period(p) {
      this._period = p;
      return this;
    }

    /** */

  }, {
    key: "statistics",
    value: function statistics(name) {
      this._statistics = name;
      return this;
    }

    /** */

  }, {
    key: "metricStatistics",
    value: function metricStatistics(namespace, instanceID, metricName) {
      var dimName = (0, _metrics.nsToDimName)(namespace);
      var metric = (0, _metrics.searchMetric)(namespace, metricName);
      var sep = _time2.default.toSEP(this._duration);
      if (this._period) {
        sep.Period = this._period;
      }
      if (this._statistics) {
        metric.Statistics = [this._statistics];
      }

      var params = _extends({}, sep, metric, {
        Namespace: namespace,
        Dimensions: [{
          Name: dimName,
          Value: instanceID
        }]
      });

      //process.stderr.write(JSON.stringify(params));
      var cloudwatch = new _awsSdk2.default.CloudWatch();
      return new Promise(function (resolve, reject) {
        return cloudwatch.getMetricStatistics(params, function (err, data) {
          return err ? reject(err) : resolve(data);
        });
      });
    }
  }]);

  return CloudWatch;
}();

exports.default = CloudWatch;