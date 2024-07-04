import React from 'react';
import { withRouter } from 'react-router-dom';
import {Button, Col} from 'react-bootstrap';
import { ArrowLeftIcon } from '@primer/octicons-react';

import './nomatch.css';
import MSG404 from '../../assets/img/404_error.png';
import { withTranslation } from 'react-i18next';

const gobackstyle = {
    fontSize:"12px", padding: "10px 25px", background: "transparent", color: "#555", fontWeight: "600", textTransform: "uppercase"
}
/**
 * 404 - page not found handle component
 *
 * @class NoMatchComponent
 * @extends {React.Component}
 */
export class NoMatchComponent extends React.Component{
    _isMounted = false;
    constructor(props){
        super(props);
        this.state = {
            
        }
    }
      
    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            //
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    render(){
        return (<>
            
            <Col xs={12} md={6} className="nomatch-content centered text-center">
                <img src={MSG404} className="err-404" alt="404 message"/>
                <Col>
                    <Button variant="secondary" style={gobackstyle} onClick={() => this.props.history.goBack()}><ArrowLeftIcon/> {this.props.t('GO_BACK')}</Button>
                </Col>
            </Col>
        </>);
    }
}

export default withTranslation()(withRouter(NoMatchComponent));