// @flow
import {system, fs, webpage} from "./phantom-api.js"
import moment from "moment"
import {toMax, toMin, toAxisYLabel, toY, nsToDimName, to_axis_x_label_text} from "./metrics.js"
import dynamodb from "./dynamodb.js"

const argv = require("minimist")(system.args.slice(1), {
  string: ["filename", "width", "height", "max", "min", "node_modules_path",
           "x-label", "format", "bindto", "point-r"],
  boolean: ["base64", "keep-html", "keep-js", "grid-x", "grid-y", "utc", "bytes", "without-image"],
  alias: {
    f: "filename",
  },
  default: {
    width:  800,
    height: 300,
    node_modules_path: "./node_modules",
    format: "png",
    "x-tick-count": 120,
    "x-tick-culling-max": 10,
    "bindto": "container",
    "point-r": 2.5,
  }
});

try {
  const stats_data = JSON.parse(system.stdin.read())
  const repre = stats_data[0]
  const MetricName = repre.Label     || ""
  const Namespace  = repre.Namespace || ""
  const sort = (datapoints) => datapoints.sort((a, b) => a.Timestamp.localeCompare(b.Timestamp))
  const yData = stats_data.map(stats => {
    if (stats.Datapoints.length < 2) {
      throw new Error(`Number of datapoints is less than 2 for ${MetricName} of ${stats.InstanceId}. There is a possibility InstanceId was wrong. ${JSON.stringify(stats)}`)
    }
    let b = dynamodb.mimic(stats)
    return [stats[nsToDimName(Namespace)]].concat(sort(stats.Datapoints)
             .map(e => b ? dynamodb.toY(e) : toY(e, argv.bytes)))
  })
  const textLabelX = to_axis_x_label_text(repre, argv.utc)

  const data = {
    _meta: {StartTime: repre.StartTime, EndTime: repre.EndTime, UTC: argv.utc},
    bindto: `#${argv.bindto}`,
    data: {
      x: "x",
      columns: [
        ["x"].concat(sort(repre.Datapoints).map(e => moment.utc(e["Timestamp"]).valueOf())),
      ].concat(yData),
      //colors: {
      //  [axisXLabel]: (Namespace === "AWS/EC2" ? "#f58536" : null),
      //},
    },
    transition: {
      duration: null,  //
    },
    size: {
      width:  argv.width  - 16,  // heuristic adjustments
      height: argv.height - 16,
    },
    axis: {
      y: {
        max: (argv.max ? parseInt(argv.max) : toMax(repre)),
        min: (argv.min ? parseInt(argv.min) : toMin(repre)),
        padding: {top: 0, bottom: 0},
        label: {
          text: `${Namespace} ${MetricName} ${toAxisYLabel(repre, argv.bytes)}`,
          position: "outer-middle",
        },
        //tick: {
        //   format: d3.format('$,'),
        //}
      },
      x: {
        type: "timeseries",
        tick: {
          count: argv["x-tick-count"],
          culling: {
            max: argv["x-tick-culling-max"],
          },
          _format: "%Y-%m-%dT%H:%M:%S",
          format: "%H:%M",
        },
        //padding: {left: 0, right: 0},
        label: {
          text: (argv["x-label"] || textLabelX),
          position: "outer-center",
        },
        localtime: !argv.utc,
      },
    },
    grid: {
      x: {
        show: argv["grid-x"],
      },
      y: {
        show: argv["grid-y"],
      }
    },
    point: {
      r: argv["point-r"],
    },
  }

  render(argv, data);
} catch (ex) {
  system.stderr.write(ex.stack);
  system.stderr.write("\n");
  phantom.exit(1);
}

/*
 * Rendering
 */
function render(argv: Object, data: Object): void {
  const page = webpage.create()
  page.onConsoleMessage = (msg) => console.log(msg)
  page.viewportSize = {
    width:  argv.width  ? parseInt(argv.width)  : page.viewportSize.width,
    height: argv.height ? parseInt(argv.height) : page.viewportSize.height,
  }
  //console.log(JSON.stringify(page.viewportSize))
  
  const suffix   = argv.filename || `.${system.pid}-${new Date().getTime()}`
  const tmp_html = `./${suffix}.html`
  const tmp_js   = `./${suffix}.js`
  const filename = argv.filename || `./${suffix}.png`
  const node_modules_path = argv.node_modules_path;

  const now = moment().format("YYYY-MM-DD HH:mm:ss Z")
  fs.write(tmp_js, `
  // Generated at ${now}
  var data = ${JSON.stringify(data)};
  data.axis.y.tick = {format: d3.format(',')};
  c3.generate(data);
  `)
  fs.write(tmp_html, `
  <html>
    <!-- Generated at ${now} -->
    <link href="${node_modules_path}/c3/c3.css" rel="stylesheet" type="text/css"/>
    <script src="${node_modules_path}/c3/node_modules/d3/d3.js" charset="utf-8"></script>
    <script src="${node_modules_path}/c3/c3.js"></script>
    <body>
      <div id='${argv.bindto}'></div>
    </body>
    <script src="${tmp_js.split("/").slice(-1)}"></script>
  </html>
  `)
  
  page.open(tmp_html, (status) => {
    //console.error(JSON.stringify(argv))
    if (!argv["without-image"]) {
      page.render(filename, {format: argv.format});
      system.stdout.write(filename)
    } else if (argv.base64) {
      system.stdout.write(page.renderBase64(argv.format))
    }
    if (!argv["keep-html"]) {
      fs.remove(tmp_html);
    }
    if (!argv["keep-js"]) {
      fs.remove(tmp_js);
    }
    phantom.exit()
  })
}
