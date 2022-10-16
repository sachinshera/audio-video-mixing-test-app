const db = require("../database");
const childProcess = require('child_process');
// merge image with audio 
const imgWithAudio = async (req, res) => {
    let image_file_path = req.body.image_file_path;
    let audio_file_path = req.body.audio_file_path;
    // check both path are valid
    if (image_file_path != null || audio_file_path != null) {
        // find both file in db
        let imageFileResult = await db.collection('files').findOne({ name: image_file_path.split('/')[2] });
        let audioFileResult = await db.collection('files').findOne({ name: audio_file_path.split('/')[2] });
        if (imageFileResult && audioFileResult) {
            // check mime type of both file
            if (imageFileResult.fileType === 'image/jpeg' || imageFileResult.fileType === 'image/png' || imageFileResult.fileType === 'image/jpg' && audioFileResult.fileType === 'audio/mpeg' || audioFileResult.fileType === 'audio/wave ' || audioFileResult.fileType === 'audio/mp3') {
                //  convert image to video using ffmpeg cmd
                var nowDate = Date.now();
                let cmd = 'ffmpeg -loop 1 -i ' + image_file_path + ' -i ' + audio_file_path + ' -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" ' + 'uploads/' + imageFileResult.token + "/" + nowDate + imageFileResult.name.split('.')[0] + '.mp4';
                childProcess.exec(cmd, (error, stdout, stderr) => {
                    console.log(stderr);
                    if (error) {
                        res.status(400).json({
                            message: "Error",
                            error: error
                        })
                    } else {
                        //    save to database
                        const videoData = {
                            name: 'uploads/' + imageFileResult.token + "/" + nowDate + imageFileResult.name.split('.')[0] + '.mp4',
                            size: 0,
                            token: imageFileResult.token,
                            fileType: 'video/mp4',
                            imageFile: imageFileResult._id,
                            audioFile: audioFileResult._id
                        }
                        db.collection('files').insertOne(videoData, (err, result) => {
                            if (err) {
                                res.status(400).json({
                                    message: "Error",
                                    error: err
                                })
                            } else {
                                res.status(200).json({
                                    message: "Success",
                                    data: result,
                                    file_path: "uploads/" + imageFileResult.token + "/" + nowDate + imageFileResult.name.split('.')[0] + '.mp4'
                                })
                            }
                        })
                    }
                })
            } else {
                res.status(400).json({
                    message: "Error",
                    error: "Invalid file type"
                });
            }
        } else {
            res.status(400).json({
                message: "Error",
                error: "File not found"
            });
        }
    } else {
        res.status(400).json({
            "message": "Bad Request"
        })
    }
}

const audioWithVideo = async (req, res) => {
    // merge audio with video
    let video_file_path = req.body.video_file_path;
    let audio_file_path = req.body.audio_file_path;
    // check both path are valid
    if (video_file_path != null || audio_file_path != null || video_file_path !== undefined || audio_file_path !== undefined) {
        let videoFileResult = await db.collection('files').findOne({ name: video_file_path.split('/')[2] });
        let audioFileResult = await db.collection('files').findOne({ name: audio_file_path.split('/')[2] });
        if (videoFileResult && audioFileResult) {
            // check both mime type
            if (videoFileResult.fileType === 'video/mp4' && audioFileResult.fileType === 'audio/mpeg' || audioFileResult.fileType === 'audio/wave' || audioFileResult.fileType === 'audio/mp3') {
                // merge audio with video using ffmpeg cmd
                try {

                    let savingPath = 'uploads/' + videoFileResult.token + "/" + Date.now() + videoFileResult.name.split('.')[0] + '.mp4';

                    // ffmpeg -i v.mp4 -i a.wav -c:v copy -map 0:v:0 -map 1:a:0 new.mp4 use this reference
                    let cmd = 'ffmpeg -i ' + video_file_path + ' -i ' + audio_file_path + ' -c:v copy -map 0:v:0 -map 1:a:0 ' + savingPath;
                    childProcess.exec(cmd, (error, stdout, stderr) => {
                        if (error) {
                            res.status(400).json({
                                message: "Error",
                                error: error
                            });
                        } else {
                            // save video file to database
                            const videoData = {
                                name: savingPath.split('/')[2],
                                size: 0,
                                token: videoFileResult.token,
                                fileType: 'video/mp4',
                                imageFile: videoFileResult._id,
                                audioFile: audioFileResult._id
                            }
                            db.collection('files').insertOne(videoData, (err, result) => {
                                if (err) {
                                    res.status(400).json({
                                        message: "Error",
                                        error: err
                                    });
                                } else {
                                    res.status(200).json({
                                        message: "Success",
                                        data: result,
                                        file_path: savingPath
                                    });
                                }
                            })
                        }
                    })
                }
                catch (e) {
                    res.status(500).json({
                        message: "Error",
                        error: e
                    })
                }
            } else {
                res.status(400).json({
                    message: "Error",
                    error: "Invalid file type"
                });
            }
        }
    } else {
        res.status(400).json({
            "message": "Bad Request"
        })
    }
}

const mergeAllVideos = async (req, res) => {
    // use video_file_path_list for video list
    let video_file_path_list = req.body.video_file_path_list;
    // check video_file_path_list is valid
    if (video_file_path_list != null || video_file_path_list !== undefined) {
        // check video_file_path_list is array
        console.log(video_file_path_list);
        if (Array.isArray(video_file_path_list)) {
            // get all video file from database
            let videoFileResult = await db.collection('files').find({ name: { $in: video_file_path_list.map((item) => item.split('/')[2]) } }).toArray();
            // check all video file is valid
            if (videoFileResult.length > 0) {
                // check all video file is valid
                if (videoFileResult.every((item) => item.fileType === 'video/mp4')) {
                    // merge all video using ffmpeg cmd
                    try {
                        let savingPath = 'uploads/' + videoFileResult[0].token + "/" + Date.now() + videoFileResult[0].name.split('.')[0] + '.mp4';
                        // ffmpeg -i "concat:fileIntermediate1.mp4 |fileIntermediate2.mp4 " -c copy -bsf:a aac_adtstoasc mergedVideo.mp4 use this reffrence
                        let cmd = 'ffmpeg -i "concat:' + video_file_path_list.join('|') + '" -c copy -bsf:a aac_adtstoasc ' + savingPath;
                        childProcess.exec(cmd, (error, stdout, stderr) => {
                            if (error) {
                                res.status(400).json({
                                    message: "Error",
                                    error: error
                                });
                            } else {
                                // save video file to database
                                const videoData = {
                                    name: savingPath.split('/')[2],
                                    size: 0,
                                    token: videoFileResult[0].token,
                                    fileType: 'video/mp4',
                                    imageFile: videoFileResult[0]._id,
                                    audioFile: videoFileResult[0]._id
                                }
                                db.collection('files').insertOne(videoData, (err, result) => {
                                    if (err) {
                                        res.status(400).json({
                                            message: "Error",
                                            error: err
                                        });
                                    } else {
                                        res.status(200).json({
                                            message: "Success",
                                            data: result,
                                            file_path: savingPath
                                        });
                                    }
                                })
                            }
                        })
                    }
                    catch (e) {
                        res.status(500).json({
                            message: "Error",
                            error: e
                        })
                    }
                } else {
                    res.status(400).json({
                        message: "Error",
                        error: "Invalid file type"
                    });
                }
            } else {
                res.status(400).json({
                    message: "Error",
                    error: "Invalid file type"
                });
            }
        } else {
            res.status(400).json({
                message: "Error",
                error: "not array"
            });
        }
    }
    else {
        res.status(400).json({
            "message": "Bad Request"
        })
    }
}

module.exports = {
    imgWithAudio: imgWithAudio,
    audioWithVideo: audioWithVideo,
    mergeAll: mergeAllVideos
}