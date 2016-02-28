#!/usr/bin/env node
// @flow
import fs from "fs"
import {render} from "./render.js"
import {upload} from "./upload.js"
import {ls_ec2} from "./ls-ec2.js"
import {proc_gen_chart} from "./proc-gen-chart.js"

function unlink(path: string): Promise {
  return new Promise((resolve, reject) => fs.unlink(path, (err) => err ? reject(err) : resolve(path)))
}

function post(channel: string, args: Array<string>, callback: Function): Promise {
  let cb_ok  = callback || ((err, data) => console.log(data))
  let cb_err = callback || ((err, data) => console.error(err))
  return render(args)
           .then(path => Promise.all([
             upload(channel, path),
             unlink(path)
           ]))
           .then(([{file}, path]) => cb_ok(null, file))
           .catch(err => cb_err(err))
}

module.exports = {
  slack: {
    post,
  },
  ls_ec2,
  render,
  proc_gen_chart,
}
