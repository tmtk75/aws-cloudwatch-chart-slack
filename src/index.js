#!/usr/bin/env node
// @flow
import fs from "fs"
import {render} from "./render.js"
import {upload} from "./upload.js"
import {ls_ec2} from "./ls-ec2.js"

function unlink(file: Object) {
  return new Promise((resolve, reject) => fs.unlink(file.name, (err) => err ? reject(err) : resolve(file)))
}

function post(channel: string, args: Array<string>, callback: Function): Promise {
  let cb0 = callback || ((err, data) => console.log(data))
  let cb1 = callback || ((err, data) => console.error(err.stack))
  return render(args)
           .then(path => upload(channel, path))
           .then(e => unlink(e.file))
           .then(file => cb0(null, file))
           .catch(err => cb1(err))
}

module.exports = {
  slack: {
    post,
  },
  ls_ec2,
}
