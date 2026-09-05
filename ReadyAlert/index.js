import { registerRootComponent } from 'expo';
import { recordError } from './src/utils/crashReporting';

let App;
try {
  App = require('./App').default;
} catch (error) {
  recordError(error, 'App module failed to load');
  App = () => null;
}

registerRootComponent(App);
