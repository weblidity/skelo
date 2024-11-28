const shell = require('shelljs');

shell.cd(__dirname);
const {code, stdout, stderr} = shell.exec('node ../index.js ../test/**/*.outline.yaml ../test/**/*.outline.yml --verbose --');
// shell.exec('dir');