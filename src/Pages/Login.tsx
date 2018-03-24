import * as React from 'react';
import * as Forms from '../Forms';

interface Props {

}
interface States {
}

class LoginPage extends React.Component<Props, States> {
  render() {
    return (
      <Forms.Login />
    );
  }
}

export default LoginPage;
