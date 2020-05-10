const jwt = require('jsonwebtoken');
const StatEntry = require('../models/StatEntry');
let SubmissionHandler = {}

let questionData = {}

SubmissionHandler.init = function(qData){
    console.log(qData);
    questionData = qData;
}

SubmissionHandler.verifySubmission = function (namespace, question, answer){
    //console.log(namespace);
    //console.log(question);
    if(questionData[namespace] === undefined){
        return {
            "success": false, // indicates request, NOT result success
            "message": "No such namespace!"
        }
    }

    if(questionData[namespace][question] === undefined){
        return {
            "success": false,
            "message": "No such question!"
        }
    }

    let thisQuestionData = questionData[namespace][question];

    if(!thisQuestionData["caseMatch"]){
        answer = answer.toLowerCase();
    }

    let matches = thisQuestionData["answers"].includes(answer)

    StatEntry.create({
        timestamp: Math.round(Date.now()/1000),
        namespace: namespace,
        question: question,
        state: matches ? "correct" : "incorrect"
    }, function(err, result){
        if(err) console.log(err);
    });

    if(matches){
        let returnData = thisQuestionData["actionPacket"];
        if(thisQuestionData["final"]){
            let verifyToken = jwt.sign({ finished: question }, process.env.SECRET);
            returnData["data"] += "?key=" + verifyToken;
        }
        return {
            "success": true,
            "correct": true,
            "message": thisQuestionData["correctMessage"] || "Correct answer!",
            "data": returnData
        }
    } else{
        return {
            "success": true,
            "correct": false,
            "message": thisQuestionData["incorrectMessage"] || "Wrong answer!",
        }
    }
}

module.exports = SubmissionHandler;