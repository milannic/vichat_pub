var S3=require('../model/s3');
var SNS=require('../model/sns');
var Transcode=require('../model/transcode')
var AWS_settings=require('../model/aws_settings.js');
var Topic=require('../model/topic');
var Reply=require('../model/reply');
var trans = new Transcode();
var sns = new SNS();


//function to check if it has logged in.

function checkNotLogin(req,res,next){
	//console.log(req.session.user);
	//console.log(req.session);
	if(!req.session.user){
		console.log("I was here, why the I am always check not login");
		if(req.session.cookie.originalMaxAge<0){
			console.log("clear cookies");
			req.session.cookie.originalMaxAge = 60*60*24*7*1000;
			req.session.cookie._expires = new Date(Date.now()+60*60*24*7*1000);
			//res.clearCookie('vichat', { path: '/' });
			return res.render('index',{
				title: "Welcome To Vichat",
				logo: AWS_settings.cloudfront.logo,
				player: AWS_settings.cloudfront.player,
				bucket: AWS_settings.cloudfront.bucket,
				bbucket: AWS_settings.cloudfront.bbucket});
		}else{
		//req.flash('info',"you must login in to visit your page");
			return res.render('index',{
				title: "Welcome To Vichat",
				logo: AWS_settings.cloudfront.logo,
				player: AWS_settings.cloudfront.player,
				bucket: AWS_settings.cloudfront.bucket,
				bbucket: AWS_settings.cloudfront.bbucket});
		}
	} 
	else{
		next();
	}
	//console.log(req.session);
}



module.exports = function(app){

// log related
/*==============================================*/

	app.post('/login',function(req,res){
		//console.log("facebook id:"+req.body.facebookid);
		//console.log("facebook name:"+req.body.facebookname);
		//console.log("facebook img:"+req.body.facebookimg);
		if(req.body.facebookid){
			req.session.user={};
			req.session.user.id=req.body.facebookid;
			req.session.user.name=req.body.facebookname;
			req.session.user.img=req.body.facebookimg;
			req.session.mobiletype=req.body.mobiletype;
			res.redirect('/');
		}else{
			res.redirect('/');
		}
	});

	app.get('/logout',function(req,res){
		if(req.session.user){
			req.session.user=null;
		}
		return res.render('index',{
			title: "Welcome To Vichat",
			logo: AWS_settings.cloudfront.logo,
			player: AWS_settings.cloudfront.player,
			bucket: AWS_settings.cloudfront.bucket,
			bbucket: AWS_settings.cloudfront.bbucket});
	});

/*==============================================*/

	/* Home page: list all topics */
	app.get('/',checkNotLogin,function(req, res){
		Topic.getAll(100, function(err, topics) {
			if(err) {
				console.log(err);
				res.end('error');
			}
			//console.log(req.session);
			//console.log(AWS_settings.cloudfront.bucket);
			res.render('home', {
				title: 'ViChat-Home',
				cuser: req.session.user,
				bucket: AWS_settings.cloudfront.bucket,
				bbucket: AWS_settings.cloudfront.bbucket,
				player: AWS_settings.cloudfront.player,
				topics: topics,
			});
		});
	});

	app.get('/home', checkNotLogin,function(req,res){
		//console.log(req.session);
		Topic.getAll(20, function(err, topics) {
			if(err) {
				console.log(err);
				res.end('error');
			}
			//console.log(AWS_settings.cloudfront.bucket);
			res.render('home', {
			title: 'ViChat-Home',
			cuser: req.session.user,
			bucket: AWS_settings.cloudfront.bucket,
			bbucket: AWS_settings.cloudfront.bbucket,
			player: AWS_settings.cloudfront.player,
			topics: topics,
			});
		});
	});

	app.get('/upload',checkNotLogin,function(req,res){
		res.render('upload',{
			title: "Upload Your File To Vechat",
			cuser: req.session.user,
		});
	});

	/* User page */
	app.get('/u/:userid', checkNotLogin,function(req,res){
		var uname='';
		Topic.getbyuser(req.params.userid,function(err,topics){
			if(err){
				console.log(err);
				res.end('404 no such user');
			}else{
				console.log("this is get by user");
				Reply.getByUser(req.params.userid,function(err,replies){
					if(err){
						console.log(err);
						res.end('error');
					}else{
						if((topics.length+replies.length)!=0){
							uname= (topics.length>0)?topics[0].username.S:replies[0].username.S;
							res.render('user', {
								title: String(uname)+"'s personal page",
								username: String(uname),
								userid: req.params.userid,
								cuser: req.session.user,
								bucket: AWS_settings.cloudfront.bucket,
								bbucket: AWS_settings.cloudfront.bbucket,
								player: AWS_settings.cloudfront.player,
								topics: topics,
								replies: replies,
							});
						}else{
							if(req.session.user.id!=req.params.userid){
								res.end('404 No Such User\n');
							}else{
								uname = req.session.user.name;
								res.render('user', {
									title: String(uname)+"'s personal page",
									username: String(uname),
									userid: req.params.userid,
									cuser: req.session.user,
									bucket: AWS_settings.cloudfront.bucket,
									bbucket: AWS_settings.cloudfront.bbucket,
									player: AWS_settings.cloudfront.player,
									topics: topics,
									replies: replies,
								});
							}
						}
					}
				});
			}
		});
	});

	app.get('/t/:topicid',checkNotLogin,function(req,res){
		var topic = new Topic(req.params.topicid,'','','','','','','','');
		topic.getByKey(function(topicerr,topicdata){
			if(topicerr||topicdata.length==0){console.log(topicdata);res.end("the page you require does not exist");}
			else{
				//console.log(topicdata);
				Reply.getByTopic(req.params.topicid, function(replyerr,replydata){
					if(replyerr){
						//console.log(replyerr);
						//res.end('reply error');
						res.render('topic',{
							title: topicdata[0].title.S,
							cuser: req.session.user,
							tid: req.params.topicid,
							logo: AWS_settings.cloudfront.logo,
							player: AWS_settings.cloudfront.player,
							bucket: AWS_settings.cloudfront.bucket,
							bbucket: AWS_settings.cloudfront.bbucket,
							tdata: topicdata,
							rdata: ''
						});
					}else{
						//console.log(replydata);
						//console.log(replydata.length)
						res.render('topic',{
							title: topicdata[0].title.S,
							cuser: req.session.user,
							tid: req.params.topicid,
							logo: AWS_settings.cloudfront.logo,
							player: AWS_settings.cloudfront.player,
							bucket: AWS_settings.cloudfront.bucket,
							bbucket: AWS_settings.cloudfront.bbucket,
							tdata: topicdata,
							rdata: replydata
						});
					}
				});	
				//res.end('hah');
			}
		});
	});

	app.post('/reply', checkNotLogin,function(req, res){
	  res.render('reply', {
		  title: "Reply",
		  cuser: req.session.user,
		  bindingtopic: req.body.topic
	  });
	});

// the function to process when a topic is successfully uploaded.
	app.post('/uploadsucc', function(req, res){
		var transcoderesult = 'transcode plugin not configurated';
		var snscreateresult = 'sns topic plugin not configurated';
		var snssubscriberesult = 'sns subscribe plugin not configurated';
		var databaseresult = 'database plugin not configurated';
		var nextpage = req.body.fname;

		//console.log(req.body);
		trans.createJob(req.body.fname,req.body.fext,function(transerr,transdata){
			if(transerr){
				console.log(transerr);
				transcoderesult='transcoder error';
			}else{
				transcoderesult='transcoder job created';
			}
		});
		sns.createTopic(req.body.fname,function(snserr,snsdata){
			if(snserr){
				console.log(snserr); // an error occurred
				snscreateresult = 'SNS Topic configuration error';
				topic = new Topic(req.body.fname,req.body.fext,req.body.uid,req.body.uname,req.body.ftitle,"na",req.body.cdate,'0');
				topic.save(function(dberr,dbdata) {
					if(dberr) {
						console.log(err);
						databaseresult = 'Database Access Wrong';
						res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
					}
					else {
						databaseresult = 'Database Access Succeed';
						res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
					}
				});
			}else{
				snscreateresult = 'SNS Topic Create Succeed';
				sns.setTopicAttributes(snsdata.TopicArn,req.body.uname,req.body.ftitle,function(snsseterr,snssetdata){
					if(snsseterr){
						topic = new Topic(req.body.fname,req.body.fext,req.body.uid,req.body.ftitle,"na",req.body.cdate,'0');
						topic.save(function(dberr,dbdata) {
							if(dberr) {
								databaseresult = 'Database Access Wrong';
								res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
							}
							else {
								databaseresult = 'Database Access Succeed';
								res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
							}
						});
					}else{
						snssubscriberesult = 'SNS Topic Set Succeed.'
						topic = new Topic(req.body.fname,req.body.fext,req.body.uid,req.body.uname,req.body.ftitle,snsdata.TopicArn,req.body.cdate,'0');
						topic.save(function(dberr,dbdata) {
							if(dberr) {
								databaseresult = 'Database Access Wrong';
							}
							else {
								databaseresult = 'Database Access Succeed';
							}
							if(req.body.snsnoti=='true'){
								sns.subscribe(req.body.uemail,snsdata.TopicArn,function(suberr,subdata){
									if(suberr){
										snssubscriberesult = 'Subscribe Creating Error';
										res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
									}else{
										snssubscriberesult = 'Subscribe Creating Succeed';
										res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
									}
								});
							}else{
								res.render('report',{trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage})
							}
						});
					}
				});
			}
		});

	});
/*
	app.post('/replysucc', function(req, res){
		console.log(req.body);
		res.end("test");
	});
*/
// the function to process when a reply is successfully uploaded.
	app.post('/replysucc', function(req, res){
		var transcoderesult = 'transcode plugin not configurated';
		var nosuchtopic = ''
		var snscreateresult = 'sns publish not required';
		var snssubscriberesult = 'sns subscribe plugin not configurated';
		var databaseresult = 'database plugin not configurated';
		var nextpage = req.body.topic;
		//console.log(req.body);
		//confirm that the topic exists
		var topic = new Topic(req.body.topic,'','','','','','','','');
		topic.getByKey(function(topicerr,topicdata){
			if(topicerr){
				console.log(topicerr);
				nosuchtopic = "No Such Topic, I don't know where you are from ";
				res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
			}else{
				trans.createJob(req.body.fname,req.body.fext,function(transerr,transdata){
					if(transerr){
						console.log(transerr);
						transcoderesult='Transcoder Error';
					}else{
						transcoderesult='Transcoder Job Created';
					}
				});
				topic.incByKey(function(err,data){
					if(err){
						console.log(err);
						//res.write('inc insert error\n');
					}else{
						//res.write('inc insert succ\n');
					}
				});
				// add new reply to the replies table
				reply = new Reply(req.body.fname,req.body.fext,req.body.uid,req.body.uname,req.body.topic,req.body.cdate);
				reply.save(function(replyerr,replydata) {
					if(replyerr) {
						console.log(replyerr);
						databaseresult = "Database Access Error";
						res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
					}
					else {
						//console.log(replydata);
						databaseresult = "Database Access Succeed";
						//subscribe
						var message = "The topic you involved in has a new reply,please go to http://vichat.info/t/"+req.body.topic+" to view";
						//if the user select notify option
						if(req.body.snsnoti=='true'){
							//subscribe for this user by its facebook email
							//console.log(topicdata[0]);
							sns.listSubscriptionsByTopic(topicdata[0].sns.S,"",function(checksuberr,checksubdata){
								var repeat=0;
								if(checksuberr){
									console.log(checksuberr)
								}else
								{
									//console.log(checksubdata);
									for(var i = 0; i < checksubdata.Subscriptions.length;i++){
										if(checksubdata.Subscriptions[i].Endpoint==req.body.uemail){
											console.log(checksubdata.Subscriptions[i].Endpoint);
											console.log('find repeat record');
											if(checksubdata.Subscriptions[i].SubscriptionArn=='PendingConfirmation'){repeat=1;}
											break;
										}
									}
								}
								if(repeat==1){
									sns.subscribe(req.body.uemail,topicdata[0].sns.S,function(suberr,subdata){
										//console.log("i am here");
										if(suberr){
											res.write(JSON.stringify(suberr));
											snssubscriberesult = "Subscribe Creating Error";
											res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
										}else{
											snssubscriberesult = "Subscribe Creating Succeed";
											sns.publish(topicdata[0].sns.S,'new reply available',message,function(puberr,pubdata){
												//console.log("i am there");
												if(puberr){
													console.log(puberr);
													res.write("publish sns error\n");
												}else{
													//console.log(pubdata);
													res.write("publish succ\n");
												}
												res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
											});
										}
									})
								}else{
									sns.publish(topicdata[0].sns.S,'new reply available',message,function(puberr,pubdata){
										//console.log("i am there");
										if(puberr){
											console.log(puberr);
											snscreateresult = 'Sns Publish Error';
										}else{
											//console.log(pubdata);
											snscreateresult = 'Sns Publish Succeed';
										}
										res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
									});
								}
							}
							);
							//then publish a message to notice that the topic have a reply
						}else{
							//then publish a message to notice that the topic have a reply
							sns.publish(topicdata[0].sns.S,'new reply available',message,function(puberr,pubdata){
								if(puberr){
									console.log(puberr);
									snscreateresult = 'Sns Publish Error';
								}else{
									//console.log(pubdata);
									snscreateresult = 'Sns Publish Succeed';
								}
								res.render('report',{nt: nosuchtopic,trans: transcoderesult,snscreate: snscreateresult,subscribe: snssubscriberesult,db: databaseresult, np: nextpage});
							});
						}
					}
				});
			}
		});
	});

	app.post('/replydelete', checkNotLogin,function(req, res){
		if(req.body.cuser!=req.session.user.id){
			res.end("you don't have the permission");
		}else{
			var reply = new Reply(req.body.rid,null,null,null,null,null);
			reply.remove(function(err,data) {
				if(err) {
					console.log(err);
					res.end('error');
				}
				else {
					//console.log('data is ');
					//console.log(data);
					var topic = new Topic(req.body.tid,'','','','','','','','');
					topic.decByKey(function(decerr,decdata){
						if(decerr){
							console.log(decerr);
							res.redirect('/t/'+req.body.tid);
						}else{
							res.redirect('/t/'+req.body.tid);
						}
					});
				}
			});
		}
	});

	app.post('/removetopic', checkNotLogin,function(req, res){
		//console.log(req.body);
		if(req.body.cuser!=req.session.user.id){
			//console.log(req.body.cuser);
			//console.log(req.session.user.id);
			res.redirect("you don't have the permission");
		}else{
			var topic = new Topic(req.body.tid,null,null,null,null,null,null);
			topic.remove(function(terr,tdata){
				if(terr){
					console.log(terr);
					res.redirect("/");
				}else{
					Reply.removeAllByTopic(req.body.tid,function(err,data){
						if(err) {
							console.log(err);
							//res.write('reply deletion error');
						}
						else {
							//console.log(data);
							//res.write(JSON.stringify(data));
						}
					});
					var message = "the topic named " + req.body.tname + "has been deleted by the host."
					sns.publish(req.body.sns,'Topic Deleted',message,function(puberr,pubdata){
						if(puberr){
							console.log(puberr);
							res.redirect("/");
						}else{
							//console.log(pubdata);
							res.redirect("/");
						}
					});
				}
			});
		}
	});
	




