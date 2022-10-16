const db = require('../database');
const mongodb = require('mongodb');
const gtts = require("gtts");
// create audio from text file that user uploaded
const fs = require('fs');
const path = require('path');
const create = async (req, res) => {
    let filePath = req.body.file_path;
    if (filePath) {
        // find file in database
        try {
            let fileResult = await db.collection('files').findOne({ name: filePath.split('/')[2] });
            if (fileResult) {
                // check file is text file or not
                if (fileResult.fileType === 'text/plain') {
                    // read file
                    try {
                        let fileData = fs.readFileSync(path.join(__dirname, `../uploads/${fileResult.token}/${fileResult.name}`), 'utf8');
                        // create audio file from text file using gtts
                        // set random name for audio file
                        let audioFileName = `${Date.now()}.mp3`;
                        let audioFilePath = path.join(__dirname, `../uploads/${fileResult.token}/${audioFileName}`);
                        let gttsObj = new gtts(fileData);
                        gttsObj.save(audioFilePath, function (err, result) {
                            if (err) {
                                res.status(400).json({
                                    message: "Error",
                                    error: err
                                });
                            } else {
                                // save audio file to database
                                let audioFileData = {
                                    name: audioFileName,
                                    size: result,
                                    token: fileResult.token,
                                    fileType: 'audio/mpeg',
                                }
                                db.collection('files').insertOne(audioFileData, (err, result) => {
                                    if (err) {
                                        res.status(400).json({
                                            message: "Error",
                                            error: err
                                        });
                                    } else {
                                        // file path witohut system path
                                        const UploadsfilePath = `uploads/${fileResult.token}/${audioFileName}`;
                                        res.status(200).json({
                                            message: "Success",
                                            data: result,
                                            file_path: UploadsfilePath
                                        });
                                    }
                                })
                            }
                        })


                    } catch (err) {
                        console.log(err);
                        res.status(400).json({
                            message: "Error",
                            error: err
                        });
                    }
                } else {
                    res.status(400).json({
                        message: "Error",
                        error: "File is not text file"
                    });
                }
            } else {
                res.status(400).json({
                    message: "Error",
                    error: "File not found"
                });
            }
        } catch (err) {
            res.status(400).json({
                message: "Error",
                error: err
            });
        }

    } else {
        res.status(400).json({
            message: "Error",
            error: "File path is required"
        });
    }

}


module.exports = {
    create: create
}