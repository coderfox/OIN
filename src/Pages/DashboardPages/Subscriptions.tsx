import * as React from 'react';
import { inject, observer } from 'mobx-react';
import SessionState from '../../lib/SessionStore';

import * as Forms from '../../Forms';
import * as Components from '../../Components';
import {
  Card,
  Menu,
  MenuItemProps,
  Dimmer,
  Loader,
  Dropdown,
  DropdownProps,
} from 'semantic-ui-react';

import * as I from '../../lib/api_interfaces';

const queryOptions = [
  {
    text: '已启用订阅',
    value: 'enabled:true',
    icon: 'checkmark',
  },
  {
    text: '所有订阅',
    value: 'all',
    icon: 'rss',
  },
  {
    text: '已删除订阅',
    value: 'enabled:false',
    icon: 'close',
  },
];

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
    await this.load();
  }
  load = async (query?: string) => {
    this.setState({ subscriptions: undefined });
    await Promise.all([
      this.props.session!.purgeServiceCache(),
      this.props.session!.purgeSubscriptionCache(),
    ]);
    const subscriptions = await this.props.session!.client!.getSubscriptions(
      query,
    );
    await this.props.session!.cacheServices(subscriptions.map(s => s.service));
    this.setState({ subscriptions });
  }

  openCreateCard: MenuItemProps['onClick'] = () =>
    this.setState({ create_card_visible: true })
  closeCreateCard = (subscription?: I.Subscription) => {
    this.setState({ create_card_visible: false });
    if (subscription) {
      this.setState(prev => ({
        subscriptions: [subscription, ...(prev.subscriptions || [])],
      }));
    }
  }

  onSearchChange: DropdownProps['onChange'] = async (_, data) => {
    let value = data.value as string;
    if (value === 'all') {
      value = '';
    }
    await this.load(value);
  }

  render() {
    const { subscriptions } = this.state;
    return (
      <div>
        <Menu secondary stackable>
          <Menu.Item>
            <span>
              显示
              <Dropdown
                inline
                options={queryOptions}
                defaultValue={queryOptions[0].value}
                onChange={this.onSearchChange}
              />
            </span>
          </Menu.Item>
          <Menu.Item
            name="添加订阅"
            onClick={this.openCreateCard}
            disabled={this.state.create_card_visible}
          />
          {
            // <Menu.Item position="right">
            //   <Input icon="search" placeholder="搜索" />
            // </Menu.Item>
          }
        </Menu>
        <Card.Group itemsPerRow={2} stackable>
          <Dimmer active={subscriptions === undefined} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          {this.state.create_card_visible && (
            <Card>
              <Card.Content header="创建订阅" />
              <Card.Content>
                <Forms.CreateSubscription onFinish={this.closeCreateCard} />
              </Card.Content>
            </Card>
          )}
          {subscriptions &&
            subscriptions
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
              .map(s => <Components.Subscription key={s.id} id={s.id} />)}
        </Card.Group>
      </div>
    );
  }
}

export default Subscriptions;
