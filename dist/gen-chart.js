"use strict";

var _phantomApi = require("./phantom-api.js");

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _metrics = require("./metrics.js");

var _dynamodb = require("./dynamodb.js");

var _dynamodb2 = _interopRequireDefault(_dynamodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = require("minimist")(_phantomApi.system.args.slice(1), {
  string: ["filename", "width", "height", "max", "min", "node_modules_path", "x-label", "format"],
  boolean: ["base64", "keep-html", "keep-js", "grid-x", "grid-y", "utc", "bytes"],
  alias: {
    f: "filename"
  },
  default: {
    width: 800,
    height: 300,
    node_modules_path: "./node_modules",
    format: "png",
    "x-tick-count": 120,
    "x-tick-culling-max": 10
  }
});

try {
  (function () {
    var stats_data = JSON.parse(_phantomApi.system.stdin.read());
    var repre = stats_data[0];
    var MetricName = repre.Label || "";
    var Namespace = repre.Namespace || "";
    var sort = function sort(datapoints) {
      return datapoints.sort(function (a, b) {
        return a.Timestamp.localeCompare(b.Timestamp);
      });
    };
    var yData = stats_data.map(function (stats) {
      if (stats.Datapoints.length < 2) {
        throw new Error("Number of datapoints is less than 2 for " + MetricName + " of " + stats.InstanceId + ". There is a possibility InstanceId was wrong.");
      }
      var b = _dynamodb2.default.mimic(stats);
      return [stats[(0, _metrics.nsToDimName)(Namespace)]].concat(sort(stats.Datapoints).map(function (e) {
        return b ? _dynamodb2.default.toY(e) : (0, _metrics.toY)(e, argv.bytes);
      }));
    });
    var textLabelX = (0, _metrics.to_axis_x_label_text)(repre.Datapoints, argv.utc);

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
        width: argv.width - 16, // heuristic adjustments
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
            count: argv["x-tick-count"],
            culling: {
              max: argv["x-tick-culling-max"]
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
  _phantomApi.system.stderr.write(ex.stack);
  _phantomApi.system.stderr.write("\n");
  phantom.exit(1);
}

/*
 * Rendering
 */
function render(argv, data) {
  var page = _phantomApi.webpage.create();
  page.onConsoleMessage = function (msg) {
    return console.log(msg);
  };
  page.viewportSize = {
    width: argv.width ? parseInt(argv.width) : page.viewportSize.width,
    height: argv.height ? parseInt(argv.height) : page.viewportSize.height
  };
  //console.log(JSON.stringify(page.viewportSize))

  var suffix = argv.filename || "." + _phantomApi.system.pid + "-" + new Date().getTime();
  var tmp_html = "./" + suffix + ".html";
  var tmp_js = "./" + suffix + ".js";
  var filename = argv.filename || "./" + suffix + ".png";
  var node_modules_path = argv.node_modules_path;

  _phantomApi.fs.write(tmp_js, "\n  var data = " + JSON.stringify(data) + ";\n  data.axis.y.tick = {format: d3.format(',')};\n  c3.generate(data);\n  ");
  _phantomApi.fs.write(tmp_html, "\n  <html>\n    <link href=\"" + node_modules_path + "/c3/c3.css\" rel=\"stylesheet\" type=\"text/css\"/>\n    <script src=\"" + node_modules_path + "/c3/node_modules/d3/d3.js\" charset=\"utf-8\"></script>\n    <script src=\"" + node_modules_path + "/c3/c3.js\"></script>\n    <body>\n      <div id='container'></div>\n    </body>\n    <script src=\"" + tmp_js + "\"></script>\n  </html>\n  ");

  page.open(tmp_html, function (status) {
    if (!argv.base64) {
      page.render(filename, { format: argv.format });
      _phantomApi.system.stdout.write(filename);
    } else {
      _phantomApi.system.stdout.write(page.renderBase64(argv.format));
    }
    if (!argv["keep-html"]) {
      _phantomApi.fs.remove(tmp_html);
    }
    if (!argv["keep-js"]) {
      _phantomApi.fs.remove(tmp_js);
    }
    phantom.exit();
  });
}