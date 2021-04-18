const express = require('express');
const fs = require('fs');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(cors({
    origin: [
        "http://localhost:4200"
    ],
    credentials: true
}));

const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

var db = null;
const mongoClient = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true
});

mongoClient.connect(function (err) {
    console.log('MongoDB connected');
    db = mongoClient.db("dojo");
});

if (!fs.existsSync("maps")) {
    fs.mkdirSync("maps");
}

app.get("/auth", (req, res, next) => {
    console.log("/auth", req.query);
    const users = db.collection('users');
    users.find({
        webid: req.query.webid
    }).toArray(function (err, docs) {
        if (!docs.length) {
            users.insertOne({
                webid: req.query.webid,
                login: req.query.login,
                name: req.query.name,
                last_active: Date.now()
            });
        } else {
            var newvalues = {
                $set: {
                    login: req.query.login,
                    name: req.query.name,
                    last_active: Date.now()
                }
            };
            users.updateOne({
                webid: req.query.webid
            }, newvalues);
        }
    });
    res.send("1");
});

app.post("/save-game-data", function (req, res) {
    console.log(req.query);
    var size = 0;
    var data2 = "";
    req.on('data', function (data) {
        size += data.length;
        data2 += data;
        console.log('Got chunk: ' + data.length + ' total: ' + size);
    });

    req.on('end', function () {
        let buff = new Buffer(data2, 'base64');
        console.log("total size = " + size);
        var filePath = "maps/" + req.query.authorName + "/" + req.query.mapName + "/" + req.query.endRaceTime + "_" + req.query.playerName + "_" + Date.now();
        if (!fs.existsSync("maps/" + req.query.authorName)) {
            fs.mkdirSync("maps/" + req.query.authorName);
        }
        if (!fs.existsSync("maps/" + req.query.authorName + "/" + req.query.mapName)) {
            fs.mkdirSync("maps/" + req.query.authorName + "/" + req.query.mapName);
        }
        fs.writeFile(filePath, buff, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved!");
            data2 = "";
            const raceData = db.collection('race_data');
            req.query["file_path"] = filePath;
            req.query["date"] = Date.now();
            req.query.raceFinished = parseInt(req.query.raceFinished);
            req.query.endRaceTime = parseInt(req.query.endRaceTime);
            raceData.insertOne(req.query);
        });
        res.end("Thanks");
    });

    req.on('error', function (e) {
        console.log("ERROR ERROR: " + e.message);
    });

});