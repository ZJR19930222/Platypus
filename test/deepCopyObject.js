const config = {name: "zjr", address: {
    city: "new york",
    state: "mayaland"
}}

let newConfig = {}

for (let p in config){
    newConfig[p] = config[p];
}

newConfig["address"]["city"]="sanjie";

console.log(config)

newConfig['projection'] = {"_id": 0};

console.log(config)
