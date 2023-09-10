import natural from 'natural';
import { input } from '@inquirer/prompts';
import chalk from 'chalk';

const tokenizer = new natural.WordTokenizer();

const main = async () => {
  const sentence = await input({
    message: 'Input a sentence and I will tokenize it for you:',
  });
  const result = tokenizer.tokenize(sentence);
  console.log(chalk.yellow(JSON.stringify(result)));
};

main();
