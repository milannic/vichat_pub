
/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var app = express();
var flash = require('express-flash');
//var RedisStore = require('connect-redis')(express);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.use(express.favicon(path.join(__dirname, 'public/pic/favicon.ico'),{ maxAge: 2592000000 }));
app.set('view engine', 'jade');
app.set('env','development');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: 'vichat_2014',cookie: {name: 'vichat',maxAge : new Date(Date.now()+60*60*24*7*1000)}}));
app.use(flash());
app.use(app.router);
routes(app);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
