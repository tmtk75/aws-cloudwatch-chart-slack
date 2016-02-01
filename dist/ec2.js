"use strict";

var AWS = require("aws-sdk");

var params = {
  //DryRun: true || false,
  //Filters: [
  //  {
  //    Name: 'STRING_VALUE',
  //    Values: [
  //      'STRING_VALUE',
  //      /* more items */
  //    ]
  //  },
  //  /* more items */
  //],
  InstanceIds: ["i-003bb906", "i-0935c111", "i-1c41aa18"]
};

//MaxResults: 0,
//NextToken: 'STRING_VALUE'
AWS.config.update({ region: "ap-northeast-1" });
var ec2 = new AWS.EC2();
ec2.describeInstances(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else console.log(JSON.stringify(data)); // successful response
});