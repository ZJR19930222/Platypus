function setParams() {
    let argnum = arguments.length;
    if (argnum < 2) return '';
    let nascence = '?';
    for (let i=0; i<argnum; i++){
        let str = (arguments[i] === null)? '' : arguments[i];
        if (i%2) nascence += ('=' + str);
        else     nascence += ('&' + str);
    }
    return nascence;
}


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

console.log(setParams("https://www.baidu.com/host/",'pn',60,
    'queryWord','鱼',
    'tn','resultjson_com',
    'logid',"5179920884740494226", 'st', -1, 'nc', '', 'rn', 30))


