function pack(num1, num2){
    return [num1 + num2, num1-num2];
}


let [sum, deviation] = pack(100, 199);

console.log(sum);
console.log(deviation);