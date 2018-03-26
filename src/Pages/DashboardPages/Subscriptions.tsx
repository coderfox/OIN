import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../../lib/state/Session';
import * as Interfaces from '../../lib/api_interfaces';

import * as Forms from '../../Forms';
import * as Components from '../../Components';
import { Row, Col, Button, Collapse, message } from 'antd';

interface Props {
  session?: SessionState;
}
interface States {
}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  async componentWillMount() {
    try {
      await this.props.session!.refreshServices();
      await this.props.session!.refreshSubscriptions();
      await this.props.session!.refreshMessages();
    } catch (ex) {
      message.error(<p>{ex.message} - {ex.response && ex.response.data && ex.response.data.code}</p>);
    }
  }
  render() {
    const { subscriptions } = this.props.session!;
    return (
      <div>
        <Components.AddSubscriptionDialog />
        {subscriptions.map(value => (<Components.Subscription id={value.id} key={value.id} />))}
      </div>
    );
  }
}

export default Messages;
