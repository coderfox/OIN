import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';

import * as Forms from '../Forms';
import * as Components from '../Components';
import * as DashboardComponents from './DashboardPages';
import { Grid, Menu, MenuItemProps, Segment, Header, Image } from 'semantic-ui-react';

interface Props {
  routing?: RouterStore;
  session?: SessionState;
}
interface States {
}

@inject('session', 'routing')
@observer
class Dashboard extends React.Component<Props, States> {
  async componentWillMount() {
    try {
      await this.props.session!.loadSession();
      await this.props.session!.retrieveLatestData();
    } catch (ex) {
      // message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
  }
  handleItemClick: MenuItemProps['onClick'] = (e, { route }) => this.props.routing!.push(route || '/dashboard');
  render() {
    const { messages, subscriptions } = this.props.session!;
    return (
      <Grid columns={2} container>
        <Grid.Row>
          <Header as="h1">
            OIN
          </Header>
        </Grid.Row>
        <Grid.Row>
          <Grid.Column width={3}>
            <Components.UserCard />
            <Menu pointing secondary vertical fluid>
              <Menu.Item
                name="dashboard"
                route="/dashboard"
                active={this.props.routing!.location!.pathname === '/dashboard'}
                onClick={this.handleItemClick}
              />
              <Menu.Item
                name="subscriptions"
                route="/dashboard/subscriptions"
                active={this.props.routing!.location!.pathname === '/dashboard/subscriptions'}
                onClick={this.handleItemClick}
              />
            </Menu>
          </Grid.Column>
          <Grid.Column width={13} stretched>
            <Switch>
              <Route path="/dashboard" exact={true} component={DashboardComponents.Messages} />
              <Route path="/dashboard/subscriptions" component={DashboardComponents.Subscriptions} />
            </Switch>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

export default Dashboard;
