import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouterStore } from 'mobx-react-router';
import { Route, Switch } from 'react-router-dom';
import SessionState from '../lib/SessionStore';

import * as Components from '../Components';
import * as DashboardComponents from './DashboardPages';
import {
  Grid,
  Menu,
  MenuItemProps,
  Header,
  Image,
  Segment,
  Responsive,
  Message,
} from 'semantic-ui-react';
import * as responsive from '../lib/responsive';

interface Props {
  routing?: RouterStore;
  session?: SessionState;
}
interface States {
  errors: string[];
}

@inject('session', 'routing')
@observer
class Dashboard extends React.Component<Props, States> {
  state: States = { errors: [] };

  // tslint:disable-next-line:no-any
  componentDidCatch(ex: any) {
    this.setState(prev => ({
      errors: [
        (ex.response && ex.response.data && ex.response.data.code) ||
          ex.message,
        ...prev.errors,
      ],
    }));
  }
  dismissError = () => {
    this.setState({ errors: [] });
  }
  async componentWillMount() {
    await this.props.session!.loadSession();
  }
  handleItemClick: MenuItemProps['onClick'] = (_, { route }) =>
    this.props.routing!.push(route || '/dashboard')
  render() {
    return (
      <Grid column={2} container={responsive.isComputer()}>
        <Grid.Column mobile={16} tablet={16} computer={3}>
          <Segment vertical>
            <Header as="h1">
              <Image src="/assets/oin.svg" />
              {process.env.REACT_APP_SANDRA_STAGE === 'true' &&
                `${process.env.REACT_APP_COMMIT_SHA}`.slice(0, 6)}
            </Header>
          </Segment>
          <Responsive {...responsive.computerAndMore}>
            <Components.UserCard />
          </Responsive>
          <Menu
            pointing
            secondary
            vertical={!responsive.isMobileOrTablet()}
            fluid
          >
            <Menu.Item
              name="dashboard"
              route="/dashboard"
              active={this.props.routing!.location!.pathname === '/dashboard'}
              onClick={this.handleItemClick}
            />
            <Menu.Item
              name="subscriptions"
              route="/dashboard/subscriptions"
              active={
                this.props.routing!.location!.pathname ===
                '/dashboard/subscriptions'
              }
              onClick={this.handleItemClick}
            />
          </Menu>
          <Message
            error
            header="出现了错误"
            hidden={this.state.errors.length === 0}
            list={this.state.errors}
            onDismiss={this.dismissError}
          />
        </Grid.Column>
        <Grid.Column mobile={16} tablet={16} computer={13}>
          <base target="_blank" />
          <Switch>
            <Route
              path="/dashboard"
              exact={true}
              component={DashboardComponents.Messages}
            />
            <Route
              path="/dashboard/subscriptions"
              component={DashboardComponents.Subscriptions}
            />
          </Switch>
        </Grid.Column>
      </Grid>
    );
  }
}

export default Dashboard;
