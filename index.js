const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
require("./database");
// use middelware
// set static folder
app.use("/uploads", express.static('uploads'));

app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer().any());
// routes

app.use("/", require("./routes/index.routes"));

// error handler

app.use((err, req, res, next) => {
    console.log(err);
    res.status(400).json({
        message: "Error",
        error: err
    });
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});