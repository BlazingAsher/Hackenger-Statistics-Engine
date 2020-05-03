var express = require('express');
var router = express.Router();
const CryptoJS = require('crypto-js');
const base64 = require('base-64');

const StatEntry = require('../models/StatEntry')
const stats = require('../services/stats');

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({"status": "OK"})
});

router.post('/report', function(req, res, next){
  let reportEncoded = req.body["info"];
  let reportInfo = JSON.parse(CryptoJS.AES.decrypt(base64.decode(reportEncoded), process.env.SECRET).toString(CryptoJS.enc.Utf8));

  StatEntry.create(reportInfo, function(err, result){
    if(err) return res.json({"status": "ERROR"});
    return res.json({"status": "OK"});
  })

})

router.post('/reportInternal', function(req, res, next){
  if(!req.body["key"] || req.body["key"].toString() !== process.env.INTERNAL_KEY){
    return res.json({"status": "UNAUTHORIZED"});
  }

  let reportInfo = req.body["info"];

  StatEntry.create(reportInfo, function(err, result){
    if(err) return res.json({"status": "ERROR"});
    return res.json({"status": "OK"});
  })

})

router.get('/stats', function(req, res, next){
  return res.json({"status": "OK", "stats": stats.getStats()})
})

router.get('/testData', function(req, res, next){
  if(process.env.ENV !== 'development'){
    return res.json({"status": "UNAUTHORIZED"})
  }
  let testData = {
    timestamp: Date.now(),
    question: 1,
    state: "testing",
    namespace: "ns_test"
  }
  return res.json({data: base64.encode(CryptoJS.AES.encrypt(JSON.stringify(testData), process.env.SECRET).toString())});
})

module.exports = router;
