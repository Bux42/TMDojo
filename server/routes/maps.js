const express = require('express');
const router = express.Router();
const axios = require('axios');

const fs = require('fs');
const path = require('path');

const db = require('../lib/db');

/**
 * GET /maps
 * Retrieves all unique map names we have replays of
 */
router.get('/', async (req, res, next) => {
  try {
    const mapNames = await db.getUniqueMapNames();
    res.send(mapNames);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /maps/:mapUID
 * Retrieves map (block) data by mapUID
 */
router.get('/:mapUID', async (req, res, next) => {
  try {
    if (fs.existsSync(`mapBlocks/${req.params.mapUID}`)) {
      res.sendFile(path.resolve(__dirname + '/../mapBlocks/' + req.params.mapUID));
    } else {
      res.status(404).send();
    }
  } catch (err) {
    next(err);
  }
});

/**
 * GET /maps/:mapUID/info
 * Retrieves map's metadata (including tm.io information)
 */
router.get('/:mapUID/info', async (req, res, next) => {
  let mapData = {};

  // fetch tm.io data
  try {
    const tmxRes = await axios.get(`https://trackmania.io/api/map/${req.params.mapUID}`, {
      withCredentials: true,
      headers: { 'User-Agent': 'TMDojo API - https://github.com/Bux42/TMDojo' }
    });

    const tmioData = tmxRes.data;
    mapData = { ...mapData, ...tmioData };
  } catch (error) {
    console.log('/maps/:mapUID/info: tm.io request failed with error ', error.toString());
  }

  res.send(mapData);
});

/**
 * POST /maps/:mapUID
 * Stores map (block) data (from the request body)
 */
router.post('/:mapUID', (req, res, next) => {
  const size = 0; // TODO: do we need the size for anything?
  const completeData = '';

  req.on('data', (data) => {
    size += data.length;
    completeData += data;
  });

  req.on('end', function () {
    const buff = Buffer.from(completeData, 'base64');
    const filePath = 'mapBlocks/' + req.params.mapUID;
    fs.writeFile(filePath, buff, (err) => {
      if (err) {
        return next(err);
      }
      console.log(`POST /maps/${req.params.mapUID}: The file was saved at`, filePath);
      res.send();
    });
  });

  req.on('error', (err) => {
    next(err);
  });
});

module.exports = router;
