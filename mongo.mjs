import { MongoClient, ObjectId } from "mongodb";
const LocalUrl = 'mongodb://127.0.0.1:27017';
const AtlasUrl = 'mongodb+srv://zjr1993:19931129lcq' +
    '@cluster0.lglhg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const url = process.env.atlas ? AtlasUrl : LocalUrl;
const cfg_maxCache = 5;
const maxCache = process.env.maxcache ? Number(process.env.maxcache) : cfg_maxCache;
const Client = new MongoClient(url);


class cacheQueue {
    constructor(num) {
        this.items = [];
        this.maxLength = num;
    }

    // add an element to the back of the queue
    add(element) {
        if (this.isMax()) {
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
        if (this.isEmpty()) {
            return null;
        }
        return this.items.shift();
    }
    // Check the front element without removing it
    peek() {
        if (this.isEmpty()) {
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
        for (let j = 0; j < this.items.length; j++) {
            console.log(this.items[j]);
        }
    }
}

const queue = new cacheQueue(maxCache);



async function findOne(database, collection, query, options) {
    let result = null;
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        result = await collect.findOne(query, options);
        return result;
    }
    finally {
        if (result) queue.add(result);
    }
}

async function findMany(database, collection, query, options, errmsg) {
    let docx = [];
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const cursor = collect.find(query, options);
        for await (let doc of cursor){
            docx.push(doc);
        }
        return docx;
    }
    catch (error){
        if (errmsg !== undefined){
            errmsg(error);
        }
    }
    finally {
        if (docx.length > 0) queue.add(docx);
    }
}


async function findManyNoId(database, collection, query, options, errmsg) {
    let newOptions = {};
    for (let p in options){
        newOptions[p] = options[p]
    }
    if ( !options.hasOwnProperty('projection') ){
        newOptions['projection'] = {'_id': 0};
    }
    return (await findMany(database, collection, query, newOptions, errmsg));
}




async function upsert(database, collection, doc, errmsg) {
    let _t = await findOne(database, collection, doc);
    let insertOneId = null;
    if (_t) {
        return null;
    }
    else {
        try {
            const db = Client.db(database);
            const collect = db.collection(collection);
            const insertOneResult = await collect.insertOne(doc);
            insertOneId = (insertOneResult.acknowledged) ? insertOneResult.insertedId.toString() : null;
            return insertOneId;
        }
        catch (error) {
            if (errmsg !== undefined) {
                errmsg(error);
            }
        }
        finally {
            if (insertOneId) queue.add(insertOneId);
        }
    }
}

async function upsertMany(database, collection, docs, errmsg) {
    const db = Client.db(database);
    const collect = db.collection(collection);
    const insertManyIds = [];
    const len = docs.length;
    try {
        for (let j = 0; j < len; j++) {
            if (await findOne(database, collection, docs[j])) {
                insertManyIds.push(null);
                continue;
            }
            else {
                let insertOneResult = await collect.insertOne(docs[j]);
                if (insertOneResult.acknowledged) {
                    insertManyIds.push(insertOneResult.insertedId.toString());
                }
                else {
                    insertManyIds.push(null);
                }
            }
        }
        return insertManyIds;
    }
    catch (error) {
        if (errmsg !== undefined) {
            errmsg(error);
        }
        return insertManyIds;
    }
}

async function findManyDist(database, collection, Key, filter, errmsg) {
    let noDuplicateList = [];
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        noDuplicateList = await collect.distinct(Key, filter);
        return noDuplicateList;
    }
    catch (error) {
        if (errmsg !== undefined) {
            errmsg(error);
        }
    }
    finally {
        if (noDuplicateList) queue.add(noDuplicateList);
    }
}

async function insertOne(database, collection, document, errmsg) {
    let insertOneId = null;
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const insertOneResult = await collect.insertOne(document);
        insertOneId = (insertOneResult.acknowledged) ? insertOneResult.insertedId.toString() : null;
        return insertOneId;
    }
    catch (error) {
        if (errmsg !== undefined) {
            errmsg(error);
        }
    }
    finally {
        if (insertOneId) queue.add(insertOneId);
    }
}

async function insertMany(database, collection, documents, errmsg) {
    var insertManyIds = [];
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        const insertManyResult = await collect.insertMany(documents);
        if (insertManyResult.acknowledged) {
            Object.values(insertManyResult.insertedIds).forEach((x) => {
                insertManyIds.push(x.toString());
            });
        }
        return insertManyIds;
    }
    catch (error) {
        if (errmsg !== undefined) {
            errmsg(error);
        }
    }
    finally {
        if (insertManyIds) queue.add(insertManyIds);
    }
}

async function update(database, collection, filter, updateDoc, options, errmsg, singleUpdate){
    let result = {'acknowledged': false};
    try {
        const db = Client.db(database);
        const collect = db.collection(collection);
        if ( singleUpdate ) result = await collect.updateOne(filter, updateDoc, options);
        else result = await collect.updateMany(filter, updateDoc, options);
        return result;
    }
    catch (error){
        if ( errmsg !== undefined ){
            errmsg(error);
        }
    }
    finally {
        // acknowledged: boolean, matchedCount: number, modifiedCount: number
        // upsertedCount: number, upsertedId: _id
        if ( result.acknowledged ) queue.add(result);
    }
}




const _insertOne = insertOne;
const _update = update;
const _insertMany = insertMany;
const _findManyDist = findManyDist;
const _findOne = findOne;
const _upsert = upsert;
const _upsertMany = upsertMany;
const _findMany = findMany;
const _findManyNoId = findManyNoId;

export {_findOne as findOne, _upsert as upsert, _upsertMany as upsertMany,
    _findMany as findMany,
    _findManyNoId as findManyNoId,
    _findManyDist as findManyDist,
    _insertOne as insertOne,
    _insertMany as insertMany,
    _update as update,
}
