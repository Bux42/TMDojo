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
 * GET /maps/:mapUID/tmx
 * Retrieves map's TMX id
 */
router.get('/:mapUID/tmx', async (req, res, next) => {
  // uses param "mapUId" and fetches the TMX id for it
  try {
    const tmxRes = await axios.get(`https://trackmania.exchange/api/maps/get_map_info/multi/${req.params.mapUID}`, {
      withCredentials: true
    });

    const tmxData = tmxRes.data;
    if (tmxData[0] && tmxData[0].TrackID) {
      res.send({ tmxId: tmxData[0].TrackID });
    } else {
      res.status(404).send({ error: 'No TMX data available for this map.' });
    }
  } catch (error) {
    next(error);
  }
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
