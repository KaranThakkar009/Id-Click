const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');
const cors = require('cors');
const jsonData = require('../src/descriptors/bnk48.json')

const app = express();
const port = process.env.PORT || 5000;
//const hostname = '192.168.43.113';

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cors());

app.get('/',(req,res) => res.status(200).send({
    message: "Server is running..."
}));


const WriteTextToFileSync =  (contentToWrite) => {
    fs.writeFileSync('./src/descriptors/bnk48.json',contentToWrite,(err) =>{
        //console.log(contentToWrite);
        if(err) {
            console.log(err);
        }else {
            console.log('Done writing to file successfully...')
        }
    })
}

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
      res.sendFile(path.join(__dirname, 'student-face-recognition/build', 'index.js'));
    });
  }

app.post('/write',(req,res,next) =>{
    const user = {
        "name": req.body[0].name,
        "descriptors": req.body[0].descriptors
    }
    jsonData[user.name]=user
    //console.log(req.body[0].descriptors)
    const requestContent = JSON.stringify(jsonData,null,2);
    WriteTextToFileSync(requestContent)
});

app.use((req,res,next) => res.status(404).send({
    message: "Couldn't find specified route that was requested..."
}));

app.listen(port,()=>{
    console.log(
        `
        !!! server is running..
        !!! Listening for incoming requests on port ${port}
        !!! Server running at ${port}
        !!! http://localhost:5000
        `
    )
})