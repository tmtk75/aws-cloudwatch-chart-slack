// @flow
import I from "immutable"
import moment from "moment"

const metricsRDS = [
  { MetricName: "BinLogDiskUsage",           Statistics: [ "Maximum" ] },
  { MetricName: "CPUUtilization",            Statistics: [ "Average" ] },
  { MetricName: "DatabaseConnections",       Statistics: [ "Maximum" ] },
  { MetricName: "DiskQueueDepth",            Statistics: [ "Maximum" ] },
  { MetricName: "FreeStorageSpace",          Statistics: [ "Minimum" ] },
  { MetricName: "FreeableMemory",            Statistics: [ "Minimum" ] },
  { MetricName: "NetworkReceiveThroughput",  Statistics: [ "Maximum" ] },
  { MetricName: "NetworkTransmitThroughput", Statistics: [ "Maximum" ] },
  { MetricName: "ReadIOPS",                  Statistics: [ "Maximum" ] },
  { MetricName: "ReadLatency",               Statistics: [ "Maximum" ] },
  { MetricName: "ReadThroughput",            Statistics: [ "Maximum" ] },
  { MetricName: "SwapUsage",                 Statistics: [ "Maximum" ] },
  { MetricName: "WriteIOPS",                 Statistics: [ "Maximum" ] },
  { MetricName: "WriteLatency",              Statistics: [ "Maximum" ] },
  { MetricName: "WriteThroughput",           Statistics: [ "Maximum" ] },
]

const metricsEC2 = [
  { MetricName: "CPUCreditUsage",             Statistics: [ "Maximum" ] },
  { MetricName: "CPUCreditBalance",           Statistics: [ "Maximum" ] },
  { MetricName: "CPUUtilization",             Statistics: [ "Average" ] },
  { MetricName: "DiskReadOps",                Statistics: [ "Maximum" ] },
  { MetricName: "DiskWriteOps",               Statistics: [ "Maximum" ] },
  { MetricName: "DiskReadBytes",              Statistics: [ "Maximum" ] },
  { MetricName: "DiskWriteBytes",             Statistics: [ "Maximum" ] },
  { MetricName: "NetworkIn",                  Statistics: [ "Maximum" ] },
  { MetricName: "NetworkOut",                 Statistics: [ "Maximum" ] },
  { MetricName: "StatusCheckFailed",          Statistics: [ "Maximum" ] },
  { MetricName: "StatusCheckFailed_Instance", Statistics: [ "Maximum" ] },
  { MetricName: "StatusCheckFailed_System",   Statistics: [ "Maximum" ] },
]

const metricsDynamoDB = [
  { MetricName: "ConsumedReadCapacityUnits",        Statistics: [ "Sum" ] },
  { MetricName: "ConsumedWriteCapacityUnits",       Statistics: [ "Sum" ] },
  { MetricName: "ProvisionedReadCapacityUnits",     Statistics: [ "Maximum" ] },
  { MetricName: "ProvisionedWriteCapacityUnits",    Statistics: [ "Maximum" ] },
  { MetricName: "ConditionalCheckFailedRequests",   Statistics: [ "Maximum" ] },
  { MetricName: "OnlineIndexConsumedWriteCapacity", Statistics: [ "Maximum" ] },
  { MetricName: "OnlineIndexPercentageProgress",    Statistics: [ "Maximum" ] },
  { MetricName: "OnlineIndexThrottleEvents",        Statistics: [ "Maximum" ] },
  { MetricName: "ReturnedItemCount",                Statistics: [ "Maximum" ] },
  { MetricName: "SuccessfulRequestLatency",         Statistics: [ "Maximum" ] },
  { MetricName: "SystemErrors",                     Statistics: [ "Maximum" ] },
  { MetricName: "ThrottledRequests",                Statistics: [ "Maximum" ] },
  { MetricName: "UserErrors",                       Statistics: [ "Maximum" ] },
  { MetricName: "WriteThrottleEvents",              Statistics: [ "Maximum" ] },
  { MetricName: "ReadThrottleEvents",               Statistics: [ "Sum" ] },
]

"Seconds | Microseconds | Milliseconds | Bytes | Kilobytes | Megabytes | Gigabytes | Terabytes | Bits | Kilobits | Megabits | Gigabits | Terabits | Percent | Count | Bytes/Second | Kilobytes/Second | Megabytes/Second | Gigabytes/Second | Terabytes/Second | Bits/Second | Kilobits/Second | Megabits/Second | Gigabits/Second | Terabits/Second | Count/Second | None"
"Minimum | Maximum | Sum | Average | SampleCount"

export const METRICS = {
  "AWS/EC2": metricsEC2,
  "AWS/RDS": metricsRDS,
  "AWS/DynamoDB": metricsDynamoDB,
}

type Metric = {
  MetricName: string;
  Statistics: Array<string>;
}

type Datapoint = {
  Timestamp: string;
  Unit: string;
}

type Metrics = {
  Datapoints: Array<Datapoint>;
}

export function searchMetric(ns: string, metricName: string): Metric {
  let a = METRICS[ns].filter(({MetricName: n}) => n.match(new RegExp(metricName, "i")))
  return a[0]
}

export function nsToDimName(ns: string): string {
  return ({
    "AWS/RDS": "DBInstanceIdentifier",
    "AWS/EC2": "InstanceId",
    "AWS/DynamoDB": "TableName",
  })[ns]
}

export function toMax(metrics: Metrics): ?number {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 100.0;
  }
  return null;
}

export function toMin(metrics: Metrics): ?number {
  if (!metrics.Datapoints[0]) {
    return null;
  }
  if (metrics.Datapoints[0].Unit === "Percent") {
    return 0.0;
  }
  return null;
}

export function toAxisYLabel(metrics: Metrics, bytes: boolean): string {
  if (metrics.Datapoints[0].Unit === "Bytes" && !bytes) {
    return "Megabytes"
  }
  return metrics.Datapoints[0].Unit
}

export function toY(metric: Object, bytes: boolean): number {
  let e = metric["Maximum"] || metric["Average"] || metric["Minimum"]|| metric["Sum"] || metric["SampleCount"]
  if (metric.Unit === "Bytes" && !bytes) {
    return e / (1024 * 1024)  // Megabytes
  }
  return e || 0
}

const _stats = I.Set(["Maximum", "Average", "Minimum", "Sum", "SampleCount"])
export function find_stat_name(datapoints: Array<Datapoint>): ?string {
  if (!(datapoints && datapoints.length > 0))
    return null
  let dp = datapoints[0];
  return I.List(Object.keys(dp)).find(e => _stats.has(e))
}

export function calc_period(datapoints: Array<Datapoint>, measurement: string = "minutes"): ?number {
  if (!(datapoints && datapoints.length > 1))
    return null
  let [a, b] = datapoints.sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
  return moment(b.Timestamp).diff(moment(a.Timestamp), measurement)
}

export function to_axis_x_label_text(stats: Object, utc: boolean): string {
  let et   = moment(stats.EndTime)
  let diff = moment(stats.StartTime).diff(et)
  let tz = utc ? "UTC" : (new Date().getTimezoneOffset() / 60) + "h"

  let ago  = moment.duration(diff).humanize()
  let from = (utc ? et.utc() : et).format("YYYY-MM-DD HH:mm")
  return `${find_stat_name(stats.Datapoints)} every ${calc_period(stats.Datapoints)}minutes from ${from} (tz:${tz}) to ${ago} ago`
}

//
if (require.main === module) {
  console.log(JSON.stringify(METRICS, null, 2));
}
