const express = require("express");
const bodyParser = require("body-parser");

const app = express();

// parse requests of content-type: application/json
app.use(bodyParser.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// routing routes
app.get("/", (req, res) => {
  res.json({ message: "Web app" });
});
require("./app/routes/user.routes.js")(app);

// set port, listen for requests
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
module.exports = server;