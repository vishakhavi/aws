const checkAuthorization = require('../helper/authentication.js');

module.exports = app => {
    const users = require("../controller/user.controller.js");
  
    // Create a new Customer
    app.post("/user", users.create);
  
  
   
    app.get("/user/self",checkAuthorization,users.getUserDetails);

    
    // Update a user

    app.put("/user/self", checkAuthorization, users.getUpdatedDetails);
}