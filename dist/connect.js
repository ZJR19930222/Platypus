const Localurl = 'http://127.0.0.1:3989/';

function setParams(url, ...param) {
    if (url.endsWith('/')){
        url = url.slice(0, url.length - 1);
    }
    if (param.length == 0) return url;
    let nascence = url + '?' + param[0];
    let j = 1
    for (let j=1; j< param.length; j++){
        if (j%2){
            nascence += ('=' + param[j]);
        }
        else {
            nascence += ('&' + param[j])
        }
    }
    return nascence;
}

// return [statusCode, content]
async function uploadJson(docx, host, ...param) {
    const response = await fetch(setParams(Localurl+host, ...param), {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(docx)
    });
    let content;
    if (docx.hasOwnProperty('length')){
        content = await response.json();
    }
    else {
        content = await response.text();
    }
    return [response.status, content];
}

async function findDocx(query, options, host, ...param) {
    const response = await fetch(setParams(Localurl+host, ...param), {
        headers:{
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({query: query, options: options})
    });
    let content = await response.json();
    return [response.status, content];
}

async function distinctDocx(key, filter, host, ...param) {
    const response = await fetch(setParams(Localurl+host, ...param), {
        headers:{
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({key: key, filter: filter})
    });
    let content = await response.json();
    return [response.status, content];
}

async function CheckConnect() {
    return await fetch(Localurl+'echo', {
        headers: {
            'Content-Type': 'text/plain'
        },
        method: 'get'
    }).then((x)=>{
        if (x.status == 200){
            return true;
        }
        else {
            return false;
        }
    }).catch((x)=>{
        return false;
    });
}


async function update(filter, updateDoc, options, host, ...param) {
    let response = await fetch(setParams(Localurl+host, ...param), {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        body: JSON.stringify({filter: filter, update: updateDoc, options: options})
    });
    let content = await response.json();
    return [response.status, content];
}