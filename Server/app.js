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

var db = null;
const mongoClient = new MongoClient("mongodb://localhost:27017", {
    useUnifiedTopology: true
});

mongoClient.connect(function (err) {
    console.log('Connected successfully to server');
    db = mongoClient.db("dojo");
});

if (!fs.existsSync("maps")) {
    fs.mkdirSync("maps");
}

const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});

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

app.get("/set-current-map", (req, res, next) => {
    console.log(req.query);
    if (!fs.existsSync("maps/" + req.query.author)) {
        fs.mkdirSync("maps/" + req.query.author);
    }
    if (!fs.existsSync("maps/" + req.query.author + "/" + req.query.name)) {
        fs.mkdirSync("maps/" + req.query.author + "/" + req.query.name);
    }
    res.send("1");
});


app.post("/save-game-data", function (req, res) {
    console.log(req.query);
    var size = 0;
    var data2 = "";
    req.on('data', function (data) {
        size += data.length;
        data2 += data;
    });

    req.on('end', function () {
        let buff = new Buffer(data2, 'base64');
        var filePath = "maps/" + req.query.authorName + "/" + req.query.mapName + "/" + req.query.endRaceTime + "_" + req.query.playerName + "_" + Date.now();
        fs.writeFile(filePath, buff, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved at", filePath);
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

// FRONT

app.get("/get-files", (req, res, next) => {
    console.log(req.query);
    const raceData = db.collection('race_data');
    var query = {};
    if (req.query.mapName.length > 0) {
        query["mapName"] = {$regex : ".*" + req.query.mapName + ".*"};
    }
    if (req.query.playerName.length > 0) {
        query["playerName"] = {$regex : ".*" + req.query.playerName + ".*"};
    }
    if (req.query.raceFinished != -1) {
        query["raceFinished"] = parseInt(req.query.raceFinished);
    }
    raceData.find(query).toArray(function (err, docs) {
        var files = [];
        console.log(docs);
        for (var i = 0; i < req.query.maxResults && i < docs.length; i++) {
            files.push(docs[i]);
        }
        res.send({"Files": files, "TotalResults": docs.length});
    });
   
});

app.get('/get-race-data', (req, res, nexct) => {
    console.log(req.query);
    res.sendFile(__dirname + "\\" + req.query.filePath);
});