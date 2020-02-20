
//Dependencies
var express = require('express');
var bodyParser = require('body-parser');

var jsforce = require('jsforce');



//Express
var app = express();

app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

//Routes
/*
app.get('/',function(req,res){
   res.send('Hello world!');
});
*/
app.use('/api',require('./routes/api'));

app.listen(3007);


console.log('running on post 3007');