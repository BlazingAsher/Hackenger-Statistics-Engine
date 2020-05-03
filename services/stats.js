const StatEntry = require('../models/StatEntry');
let gStats = {}

function getLastKeyPrefix(state){
    return "last"+state[0].toUpperCase()+state.substring(1);
}

function getAllKeyPrefix(state){
    return "all"+state[0].toUpperCase()+state.substring(1);
}

async function calculateStats() {
    let statDocs = StatEntry.find({});
    statDocs = await statDocs;
    //console.log(statDocs);

    let stats = {}

    for (let statDoc of statDocs){
        let nsp = statDoc["namespace"];
        let timestamp = statDoc["timestamp"];
        let state = statDoc["state"];
        let question = statDoc["question"];

        if(!stats[nsp]){
            stats[nsp] = {}
        }

        if(!stats[nsp][question]){
            stats[nsp][question] = {}
        }

        if(stats[nsp][question][state] === undefined){
            stats[nsp][question][state] = 0
            stats[nsp][question][getLastKeyPrefix(state)] = 0;
            stats[nsp][question][getAllKeyPrefix(state)] = [];
        }

        let lState = getLastKeyPrefix(state);
        let aState = getAllKeyPrefix(state);

        stats[nsp][question][state] += 1
        stats[nsp][question][aState].push(timestamp);
        if(stats[nsp][question][lState] < timestamp){
            stats[nsp][question][lState] = timestamp;
        }

    }
}

let Stats = {}

Stats.getStats = function() {
    return gStats;
}

Stats.startService = async function () {
    calculateStats();
    setInterval(async function() {
        calculateStats();
    }, 30*1000);
}

module.exports = Stats;