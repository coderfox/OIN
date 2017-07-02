import * as React from 'react';
import * as ReactDOM from 'react-dom';

import 'typeface-roboto';
import * as react_tap_event_plugin from 'react-tap-event-plugin';
react_tap_event_plugin();

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <App name="NAME" />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
