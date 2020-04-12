const fs = require('fs');
const path = require('path');
const headers = require('./cors');
const multipart = require('./multipartUtils');
const messageQueue = require('./messageQueue');

// Path for the background image ///////////////////////
// ../img/background
// module.exports.backgroundImageFile = path.join('.', 'background.jpg');
module.exports.backgroundImageFile = path.join('.', 'spec', 'img', 'background.jpg');
////////////////////////////////////////////////////////

let keyName = null; //originally messageQueue
module.exports.initialize = (queue) => {
  messageQueue.enqueue(queue);
  keyName = queue;
};

var getRandomDirection = function() {
  var directions = ["up", "down", "left", "right"];
  var index = Math.floor(Math.random() * directions.length);
  return directions[index];
}

module.exports.router = (req, res, next = ()=>{}) => {
  console.log('Serving request type ' + req.method + ' for url ' + req.url);

  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    res.end();
    next();
  } else if (req.method === 'GET') {
    if (req.url === '/random') {
      res.writeHead(200, headers);
      res.write(getRandomDirection());
      res.end();
      next();
    } else if (req.url === '/keypress') {
      res.writeHead(200, headers);
      var dequeued = messageQueue.dequeue();
      keyName = null;
      if (dequeued) {
        // console.log(dequeued);
        res.write(dequeued);
      }
      res.end();
      next();
    } else if (req.url === '/background') { // <----- Get background image
      fs.readFile( module.exports.backgroundImageFile, (err, data) => {
        if (err) {
          res.writeHead(404, headers);
        } else {
          res.writeHead(200, headers);
          //when you readFile, data is in binary, still works without binary???
          res.write(data);
        }
        res.end();
        next();
      })
    } else {
      res.writeHead(404, headers);
      res.end();
      next();
    }
  } else if (req.method === 'POST') {
    if (req.url === '/post') {
      // req.on('data', (data) => {
      //   module.exports.backgroundImageFile = data;
      // });
      // res.end();
      // next();
      var fileData = Buffer.alloc(0);

      req.on('data', (chunk) => {
        fileData = Buffer.concat([fileData, chunk]);
      });

      req.on('end', () => {
        var file = multipart.getFile(fileData);
        fs.write(module.exports.backgroundImageFile, file.data, (err) => {
          res.writeHead(err ? 404 : 200, headers);
          res.end();
          next()
        });
      });
    }
  } else {
      res.writeHead(404, headers);
      res.end();
      next(); // invoke next() at the end of a request to help with testing!
  }
};

/*
var fileData = Buffer.alloc(0);

req.on('data', (chunk) => {
  fileData = Buffer.concat([fileData, chunk]);
});

req.on('end', {} => {
  fs.write(module.exports.backgroundImageFile, fileData, (err) => {
    res.writeHead(err ? 404 : 200, headers);
    res.end();
    next()
  });
});
*/
