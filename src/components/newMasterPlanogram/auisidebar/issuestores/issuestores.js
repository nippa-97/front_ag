import React from 'react';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Col, Row, Modal, Alert, Button } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';

import { auiRedirectMDSetAction } from '../../../../actions/masterPlanogram/masterplanogram_action';

import "./issuestores.css";


export class IssueStoresList extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            storeList: [],
            totalOtherCount: 0,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        if(this._ismounted){
            this.compareStoreList();
        }
      }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    compareStoreList = () => {
        let allissuestorelist = this.props.issueStoreList;

        let totalothercount = allissuestorelist.filter(x => x.floorId > -1 && x.storeManagerId > -1);
        let issuestorelist = allissuestorelist.filter(x => x.floorId < 1 || x.storeManagerId < 0);

        this.setState({  
            storeList: issuestorelist,
            totalOtherCount: totalothercount.length,
        });
    }
    
    handleMDOpen = (opentype, cobj) => {
        this.props.auiRedirectMDSet(opentype);
        window.open(window.location.origin);

        setTimeout(() => {
            this.props.auiRedirectMDSet(null);
        }, 2000);
    }

    handleContinueUpdate = (contype) => {
        this.props.handleToggleIssueStores(false);
        this.props.updateImplementData(contype);
    }

    render() {
        return (<>
            <Modal centered className={'contimplement-modal issuestore-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} 
            show={this.props.showIssueStores} onHide={() => this.props.handleToggleIssueStores(false)} backdrop="static">
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.props.handleToggleIssueStores(false)}><XIcon size={30} /></div>

                    <h3 className='issue-header'>{this.props.t("STORE_WITH_ISSUES")} <small>{this.props.t("PLEASE_FIX_BELOWITEM")}</small></h3>

                    {this.state.totalOtherCount > 0?<Alert variant='success'><b>{this.state.totalOtherCount} {this.props.t("stores")}</b> {this.props.t("CAN_BE_CONTINUE_WITHOUT")}</Alert>:<></>}

                    <Col xs={12} style={{padding:"0px 20px"}}>
                        <Col xs={12} className="details-view">
                            <Col xs={12} className='storelist-headers'>
                                <Row>
                                    <Col xs={6}>{this.props.t("STORE")}</Col>
                                    <Col xs={3}>{this.props.t("floor")}</Col>
                                    <Col xs={3}>{this.props.t("storemanager")}</Col>
                                </Row>
                            </Col>
                            <Col xs={12} className='storelist-view'>
                                {this.state.storeList.map((sitem, sidx) => {
                                    return <Col xs={12} key={sidx} className="singlestore-item">
                                    <Row>
                                        <Col xs={6} className='dotted-text'>{sitem.store.storeName}</Col>
                                        <Col xs={3}>
                                            {sitem.floorId > -1?<label className='label'>{this.props.t("ISSUESTORE_BTNS.available")}</label>:
                                            <label className='label danger' onClick={() => this.handleMDOpen("floor",sitem)}>{this.props.t("ISSUESTORE_BTNS.notavailable")} <FeatherIcon icon="external-link" size={13} /></label>}
                                        </Col>
                                        <Col xs={3}>
                                            {sitem.storeManagerId > -1?<label className='label'>{this.props.t("ISSUESTORE_BTNS.available")}</label>:
                                            <label className='label danger' onClick={() => this.handleMDOpen("store",sitem)}>{this.props.t("ISSUESTORE_BTNS.notavailable")} <FeatherIcon icon="external-link" size={13} /></label>}
                                        </Col>
                                    </Row>
                                </Col>
                                })}
                            </Col>
                        </Col> 

                        <Col xs={12} className='bottom-list'>
                            <ul className='list-inline text-right'>
                                <li className='list-inline-item float-left'>
                                    <Button variant='secondary' size='sm' onClick={() => this.props.handleToggleIssueStores(false)}>{this.props.t("btnnames.back")}</Button>
                                </li>
                                {this.state.totalOtherCount > 0?<li className='list-inline-item'>
                                    <Button variant='danger' onClick={() => this.handleContinueUpdate("IGNORE")} size='sm'>{this.props.t("ISSUESTORE_BTNS.ignoreall")}</Button>
                                </li>:<></>}
                                <li className='list-inline-item'>
                                    <Button variant='primary' onClick={() => this.handleContinueUpdate("NORMAL")} size='sm'>{this.props.t("ISSUESTORE_BTNS.retry")}</Button>
                                </li>
                            </ul>
                        </Col>   
                    </Col>
                    
                </Modal.Body>
            </Modal>
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    auiRedirectMDSet: (payload) => dispatch(auiRedirectMDSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null, mapDispatchToProps)(IssueStoresList)))