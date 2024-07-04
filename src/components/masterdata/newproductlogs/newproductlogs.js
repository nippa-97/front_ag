import { Component } from 'react';
import { Breadcrumb, Col, Row, Tab, Tabs  } from 'react-bootstrap';
import MDsidebarmenu from '../../common_layouts/mdsidebarmenu';
import { withRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import NewProductChangesLog from './npchangelog';
import NewProductStartLog from './npstartlog';

import "./newproductslogs.css";

export class NewProductLogs extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            showingTabType: "prod_log",
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
           
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }

    tabToggle = (type) =>{
        this.setState({ showingTabType: type });
    }

    render(){
        return(
            <Col xs={12} className={"main-content newprodlog-content "+(this.props.isRTL==="rtl"?"RTL":"LTR")} dir={this.props.isRTL}>
                <Row>
                    <MDsidebarmenu />
                    <Col xs={12} lg={10}>
                        <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                            <Breadcrumb.Item active>{this.props.t('NEWPROD_LOGS')}</Breadcrumb.Item>
                            <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                            </>:<>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('NEWPROD_LOGS')}</Breadcrumb.Item>
                            </>}
                        </Breadcrumb>
                        <Col className="white-container">
                            <Tabs defaultActiveKey="prodLogTab">
                                <Tab eventKey="prodLogTab" title={this.props.t("NEWPROD_LOG_START")} onEntered={()=> this.tabToggle("prod_log")}>
                                    {this.state.showingTabType === "prod_log"?<NewProductStartLog t={this.props.t} dmode={this.props.dmode} 
                                        signedobj={this.props.signedobj}
                                        />:<></>}
                                </Tab>
                                <Tab eventKey="changesLog" title={this.props.t("NEWPROD_LOG_CHANGES")} onEntered={() => this.tabToggle("changes_log")}>
                                    {this.state.showingTabType ===  "changes_log"?<NewProductChangesLog t={this.props.t} dmode={this.props.dmode} 
                                        />:<></>}
                                </Tab> 
                            </Tabs>
                               
                        </Col>
                    </Col>
                </Row>
            </Col>
        )
    }
}

export default withTranslation()(withRouter(NewProductLogs));

