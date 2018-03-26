import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { RouterStore, syncHistoryWithStore } from 'mobx-react-router';
import { Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';

import * as Forms from '../Forms';
import * as Components from '../Components';
import * as DashboardComponents from './DashboardPages';
import { Row, Col, Button, Collapse, Menu, Icon, message } from 'antd';

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
      message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
  }
  render() {
    const { messages, subscriptions } = this.props.session!;
    return (
      <Row style={{ height: '100%' }} type="flex" justify="space-around" align="top">
        <Col span={18}>
          <h1>Sandra</h1>
          <Menu
            mode="horizontal"
            selectedKeys={[this.props.routing!.location!.pathname]}
          >
            <Menu.Item key="/dashboard">
              <Link to="/dashboard">首页</Link>
            </Menu.Item>
            <Menu.Item key="/dashboard/subscriptions">
              <Link to="/dashboard/subscriptions">订阅</Link>
            </Menu.Item>
          </Menu>
          <Row gutter={24}>
            <Col span={15}>
              <Switch>
                <Route path="/dashboard" exact={true} component={DashboardComponents.Messages} />
                <Route path="/dashboard/subscriptions" component={DashboardComponents.Subscriptions} />
              </Switch>
            </Col>
            <Col span={9}>
              <Row>
                <Components.UserCard />
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Dashboard;
