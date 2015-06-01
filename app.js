var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
//  , startContest = require('./routes/startContest')
//   , startFinals = require('./routes/startFinals')
//    , pickWinner = require('./routes/pickWinner')
  , http = require('http')
  , path = require('path')
  , request = require('request');
var parseString = require('xml2js').parseString;
var app = express();
var pg = require('pg');
var schedule = require('node-schedule');

var Contest = {
        current_msg:'',
        current_state:'',
        winner_name:'',
        id:1
        };

var Message = { 
        start_msg:'',
        final_msg:'',
        winner_msg:''
};


//var client = new pg.Client({
//    user: "ykzikswhqjjikg",
//    password: "HkQfFZqdEM9DdxNOwKIOJMDsN2",
//    database: "dbkp82368tfgup",
//    port: 5432,
//    host: "ec2-54-83-201-96.compute-1.amazonaws.com",
//    ssl: true
//}); 
//client.connect();

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
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/', routes.index);
app.get('/users', user.list);


app.post('/try', function(req, res){
    console.log(req.body);
});
//////////////////////////////////////////////////////////Get time////////////////////////////////////////////
app.get('/time', function(req, res){
function timing (){
    request({
        method: "GET",
        url: "http://www.earthtools.org/timezone-1.1/24.3671/53.9758",
        
            json:true 
        }, function (err,res,body){
            
            parseString(body, function (err, result) {
                var timeresult = result.timezone.localtime[0];
                console.log(timeresult);
                var mytime= timeresult.split(" ");
                console.log(mytime[3]);
                
                var clock= mytime[3].split(":");
                var hours = clock[0];
                console.log(hours);
                var min = clock[1];
                console.log(min);
                var sec = clock[2];
                console.log(sec);
                
                
            });
            
        });    
}
timing();
});



//////////////////////////////////////////////////////////EVENT BROKER////////////////////////////////////////////
function eventBroker (callback){
    request({
        method: "POST",
        url: "http://eb.dexit.co/events/d0c178c7-0b7b-4785-8828-ab6f65edd136/trigger",
          
        headers: {
               "X-Auth-Key": '4a45f293-2aed-42cd-b6a9-acb5a060f8a2'
                },
            json:true 
        }, function (err,res,body){
            console.log("Event Broker is triggered");
            var msg2 = 6;
            callback(msg2);
            
        });    
}



//////////////////////////////////////////////////////////GENERATE ACCESS TOKEN////////////////////////////////////////////
function getAccessToken (callback){
    request({
        method: "POST",
        url: "https://sso.dexit.co/openam/oauth2/access_token?realm=uaeu.ac.ae&grant_type=password&username=someone@uaeu.ac.ae&password=12345678",
          
        headers: {
               "Authorization": 'Basic ZHgtc2VydmljZToxMjMtNDU2LTc4OQ=='
               ,"Content-Type": 'application/x-www-form-urlencode'
                },
            json:true 
        }, function (err,res,body){
            var MyToken =    body.access_token;
            console.log("Token = " + MyToken);
            callback(MyToken);
        });    
}



////////////////////////////////////////////////////////// GET PARAM////////////////////////////////////////////
    function getParam(database, tableName,  paramName, id, callback, accessToken){
        request({
            method: "GET",
            url: "http://developer.kb.dexit.co/access/stores/"+database+"/query/?query=SELECT " + paramName + " AS myparam FROM  " + tableName + " where id = " + id,
            headers: {
                "Accept": 'application/json',
                "Authorization": 'Bearer '+ accessToken
            },
            json:true
        }, function (err,res,body){    
            var par = res.body.result.rows[0];
            var p= par[0];
            console.log(p);
            callback(p);
    });
}

//////////////////////////////////////////////////////////SET PARAM////////////////////////////////////////////
function setParam(database, tableName, paramName, value, id, accessToken){
        request({
            method: "GET",
            url: "http://developer.kb.dexit.co/access/stores/"+database+"/query/?query=UPDATE "+ tableName + ' SET  ' + paramName + ' = ' + '\'' + value +'\'' + ' where id = ' + id,
              headers: {
                   "Accept": 'application/json',
                   "Authorization": 'Bearer ' + accessToken
                },
                json:true
        }, function (err,res,body){
            console.log("Update "+paramName+" to "+ value);
        });
}



console.log('Express ');

app.get('/', function(req, res){ 
});




////////////////////////////////////////////////////Start Winner //////////////////////////////////////
function pickWinner(database, accessToken){
    function handleAccessToken(accessToken){
    request({
        method: "GET",
        url: "http://developer.kb.dexit.co/access/stores/"+database+"/query/?query=SELECT MAX (score)  FROM finalist",
          headers: {
               "Accept": 'application/json',
               "Authorization": 'Bearer ' + accessToken
            },
            json:true
    }, function (err,res,body){
    
        var par = res.body.result.rows[0];
        var max= par[0];
        console.log(max);
        request({
            method: "GET",
            url: "http://developer.kb.dexit.co/access/stores/"+database+"/query/?query=SELECT name FROM finalist where score = " + max,
              headers: {
                   "Accept": 'application/json',
                   "Authorization": 'Bearer ' + accessToken 
                },
                json:true
        }, function (err,res,body){
            var par = res.body.result.rows[0];
            var name= par[0];
            console.log(name);
            setParam(database, 'contest', 'winner_name', name, 1, accessToken);
            console.log('The winner is: '+name);
            function handleEventBroker(msg2){
              
          }
            setTimeout(function(){console.log('Timeout after 5 seconds...');
            eventBroker(handleEventBroker);
            
            }, 5000);
            });    
        });
    }
    getAccessToken(handleAccessToken);
}

//app.post('/winner', function(req, response){
  //  var datastore=req.body.datastore;
function winnerStage(datastore){
    function handleAccessToken(accessToken){
        
//        function handlecallback00(coordinates){ 
//        
//            function handlecallback0(msg){   //0
//            var temptime = msg.split(":");
//            var myhour = temptime[0];
//                console.log(myhour);
//            var mymin = temptime[1];
//                console.log(mymin);
//            
//        
//            request({
//                method: "GET",
//                url: "http://www.earthtools.org/timezone-1.1/"+coordinates,
//                
//                    json:true 
//                }, function (err,res,body){
//                    
//                    parseString(body, function (err, result) {
//                        var timeresult = result.timezone.localtime[0];
//                        console.log(timeresult);
//                        var mytime= timeresult.split(" ");
//                        console.log(mytime[3]);
//                        
//                        var clock= mytime[3].split(":");
//                        var hours = clock[0];
//                        console.log(hours);
//                        var min = clock[1];
//                        console.log(min);
//                        var sec = clock[2];
//                        console.log(sec);
//                        
//                        if (myhour===hours && mymin===min)
//                            { 

     function handlecallback1(msg){ //2
         
            console.log('change current msg and current state= winner',  accessToken);
            
            setParam(datastore, 'contest', 'current_msg',msg, 1,  accessToken);
            setParam(datastore, 'contest', 'current_state', 'winner', 1,  accessToken);
            pickWinner(datastore,accessToken);
            
//            function handlecallback2(msg){
//                setTimeout(function(){
//                    console.log('Timeout after 25 seconds...');
//                    setParam(datastore, 'contest', 'current_state', 'not started', 1,  accessToken);}, msg*1000);
                
            //}
            
          //  response.send("");
          //  response.send({"name":["winner stage"]});
            //res.send("winner stage");
            //getParam(datastore, 'contest', 'duration_winner', 1, handlecallback2,accessToken);
        }
        
        console.log('get winner msg');
        getParam(datastore, 'message', 'winner_msg', 1, handlecallback1, accessToken); //1
//                            }
//                        else{
//                         //   response.send("wrong time");
//                            response.send({"name":["wrong time"]});
//                            
//                        }
//                    });
//            });    
         
     //   getParam(datastore, 'contest', 'end_time', 1, handlecallback0, accessToken); //0
   // }
   // getParam(datastore, 'location', 'coordinates', 1, handlecallback00, accessToken); 
}
    getAccessToken(handleAccessToken); //0
    
    }


////////////////////////////////////////////////////Start Finals //////////////////////////////////////

function finalStage(datastore){
    function handleAccessToken(accessToken){
    function handlecallback1(msg){ //4
          console.log('change current msg and current state= final');
          setParam(datastore, 'contest', 'current_msg',msg, 1,accessToken);
          setParam(datastore, 'contest', 'current_state', 'final', 1,accessToken);
          
          function handleEventBroker(msg2){
              
          }
          
          setTimeout(function(){console.log('Timeout after 5 seconds...');
          eventBroker(handleEventBroker);
          
          setTimeout(function(){console.log('Timeout after 5 seconds...');
        
      winnerStage(datastore);
          }, 20000);
          
          }, 5000);

  }
      
  console.log('get final msg');
  getParam(datastore, 'message', 'final_msg', 1, handlecallback1, accessToken);//3
    }
getAccessToken(handleAccessToken); //0
}

////////////////////////////////////////////////////Start Contest //////////////////////////////////////
app.post('/contest', function(req, response){
    var datastore=req.body.datastore;
    
    function handleAccessToken(accessToken){
        
        function handlecallback00(coordinates){ 
            
        function handlecallback0(msg){   //0
            var temptime = msg.split(":");
            var myhour = temptime[0];
                console.log(myhour);
            var mymin = temptime[1];
                console.log(mymin);
            
        
            request({
                method: "GET",
                url: "http://www.earthtools.org/timezone-1.1/"+coordinates,
                
                    json:true 
                }, function (err,res,body){
                    
                    parseString(body, function (err, result) {
                        var timeresult = result.timezone.localtime[0];
                        console.log(timeresult);
                        var mytime= timeresult.split(" ");
                        console.log(mytime[3]);
                        
                        var clock= mytime[3].split(":");
                        var hours = clock[0];
                        console.log(hours);
                        var min = clock[1];
                        console.log(min);
                        var sec = clock[2];
                        console.log(sec);
                        
                        if (myhour===hours && mymin===min)
                            { 
                            
    function handlecallback1(msg){   //2

        console.log('if condition (not started)');
        if (msg === 'not_started'){
           console.log('clear winner name');
           setParam(datastore, 'contest', 'winner_name', ' ', 1, accessToken);
  
            function handlecallback2(msg){ //4
                console.log('change current msg and current state= started');
                setParam(datastore, 'contest', 'current_msg',msg, 1, accessToken);
                setParam(datastore, 'contest', 'current_state', 'started', 1, accessToken);
                
                function handleEventBroker(msg2){
    
                function handlecallback3(msg){
                    setTimeout(function(){console.log('Timeout after 20 seconds...');
                    finalStage(datastore);
                    
                    }, msg*1000);
                    
                }
                
                getParam(datastore, 'contest', 'duration_start', 1,handlecallback3, accessToken);
             
                response.send({"name":["start stage"]});
                }
                
                setTimeout(function(){console.log('Timeout after 5 seconds...');
                eventBroker(handleEventBroker);
                
                }, 5000);
            
            }
            
            console.log('get start msg');
            getParam(datastore, 'message', 'start_msg', 1, handlecallback2, accessToken); //3
            }
        else{
        	response.send({"name":["sorry"]});
        }
        }
    console.log('get current state');
    getParam(datastore, 'contest', 'current_state', 1, handlecallback1, accessToken); //1
                            }
                        else{
                    response.send({"name":["sorry"]});
                        }
                        
                        });
                });        
        }
    
    getParam(datastore, 'contest', 'start_time', 1, handlecallback0, accessToken); //0
}
        getParam(datastore, 'location', 'coordinates', 1, handlecallback00, accessToken); 
    }

    getAccessToken(handleAccessToken);//0

    });
//}      


http.createServer(app).listen(app.get('port'), function(){
    

//    var date = new Date(2015, 0, 11, 17, 33, 0);
//
//    var j = schedule.scheduleJob(date, function(){
//        contest();
//    
//    });
        });