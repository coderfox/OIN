import * as React from 'react';
import { inject, observer } from 'mobx-react';
import { Redirect } from 'react-router-dom';
import SessionState from '../../lib/state/Session';
import * as Interfaces from '../../lib/api_interfaces';

import * as Forms from '../../Forms';
import * as Components from '../../Components';
import { Card, Grid, Menu, Input, Modal, Header, Button, Icon, ModalProps, MenuItemProps } from 'semantic-ui-react';

interface Props {
  session?: SessionState;
}
interface States {
  create_card_visible?: boolean;
}

@inject('session')
@observer
class Subscriptions extends React.Component<Props, States> {
  state: States = {};

  openCreateCard: MenuItemProps['onClick'] = () =>
    this.setState({ create_card_visible: true })
  closeCreateCard = () =>
    this.setState({ create_card_visible: false })

  render() {
    const { subscriptions } = this.props.session!;
    return (
      <div>
        <Menu secondary>
          <Menu.Item
            name="添加订阅"
            onClick={this.openCreateCard}
            disabled={this.state.create_card_visible}
          />
          <Menu.Item position="right">
            <Input icon="search" placeholder="搜索" />
          </Menu.Item>
        </Menu>
        <Card.Group itemsPerRow={2}>
          {
            this.state.create_card_visible &&
            <Card>
              <Card.Content header="创建订阅" />
              <Card.Content>
                <Forms.CreateSubscription onFinish={this.closeCreateCard} />
              </Card.Content>
            </Card>
          }
          {subscriptions
            .map(s => (
              <Components.Subscription
                key={s.id}
                id={s.id}
              />))
          }
        </Card.Group>
      </div>
    );
  }
}

export default Subscriptions;
