import React from 'react';
import { Col, Row, Modal, Button, ListGroup, ButtonGroup } from 'react-bootstrap';
import { XIcon } from '@primer/octicons-react';
// import FeatherIcon from 'feather-icons-react';
import { confirmAlert } from 'react-confirm-alert';

import { alertService } from '../../../../_services/alert.service';
import { convertDate } from '../../../../_services/common.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { markSimUpdateTypes } from '../../../../enums/masterPlanogramEnums';

import { NoFieldViewIcon, UniqueDunitViewIcon } from '../../../../assets/icons/icons';

import "./uniquedunit.css";

export class UniqueDunitEditModal extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            dataObj: null,
            isExcludeAll: true,
        };
    }

    componentDidMount() {
        this._ismounted = true;
        if(this._ismounted){
            let cdataobj = (this.props.dataObj && this.props.dataObj.length > 0?this.props.dataObj:[]);
            
            this.setState({
                isExcludeAll: true,
                dataObj: JSON.parse(JSON.stringify(cdataobj)),
            }, () => {
                // console.log(this.props.isNonDiffAvailable);
            });
        }
      }
    
    componentWillUnmount() {
        this._ismounted = false;
    }
    //handle toggle force/exclude changes
    handleChangeForce = (isparent, childidx, cval) => {
        let cdataobj = this.state.dataObj;

        if(isparent){
            //update all stores
            for (let i = 0; i < cdataobj.length; i++) {
                cdataobj[i].isForced = !cval;
            }
            
            this.setState({ isExcludeAll: cval });
        } else{
            cdataobj[childidx].isForced = cval;
        }

        this.setState({ dataObj: cdataobj });
    }
    //update unique fields
    handleUpdateUniqueFields = (isignoreall) => {
        let isNonDiffAvailable = this.props.isNonDiffAvailable; //non diff available
        
        //get store list obj
        let cdataobj = this.state.dataObj;

        //check if count update fields available
        let filterForcedList = cdataobj.filter(x => x.isForced === true);

        if(isignoreall){
            if(isNonDiffAvailable === true && cdataobj && cdataobj.length > 0){
                if(filterForcedList && filterForcedList.length > 0){
                    confirmAlert({
                        title: this.props.t('UNIQUEFIX_BTNS.IGNORE'),
                        message: (this.props.t('ARE_YOU_SURE_IGNOREALL_DIFFIELDS')),
                        overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                        buttons: [{
                            label: this.props.t('btnnames.yes'),
                            onClick: () => {   
                                for (let i = 0; i < cdataobj.length; i++) {
                                    cdataobj[i].isForced = false;
                                }
                    
                                this.continueUpdateStores(cdataobj);
                            }
                        }, {
                            label: this.props.t('btnnames.no')
                        }]
                    });
                } else{
                    this.props.handleToggleUniqueDunits(false, true);
                }
            } else{
                alertService.error(this.props.t("CANNOT_IGNORE_WITHOUT_NONDIFFSTORES"));
            }
        } else{
            if(
                (isNonDiffAvailable === false && filterForcedList && filterForcedList.length > 0) || 
                (isNonDiffAvailable === true && cdataobj && cdataobj.length > 0)
            ){
                confirmAlert({
                    title: this.props.t('UPDATE_CHANGES'),
                    message: (this.props.t('ARE_YOU_SURE_DIFFFIELD')),
                    overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
                    buttons: [{
                        label: this.props.t('btnnames.yes'),
                        onClick: () => {   
                        this.continueUpdateStores(cdataobj);
                        }
                    }, {
                        label: this.props.t('btnnames.no')
                    }]
                });
            } else{
                alertService.error(this.props.t("CANNOT_CONTINUE_WITHOUT_UPDATE_DIFFSTORES"));
            }     
        }
    }
    //continue update unique fields stores
    continueUpdateStores = (countaddedlist) => {
        //create new object to send data to backend
        let saveobj = {
            mpId: (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1),
            approvalType: markSimUpdateTypes.ForceUpdate,
            stores: countaddedlist
        };

        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.markApproveDisconnect, saveobj, true).then(res => {
                this.props.toggleLoadingModal(false);

                if(res && res.status){
                    alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                    this.props.handleToggleUniqueDunits(false, true);
                } else{
                    //
                }
            });    
        })
    }

    render() {
        let { isExcludeAll, dataObj } = this.state;

        return (<>
            <Modal centered className={'contimplement-modal nofieldedit-modal uniquedunit-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} 
            show={this.props.showUniqueDunitEdit} onHide={() => this.props.handleToggleUniqueDunits(false)} backdrop="static">
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.props.handleToggleUniqueDunits(false)}><XIcon size={30} /></div>
                    <Row>
                        <Col xs={4} className="title-content">
                            <div className='icon-view'> 
                                <UniqueDunitViewIcon size={140} />
                            </div>
                            <h4>{this.props.t("FOLLOW_DUNIT_WARN")}</h4>
                            <div className='title-btns'>
                                <ButtonGroup className='forcebtn-list'>
                                    <div className={'force-overlay'+(isExcludeAll?" active":"")}></div>
                                    <Button variant='default' onClick={() => this.handleChangeForce(true, null, false)} className={!isExcludeAll?'active':''}>{this.props.t("UNIQUEFIX_BTNS.FORCEALL")}</Button>
                                    <Button variant='default' onClick={() => this.handleChangeForce(true, null, true)} className={isExcludeAll?'active':''}>{this.props.t("UNIQUEFIX_BTNS.EXCLUDEALL")}</Button>
                                </ButtonGroup>

                                <Button variant='success' onClick={() => this.handleUpdateUniqueFields()}>{this.props.t("UNIQUEFIX_BTNS.SAVE")}</Button>
                                <Button variant='default' onClick={() => this.handleUpdateUniqueFields(true)}>{this.props.t("UNIQUEFIX_BTNS.IGNORE")}</Button>
                            </div>
                        </Col>
                        <Col xs={8} className="details-view">
                            <Col xs={12} className='storelist-view'>
                                <Col xs={12} className="singlestore-item">
                                    <Row>
                                        <Col xs={12}>
                                            <Col xs={12} className='single-header'>
                                                <span>{this.props.t("FIELD_ARRANGEMENT_NOTMATCH")}</span>
                                                <span className='storecount-txt'><b>{(dataObj && dataObj.length > 0)?dataObj.length:0}</b> {this.props.t((dataObj && dataObj.length > 1?'stores':'STORE'))}</span>
                                            </Col>
                                            <Col className='single-content'>
                                                {dataObj && dataObj.length > 0?<ListGroup>
                                                    {dataObj.map((num, nidx) => {
                                                        return <ListGroup.Item key={nidx}>
                                                            <Row>
                                                                <Col className='single-wrapper' xs={12}>
                                                                    <Row>
                                                                        <Col xs={7} className="store-title">
                                                                            <NoFieldViewIcon size={35} /> <h5>{num.name}</h5>
                                                                            {num.forcedDetails?<p>{this.props.t("RESPONSE_STAT.updated")} {convertDate(num.forcedDetails.forcedDate)} | @{(num.forcedDetails.user.firstName+"_"+num.forcedDetails.user.lastName)}</p>:<></>}
                                                                        </Col>
                                                                        <Col xs={5}>
                                                                            <ButtonGroup className='forcebtn-list'>
                                                                                <div className={'force-overlay'+(!num.isForced?" active":"")}></div>
                                                                                <Button variant='default' className={num.isForced?'active':''} onClick={() => this.handleChangeForce(false, nidx, true)}>{this.props.t("UNIQUEFIX_BTNS.FORCE")}</Button>
                                                                                <Button variant='default' className={!num.isForced?'active':''} onClick={() => this.handleChangeForce(false, nidx, false)}>{this.props.t("UNIQUEFIX_BTNS.EXCLUDE")}</Button>
                                                                            </ButtonGroup>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </ListGroup.Item>
                                                    })}
                                                </ListGroup>:<></>}
                                            </Col>
                                        </Col>
                                    </Row>
                                </Col>
                                
                            </Col>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>
        </>);
    }
}
