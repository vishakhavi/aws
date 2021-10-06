const sql = require("./db.js");

// constructor
const User = function(user) {
  this.username = user.username;
  this.first_name = user.first_name;
  this.last_name = user.last_name;
  this.password = user.password;
  this.id=user.id;
  this.account_created = new Date();
  this.account_updated = new Date();
 
};

User.create = (newUser, result) => {
  sql.query("INSERT INTO user SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.username, ...newUser });
  });
};


User.getUserDetails = result =>{
  console.log("user data: ", res);
    result(null, res.username);
};

User.getUpdatedDetails = result =>{
  console.log("user data: ", res);
    result(null, res.username);
};
module.exports = User;
