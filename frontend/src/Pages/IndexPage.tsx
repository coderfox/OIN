import * as React from 'react';
import { Redirect } from 'react-router-dom';

interface Props {
}
interface States {
}

class IndexPage extends React.Component<Props, States> {
  render() {
    return (
      <Redirect to="/login" />
    );
  }
}

export default IndexPage;
