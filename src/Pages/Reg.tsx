import * as React from 'react';
import { Row, Col } from 'antd';

import * as Forms from '../Forms';

interface Props {

}
interface States {
}

class RegPage extends React.Component<Props, States> {
  render() {
    return (
      <Row style={{ height: '100%' }} type="flex" justify="space-around" align="middle">
        <Col md={12} xs={24}>
          <Forms.Reg />
        </Col>
      </Row>
    );
  }
}

export default RegPage;
