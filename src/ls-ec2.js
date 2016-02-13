// @flow
import AWS from "aws-sdk"
import I from "immutable"

/** */
function describe_instances(filters: Array<Object> = []): Promise {
  //AWS.config.update({region: "ap-northeast-1"})
  let ec2 = new AWS.EC2();
  let params = {
    Filters: [
      {Name:"instance-state-name", Values:["running"]},
      ...filters,
    ],
  }
  return new Promise((resolve, reject) => ec2.describeInstances(params, (err, data) => err ? reject(err) : resolve(data)))
    .then(r => r.Reservations.map(e => e.Instances[0]))
    .then(r => r.map(e => ({
      InstanceId: e.InstanceId,
      InstanceType: e.InstanceType,
      Name: (I.List(e.Tags).find(e => e.Key === "Name") || {}).Value,
    })))
} 

/**
 * in: tag:site=dev,role=webapp|db
 *
 * out: [
 *   {Name: "tag:site", Values: ["dev"]},
 *   {Name: "tag:role", Values: ["webapp", "db"]},
 * ]
 */
export function to_filters(s: string): Array<Object> {
  return s.trim()
          .split(",")
          .map(e => e.trim().split("="))
          .map(([k, v]) => ({Name:`tag:${k}`, Values:[...v.split("|")]}))
}

export function tag_string_to_filters(s: string): Array<Object> {
  if (!s)
    return []
  let a = s.match("^tag:(.*)")
  return a ? to_filters(a[1]) : []
}

export function ls_ec2(f: string): Promise {
  return describe_instances(to_filters(f))
    .then(e => e.map(s => s.InstanceId))
    .then(e => e.join(","))
}

import minimist from "minimist"
if (require.main === module) {
  let argv = minimist(process.argv.slice(2))
  AWS.config.update({region: argv.region || process.env.AWS_DEFAULT_REGION || "ap-northeast-1"})
  describe_instances(tag_string_to_filters(argv._[0]))
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => console.error(err.stack))
}
