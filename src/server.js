const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const jsonData = require('../src/descriptors/bnk48.json')

const accountSid = 'AC6f1f687b870cb599cbc186abf8621348';
const authToken = 'ee4c08ba3304115745a1703942bf8cd9';
const client = require('twilio')(accountSid, authToken);


const app = express();
const port = 5000;
//const hostname = '192.168.43.113';

app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.get('/', (req, res) => res.status(200).send({
    message: "Server is running..."
}));


const WriteTextToFileSync = (contentToWrite) => {
    fs.writeFileSync('./src/descriptors/bnk48.json', contentToWrite, (err) => {
        //console.log(contentToWrite);
        if (err) {
            console.log(err);
        } else {
            console.log('Done writing to file successfully...')
        }
    })
}

const SendWAMessage = (waMessage) => {
    client.messages.create({
        from: 'whatsapp:+14155238886',
        body: `${waMessage}`,
        to: 'whatsapp:+918828088551'
    }).then(message => console.log(message.sid));
}

app.post('/message', (req, res, next)=> {
    const Message = req.body.msg
    // const Img = req.body.img
    // console.log(Img)
    SendWAMessage(Message)
});

app.post('/write', (req, res, next) => {
    const user = {
        "name": req.body[0].name,
        "descriptors": req.body[0].descriptors
    }
    jsonData[user.name] = user
    //console.log(req.body[0].descriptors)
    const requestContent = JSON.stringify(jsonData, null, 2);
    WriteTextToFileSync(requestContent)
});

app.use((req, res, next) => res.status(404).send({
    message: "Couldn't find specified route that was requested..."
}));

app.listen(port, () => {
    console.log(
        `
        !!! server is running..
        !!! Listening for incoming requests on port ${port}
        !!! Server running at ${port}
        !!! http://localhost:5000
        `
    )
})