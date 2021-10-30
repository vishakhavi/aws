const imageService = require("../service/image.service");
const {
    uploadFile,
    deleteFile
} = require('./s3');
const sql = require("../models/db.js");
const getUserPic = async (req, res) => {
    try {
        let existingUser = await imageService.getImage(req.user.id);
        if(existingUser != null){
            return res.status(200).send(
                existingUser
            );
        }else{
            res.status(400).json({
                "message": "User doesn't have a profile image"
            })
        }
       
    } catch (ex) {
        if (ex.name == "SequelizeUniqueConstraintError") {
            // user not found
            res.status(404).json({
                "message": "Not found"
            })
            res.status(500).json(ex)
        }
    }
}

const uploadUserPic = async function (req, res) {
    if (req.body.length == 0) {
        return res.send("Error uploading file.");
    }
    try {
        let existingUser = await imageService.getImage(req.user.id);
        if (existingUser != null) {
            const success = await deleteFile(existingUser.dataValues.file_name);
            let removeUser = await imageService.deleteImage(existingUser.dataValues.user_id);
        }
        const imageType = req.get('Content-Type').split('/')[1];
        const result = await uploadFile(req.user, req.body, imageType);
        console.log(result);
        let uploadImage = await imageService.addImage(req.user.id, result);
        // getUserPic(req, res);
        res.send(uploadImage);
    } catch (ex) {
        if (ex.name == "SequelizeUniqueConstraintError") {
            // user not found
            res.status(404).json({
                "message": "Not found"
            })
            res.status(400).json({
                msg: "Error while uploading image"
            });
        }
        console.log(ex);
        res.status(500).json(ex);
    }


}


const deleteUserPic = async function (req, res) {
    try {
        let existingUser = await imageService.getImage(req.user.id);
        if (existingUser != null) {
            const success = await deleteFile(existingUser.dataValues.file_name);
            console.log("success");
            console.log(success);
            // delete record from database
            if (success) {
                let removeUser = await imageService.deleteImage(existingUser.dataValues.user_id);
            }else{
                res.status(400).send("Try again");
            }
        }else{
            res.status(400).json({
                "message": "User doesn't have a profile image"
            })
        }
        res.status(204).send();
    } catch (ex) {
        if (ex.name == "SequelizeUniqueConstraintError") {
            // user not found
            res.status(404).json({
                "message": "Not found"
            })
        }
    }
}

module.exports = {
    getUserPic,
    deleteUserPic,
    uploadUserPic
}