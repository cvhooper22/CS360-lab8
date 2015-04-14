var express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
  return((user==='cs360')&&(pass === 'test'));
});
app.use(bodyParser());


app.all('*',function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT,GET,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});


app.use('/', express.static('./html/', {maxage: 60*60*1000}));


app.get('/getCities', function(req, res) {
  console.log("In getcity route");
  var urlObj = url.parse(req.url, true, false);
  console.log("the url obj received is: ");
  console.log(urlObj);
  fs.readFile('html/cities.dat.txt', function(err, data) {
    if(err) throw err;
    var cities = data.toString().split("\n");
    var jsonresult = [];
    var myRegEx = new RegExp("^" + urlObj.query["q"]);
    for(var i = 0; i < cities.length; i++) {
      var result = cities[i].search(myRegEx);
      if(result != -1) {
        console.log(cities[i]);
        jsonresult.push({city:cities[i]});
      }
    }
     res.json(jsonresult);
  });
});


app.get('/comment', function(req, res) {
  console.log("In comment route");
   var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/weather", function(err, db) {
        db.collection("comments", function(err, comments){
          if(err) throw err;
          comments.find(function(err, items){
            items.toArray(function(err, itemArr){
              console.log("Document Array: ");
              console.log(itemArr);

              res.writeHead(200);
              res.end(JSON.stringify(itemArr));
            });
          });
        });
      });

});


app.post('/comment', auth, function(req, res) {
  console.log("In POST comment route");
  console.log(req.user);
  console.log("Remote user");
  console.log(req.remoteUser);
  console.log(req.body);

   var MongoClient = require('mongodb').MongoClient;
      MongoClient.connect("mongodb://localhost/weather", function(err, db) {
      if(err) throw err;
      db.collection('comments').insert(req.body, function(err, records) {
        console.log("Record added as " + records[0]._id);
          });
        });

  res.status(200);
  res.end();
});


var options = {
  host: '127.0.0.1',
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.crt')
};
  http.createServer(app).listen(6008);
  https.createServer(options, app).listen(443);
  app.get('/', function (req, res) {
    res.send("Get Index");
  });
