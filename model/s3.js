var AWS=require('aws-sdk');
AWS.config.loadFromPath('./model/aws_config.json');

function S3(name){
	this.s3=new AWS.S3();
}
//list all the buckets
S3.prototype.listBuckets=function(callback){
//S3.listBuckets=function(callback){
	this.s3.listBuckets(function(err,data){
		if(err){
			callback(err);
		}else{
			var buckets=data;
			
			/*for (var index in data.Buckets) {
				//buckets = buckets+data.Buckets[index];
				//console.log(index);
				console.log("Bucket: ", index.Name, ' : ', index.CreationDate);
			}
			*/
			console.log(buckets);
			callback(err,buckets);
		}
	});
};

module.exports=S3;
