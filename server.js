var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var db = require("./models");
var controllers = require("./controllers");

var PORT = process.env.PORT || 8080;

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));

var routes = require("./routes/routes");
app.use("/", routes);

mongoose.Promise = Promise; //Set Mongo to use promises for asynch queries

//connect to db
mongoose.connect("mongodb://localhost/therify", {
  //useMongoClient: true //got a warning saying to remove this
});

//start server
app.listen(PORT, '0.0.0.0', function() {
  console.log("App running on port " + PORT + "!");
});