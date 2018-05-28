import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import { Route, Switch } from 'react-router-dom';
import SessionState from '../lib/SessionStore';

import * as Components from '../Components';
import * as DashboardComponents from './DashboardPages';
import { Grid, Menu, MenuItemProps, Header, Image, Segment } from 'semantic-ui-react';

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
    } catch (ex) {
      // message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
  }
  handleItemClick: MenuItemProps['onClick'] = (_, { route }) => this.props.routing!.push(route || '/dashboard');
  render() {
    return (
      <Grid columns={2} container>
        <Grid.Row verticalAlign="top">
          <Grid.Column width={3}>
            <Segment>
              <Header as="h1">
                <Image src="/assets/oin.svg" /> beta
              </Header>
            </Segment>
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
          <Grid.Column width={13}>
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
