// @flow
"use strict"
import AWS from "aws-sdk"
import I from "immutable"

/** */
export function ls_ec2(): Promise {
  AWS.config.update({region: "ap-northeast-1"})
  let ec2 = new AWS.EC2();
  let params = {
    Filters: [{Name:"instance-state-name", Values:["running"]}],
  }
  return new Promise((resolve, reject) => ec2.describeInstances(params, (err, data) => err ? reject(err) : resolve(data)))
    .then(r => r.Reservations.map(e => e.Instances[0]))
    .then(r => r.map(e => ({
      InstanceId: e.InstanceId,
      InstanceType: e.InstanceType,
      Name: (I.List(e.Tags).find(e => e.Key === "Name") || {}).Value,
    })))
} 

if (require.main === module) {
  ls_ec2()
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => console.error(err.stack))
}
