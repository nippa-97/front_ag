import React from 'react';
import { withRouter } from 'react-router-dom';
import {Button, Col} from 'react-bootstrap';
import { ArrowLeftIcon } from '@primer/octicons-react';
import { withTranslation } from 'react-i18next';

import { grantPermission } from '../../_services/common.service';
import { alertService } from '../../_services/alert.service';

import '../nomatch/nomatch.css';
import MSG403 from '../../assets/img/403_error.png';

const gobackstyle = {
    fontSize:"12px", padding: "10px 25px", background: "transparent", color: "#555", fontWeight: "600", textTransform: "uppercase"
}
/**
 * unauthorized pages blocking redict page
 *
 * @class UnauthorizedComponent
 * @extends {React.Component}
 */
class UnauthorizedComponent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            
        }
    }
      
    componentDidMount(){
        alertService.error(this.props.t("accessdenied"));
        //check privileges to check user allowed to planograms or task
        if(grantPermission("planogram")){
            this.props.history.push("/planograms");
        } else if(grantPermission("taskfeed")){
            this.props.history.push("/tasks");
        }
    }

    render(){
        return (<>
            
            <Col xs={12} md={6} className="nomatch-content centered text-center">
                <img src={MSG403} className="err-404" alt="404 message"/>
                <Col>
                    <Button variant="secondary" style={gobackstyle} onClick={() => this.props.history.goBack()}><ArrowLeftIcon/> {this.props.t('GO_BACK')}</Button>
                </Col>
            </Col>
        </>);
    }
}

export default withTranslation()(withRouter(UnauthorizedComponent));