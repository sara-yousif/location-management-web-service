
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

var client = new pg.Client({
    user: "glwrbiudmqnwsp",
    password: "J1ihQDJmR4uEmAHLeiVJRPwLgU",
    database: "d2hibm48u1o95j",
    port: 5432,
    host: "ec2-54-204-35-114.compute-1.amazonaws.com",
    ssl: true
}); 
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


app.get('/', function(req, res){
//	 client.query("SELECT NOW() as when", function(err, result) {
//       //  console.log("Row count: %d",result.rows.length);  // 1
//        // console.log("Current year: %d", result.rows[0].when.getFullYear());
//	 });
//	 client.query("INSERT INTO winner_info(contest_id, name, statement) VALUES($1, $2, $3)",
//	            ["4", "sinichi", "Perfect!!"]);
	 
	  var query = client.query('SELECT MAX(contest_id) FROM winner_info');

	  query.on('row', function(row) {
		  var x = row.max;
		//  console.log(x);
		  var query = client.query('SELECT * FROM winner_info where contest_id ='+x);

		  query.on('row', function(row) {
//	    console.log(JSON.stringify(row));
		  var name= row.name;
		  var id= row.contest_id;
		//  console.log(name);
		//  console.log(id);
		  res.send('Ohayou Gozaimasu  '+ name + ' chan    id ' + id + '   ' + row.statement);
	  });
});
});

app.get('/', routes.index);
app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
 // console.log('Express server listening on port ' + app.get('port'));

	});


