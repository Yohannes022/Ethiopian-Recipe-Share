import moduleAlias from 'module-alias';
import path from 'path';

// In development, we use ts-node which runs from src/
// In production, the code is compiled to dist/
const isProduction = process.env.NODE_ENV === 'production';

// Register the aliases
moduleAlias.addAliases({
  '@': isProduction ? path.join(__dirname, '..') : path.join(__dirname, '../..'),
  '@src': path.join(__dirname, '../..') // Always point to src/ from project root
});

// Apply the aliases
moduleAlias();

export default moduleAlias;
