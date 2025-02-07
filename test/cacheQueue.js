
class cacheQueue {
    constructor(num) {
        this.items = [];
        this.maxLength = num;
    }

    // add an element to the back of the queue
    add(element){
        if (this.isMax()){
            this.dequeue();
        }
        return this.enqueue(element);
    }

    // Add an element to the back of the queue
    enqueue(element) {
        this.items.push(element);
    }

    // Remove and return the element at the front of the queue
    dequeue() {
        if (this.isEmpty()){
            return null;
        }
        return this.items.shift();
    }
    // Check the front element without removing it
    peek() {
        if (this.isEmpty()){
            return null;
        }
        return this.items[0];
    }
    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // get the size of the queue
    size() {
        return this.items.length;
    }

    // Check if the length of queue exceeds the max limitation
    isMax() {
        return this.items.length >= this.maxLength;
    }

    // print the queue 
    print() {
        for (let j=0; j < this.items.length; j++){
            console.log(this.items[j]);
        }
    }
}

const queue = new cacheQueue(5);

queue.add(233);

queue.print()
queue.add("string");
queue.add({"name" : "zjr", "age": 29});
queue.add({"name" : "csl", "age": 23});
queue.print();


queue.add({"name" : "wsl", "age": 24});
queue.add({"name" : "url", "address": "http://www.baidu.com"});

queue.print();
queue.add({"name" : "url", "address": "http://www.bilibili.com"});
queue.add({"name" : "url", "address": "https://www.youtube.com"});

queue.print();