const db = require('../database');
const fs = require('fs');
const path = require('path');
const uploadNew = async (req, res) => {
    // upload file into uploads folder with token and save to database
    const file = req.files[0];
    // upload to directory
    const filePath = path.join(__dirname, `../uploads/${req.headers.authorization}`);
    if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath);
    }
    // if file exists then change name
    if (fs.existsSync(`${filePath}/${file.originalname}`)) {
        file.originalname = `${Date.now()}_${file.originalname}`;
    }


    try {

        const fileData = {
            name: file.originalname,
            size: file.size,
            token: req.headers.authorization,
            fileType: file.mimetype,
        }

        fs.writeFileSync(path.join(filePath, file.originalname), file.buffer);

        await db.collection('files').insertOne(fileData, (err, result) => {
            if (err) {
                res.status(400).json({
                    message: "Error",
                    error: err
                });
            } else {
                // file path witohut system path
                const UploadsfilePath = `uploads/${req.headers.authorization}/${file.originalname}`;
                res.status(200).json({
                    message: "Success",
                    data: result,
                    file_path: UploadsfilePath
                });
            }
        })
    } catch (err) {
        res.status(400).json({
            message: "Error",
            error: err
        });
    }

}

const downloadFile = async (req, res) => {
    // download the file from uploads folder
    const DownloadFilePath = req.query.file_path;
    if (fs.existsSync(DownloadFilePath)) {
        res.download(DownloadFilePath);
    } else {
        res.status(400).json({
            message: "File not found",
        });
    }
}

module.exports = {
    upload: uploadNew,
    download: downloadFile
}