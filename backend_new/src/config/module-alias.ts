import 'module-alias/register';
import path from 'path';
import moduleAlias from 'module-alias';

// Register module aliases
moduleAlias.addAliases({
  '@': path.join(__dirname, '..'),
  '@config': path.join(__dirname, '..', 'config'),
  '@controllers': path.join(__dirname, '..', 'controllers'),
  '@middlewares': path.join(__dirname, '..', 'middlewares'),
  '@models': path.join(__dirname, '..', 'models'),
  '@routes': path.join(__dirname, '..', 'routes'),
  '@services': path.join(__dirname, '..', 'services'),
  '@types': path.join(__dirname, '..', 'types'),
  '@utils': path.join(__dirname, '..', 'utils'),
  '@validations': path.join(__dirname, '..', 'validations')
});

// Ensure this file is treated as a module
export {};
