const Image = require("../models/image.model.js");
const {
    uploadFile,
    deleteFile
} = require('./s3');
const sql = require("../models/db.js");
const getUserPic = (req, res) => {
    sql.query(`SELECT * FROM image where user_id ="${req.user.id}"`, (err, newImage) => {
        if (newImage.length == 0) {
            return res.status(404).send("Not found")
        } else {
            return res.status(200).send(
                newImage[0]
            );
        }
    });
};
const uploadUserPic =  function (req, res) {
    if (req.body.length == 0) {
        return res.send("Error uploading file.");
    }

    // check if current req.user.id present inn image db 
    // if true then call delete logic here if possible or just copy paste
    //if(user present){
    // run delete logic
    //}

    sql.query(`SELECT user_id FROM image where user_id ="${req.user.id}"`, (err, userid) => {
        if (!userid.length) {
            return res.status(404).send("Not found")
        } else {
            sql.query(`DELETE FROM image WHERE user_id = "${req.user.id}"`,async (delErr, delresults) => {
                console.log(delErr)
                if (delErr) {
                    return res.status(400).json({
                        msg: "Error while deleting the image"
                    });
                } else {
                    const imageType = req.get('Content-Type').split('/')[1];
                    const result = await uploadFile(req.user, req.body, imageType);
                    console.log(result);
                    const newImage = new Image({
                        user_id: req.user.id,
                        file_name: result.Key,
                        url: result.Location,
                        upload_date: new Date()
                    });
                    // return res.send({imagePath :`${result.Location}`});
                    console.log(newImage);
                    sql.query("INSERT INTO image SET ?", newImage, (err, results) => {

                        if (err) {
                            console.log("insert query", err)
                            return res.status(400).json({
                                msg: "Error while uploading image"
                            });

                        } else {
                            return getUserPic(req, res);
                        }
                    })
                }
            });

        }
    });




}


const deleteUserPic = function async (req, res) {
    sql.query(`SELECT * FROM image where user_id ="${req.user.id}"`, async (err, newImage) => {
        if (newImage.length == 0) {
            return res.status(404).send("Not found")
        } else {
            // delete record from s3
            const success = await deleteFile(newImage[0].file_name);
            console.log("success");
            console.log(success);
            // delete record from database
            console.log(`DELETE FROM image WHERE user_id = "${req.user.id}"`);
            deleteImage(req, res)

        }
    });

}

const deleteImage = function (req, res) {
    sql.query(`DELETE FROM image WHERE user_id = "${req.user.id}"`, (delErr, delresults) => {
        console.log(delErr)
        if (delErr) {
            return res.status(400).json({
                msg: "Error while deleting the image"
            });
        } else {
            return res.status(204).send();
        }
    });
}
module.exports = {
    getUserPic,
    deleteUserPic,
    uploadUserPic
}