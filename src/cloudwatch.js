// @flow
"use strict"
import AWS from "aws-sdk"
import time from "./time.js"
import moment from "moment"
import {
  nsToDimName,
  searchMetric,
} from "./metrics.js"

class CloudWatch {
  _duration: string;
  _period: number;
  _statistics: string;

  /** */
  region(r: string): CloudWatch {
    AWS.config.update({region: r});
    return this;
  }

  /** */
  duration(d: string): CloudWatch {
    this._duration = d;
    return this;
  }

  /** */
  period(p: number): CloudWatch {
    this._period = p;
    return this;
  }

  /** */
  statistics(name: string): CloudWatch {
    this._statistics = name;
    return this;
  }

  /** */
  metricStatistics(namespace: string, instanceID: string, metricName: string): Promise {
    let dimName = nsToDimName(namespace);
    let metric  = searchMetric(namespace, metricName);
    let sep     = time.toSEP(this._duration);
    if (this._period) {
      sep.Period = this._period;
    }
    if (this._statistics) {
      metric.Statistics = [ this._statistics ]
    }
  
    let params = {
      ...sep,
      ...metric,
      Namespace: namespace,
      Dimensions: [
        {
          Name: dimName,
          Value: instanceID,
        },
      ],
    };

    //process.stderr.write(JSON.stringify(params));
    let cloudwatch = new AWS.CloudWatch();
    return new Promise((resolve, reject) =>
      cloudwatch.getMetricStatistics(params, (err, data) => err ? reject(err) : resolve(data))
    )
  }
}

export default CloudWatch;

