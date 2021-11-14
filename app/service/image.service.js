const db = require("../models/db");
const Image = db.Image;

const addImage = async (user_id, uploaded_file) => {
    let image = {};
    image.file_name = uploaded_file.Key;
    image.url = uploaded_file.Location;
    image.upload_date = new Date();
    image.user_id = user_id;
    let res = await Image.create(image);
   
    return res;
}
const deleteImage = async (user_id) => {
    let res = await Image.destroy({
        where: {
            user_id: user_id
        }
    });
    return res;
}
const getImage = async ( user_id) => {
    let res = await Image.findOne({
        where: {
            user_id: user_id
        }
    });
    return res;
}

module.exports = {
    getImage,
    deleteImage,
    addImage
}