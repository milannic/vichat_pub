var AWS=require('aws-sdk');
var AWS_settings=require('./aws_settings.js');
AWS.config.loadFromPath('./model/aws_config.json');

function Transcode(){
	this.elastictranscoder = new AWS.ElasticTranscoder({apiVersion: '2012-09-25'});
}

Transcode.prototype.createPipeline=function(callback){
	var params = {
	  InputBucket: AWS_settings.s3.vbucket,
	  Name: 'test_pipe',
	  OutputBucket: AWS_settings.s3.vbucket,
	  Role: AWS_settings.transcode.default_role,
	  Notifications: {
		Completed: '',
		Error: '',
		Progressing: '',
		Warning: '',
	  }
	};
	this.elastictranscoder.createPipeline(params, function(err, data) {
	  if (err){
		console.log(err, err.stack); // an error occurred
		callback(err);
	  } 
	  else{
		console.log(data); 
		callback(err,data);
	  }              // successful response
	});
};
Transcode.prototype.createJob=function(inname,inext,callback){
	var inkey = inname+inext;
	var okey = inname+'.mp4';
	var params = {
	  Input: {
		Key: inkey,
	  },
	  OutputKeyPrefix: 'vtrans/',
	  Outputs: [
		  {
			  Key : okey,
			  PresetId: AWS_settings.transcode.presetID,
			  ThumbnailPattern: inname+"-{count}", 
		  }
	  ],
	  PipelineId:AWS_settings.transcode.pipelineId,
	};

	this.elastictranscoder.createJob(params, function(err, data) {
	  if (err){
		console.log(err, err.stack); // an error occurred
		callback(err);
	  } 
	  else{
		console.log(data); 
		callback(err,data);
	  }              // successful response
	});
};
module.exports=Transcode;
