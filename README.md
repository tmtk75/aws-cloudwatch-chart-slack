# README
You can render charts for statistics of CloudWatch,
and can upload chart images to channels of Slack.

<img src="https://59c5872c.jp.kiiapps.com/api/x/s.51e97aa00022-e3da-5e11-3a8c-0a01367a"></img>

## Getting Started
```
$ npm install [--no-spin]
```

```
export AWS_DEFAULT_REGION=ap-northeast-1                                                                                    │~
export AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
export AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
export SLACK_API_TOKEN=bbbb-xxxxxxxxxx-yyyyyyyyyy-zzzzzzzzzzz-aaaaaaaaaa
```

If MacOSX, try this.
```
SLACK_CHANNEL_NAME=#api-test ./bin/slack-cloudwatch-chart <EC2-instance-id>
```

A few seconds later, You can see a chart on the channel.


## Build
```
$ npm run build
```


## Test
```
$ npm test
```


## How it works
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


## How to debug for rendering chart
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


## TODO
- [ ] Timeout

