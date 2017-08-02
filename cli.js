#!/usr/bin/env node
'use strict';
const meow = require('meow');
const logSymbols = require('log-symbols');
const chalk = require('chalk');
const fs = require('fs-extra');

const cli = meow(`
  Usage
    $ templateme generator <generator-name>
    $ templateme generate <generator-name> <template-name>
    $ templateme create <generator-name> <template-name>
    $ templateme delete <generator-name> <template-name
  Examples
    $ templateme generator modal
    $ templateme generator modal GoodModal
    $ templateme create modal GoodModal
    $ templateme delete modal GoodModal
`, {
  string: ['_']
});

const input = cli.input;

if (input[0] == 'generator') {
  const generatorName = input[1]
  if(generatorName) {
    fs.mkdirs(`templateme/${generatorName}`).then(() => {
      return fs.mkdirs(`templateme/${generatorName}/templates`)
    }).then(() => {
      return fs.writeFile(`templateme/${generatorName}/parameters.json`, JSON.stringify({
        templates: ['index.js'],
        parameters: ['name']
      }, null, 2))
    }).then(() => {
      return fs.writeFile(`templateme/${generatorName}/templates/index.js`, '<%= name %>\nFill something here')
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
      return fs.readJson(`templateme/${generatorName}/parameters.json`)
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
      for(let template of Object.keys(json.templates)) {
        let promise = fs.readFile(`templateme/${generatorName}/templates/${template}`, 'utf8').then((file) => {
          for(let parameter of Object.keys(json.parameters)) {
            let re = new RegExp(`\<\%\= ${parameter} \%\>`, "g");
            file = file.replace(re, json.parameters[parameter]);
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



