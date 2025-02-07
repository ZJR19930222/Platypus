const con = [];
function divisor(num){
    let result = null;
    try {
        result = 1 / num;
        if (num == 0) throw new Error("divisor is zero!!");
        return result;
    }
    catch(error){
        console.log("some error");
    }
    finally {
        con.push(result);
    }
}

console.log(divisor(0));
console.log(con)