import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../lib/state/Session';
import * as Interfaces from '../lib/api_interfaces';

import * as Forms from '../Forms';
import * as Components from '../Components';
import { Row, Col, Button, Collapse, message } from 'antd';

interface Props {
  session?: SessionState;
}
interface States {
}

@inject('session')
@observer
class Dashboard extends React.Component<Props, States> {
  async componentWillMount() {
    try {
      await this.props.session!.loadSession();
      await this.props.session!.refreshServices();
      await this.props.session!.refreshSubscriptions();
      await this.props.session!.refreshMessages();
    } catch (ex) {
      message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
  }
  render() {
    const { messages, subscriptions } = this.props.session!;
    return (
      <Row style={{ height: '100%' }} type="flex" justify="space-around" align="top">
        <Col span={20}>
          <h1>Sandra</h1>
          <Row gutter={8}>
            <Col span={15}>
              {
                messages.length !== 0 ?
                  messages.map(value =>
                    (<Components.Message id={value.id} key={value.id} />)) :
                  <p>您的消息已经全部处理完毕！</p>
              }
            </Col>
            <Col span={9}>
              <Row>
                <Components.UserCard />
                <Components.AddSubscriptionDialog />
                {
                  subscriptions.map(value =>
                    (<Components.Subscription id={value.id} key={value.id} />))
                }
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default Dashboard;
