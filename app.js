
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var app = express();
var mysql      = require('mysql');
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

var connection = mysql.createConnection(//'postgres://glwrbiudmqnwsp:J1ihQDJmR4uEmAHLeiVJRPwLgU@ec2-54-204-35-114.compute-1.amazonaws.com:5432/d2hibm48u1o95j');
		{
			
//				  host     : 'localhost',
//				  user     : 'root',
//				  password : 'root',
//				  database : 'test',
//				  port : '3306'
//				});
			
	  host     : 'ec2-54-204-35-114.compute-1.amazonaws.com',
	  user     : 'glwrbiudmqnwsp',
	  password : 'J1ihQDJmR4uEmAHLeiVJRPwLgU',
	  database : 'd2hibm48u1o95j',
	  port : '5432'
	});
console.log('Done1');
	connection.connect();
	
	app.get('/', function(request, response) {
		 console.log('try!!');
	    connection.query('SELECT * from winner_info;', function(err, rows, fields) {
	        if (err) {
	            console.log('error: ', err);
	            throw err;
	        }
	      
	        console.log('Done2');
	        response.send(['Hello World!!!! HOLA MUNDO!!!!', rows]);
	    });
	});
	 
app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
