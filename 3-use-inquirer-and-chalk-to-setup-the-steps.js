import natural from 'natural';
import { input, select, checkbox } from '@inquirer/prompts';
import chalk from 'chalk';

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

const fileNames = [
  'negative-1.txt',
  'positive-2-bible-james-1-2-3.txt',
  'positive-3-bible-romans-15-13.txt',
];
const contentMap = {
  'negative-1.txt': 'You are an idiot sandwich',
  'positive-2-bible-james-1-2-3.txt':
    'My brethren, count it all joy when you fall into various trials, knowing that the testing of your faith produces patience.',
  'positive-3-bible-romans-15-13.txt':
    'Now may the God of hope fill you with all joy and peace in believing, that you may abound in hope by the power of the Holy Spirit.',
};
const getContents = async (operation) => {
  const selectedFileNames = await checkbox({
    message: `Which file(s) to perform "${operation}" on?`,
    choices: fileNames.map((fileName) => ({ name: fileName, value: fileName })),
  });

  if (selectedFileNames.length === 0) {
    log.warn('No file is selected. Please select at least 1 file!');
    return await getContents(operation);
  }

  return selectedFileNames.map((fileName) => ({
    fileName,
    content: contentMap[fileName],
  }));
};

const performNLP = async (operation, contents) => {
  log.success(
    `${operation} on ${contents.map(
      (content) => content.fileName
    )} successfully!
    `
  );

  const dummy = { success: true };
  return dummy;
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

  log.success(`Saved to ${fileName}.json`);
};

const main = async () => {
  // 1.
  const operation = await getOperation();
  log.info(`You selected ${operation}`);

  // 2.
  const contents = await getContents(operation);
  log.info(`You selected ${contents.map((content) => content.fileName)}`);

  // 3.
  const nlpResults = await performNLP(operation, contents);

  // 4.
  await saveFile(nlpResults);
};

main();
