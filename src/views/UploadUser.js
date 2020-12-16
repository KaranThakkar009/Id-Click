const fs = require("fs");
const jsonData = require("./src/descriptors/bnk48.json");


const user = {
    name: "Jack",
    descriptor: [8,43]
};

jsonData[user.name] = user;
fs.writeFileSync("./JsonFile.json", JSON.stringify(jsonData,null,2),err=>{
    if(err) throw err;
    console.log("Done Writing");
});
