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
    app.post("/v1/user", users.create);
  
    app.post("/v1/user/self/pic",checkAuthorization,upload.single('image'),image.uploadUserPic);

    app.get("/v1/user/self/pic",checkAuthorization,image.getUserPic);

    app.delete("/v1/user/self/pic",checkAuthorization,image.deleteUserPic);
   
    app.get("/v1/user/self",checkAuthorization,users.getUserDetails);

    
    // Update a user

    app.put("/v1/user/self", checkAuthorization, users.getUpdatedDetails);
}