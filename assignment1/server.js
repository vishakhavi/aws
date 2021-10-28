const express = require("express");
const bodyParser = require("body-parser");
var cors = require("cors");
const app = express();

// parse requests of content-type: application/json
app.use(bodyParser.json());
app.use(
  bodyParser.raw({ limit: '50mb', type: ['image/*'] })
);
// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
// routing routes
app.get("/", (req, res) => {
  res.json({ message: "Web app" });
});
require("./app/routes/user.routes.js")(app);


// app.use(function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//  // next();
// });
// set port, listen for requests
var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('App listening at http://%s:%s', host, port);
});
module.exports = server;