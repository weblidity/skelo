const shell = require('shelljs');

shell.cd(__dirname);
shell.echo('rem ===============');
shell.echo("rem build with specifid patterns and verbose output");
shell.echo('rem ===============');

const {code, stdout, stderr} = shell.exec('node ../index.js ../test/**/*.outline.yaml ../test/**/*.outline.yml --verbose --');

shell.echo('rem ===============');
