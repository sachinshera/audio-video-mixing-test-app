
const db = require('../database');
const checkAuth = (req, res, next) => {
    if (req.headers.authorization) {
        //    validate from database
        db.collection('storage').findOne({ token: req.headers.authorization }, (err, result) => {
            if (err) {
                res.status(400).json({
                    message: "Error",
                    error: err
                });
            } else {
                if (result) {
                    next();
                } else {
                    res.status(401).json({
                        message: "Unauthorized"
                    });
                }
            }
        })
    } else {
        res.status(401).json({
            message: "Unauthorized"
        });
    }
}


module.exports = {
    checkAuth: checkAuth
}