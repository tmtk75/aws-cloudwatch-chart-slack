// @flow
import minimist from "minimist"
import {print_stats} from "./print-stats.js"
import {proc_gen_chart} from "./proc-gen-chart.js"

function render(args: Array<string>): Promise {
  return print_stats(minimist(args))
    .then(proc_gen_chart(args))
}

module.exports = {
  render,
}

if (require.main === module) {
  render(process.argv.slice(2))
    .then(r => console.log(r))
    .catch(err => console.error(err.stack))
}
