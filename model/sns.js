var AWS=require('aws-sdk');
AWS.config.loadFromPath('./model/aws_config.json');

function SNS(){
	this.sns=new AWS.SNS();
}
//list all the buckets
SNS.prototype.createTopic=function(topic_name,callback){
	var t_name = topic_name;
	var params = {
	  Name: t_name, // required
	};
//S3.listBuckets=function(callback){
	this.sns.createTopic(params,function(err,data){
		if(err){
			console.log(err);
			callback(err);
		}else{
			callback(err,data);
		}
	});
};
SNS.prototype.setTopicAttributes=function(topic_arn,uname,title,callback){
	var message=uname+'\'s vichat topic '+title;
	var params = {
	  AttributeName: 'DisplayName', // required
	  TopicArn: topic_arn, // required
	  AttributeValue: message,
	};
//S3.listBuckets=function(callback){
	this.sns.setTopicAttributes(params,function(err,data){
		if(err){
			console.log(err);
			callback(err);
		}else{
			callback(err,data);
		}
	});
};


SNS.prototype.subscribe=function(email,t_arn,callback){
	//var email_address = 'meiyan.wang08@gmail.com';
	var email_address = email;
	var params = {
	  Protocol: 'email', // required
	  TopicArn: t_arn, // required
	  Endpoint: email_address,
	};
//S3.listBuckets=function(callback){
	this.sns.subscribe(params,function(err,data){
		if(err){
			console.log("why i am failed");
			console.log(err);
			callback(err);
		}else{
			callback(err,data);
		}
	});
};

SNS.prototype.publish=function(tarn,ttitle,tmessage,callback){
	var params = {
	  Message: tmessage, // required
	  Subject: ttitle,
	  TopicArn: tarn,
	};
	this.sns.publish(params,function(err,data){
		if(err){
			console.log(err);
			callback(err);
		}else{
			callback(err,data);
		}
	});
};

SNS.prototype.listSubscriptionsByTopic=function(t_arn,n_token,callback){
	var params = {
	  TopicArn: t_arn, // required
	  NextToken: n_token,
	};
	this.sns.listSubscriptionsByTopic(params,function(err,data){
		if(err){
			console.log(err);
			callback(err);
		}else{
			callback(err,data);
		}
	});
};

module.exports=SNS;
