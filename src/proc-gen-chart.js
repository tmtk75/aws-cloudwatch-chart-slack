// @flow
import {spawn} from "child_process"
import path from "path"

// workaround: prod.stdin.write doesn't pass for flow check
function write_to_stdin(proc: any, obj) {
  proc.stdin.write(JSON.stringify(obj))
  proc.stdin.end()
}

export function proc_gen_chart(args) {
  return r => new Promise((resolve, reject) => {
    let cmd = path.join(__dirname, "../node_modules/.bin/", "phantomjs")
    let js  = path.join(__dirname, "gen-chart.js")
    let nmp = path.join(__dirname, "../node_modules")
    let p = spawn(cmd, [js, "--node_modules_path", nmp].concat(args))
    write_to_stdin(p, r);
    var buf    = ""
    var errbuf = ""
    p.stdout.on("data", (data) => buf += `${data}`);  // filename: String
    p.stderr.on("data", (data) => errbuf += `${data}`);
    p.on("close", (code) => code == 0 ? resolve(buf) : reject(new Error(errbuf)));
  })
}
