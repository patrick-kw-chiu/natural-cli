#!/usr/bin/env node

// Native libraries
import fs from 'fs';
import child_process from 'child_process';
import util from 'util';

// Libraries
import natural from 'natural';
import { input, select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';

// Init NLP helpers
const tokenizer = new natural.WordTokenizer();
const Analyzer = natural.SentimentAnalyzer;
const stemmer = natural.PorterStemmer;
const analyzer = new Analyzer('English', stemmer, 'afinn');

const exec = util.promisify(child_process.exec);

const log = {
  success: (message) => console.log(chalk.green(message)),
  info: (message) => console.log(chalk.yellow(message)),
  warn: (message) => console.log(chalk.red(message)),
};

const nlpOperations = ['Tokenize', 'Sentiment Analyze'];
const getOperation = async () => {
  return await select({
    message: 'Which NLP operation do you want to perform?',
    choices: nlpOperations.map((operation) => ({
      name: operation,
      value: operation,
    })),
  });
};

const getContents = async (operation) => {
  const fileAndDirNames = fs.readdirSync('./', { withFileTypes: true });
  const fileNames = fileAndDirNames
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);

  const selectedFileNames = await checkbox({
    message: `Which file(s) to perform "${operation}" on?`,
    choices: fileNames.map((fileName) => ({ name: fileName, value: fileName })),
  });

  if (selectedFileNames.length === 0) {
    log.warn('No file is selected. Please select at least 1 file!');
    return await getContents(operation);
  }

  return selectedFileNames.map((fileName) => {
    const content = fs.readFileSync(`./${fileName}`, 'utf8');
    return { fileName, content };
  });
};

const performNLP = async (operation, contents) => {
  let results = contents.map(({ fileName, content }) => {
    return { fileName, tokens: tokenizer.tokenize(content) };
  });

  if (operation === 'Sentiment Analyze') {
    results = results.map(({ fileName, tokens }) => {
      return { fileName, sentiment: analyzer.getSentiment(tokens) };
    });
  }

  log.success(
    `${operation} on the selected ${contents.length} file(s) successfully!`
  );

  return results;
};

const saveFile = async (nlpResults) => {
  const fileName = await input({
    message: 'Save the result JSON as:',
    validate: (fileName) => {
      return (
        /^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(fileName) ||
        `Invalid name! Name must match the following criteria:
- Consists of integers, letters, or hyphens only
- Starts and ends with an integer or letter`
      );
    },
  });

  try {
    const { stdout, stderr } = await exec(
      `echo "${JSON.stringify(nlpResults, null, 2).replaceAll(
        '"',
        '\\"'
      )}" > ${fileName}.json`
    );

    log.success(`Saved to ${fileName}.json`);
  } catch (e) {
    const { stderr } = e;
    log.warn(stderr);
  }
};

const main = async () => {
  // 1.
  const operation = await getOperation();
  log.info(`You selected ${operation}\n`);

  // 2.
  const contents = await getContents(operation);
  log.info(`You selected ${contents.map((content) => content.fileName)}\n`);

  // 3.
  const nlpResults = await performNLP(operation, contents);

  // 4.
  await saveFile(nlpResults);
};

main();
