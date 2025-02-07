const example = '/^ui.*p[1-9]+$/i'
const example2 = {uu:{ sku: { $regex: "/789$/" }, name: example }}



const demo = {
    example: example,
    num: 123,
    name: "zjr/u/"
}
// const pattern = /^\/([^\/]+)\/([a-z]{0,2})$/;

// const match = example.match(pattern);


// const [_, firstPart, secondPart] = match;
// console.log(firstPart);
// console.log(`0${secondPart}0`);


// let reg = new RegExp(firstPart, secondPart);

// console.log(reg.test("UIabcpp223"))



function stringToRegExp(query) {
    const pattern = /^\/([^\/]+)\/([a-z]{0,2})$/;
    for (const key of Object.keys(query)) {
        if (typeof query[key] === 'string' && (match = query[key].match(pattern))) {
            const [_, firstPart, secondPart] = match;
            query[key] = new RegExp(firstPart, secondPart);
        }
    }
}

function RegExprize(query){
    const pattern = /^\/([^\/]+)\/([a-z]{0,2})$/;
    for (let key of Object.keys(query)){
        if (typeof query[key] === 'object'){
            RegExprize(query[key]);
        }
        else {
            if (typeof query[key] === 'string' && pattern.test(query[key])) {
                const [_, firstPart, secondPart] = query[key].match(pattern);
                query[key] = new RegExp(firstPart, secondPart);
            }
        }
    }
}

RegExprize(example2);
console.dir(example2)