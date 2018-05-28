import * as React from 'react';
import { inject, observer } from 'mobx-react';
import SessionState from '../../lib/SessionStore';

import * as Forms from '../../Forms';
import * as Components from '../../Components';
import { Card, Menu, Input, MenuItemProps, Dimmer, Loader } from 'semantic-ui-react';

import * as I from '../../lib/api_interfaces';

interface Props {
  session?: SessionState;
}
interface States {
  create_card_visible?: boolean;
  subscriptions?: I.Subscription[];
}

@inject('session')
@observer
class Subscriptions extends React.Component<Props, States> {
  state: States = {};

  async componentDidMount() {
    this.setState({ subscriptions: undefined });
    const subscriptions = await this.props.session!.client!.getSubscriptions();
    this.setState({ subscriptions });
  }

  openCreateCard: MenuItemProps['onClick'] = () =>
    this.setState({ create_card_visible: true })
  closeCreateCard = (subscription?: I.Subscription) => {
    this.setState({ create_card_visible: false });
    if (subscription) {
      this.setState(prev =>
        ({ subscriptions: [subscription, ...prev.subscriptions || []] }));
    }
  }

  render() {
    const { subscriptions } = this.state;
    return (
      <div>
        <Menu secondary>
          <Menu.Item position="left">
            <Input icon="search" placeholder="搜索" />
          </Menu.Item>
          <Menu.Item
            name="添加订阅"
            onClick={this.openCreateCard}
            disabled={this.state.create_card_visible}
            position="right"
          />
        </Menu>
        <Card.Group itemsPerRow={2}>
          <Dimmer active={subscriptions === undefined} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          {
            this.state.create_card_visible &&
            <Card>
              <Card.Content header="创建订阅" />
              <Card.Content>
                <Forms.CreateSubscription onFinish={this.closeCreateCard} />
              </Card.Content>
            </Card>
          }
          {subscriptions && subscriptions
            .sort((a, b) => {
              if (!a.deleted && !b.deleted) {
                return Date.parse(b.updated_at) - Date.parse(a.updated_at);
              } else if (a.deleted && b.deleted) {
                return 0;
              } else if (a.deleted && !b.deleted) {
                return 1;
              } else if (!a.deleted && b.deleted) {
                return -1;
              } else {
                return 0;
              }
            })
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
