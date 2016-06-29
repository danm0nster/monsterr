var fs = require('fs');
var path = require('path');

fs.writeFile(path.join(process.cwd(), '../../client.js'),
  'monsterr.run();\n', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('-monsterr-> client.js created!');
  }
});

fs.writeFile(path.join(process.cwd(), '../../server.js'),
  'var monsterr = require(\'monsterr\');\n\nmonsterr.run();\n', (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('-monsterr-> server.js created!');
  }
});

fs.mkdir(path.join(process.cwd(), '../../logs'), function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log('-monsterr-> logs dir created!');
  }
})
