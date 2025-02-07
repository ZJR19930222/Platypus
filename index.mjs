import express from "express";
import bodyParser from "body-parser";
import * as mongo from "./mongo.mjs";

const app = express();
const port = 3989;
const public_path = "./public";
const Cfg = 'config';
let Debug = true;

app.set('port', process.env.port ? Number(process.env.port) : port);
app.set('cfg', process.env.cfg ? String(process.env.cfg) : Cfg);
app.set('debug', process.env.debug ? Boolean(process.env.debug) : Debug);
app.set('public_path', process.env.public_path ? String(process.env.public_path) : public_path);

app.use(express.static(app.get("public_path")));
app.use(bodyParser.json({
    limit: '10mb',
    extended: true,
}));

function Print(message) {
    if (app.get('debug')) {
        console.log(message);
    }
}

// 查询字符串正则化
function RegExprize(query) {
    const pattern = /^\/([^\/]+)\/([a-z]{0,2})$/;
    for (let key of Object.keys(query)) {
        if (typeof query[key] === 'object') {
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

// 服务器是否可达
app.get('/echo', function (req, res) {
    Print(`${req.url} connect!`);
    res.status(200);
    res.send("what can I say!");
});

// 测试网址参数
app.get('/test', function (req, res) {
    let paramArray = [];
    for (let key of Object.keys(req.query)) {
        paramArray.push(`${key}: type is ${typeof req.query[key]}`);
    }
    res.status(200);
    res.send(paramArray);
});



// 查询数据
app.post('/find', function (req, res) {
    let database = req.query.db;
    let collect = req.query.collect;
    let query = req.body.query;
    let options = req.body.options;
    Print(`a query on ${database}.${collect} with condition: ${query}`);
    RegExprize(query);
    mongo.findMany(database, collect, query, options, (x) => {
        Print(x);
        res.status(303);
        res.send({ error: x });
    }).then((value) => {
        if (value === undefined) return;
        if (value.length == 0) {
            // find no documents
            res.status(404);
        }
        else {
            // find documents
            res.status(200);
        }
        res.send(value);
    });
});

// 插入数据 
// statusCode: 303   部分失败
// statusCode: 404   没有插入
// statusCode: 200   插入成功
app.post('/insert', function (req, res) {
    let database = req.query.db;
    let collect = req.query.collect;
    let docx = req.body;
    Print(`insert to the ${database}.${collect}`);
    if (docx.hasOwnProperty('length')) {
        mongo.insertMany(database, collect, docx, (x) => {
            Print("A MongoBulkWriteException occured, but there are successfully processd documents.");
            let insertManyIds = new Array();
            let _MongoBulkWriteError = x.result;
            let _BulkWriteResult = _MongoBulkWriteError.result;
            Object.values(_BulkWriteResult.insertedIds).forEach((y) => {
                insertManyIds.push(y.toString());
            })
            // 部分数据插入失败
            res.status(303);
            res.send(insertManyIds);
        }).then((value) => {
            if (value === undefined) return;
            if (value.length > 0) {
                res.status(200);
            }
            else {
                // no documents is inserted!
                res.status(404);
            }
            res.send(value);
        })
    } else {
        mongo.insertOne(database, collect, docx).then((value) => {
            if (value) {
                res.status(200);
                res.send(value);
            }
            else {
                // no document is inserted!
                res.status(404);
                res.send("");
            }
        })
    }
});


// 无重复插入数据
app.post('/upsert', function (req, res) {
    let database = req.query.db;
    let collect = req.query.collect;
    let docx = req.body;
    Print(`upsert to the ${database}.${collect}`);
    if (docx.hasOwnProperty('length')) {
        // many documents
        mongo.upsertMany(database, collect, docx, (x) => {
            Print("some documents failed to insert!");
            Print(x);
        }).then((value) => {
            if (value.length != docx.length) {
                // some error!
                res.status(303);
            }
            else {
                res.status(200);
            }
            res.send(value);
        })
    }
    else {
        // single document
        mongo.upsert(database, collect, docx, (x) => {
            Print("document failed to insert!")
            Print(x);
        }).then((value) => {
            if (value === null || value === undefined) {
                // some error! or no document insert!
                res.status(404);
                res.send("");
            }
            else {
                res.status(200);
                res.send(value);
            }
        })

    }
});

// 查询某个key值对应的不同值
app.post('/distinct', function (req, res) {
    let database = req.query.db;
    let collect = req.query.collect;
    let key = req.body.key;
    let filter = req.body.filter;
    RegExprize(filter);
    mongo.findManyDist(database, collect, key, filter, (x) => {
        Print("error! in function findManyDist");
        Print(x);
        res.status(303);
        res.send({ error: x });
    }).then((value) => {
        if (value === undefined) return;
        if (value.length > 0) {
            res.status(200);
            res.send(value);
        }
        else {
            res.status(404);
            res.send([value]);
        }
        
    })
});

app.post('/update', function (req, res) {
    let database = req.query.db;
    let collect = req.query.collect;
    let filter = req.body.filter;
    let update = req.body.update;
    let options = req.body.options;
    RegExprize(filter);
    mongo.update(database, collect, filter, update, options, (x) => {
        Print("update error!");
        res.status(303);
        res.send({ error: x });
    }, req.query.onlyOne).then((value) => {
        if (value === undefined) return;
        res.status(value.acknowledged ? 200 : 404);
        res.send(value);
    })
});

app.listen(app.get('port'), function () {
    let _port = app.get('port');
    Print(`Platypus listen on http://127.0.0.1:${_port}`);
    Print('press Ctrl + C to terminate.');
})