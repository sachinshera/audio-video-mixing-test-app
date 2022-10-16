const express = require('express');
const router = express.Router();
const storageController = require('../controllers/storage.controller');
const fileController = require('../controllers/file.controller');
const authServices = require('../services/auth.services');
const audioController = require('../controllers/audio.controller');
const mergeController = require("../controllers/merge.controller");
// create new storage

router.post("/create_new_storage", (req, res) => {
    storageController.new(req, res);
});

router.post("/upload_file", authServices.checkAuth, fileController.upload);
router.post("/text_file_to_audio", authServices.checkAuth, audioController.create);
router.post("/merge_image_and_audio", authServices.checkAuth, mergeController.imgWithAudio);
router.post("/merge_video_and_audio", authServices.checkAuth, mergeController.audioWithVideo);
router.post("/merge_all_video", authServices.checkAuth, mergeController.mergeAll);
router.get("/download_file", authServices.checkAuth, fileController.download);


module.exports = router;