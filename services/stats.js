const StatEntry = require('../models/StatEntry');
let gStats = {}

async function calculateStats() {
    let statDocs = StatEntry.find({});
    statDocs = await statDocs;

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
            stats[nsp][question][state] = {}
            stats[nsp][question][state]["num"] = 0;
            stats[nsp][question][state]["lastTrigger"] = 0;
            stats[nsp][question][state]["freq"] = {};
        }

        stats[nsp][question][state]["num"] += 1;
        if(stats[nsp][question][state]["lastTrigger"] < timestamp){
            stats[nsp][question][state]["lastTrigger"] = timestamp;
        }

        if(stats[nsp][question][state]["freq"][timestamp] === undefined){
            stats[nsp][question][state]["freq"][timestamp] = 0;
        }
        stats[nsp][question][state]["freq"][timestamp] += 1;

    }

    for(let nsp of Object.keys(stats)){
        let nspData = stats[nsp];
        for(let ques of Object.keys(nspData)){
            let quesData = nspData[ques];
            for(let eve of Object.keys(quesData)){
                let eveData = quesData[eve];
                let eveFreqs = eveData["freq"];
                let formattedData = [];
                for(let dataSlice in eveFreqs){
                    if(Object.prototype.hasOwnProperty.call(eveFreqs, dataSlice)){
                        formattedData.push(
                            {
                                x: new Date(parseInt(dataSlice) * 1000),
                                y: eveFreqs[dataSlice]
                            }
                        );
                    }
                }
                // stats[nsp][ques][eve]["chartData"] = {
                //     datasets: [{
                //         label: 'Events',
                //         data: formattedData,
                //         backgroundColor: 'rgba(5, 25, 48, 0.9)',
                //         cubicInterpolationMode: 'monotone'
                //     }]
                // };
                stats[nsp][ques][eve]["chartData"] = formattedData;

            }
        }
    }

    gStats = {
        "data": stats,
        "timestamp": Date.now()
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
    }, parseInt(process.env.UPDATE_FREQUENCY));
}

module.exports = Stats;