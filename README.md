# README  [![Build Status](https://circleci.com/gh/tmtk75/aws-cloudwatch-chart-slack.png)](https://circleci.com/gh/tmtk75/aws-cloudwatch-chart-slack)
This module is a chart renderer and uploader to Slack.
It's easy to share charts of CloudWatch on Slack.
You can render charts for datapoints of CloudWatch, and can upload chart images to channels of Slack.

<img width="70.7%" src="https://59c5872c.jp.kiiapps.com/api/x/s.51e97aa00022-e3da-5e11-3a8c-0a01367a"></img>

## Getting Started
```
$ npm install [--no-spin]
```

Set four environment variables.
```
export AWS_DEFAULT_REGION=ap-northeast-1                                                                                    │~
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export SLACK_API_TOKEN=bbbb-xxxxxxxxxx-yyyyyyyyyy-zzzzzzzzzzz-aaaaaaaaaa
```

Try this, of course change channel name as you have. 
```
SLACK_CHANNEL_NAME=#api-test ./bin/slack-cloudwatch-chart <EC2-instance-id>
```

A few seconds later, You can see a chart on the channel.


## Hubot Integration
Please add the below snippet.
```coffee-script
chart = require "aws-cloudwatch-chart-slack"
module.exports = (robot) ->
  robot.respond /cloudwatch (.+)/i, (msg) ->
    [id, params...] = msg.match[1].split(" ").map (e) -> e.trim()
    console.log "cloudwatch: #{id}"
    console.log "message.room: #{msg.message.room}"

    chart.slack.post "#{msg.room}", [id, params...], (err, file)->
      if (err)
        console.error err.stack
        msg.send err.message
```
<img width="70.7%" src="https://59c5872c.jp.kiiapps.com/api/x/s.51e97aa00022-e3da-5e11-2acc-0fa6c227"></img>

For arguments and available options, see [here](https://github.com/tmtk76/aws-cloudwatch-chart-slack/blob/master/bin/slack-cloudwatch-chart#L1://github.com/tmtk75/aws-cloudwatch-chart-slack/blob/master/bin/slack-cloudwatch-chart#L5).


## How to give arguments
By default, metric is `CPUUtilization` and namespace is `AWS/EC2`.
```
cloudwatch i-12345678
```

You can give metric and namespace at 2nd and 3rd arguments.
```
cloudwatch main-db FreeableMemory AWS/RDS
```

Multiple IDs can be given seperated with `,`.
```
cloudwatch i-xyza5678,i-abcd1234
```

`--region` is to specify a AWS region.
```
cloudwatch i-abcd4567 --region us-west-2
```

`--statistics` has `Maximum`, `Minimum`, `Average`, `Sum` and `SampleCount`.
```
cloudwatch i-abcd1234 --statistics Maximum
```

Duration and period also can be given with `--duration` and `period` options.
```
cloudwatch i-abcd1234 --duration 3days --period 1hour
```

Regarding AWS/EC2, you can filter EC2 instances with some tags.
Next example is that `site` is `dev` and `role` is `webapp` or `db`.
```
cloudwatch "tag:site=dev,role=webapp|db"
```


## Development
```
$ gulp
```
The gulp default task is to complie watching change of sources.
`src/*.js` are compiled and saved under `dist`.

```
$ npm test
or
$ gulp test
```
The 1st one is to run test once, the 2nd one watches change of sources.

```
$ npm run lint
```
Linting with ESLint.

```
$ npm run typecheck
```
Run type check with [flow](http://flowtype.org/).


### How it works
```
dist/index.js
    |
    v
    dist/render.js    Generate a png file
        |
        v
        dist/print-stats.js         Retrieve stats with aws-sdk CloudWatch.
        |
        | stdin
        v
        spawn: dist/gen-chart.js    Generate a .js file for c3 and a .html file.
        |                           Load the .html file with phantomjs and render a chart as .png
        | filename
        |
    +<--+
    |
    v
    dist/upload.js    Read file.
    |                 Upload it to Slack with a REST API.
    |
    v
    unlink the file
```


## Sub modules
### Print statistics
Print stats using aws-sdk. Environment variables for AWS are referred.
```
$ node ./dist/print-stats.js [options] <instance-id>
[{"Namespace":"AWS/EC2","InstanceId":"i-003bb906","Label":"CPUUtilization","Respon...
```

### Generating chart image in .png
Generate a png image and show the path.
```
$ cat <stats-file> | phantomjs ./dist/gen-chart.js
./.97516-1454216914841.png
```

### Render
`render.js` calls `print-stats.js` and `gen-chart.js`.
```
$ node dist/render.js <instance-id>
./.97516-1454216914841.png
```

### Upload to a channel of Slack
```
$ node dist/upload.js ./.97516-1454216914841.png
{ ok: true,
  file:
  ...
```


## How to debug for rendered charts
You can prevent removing temporary files with two options.
```
$ node dist/render.js i-003bb906 --filename a.png --keep-html --keep-js
a.png
```

The options preserve temporary files `a.png.html` and `a.png.js`.
You can open the html file and see the chart rendered by c3.js.
```
$ open a.png.html
```

## Contribution
1. Fork me (<https://github.com/tmtk75/aws-cloudwatch-chart-slack>)
1. Create your feature branch (git checkout -b my-new-feature)
1. Commit your changes (git commit -am 'Add some feature')
  1. Pass `npm run typecheck`
  1. Pass `npm run lint`
1. Add test cases for your changes
  1. Pass `npm test`
1. Push to the branch (git push origin my-new-feature)
1. Create your new pull request


## License

[MIT License](http://opensource.org/licenses/MIT)

