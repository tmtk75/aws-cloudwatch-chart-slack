// @flow
import minimist from "minimist"
import {print_stats} from "./print-stats.js"
import {spawn} from "child_process"
import path from "path"

// workaround: prod.stdin.write doesn't pass for flow check
function write_to_stdin(proc: any, obj) {
  proc.stdin.write(JSON.stringify(obj))
  proc.stdin.end()
}

function render(args: Array<string>): Promise {
  return print_stats(minimist(args))
    .then(r =>
      new Promise((resolve, reject) => {
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
    )
}

module.exports = {
  render,
}

if (require.main === module) {
  render(process.argv.slice(2))
    .then(r => console.log(r))
    .catch(err => console.error(err.stack))
}
