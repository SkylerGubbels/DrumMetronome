const http = require("http");
const fs = require("fs");
const url = require("url");

let ROOT_DIR = "html";

http.createServer(function(req, res){
    
    let urlObj = url.parse(req.url, true, false);
    let receivedData = "";

    /** Supplies .html file to the client */
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
            console.log(receivedData);

            let dataObj = JSON.parse(receivedData);
            let returnObj = {};

            /** Saves a new drumbeat */
            if(dataObj.beat)
            {
                // Note: Currently only works if there is already a drumset saved in drumbeats.txt
                fs.readFile("html/drumbeats.txt", function(err, data){
                    let drumBeatArr;

                    drumBeatArr = JSON.parse(data);
                    drumBeatArr.push(dataObj);

                    fs.writeFile("html/drumbeats.txt", JSON.stringify(drumBeatArr), function(err, data){
                        if(err){
                            console.log("ERROR: " + JSON.stringify(err));
                            res.writeHead(404);
                            res.end(JSON.stringify(returnObj));
                        }
                    })

                    res.writeHead(200);
                    res.end(JSON.stringify(returnObj));

                })
            }

            /** Gets requested drumbeat from server */
            if(dataObj.request)
            {

                fs.readFile("html/drumbeats.txt", function(err, data){
                    let drumBeatArr = JSON.parse(data);
                    for(let beat of drumBeatArr)
                    {
                        if(beat.name === dataObj.request)
                        {
                            returnObj = beat;
                        }
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify(returnObj));
                })
            }

            /** Gets song names available for dropdown menu */
            if (dataObj.names)
            {
                returnObj.names = [];

                fs.readFile("html/drumbeats.txt", function(err, data){
                    let drumBeatArr = JSON.parse(data);
                    for(let beat of drumBeatArr)
                    {
                        console.log(beat.name);
                        returnObj.names.push(beat.name); 
                        console.log(returnObj.names);
                    }

                    res.writeHead(200);
                    res.end(JSON.stringify(returnObj));
                    
                })

                console.log("HERE: " + returnObj.names);
            }
        }
    })

}).listen(process.env.PORT || 3000);

console.log("Server Running at Port 3000  CNTL-C to quit");
console.log("To Test:");
console.log("http://localhost:3000");