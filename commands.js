import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 2],
};

const COMMAND = {
  name: 'configurar_bosses_nc',
  description: 'Configurar os horários dos bosses',
  type: 1
}

const CONSULTAR_BOSSES = {
  name: 'consultar_bosses',
  description: 'Consultar os horários dos bosses salvos',
  type: 1
};

const LIMPAR_BOSSES = {
  name: 'limpar',
  description: 'Consultar os horários dos bosses salvos',
  type: 1
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, COMMAND, CONSULTAR_BOSSES, LIMPAR_BOSSES];

InstallGlobalCommands(process.env.APP_ID, process.env.GUILD_ID, ALL_COMMANDS);
