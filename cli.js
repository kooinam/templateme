#!/usr/bin/env node
'use strict';
const meow = require('meow');
const logSymbols = require('log-symbols');
const chalk = require('chalk');
const fs = require('fs-extra');
const minimist = require('minimist');
const capitalize = require('capitalize');
const pluralize = require('pluralize');
const camelcase = require('camelcase');

const cli = meow(`
  Usage
    $ templateme generator <generator-name>
    $ templateme generate <generator-name> <template-name>
    $ templateme create <generator-name> <template-name>
    $ templateme delete <generator-name> <template-name
  Examples
    $ templateme generator SimpleModal -p ~/ship/nodejs/templateme/
    $ templateme generate SimpleModal SignInModal -p ~/ship/nodejs/templateme/
    $ templateme create SimpleModal GoodModal -p ~/ship/nodejs/templateme/
    $ templateme delete SimpleModal GoodModal -p ~/ship/nodejs/templateme/
`, {
  string: ['_'],
});

const input = cli.input;
const argv = minimist(process.argv.slice(2));
let path = '';

if (argv.p) {
  path = argv.p;
}

console.log(chalk.blue(path));

if (input[0] == 'generator') {
  const generatorName = input[1]
  if(generatorName) {
    fs.mkdirs(`${path}templateme/${generatorName}`).then(() => {
      return fs.mkdirs(`${path}templateme/${generatorName}/templates`)
    }).then(() => {
      return fs.writeFile(`${path}templateme/${generatorName}/parameters.json`, JSON.stringify({
        templates: ['index.js'],
        parameters: ['name']
      }, null, 2))
    }).then(() => {
      return fs.writeFile(`${path}templateme/${generatorName}/templates/index.js`, '<%= name %>\nFill something here')
    }).catch((err) => {
      console.log(err)
      process.exit(0)
    })
  }
  else {
    console.error('Specify a Generator Name');
    process.exit(0);
  }
}
else if(input[0] == 'generate') {
  const generatorName = input[1]
  const templateName = input[2]
  if(generatorName && templateName) {
    fs.mkdirs(`templateme/${generatorName}/${templateName}`).then(() => {
      return fs.readJson(`${path}templateme/${generatorName}/parameters.json`)
    }).then((json) => {
      let templates = { }
      for(let template of json.templates) {
        templates[template] = `test/${template}`
      }
      let parameters = { }
      for(let parameter of json.parameters) {
        parameters[parameter] = 'placeholder'
      }
      return fs.writeFile(`templateme/${generatorName}/${templateName}/parameters.json`, JSON.stringify({
        templates: templates,
        parameters: parameters
      }, null, 2))
    }).catch((err) => {
      console.log(err)
      process.exit(0)
    })
  }
  else {
    console.error('Specify a Generator Name and Template Name');
    process.exit(0);
  }
}
else if(input[0] == 'create') {
  const generatorName = input[1]
  const templateName = input[2]
  if(generatorName && templateName) {
    fs.readJson(`templateme/${generatorName}/${templateName}/parameters.json`).then((json) => {
      let promises = []
      const parameters = json.parameters;
      for(let template of Object.keys(json.templates)) {
        let promise = fs.readFile(`${path}templateme/${generatorName}/templates/${template}`, 'utf8').then((file) => {
          for(let parameter of Object.keys(json.parameters)) {
            let re = new RegExp(`\<\%\= ${parameter}(\.?)*? \%\>`, "g");
            const matches = file.match(re);

            if (matches) {
              for(const match of matches) {
                let replaced = json.parameters[parameter];
                if (match.indexOf('.split()') > -1) {
                  replaced = replaced.replace(/_/g, ' ');
                }
                if (match.indexOf('.pluralize()') > -1) {
                  replaced = pluralize(replaced);
                }
                if (match.indexOf('.capitalize()') > -1) {
                  replaced = capitalize.words(replaced.replace(/_/g, ' '));
                  if (match.indexOf('.split()') === -1) {
                    replaced = replaced.replace(/ /g, '');
                  }
                }
                if (match.indexOf('.camelcase()') > -1) {
                  replaced = camelcase(replaced.replace(/_/g, ' '));
                }
                file = file.replace(match, replaced);
              }
            }
          }
          return fs.outputFile(json.templates[template], file)
        })
        promises.push(promise)
      }

      return Promise.all(promises)
    }).catch((err) => {
      console.log(err)
      process.exit(0)
    })
  }
  else {
    console.error('Specify a Generator Name and Template Name');
    process.exit(0);
  }
}
else if(input[0] == 'delete') {

}
else {
  console.error('Specify a generator method');
  process.exit(0);
}


// templateme create FormComponent SignUpForm -p ~/ship/nodejs/templateme/
