//this files contains the information about the each application of aws
module.exports={
	cloudfront: {
		player: "We use JWPlayer as the embeded video player and you can change to another",
		bucket: "This directory is where your uploaded video file been distributed by cloudfront",
		bbucket: "This directory is original S3 bucket we used for backup video playing in case of the time inteval of cloudfront and original s3 file",
		logo: "a JPG file,to show the pic when there is no screenshot,acutally in current version, the thumbnail is forced"
	},
	transcode: {
		default_role: 'arn of your default transcode role',
		presetId: 'the default transcode present id',
		pipelineId:'the pipeline ID you created you process the job',
	},
	s3: {
		vbucket: "the name of bucket where you store your video file in",
	},
	dynamodb: {
	
	}
}
