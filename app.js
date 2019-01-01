const http = require("http");
const fs = require("fs");
const url = require("url");

let ROOT_DIR = "html";

http.createServer(function(req, res){
    
    let urlObj = url.parse(req.url, true, false);
    let receivedData = "";

    if (req.method === "GET")
    {
        let htmlPath = ROOT_DIR + urlObj.pathname;
        if(urlObj.pathname === "/") { htmlPath = ROOT_DIR + "/main-page.html"; }

        fs.readFile(htmlPath, function(err, data){
            if(err){
                console.log("Error" + JSON.stringify(err));
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }

            res.writeHead(200, {"Content-Type": "text/html"});
            res.end(data);
        })
    }

    req.on("data", function(chunk)
    {
        receivedData += chunk;
    })

    req.on("end", ()=>{
        if(req.method === "POST")
        {
            console.log("POST");

            let dataObj = JSON.parse(receivedData);
            let returnObj = {};

            if(dataObj.beat)
            {
                console.log(dataObj.beat);
            }
        }
    })

}).listen(3000);

console.log("Server Running at Port 3000  CNTL-C to quit");
console.log("To Test:");
console.log("http://localhost:3000");