const sql = require("./db.js");

// constructor
const Image = function(image) {
  this.user_id = image.user_id;
  this.file_name = image.file_name;
  this.url = image.url;
  this.upload_date = new Date();
};

Image.uploadUserPic = (newImage, result) => {
    sql.query("INSERT INTO image SET ?", newImage, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
  
      console.log("created user: ", { id: res.insertId, ...newImage });
      result(null, { id: res.user_id, ...newImage });
    });
  };
module.exports = Image;
