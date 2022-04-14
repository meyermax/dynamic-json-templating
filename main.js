const fs = require('fs');

const dict = {

    "sum": (a, b) => {
        return a + b;
    },
    "constant": () => {
        return 2;
    }

}


const results = {
    ZK: {
        daily: [
            {
                "date": "2021-06-29",
                "value": 96.0,
                "country": 643
            },
            {
                "date": "2021-06-29",
                "value": 38.0,
                "country": 860
            },
            {
                "date": "2021-06-29",
                "value": 6.0,
                "country": 410
            },
            {
                "date": "2021-06-29",
                "value": 5.0,
                "country": 398
            },
            {
                "date": "2021-06-29",
                "value": 2.0,
                "country": 246
            },
            {
                "date": "2021-06-29",
                "value": 1.0,
                "country": 792
            },
            {
                "date": "2021-06-29",
                "value": 1.0,
                "country": 376
            }
        ]
    }
}


const json_file = fs.readFileSync('./test.json', 'utf8');

let json = JSON.parse(json_file);



//parse json with bfs
function parse(json, callback) {
    let processed = {};
    if (typeof json === 'object') {
        for (let key in json) {
            if (Array.isArray(json[key])) {
                processed[key] = json[key].map((val) => {
                    return parse(val, callback)
                });
            } else {
                processed[key] = parse(json[key], callback);
            }
        }
        return callback(processed);
    } else {
        return json;
    }
}

//execution time
console.time("parse");



function parseArray(obj){
    if (obj['items'] === '*') {
        return obj['context'];
    } else {
        let arr = [];
        for (const item of obj['context']) {
            let newItem = {};
            for (const key in obj['items']) {
                if (key.startsWith('@')) {
                    newItem[key.substring(1)] = item[obj['items'][key]];
                } else {
                    newItem[key] = obj['items'][key];
                }
            }
            arr.push(newItem);
        }
        return arr;
    }
}


json = parse(json, (obj) => {
    if (obj.hasOwnProperty('@type')) {
        switch (obj['@type']) {
            case 'function':
                //case function
                return dict[obj['function']](...obj['args']);
            case 'array':
                //case array
                return parseArray(obj);
            case 'results':
                //case result
                let service = results[obj['service']]
                return obj['path'].split('.').reduce((prev, curr) => {
                    return prev[curr];
                }, service);
            default:
                //case default
                return obj
        }
    } else {
        return obj;
    }
});

console.timeEnd("parse");

console.log(JSON.stringify(json));
