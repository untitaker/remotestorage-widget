var fs = require('fs');
var path = require('path');

var argv = process.argv.slice(2);
var sourcePath = argv[0];
var targetPath = argv[1];

if (! (sourcePath && targetPath)) {
  console.error('Usage: ' + process.argv.slice(0, 2).join(' ') + ' SOURCE_DIR TARGET_FILE');
  return;
}

var output = '/** THIS FILE WAS GENERATED BY compile-assets.js. DO NOT CHANGE IT MANUALLY, BUT INSTEAD CHANGE THE ASSETS IN src/assets/. **/\n';
output += 'RemoteStorage.Assets = {';

fs.readdirSync(sourcePath).forEach(function(fileName) {
  if (!fileName.match(/\.(js|css|html|png|svg)$/)) {
    return;
  }
  var parts = fileName.split('.');
  var name = parts[0];
  var ext = parts[1];
  var fullPath = path.join(sourcePath, fileName);
  var content;
  if (ext === 'png') {
    content = 'data:image/png;base64,' + fs.readFileSync(fullPath, 'base64');
  } else if (ext === 'svg') {
    content = 'data:image/svg+xml;base64,' + fs.readFileSync(fullPath, 'base64');
  } else {
    content = fs.readFileSync(fullPath, 'utf-8').replace(/\n/g, ' ');
  }

  // TODO use lib for minifying (and strip comments)
  if (ext === 'css') {
    content = content.
      replace(/\s+/g, ' ').
      replace(/\s?\{\s?/g, '{').
      replace(/\s?\}\s?/g, '}').
      replace(/\n/g, '').
      replace(/;\s/g, ';').
      replace(/:\s/g, ':');
  }

  output += '\n  ' + name + ": '" + content.replace(/'/g, "\\'") + "',";
});

output = output.replace(/,$/, '');

output += '\n};\n';

fs.writeFileSync(targetPath, output);
