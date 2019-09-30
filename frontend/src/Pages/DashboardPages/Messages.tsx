import * as React from 'react';
import { inject, observer } from 'mobx-react';

import * as Components from '../../Components';

interface Props {}
interface States {}

@inject('session')
@observer
class Messages extends React.Component<Props, States> {
  render() {
    return <Components.Messages />;
  }
}

export default Messages;
