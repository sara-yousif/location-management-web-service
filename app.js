
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var pg = require('pg');
var conString = "postgres://glwrbiudmqnwsp:J1ihQDJmR4uEmAHLeiVJRPwLgU@ec2-54-204-35-114.compute-1.amazonaws.com:5432/d2hibm48u1o95j";

var client = new pg.Client(conString);
client.connect();
// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

////pg.connect('', function(err, client) {
//	  var query = client.query('SELECT * FROM winner_info');
//
//	  query.on('row', function(row) {
//	    console.log(JSON.stringify(row));
//	  });
//	//});

client.connect(function(err) {
	  if(err) {
	    return console.error('could not connect to postgres', err);
	  }
	});
//
//app.get('/', function(req, res){
//	  client.query('SELECT * FROM winner_info', function(err, rows) { 
//	 //   res.render('users', {users: docs, title: 'App42PaaS Express PostgreSQL Application'});
//		  res.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
//	        console.log('Done!!');  
//	  });
//	});
//
//function testDate(onDone) {
//    pg.connect(conString, function(err, client) {
//        client.query("SELECT * from winner_info", function(err, result) {
//            console.log("Row ",result.rows);  // 1
//
//            onDone();
//        });
//    });
//}

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  pg.connect(conString, function(err, client,done) {
	//  console.log("INSIDE CONNECT"); 
  client.query("SELECT * FROM winner_info", function(err, result) {
	    done();
	      if(err) return console.error(err);
      console.log("Row ",result.rows);  // 1
  });
  });
});
