const checkAuthorization = require('../helper/authentication.js');
const multer = require('multer');
var upload      = multer({ dest: 'uploads/',fileFilter:function(req,file,cb){
    console.log('file is',file)
    cb(null,true);
}
})
module.exports = app => {
    const users = require("../controller/user.controller.js");
    const image = require("../controller/imageupload.js");
    // Create a new Customer
    app.post("/user", users.create);
  
    app.post("/user/self/pic",checkAuthorization,upload.single('image'),image.uploadUserPic);

    app.get("/user/self/pic",checkAuthorization,image.getUserPic);

    app.delete("/user/self/pic",checkAuthorization,image.deleteUserPic);
   
    app.get("/user/self",checkAuthorization,users.getUserDetails);

    
    // Update a user

    app.put("/user/self", checkAuthorization, users.getUpdatedDetails);
}