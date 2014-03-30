var dynamodb = require('./db');

function Topic(fileKey, extension, userID,userName,title, sns, time, replycnt) { 
	this.key = fileKey;
	this.extension = extension;
	this.userID = userID;
	this.username = userName;
	this.title = title;	
	this.sns = sns;
	this.time = time;
	this.replycnt = replycnt;
};
module.exports = Topic;

/* Create topic table. Table name: t_name */
Topic.createTable = function(t_name,callback) {
	var params = {
	AttributeDefinitions: [ // required
    {
      AttributeName: 'key', 
	  AttributeType: 'S', 
	},
	],
	KeySchema: [ // required
    {
      AttributeName: 'key', // required
      KeyType: 'HASH', // required
    },
	],
	ProvisionedThroughput: { // required
		ReadCapacityUnits: 1, // required
		WriteCapacityUnits: 1, // required
	},
	TableName: t_name, // required
	};
	dynamodb.createTable(params, function(err, data) {
		if (err) {
			callback(err); // an error occurred
		}
		else {
			callback(err,data);           // successful response
		}
	});
};

/* Save a topic item */
Topic.prototype.save = function(callback) { 
	var params = {
		Item: {
			key: {
				S: this.key,
			},
			extension: {
				S: this.extension,
			},
			userID: {
				S: this.userID,
			},
			username: {
				S: this.username,
			},
			title: {
				S: this.title,
			},
			sns: {
				S: this.sns,
			},
			time: {
				N: this.time,
			},
			replycnt: {
				N: this.replycnt,
			},
		},
		TableName: 'topics',
		ReturnValues: 'ALL_OLD',
	};
	dynamodb.putItem(params, function(err, data) {
		if (err) {
			callback(err);
		}
		else {
			callback(err,data);
		}
	});
};

/* Delete a topic item and all its replies */

Topic.prototype.remove = function remove(callback) {
	var topicKey = this.key;
	var params = {
	  Key: { // required
		key: {
		  S: this.key,
		},
	  },
	  TableName: 'topics', // required
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE',
      ReturnValues: 'ALL_OLD',
    };
	dynamodb.deleteItem(params, function(err, data) {
		if (err) {
			console.log(err)
			console.log("deletetopicerror\n");
			callback(err);
		}
		else {
			callback(err, data);           // successful response
			//delete all its replies
		}
	});
};


/* Get a topic by its key */
Topic.prototype.getByKey = function (callback) { 
	var params = {
		TableName: 'topics', // required
		Limit: 100,
		ReturnConsumedCapacity: 'TOTAL',
		Select: 'ALL_ATTRIBUTES',
		ScanFilter: {
			key: {
				ComparisonOperator: 'EQ',
				AttributeValueList: [
				{
					S: this.key,
				}
				],
			},
		}
	};
	dynamodb.scan(params, function(err, data) {
	  	if (err) {
			//count++;
			//console.log(count);
			callback(err);
		}else{
			//console.log('inner data');
			//console.log(data);
			var topics = [];
			data.Items.forEach(function(item, index) {
				var topic = new Topic(item.key, item.extension, item.userID,item.username,item.title,item.sns, item.time, item.replycnt);
				topics.push(topic);
			});
			for(var i=0;i<topics.length;i++){
				var date=String(topics[i].time.N);
				topics[i].time.N = [date.slice(0,4),date.slice(4,6),date.slice(6,8),date.slice(8,10),date.slice(10,12),date.slice(12,14)];
			};
			callback(err, topics);
		}
	});
};

/* Get a limited number of topics */
Topic.getAll = function get(limit, callback) {
	var params = {
	  TableName: 'topics', // required
	  Limit: limit,
	  ReturnConsumedCapacity: 'TOTAL',
	  Select: 'ALL_ATTRIBUTES',
    };
	dynamodb.scan(params, function(err, data) {
	  	if (err) {
			callback(err);
		}
		
		var topics = [];
		data.Items.forEach(function(item, index) {
			var topic = new Topic(item.key, item.extension, item.userID, item.username,item.title, item.sns, item.time, item.replycnt);
			topics.push(topic);
		});
		topics.sort(comp2);
		for(var i=0;i<topics.length;i++){
			var date=String(topics[i].time.N);
			//console.log(date);
			topics[i].time.N = [date.slice(0,4),date.slice(4,6),date.slice(6,8),date.slice(8,10),date.slice(10,12),date.slice(12,14)];
		};
		callback(err, topics);
	});
};

/* Get topics by userID */
Topic.getbyuser = function get(userID, callback) { 
	var params = {
	  TableName: 'topics', // required
	  Limit: 100,
	  ReturnConsumedCapacity: 'TOTAL',
	  Select: 'ALL_ATTRIBUTES',
	  ScanFilter: {
		userID: {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				{
					S: userID,
				}
			],
		},
	  },
    };
	dynamodb.scan(params, function(err, data) {
	  	if (err) {
			callback(err);
		}
		else{
			var topics = [];
			data.Items.forEach(function(item, index) {
				var topic = new Topic(item.key, item.extension, item.userID, item.username,item.title, item.sns, item.time, item.replycnt);
				topics.push(topic);
			});
			topics.sort(comp);
			for(var i=0;i<topics.length;i++){
				var date=String(topics[i].time.N);
				//console.log(date);
				topics[i].time.N = [date.slice(0,4),date.slice(4,6),date.slice(6,8),date.slice(8,10),date.slice(10,12),date.slice(12,14)];
			};
			callback(err, topics);
		}
	});
};


Topic.prototype.incByKey=function(callback){
	var params = {
		TableName: 'topics', // required
		Limit: 100,
		ReturnConsumedCapacity: 'TOTAL',
		Select: 'ALL_ATTRIBUTES',
		ScanFilter: {
			key: {
				ComparisonOperator: 'EQ',
				AttributeValueList: [
				{
					S: this.key,
				}
				],
			},
		}
	};
	dynamodb.scan(params, function(err, data) {
		if(err){
			console.log(err);
			callback(err);
		}else{
			var topics = [];
			data.Items.forEach(function(item, index) {
				var topic = new Topic(item.key, item.extension, item.userID, item.username,item.title, item.sns, item.time, item.replycnt);
				topics.push(topic);
			});
			var cnt = Number(topics[0].replycnt.N);
			cnt++;
			//console.log(cnt);
			//reuse params
			params ={};
			params = {
				Key: { // required
					key: {
						  S: topics[0].key.S,
					},
				},
				TableName: 'topics', // required
				AttributeUpdates: {
				replycnt: {
					Action: 'PUT',
					Value: {
						N: String(cnt),
					},
				},
				},
				ReturnConsumedCapacity: 'TOTAL',
				ReturnItemCollectionMetrics: 'SIZE',
				ReturnValues: 'ALL_NEW',
			};
			//console.log(params);
			dynamodb.updateItem(params, function(err, data) {
				if(err){
					console.log(err);
					console.log("incur key");
					callback(err);
				}else{
					callback(err,data);
				}
			});
		}
	});
};

Topic.prototype.decByKey=function(callback){
	var params = {
		TableName: 'topics', // required
		Limit: 100,
		ReturnConsumedCapacity: 'TOTAL',
		Select: 'ALL_ATTRIBUTES',
		ScanFilter: {
			key: {
				ComparisonOperator: 'EQ',
				AttributeValueList: [
				{
					S: this.key,
				}
				],
			},
		}
	};
	dynamodb.scan(params, function(err, data) {
		if(err){
			console.log(err);
			callback(err);
		}else{
			var topics = [];
			data.Items.forEach(function(item, index) {
				var topic = new Topic(item.key, item.extension, item.userID, item.username,item.title, item.sns, item.time, item.replycnt);
				topics.push(topic);
			});
			var cnt = Number(topics[0].replycnt.N);
			cnt--;
			//console.log(cnt);
			//reuse params
			params ={};
			params = {
				Key: { // required
					key: {
						  S: topics[0].key.S,
					},
				},
				TableName: 'topics', // required
				AttributeUpdates: {
				replycnt: {
					Action: 'PUT',
					Value: {
						N: String(cnt),
					},
				},
				},
				ReturnConsumedCapacity: 'TOTAL',
				ReturnItemCollectionMetrics: 'SIZE',
				ReturnValues: 'ALL_NEW',
			};
			//console.log(params);
			dynamodb.updateItem(params, function(err, data) {
				if(err){
					console.log(err);
					console.log("incur key");
					callback(err);
				}else{
					callback(err,data);
				}
			});
		}
	});
};

	
// from start to recent
function comp(obj1,obj2){
	if(Number(obj1.time.N)>=Number(obj2.time.N)){return 1;}else{return -1;}};

//from recent to start
function comp2(obj1,obj2){
	if(Number(obj1.time.N)>=Number(obj2.time.N)){return -1;}else{return 1;}}

