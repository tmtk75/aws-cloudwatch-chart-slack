"use strict";

var _minimist = require("minimist");

var _minimist2 = _interopRequireDefault(_minimist);

var _printStats = require("./print-stats.js");

var _procGenChart = require("./proc-gen-chart.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function render(args) {
  return (0, _printStats.print_stats)((0, _minimist2.default)(args)).then((0, _procGenChart.proc_gen_chart)(args));
}


module.exports = {
  render: render
};

if (require.main === module) {
  render(process.argv.slice(2)).then(function (r) {
    return console.log(r);
  }).catch(function (err) {
    return console.error(err.stack);
  });
}