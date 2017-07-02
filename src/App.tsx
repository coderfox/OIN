import * as React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { FlatButton } from 'material-ui';

class App extends React.Component<
    {
        name: string
    }, {
        data: string
    }> {
    constructor() {
        super();
        this.state = { data: 'NULL' };
    }
    render() {
        return (
            <MuiThemeProvider>
                <FlatButton label={this.state.data} onClick={() => this.onclick()} />
            </MuiThemeProvider>
        );
    }
    onclick() {
        this.setState((prev, props) => ({ data: prev.data === 'NULL' ? 'HIT' : 'NULL' }));
    }
}

export default App;
