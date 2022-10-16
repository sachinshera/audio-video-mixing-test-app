const { v4: uuidv4 } = require('uuid');
const db = require('../database');
const newStorage = async (req, res) => {
    const STorage = {
        token: uuidv4()
    }

    // save to storage collection
    await db.collection('storage').insertOne(STorage, (err, result) => {
        if (err) {
            res.status(400).json({
                message: "Error",
                error: err
            });
        } else {
            res.cookie('token', STorage.token, { maxAge: 900000, httpOnly: true });
            res.status(200).json({
                message: "Success",
                data: result,
                token: STorage.token
            });
        }

    })
}

module.exports = {
    new: newStorage
}