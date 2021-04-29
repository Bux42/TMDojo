require("dotenv").config();

const express = require('express');
const https = require('https');
const fs = require('fs');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;

const app = express();
app.use(cors({
    origin: [
        "http://localhost:4200",
        "https://tmdojo.com"
    ],
    credentials: true
}));

if (process.env.USE_CERTIFICATES == "true") {
	https.createServer({
	    key: fs.readFileSync('./key.pem'),
	    cert: fs.readFileSync('./cert.pem')
	}, app).listen(443);
}

var db = null;
const mongoClient = new MongoClient(process.env.MONGO_URL, {
    useUnifiedTopology: true
});

mongoClient.connect(function (err) {
    console.log('Connected successfully to server');
    db = mongoClient.db("dojo");
});

if (!fs.existsSync("maps")) {
    fs.mkdirSync("maps");
}

if (!fs.existsSync("mapBlocks")) {
    fs.mkdirSync("mapBlocks");
}

if (!fs.existsSync("exports")) {
    fs.mkdirSync("exports");
}

const port = 80;

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

app.post("/save-map-blocks", function (req, res) {
    console.log(req.query);
    var size = 0;
    var data2 = "";
    req.on('data', function (data) {
        size += data.length;
        data2 += data;
    });

    req.on('end', function () {
        let buff = new Buffer(data2, 'base64');
        var filePath = "mapBlocks/" + req.query.challengeId;
        fs.writeFile(filePath, buff, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("The file was saved at", filePath);
            data2 = "";
        });
        res.end("Thanks");
    });

    req.on('error', function (e) {
        console.log("ERROR ERROR: " + e.message);
    });
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

app.get("/get-maps", (_, res) => {
    const raceData = db.collection('race_data');
    // group docs by mapName and count each occurrence
    raceData.aggregate([{
            $group: {
                _id: "$mapName",
                count: {
                    $sum: 1
                }
            }
        },
        {
            $project: {
                _id: 0,
                name: "$_id",
                count: "$count"
            }
        }
    ], async (err, cursor) => {
        if (err) {
            return res.status(500).send(err);
        }
        const data = await cursor.toArray();
        return res.send(data);
    });
})

app.get("/get-files", (req, res, next) => {
    console.log(req.query);
    const raceData = db.collection('race_data');
    var query = {};
    // case-insensitive filter for map and player name
    if (req.query.mapName.length > 0) {
        query["mapName"] = {
            $regex: ".*" + req.query.mapName + ".*",
            $options: 'i'
        };
    }
    if (req.query.playerName.length > 0) {
        query["playerName"] = {
            $regex: ".*" + req.query.playerName + ".*",
            $options: "i"
        };
    }
    if (req.query.raceFinished != -1) {
        query["raceFinished"] = parseInt(req.query.raceFinished);
    }
    var order = {};
    if (req.query.orderBy.length > 0) {
        if (req.query.orderBy == "Time Desc") {
            order["endRaceTime"] = -1;
        }
        if (req.query.orderBy == "Time Asc") {
            order["endRaceTime"] = 1;
        }
        if (req.query.orderBy == "Date Desc") {
            order["date"] = -1;
        }
        if (req.query.orderBy == "Date Asc") {
            order["date"] = 1;
        }
    }
    raceData.find(query).sort(order).toArray(function (err, docs) {
        var files = [];
        console.log(docs.length);
        for (var i = 0; i < req.query.maxResults && i < docs.length; i++) {
            files.push(docs[i]);
        }
        res.send({
            "Files": files,
            "TotalResults": docs.length
        });
    });

});

app.get('/get-race-data', (req, res, nexct) => {
    console.log(req.query);
    res.sendFile(__dirname + "\\" + req.query.filePath);
});

app.get('/get-map-blocks', (req, res) => {
    console.log(req.query);
    res.sendFile(__dirname + "\\mapBlocks\\" + req.query.filePath);
});

app.get("/download-race-data", (req, res, next) => {
    console.log(req.query);
    res.download(__dirname + "\\" + req.query.filePath, req.query.fileName);
})

app.get('/export-race-data', (req, res) => {
    const raceData = db.collection('race_data');
    raceData.find({
        _id: ObjectId(req.query.id)
    }).toArray(function (err, docs) {
        if (!docs.length) {
            res.send("id not found in db");
        } else {
            var fileName = docs[0]._id;
            delete docs[0]._id;
            var filePath = __dirname + "\\" + docs[0].file_path;
            const contents = fs.readFileSync(filePath, {
                encoding: 'base64'
            });
            docs[0].base64 = contents;
            fs.writeFileSync(__dirname + "\\" + "exports/" + fileName, JSON.stringify(docs[0]));
            res.download(__dirname + "\\" + "exports/" + fileName, function (err) {
                fs.unlink(__dirname + "\\" + "exports/" + fileName, (err) => {
                    if (err) throw err;
                });
            });
        }
    });
});

app.post('/import-file', (req, res) => {
    var size = 0;
    var data2 = "";
    req.on('data', function (data) {
        size += data.length;
        data2 += data;
    });

    req.on('end', function () {
        var obj = JSON.parse(data2);
        var splitted = obj.file_path.split('/');
        var currFolder = "maps/";

        for (var i = 1; i < splitted.length; i++) {
            if (!fs.existsSync(currFolder)) {
                fs.mkdirSync(currFolder);
                console.log("Create folder", currFolder);
            }
            currFolder += splitted[i] + '/';
        }

        const raceData = db.collection('race_data');
        raceData.find({
            file_path: obj.file_path
        }).toArray(function (err, docs) {
            if (!docs.length) {
                res.send("id not found in db");
                var file = {
                    mapName: obj.mapName,
                    challengeId: obj.challengeId,
                    authorName: obj.authorName,
                    playerName: obj.playerName,
                    playerLogin: obj.playerLogin,
                    webId: obj.webId,
                    endRaceTime: obj.endRaceTime,
                    raceFinished: obj.raceFinished,
                    file_path: obj.file_path,
                    date: obj.date
                };
                raceData.insertOne(file);

                let buff = new Buffer(obj.base64, 'base64');
                fs.writeFile(obj.file_path, buff, function (err) {
                    if (err) {
                        return console.log(err);
                    }
                    res.end("Thanks");
                    console.log("The file was saved at", obj.file_path);
                });
            } else {
                console.log("file_path:", obj.file_path, "already in db");
                res.end("Thanks");
            }
        });

    });

    req.on('error', function (e) {
        console.log("ERROR ERROR: " + e.message);
    });
});
