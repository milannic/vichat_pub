var dynamodb = require('./db');

function Reply(fileKey, extension, userID,userName,topicKey, time) { 
	this.key = fileKey;
	this.extension = extension;
	this.userID = userID;
	this.username = userName;
	this.topic = topicKey;
	this.time = time;
};
module.exports = Reply;


/* Add a reply item */
Reply.prototype.save = function (callback) { 
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
			topic: {
				S: this.topic,
			},
			time: {
				N: this.time,
			},
		},
		TableName: 'replies',
		ReturnValues: 'ALL_OLD',
	};
	dynamodb.putItem(params, function(err, data) {
		if (err) {
			console.log(err);
			console.log("error in reply save");
			callback(err);
		}
		else {
			callback(err, data);

		}
	});
};

/* Delete a reply item */
Reply.prototype.remove = function remove(callback) {
	var params = {
	  Key: { // required
		key: {
		  S: this.key,
		},
	  },
	  TableName: 'replies', // required
      ReturnConsumedCapacity: 'TOTAL',
      ReturnItemCollectionMetrics: 'SIZE',
      ReturnValues: 'ALL_OLD',
    };
	dynamodb.deleteItem(params, function(err, data) {
		if (err) {
			callback(err);
		}
		else {
			callback(err, data);           // successful response
		}
	});
};

Reply.removeAllByTopic = function (topickey,callback) {
	var params = {
	  TableName: 'replies', // required
	  Limit: 100,
	  ReturnConsumedCapacity: 'TOTAL',
	  Select: 'ALL_ATTRIBUTES',
	  ScanFilter: {
		topic: {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				{
					S: topickey,
				}
			],
		},
	  },
    };
	dynamodb.scan(params, function(err, data) {
	  	if (err) {
			console.log("scan error");
			console.log(err);
			callback(err);
		}else{
			data.Items.forEach(function(item, index){
				params = {};
				params = {
					Key: { // required
					key: {
					  S: item.key.S,
					},
				  },
				  TableName: 'replies', // required
				  ReturnConsumedCapacity: 'TOTAL',
				  ReturnItemCollectionMetrics: 'SIZE',
				  ReturnValues: 'ALL_OLD',
				};
				dynamodb.deleteItem(params, function(err, data) {
					if (err) {
						console.log("deletion error");
					}
					else {
						console.log("deletion succ");
					}
				});
			});
			callback(null,"operation succeed");
		}
	});
};

/* Get reply by its key */
Reply.getByKey = function get(topicKey, callback) { 
	var params = {
	  TableName: 'replies', // required
	  Limit: 1,
	  ReturnConsumedCapacity: 'TOTAL',
	  Select: 'ALL_ATTRIBUTES',
	  KeyConditions: {
		key: {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				{
					S: this.key,
				}
			],
		},
	  },
    };
	dynamodb.query(params, function(err, data) {
	  	if (err) {
			callback(err);
		}
		
		var replies = [];
		data.Items.forEach(function(item, index) {
			var reply = new Reply(item.key, item.extension, item.userID,item.username,item.topic, item.time);
			replies.push(reply);
		});
		callback(err, replies);
	});
};



/* Get replies by topic key */
Reply.getByTopic = function get(topicKey, callback) { 
	var params = {
	  TableName: 'replies', // required
	  Limit: 100,
	  ReturnConsumedCapacity: 'TOTAL',
	  Select: 'ALL_ATTRIBUTES',
	  ScanFilter: {
		topic: {
			ComparisonOperator: 'EQ',
			AttributeValueList: [
				{
					S: topicKey,
				}
			],
		},
	  },
    };
	dynamodb.scan(params, function(err, data) {
	  	if (err) {
			callback(err);
		}
		
		var replies = [];
		data.Items.forEach(function(item, index) {
			var reply = new Reply(item.key, item.extension, item.userID,item.username,item.topic, item.time);
			replies.push(reply);
		});
		replies.sort(comp);
		for(var i=0;i<replies.length;i++){
			var date=String(replies[i].time.N);
			console.log(date);
			replies[i].time.N = [date.slice(0,4),date.slice(4,6),date.slice(6,8),date.slice(8,10),date.slice(10,12),date.slice(12,14)];
		};
		console.log(replies);
		callback(err, replies);
	});
};

/* Get replies by userID */
Reply.getByUser = function get(userID, callback) { 
	var params = {
	  TableName: 'replies', // required
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
		
		var replies = [];
		data.Items.forEach(function(item, index) {
			var reply = new Reply(item.key, item.extension, item.userID,item.username,item.topic, item.time);
			replies.push(reply);
		});
		replies.sort(comp2);
		for(var i=0;i<replies.length;i++){
			var date=String(replies[i].time.N);
			console.log(date);
			replies[i].time.N = [date.slice(0,4),date.slice(4,6),date.slice(6,8),date.slice(8,10),date.slice(10,12),date.slice(12,14)];
		};
		callback(err, replies);
	});
};

function comp(obj1,obj2){
	if(Number(obj1.time.N)>=Number(obj2.time.N)){return 1;}else{return -1;}
}
function comp2(obj1,obj2){
	if(Number(obj1.time.N)>=Number(obj2.time.N)){return -1;}else{return 1;}
}
