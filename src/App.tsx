import * as React from 'react';
import createBrowserHistory from 'history/createBrowserHistory';
import { Provider } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router, Route, Switch } from 'react-router-dom';

import { Row, Col } from 'antd';

import * as Pages from './Pages';

const browserHistory = createBrowserHistory();
const routingStore = new RouterStore();

const stores = {
  routing: routingStore,
};

const history = syncHistoryWithStore(browserHistory, routingStore);

class App extends React.Component {
  render() {
    return (
      <Provider {...stores}>
        <Router history={history}>
          <Switch>
            <Route path="/reg" component={Pages.Reg} />
            <Route path="/login" component={Pages.Login} />
          </Switch>
        </Router >
      </Provider >
    );
  }
}

export default App;