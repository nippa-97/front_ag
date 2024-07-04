
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Col, Breadcrumb, Row} from 'react-bootstrap';
import { connect } from "react-redux";
import { withTranslation } from 'react-i18next';

import { viewSetPrevDunit } from '../../../../actions/dunit/dunit_action';

import './NewDisplayUnit.scss';

import MDSidebarMenu from '../../../common_layouts/mdsidebarmenu';
import DisplayUnitView from './DisplayUnitView';


class NewDisplayUnit extends Component {
    _isMounted = false;

    constructor(props) {
        super(props);
        
        this.state = {
            prevpagedetails: null,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if(this._isMounted){
            //console.log(this.props.dunitState);

            let prepagedetails = (this.props.dunitState && this.props.dunitState.dunitPrevDetails?this.props.dunitState.dunitPrevDetails:null);
            this.setState({
                prevpagedetails: prepagedetails,
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    backLinkSet = (backpath, iscurrent) => {
        let cprevdetails = this.state.prevpagedetails;
        if(iscurrent && cprevdetails){
            let cprevdetails = this.state.prevpagedetails;
            cprevdetails["viewtype"] = "back";
            this.props.setPrevDetails(cprevdetails);
    
            this.props.history.push(backpath);
        }
    }

    render() {
        
        return (<>
            <Col xs={12} className={"main-content "+((this.props.isRTL==="rtl")?"RTL":"")} dir={this.props.isRTL}>
                <div>
                    <div className="displayunit_outerbox">
                      <Row>
                        <MDSidebarMenu />
                        <Col xs={12} lg={10}>
                            <Breadcrumb dir="ltr">
                                {this.props.isRTL==="rtl"?<>
                                <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to="/displayunits" onClick={() => this.backLinkSet("/displayunits", true)} role="button">{this.props.t('dunits')}</Link></li>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet("/"+this.props.HomePageVal)} role="button">{this.props.t('home')}</Link></li>
                                </>:<>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} onClick={() => this.backLinkSet(""/"+this.props.HomePageVal")} role="button">{this.props.t('home')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/displayunits" onClick={() => this.backLinkSet("/displayunits", true)} role="button">{this.props.t('dunits')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('details')}</Breadcrumb.Item>
                                </>}
                            </Breadcrumb>
                            <Col className="white-container additem-content">
                                <DisplayUnitView ismdview={true} selectedStore={this.state.selectedStore} dunitState={this.props.dunitState} minHeight={"400px"} isRTL={this.props.isRTL} dmode={this.props.dmode} t={this.props.t} />
                            </Col>
                        </Col>
                        
                      </Row>
                    </div>
                </div>

            </Col>
            </>
        )
    }
}

const mapDispatchToProps = dispatch => ({
    setPrevDetails: (payload) => dispatch(viewSetPrevDunit(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(NewDisplayUnit)));
