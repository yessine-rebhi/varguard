import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { findEnvVariablesInCodebase } from "../utils/fileUtils.js";
import { handleExistingEnvExample, handleNewEnvExample, handleStaticVariablesViolation } from '../utils/envUtils.js';
import { loadConfig } from '../utils/loadConfig.js';

export const generateEnvExample = async () => {
  const config = loadConfig();
  const projectRootDir = process.cwd();
  const variables = new Set();
  const staticVariables = new Set();

  const envExamplePath = path.join(projectRootDir, config.envExamplePath);

  console.log(chalk.blue('🔍 Scanning codebase for environment variables...'));
  await findEnvVariablesInCodebase(projectRootDir, variables, staticVariables);

  const envStaticVariables = Array.from(staticVariables).filter(varName =>
    variables.has(varName)
  );
  
  if (envStaticVariables.length > 0) {
    handleStaticVariablesViolation(envStaticVariables);
    process.exit(1);
  }

  if (variables.size === 0) {
    console.error(chalk.yellow('⚠️  No environment variables detected in the codebase!'));
    process.exit(0);
  }

  if (fs.existsSync(envExamplePath)) {
    await handleExistingEnvExample(envExamplePath, variables);
  } else {
    handleNewEnvExample(envExamplePath, variables);
  }
  return Array.from(variables);
};