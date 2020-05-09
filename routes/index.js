let express = require('express');
let router = express.Router();
const CryptoJS = require('crypto-js');
const base64 = require('base-64');

const StatEntry = require('../models/StatEntry');
const SubmitEntry = require('../models/SubmitEntry');
const stats = require('../services/stats');

const submissionHandler = require('../services/submissionHandler');

/* GET home page. */
router.get('/', function(req, res, next) {
  return res.json({"status": "OK"})
});

router.post('/report', function(req, res, next){
  if(req.body.info === undefined){
    return res.json({
      "status": "BAD REQUEST"
    })
  }
  let reportEncoded = req.body["info"];
  //let reportInfo = JSON.parse(CryptoJS.AES.decrypt(base64.decode(reportEncoded), process.env.SECRET).toString(CryptoJS.enc.Utf8));
  let reportInfo = req.body["info"];
  reportInfo["timestamp"] = Date.now(); // trust our timestamp

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

router.get('/updateFrequency', function (req, res, next){
  return res.json({"status": "OK", "frequency": process.env.UPDATE_FREQUENCY});
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

router.post('/submit', function(req, res, next){
  if(req.body.namespace === undefined || req.body.question === undefined || req.body.answer === undefined){
    return res.json({
      "status": "BAD REQUEST"
    })
  }
  SubmitEntry.create({
    timestamp: Date.now(),
    namespace: req.body.namespace,
    question: req.body.question,
    submission: req.body.answer
  }, function(err, result){
    if(err){
      console.log("Error creating submission entry.");
      console.log(err);
    }

    return res.json({
      "status": "OK",
      "result": submissionHandler.verifySubmission(req.body.namespace, req.body.question, req.body.answer)
    })
  })

})

module.exports = router;
