var AWS=require('aws-sdk');
AWS.config.loadFromPath('./model/aws_config.json');

var dynamodb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

/*dynamodb.describeTable(params, function (err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});*/

module.exports=dynamodb;
