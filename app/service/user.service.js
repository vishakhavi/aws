const db = require("../models/db");
const {
    v4: uuidv4
} = require("uuid");
const bcrypt = require('bcrypt');

const User = db.User;

const create = async (userObj) => {
    let user = {};
    //encrypt password
    user.password = bcrypt.hashSync(userObj.password, 10);
    //modify user object
    user.id = uuidv4();
    user.username = userObj.username;
    user.first_name = userObj.first_name;
    user.last_name = userObj.last_name;
    user.account_created = new Date();
    user.account_updated = new Date();
    user.verified = false;
    user.verified_on = new Date();
    let newUser = await User.create(user);
    //return user without password
    const {
        password,
        ...rest
    } = newUser.dataValues;
    return rest;
}

const get = (username) => {
    let res = User.findOne({
        where: {
            username: username
        }
    });
    return res;
}

const update = async (userObj, userId) => {
    let user = {};
    if (userObj.password) {
        //encrypt password
        user.password = bcrypt.hashSync(userObj.password,10);
    }
    if (userObj.first_name) {
        user.first_name = userObj.first_name;
    }
    if (userObj.last_name) {
        user.last_name = userObj.last_name;
    }
    user.account_updated = new Date();
    //update user
    let updatedUser = await User.update(user, {
        where: {
            id: userId
        }
    });
    return updatedUser;
}
const updateVerifiedUser = async (status, userId) => {
    let user = {};
    user.verified = status;
    user.verified_on = new Date();
    user.account_updated = new Date();
    //update user
    let updatedUser = await User.update(user, {
        where: {
            id: userId
        }
    });
    return updatedUser;
}

module.exports = {
    create,
    get,
    update,
    updateVerifiedUser
}