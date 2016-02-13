// @flow
import AWS from "aws-sdk"
import I from "immutable"
import * as ec2 from "./ls-ec2.js"

/** */
function describe_db_instances(filters: Array<Object> = []): Promise {
  //AWS.config.update({region: "ap-northeast-1"})
  let rds = new AWS.RDS();
  let params = {
    Filters: [
      ...filters,
    ],
  }
  return new Promise((resolve, reject) => rds.describeDBInstances(params, (err, data) => err ? reject(err) : resolve(data)))
    .then(r => r)
} 

export function ls_rds(f: string): Promise {
  return describe_db_instances(ec2.to_filters(f))
    .then(e => e.map(s => s.InstanceId))
    .then(e => e.join(","))
}

import minimist from "minimist"
if (require.main === module) {
  let argv = minimist(process.argv.slice(2))
  AWS.config.update({region: argv.region || process.env.AWS_DEFAULT_REGION || "ap-northeast-1"})
  describe_db_instances(ec2.tag_string_to_filters(argv._[0]))
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(err => console.error(err.stack))
}
