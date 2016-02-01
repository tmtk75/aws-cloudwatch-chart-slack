"use strict";

var _system = require("system");

var _system2 = _interopRequireDefault(_system);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _metrics = require("./metrics.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = require("minimist")(_system2.default.args.slice(1), {
  string: ["filename", "width", "height", "max", "min", "node_modules_path", "x-label", "format"],
  boolean: ["base64", "keep-html", "keep-js", "grid-x", "grid-y", "utc", "bytes"],
  alias: {
    f: "filename"
  },
  default: {
    width: 800,
    height: 300,
    node_modules_path: "./node_modules",
    format: "png"
  }
});

try {
  (function () {
    var stats_data = JSON.parse(_system2.default.stdin.read());
    var repre = stats_data[0];
    var MetricName = repre.Label || "";
    var Namespace = repre.Namespace || "";
    var sort = function sort(datapoints) {
      return datapoints.sort(function (a, b) {
        return a.Timestamp.localeCompare(b.Timestamp);
      });
    };
    var yData = stats_data.map(function (stats) {
      if (stats.Datapoints.length === 0) {
        throw new Error("Datapoints is empty for " + MetricName + " of " + stats.InstanceId + ". There is a possibility InstanceId was wrong.");
      }
      return [stats[(0, _metrics.nsToDimName)(Namespace)]].concat(sort(stats.Datapoints).map(function (e) {
        return (0, _metrics.toY)(e, argv.bytes);
      }));
    });
    var textLabelX = (0, _metrics.to_axis_x_label_text)(repre.Datapoints);

    var data = {
      bindto: "#container",
      data: {
        x: "x",
        columns: [["x"].concat(sort(repre.Datapoints).map(function (e) {
          return _moment2.default.utc(e["Timestamp"]).valueOf();
        }))].concat(yData)
      },
      //colors: {
      //  [axisXLabel]: (Namespace === "AWS/EC2" ? "#f58536" : null),
      //},
      transition: {
        duration: null },
      //
      size: {
        width: argv.width - 8, // heuristic adjustments
        height: argv.height - 16
      },
      axis: {
        y: {
          max: argv.max ? parseInt(argv.max) : (0, _metrics.toMax)(repre),
          min: argv.min ? parseInt(argv.min) : (0, _metrics.toMin)(repre),
          padding: { top: 0, bottom: 0 },
          label: {
            text: Namespace + " " + MetricName + " " + (0, _metrics.toAxisYLabel)(repre, argv.bytes),
            position: "outer-middle"
          }
        },
        //tick: {
        //   format: d3.format('$,'),
        //}
        x: {
          type: "timeseries",
          tick: {
            culling: {
              max: 5
            },
            _format: "%Y-%m-%dT%H:%M:%S",
            format: "%H:%M"
          },
          //padding: {left: 0, right: 0},
          label: {
            text: argv["x-label"] || textLabelX,
            position: "outer-center"
          },
          localtime: !argv.utc
        }
      },
      grid: {
        x: {
          show: argv["grid-x"]
        },
        y: {
          show: argv["grid-y"]
        }
      }
    };

    render(argv, data);
  })();
} catch (ex) {
  _system2.default.stderr.write(ex.stack);
  _system2.default.stderr.write("\n");
  phantom.exit(1);
}

/*
 * Rendering
 */
function render(argv, data) {
  var page = require("webpage").create();
  page.onConsoleMessage = function (msg) {
    return console.log(msg);
  };
  page.viewportSize = {
    width: argv.width ? parseInt(argv.width) : page.viewportSize.width,
    height: argv.height ? parseInt(argv.height) : page.viewportSize.height
  };
  //console.log(JSON.stringify(page.viewportSize))

  var suffix = argv.filename || "." + _system2.default.pid + "-" + new Date().getTime();
  var tmp_html = "./" + suffix + ".html";
  var tmp_js = "./" + suffix + ".js";
  var filename = argv.filename || "./" + suffix + ".png";
  var node_modules_path = argv.node_modules_path;

  _fs2.default.write(tmp_js, "\n  var data = " + JSON.stringify(data) + ";\n  data.axis.y.tick = {format: d3.format(',')};\n  c3.generate(data);\n  ");
  _fs2.default.write(tmp_html, "\n  <html>\n    <link href=\"" + node_modules_path + "/c3/c3.css\" rel=\"stylesheet\" type=\"text/css\"/>\n    <script src=\"" + node_modules_path + "/c3/node_modules/d3/d3.js\" charset=\"utf-8\"></script>\n    <script src=\"" + node_modules_path + "/c3/c3.js\"></script>\n    <body>\n      <div id='container'></div>\n    </body>\n    <script src=\"" + tmp_js + "\"></script>\n  </html>\n  ");

  page.open(tmp_html, function (status) {
    if (!argv.base64) {
      page.render(filename, { format: argv.format });
      _system2.default.stdout.write(filename);
    } else {
      _system2.default.stdout.write(page.renderBase64(argv.format));
    }
    if (!argv["keep-html"]) {
      _fs2.default.remove(tmp_html);
    }
    if (!argv["keep-js"]) {
      _fs2.default.remove(tmp_js);
    }
    phantom.exit();
  });
}