import React from 'react';
import { Col, Row, Modal, Button, Form, ListGroup } from 'react-bootstrap';
import { ChevronDownIcon, ChevronUpIcon, XIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';
// import FeatherIcon from 'feather-icons-react';

import { convertDate} from '../../../../_services/common.service';
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import { NoFieldViewIcon } from '../../../../assets/icons/icons';

import "./nofieldeditview.css";

/**
 *  Using to show no field stores list and update field count of each store
 *
 * @export
 * @class NoFieldEditModal
 * @extends {React.Component}
 */
export class NoFieldEditModal extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            dataObj: [],
        };
    }

    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            //get no field store list from parent
            let cdataobj = (this.props.dataObj && this.props.dataObj.length?this.props.dataObj:[]);

            this.setState({
                dataObj: JSON.parse(JSON.stringify(cdataobj)),
            }, () => {
                // console.log(this.state.dataObj);
            });
        }
      }
    
    componentWillUnmount() {
        this._ismounted = false;
    }
    //on change or blur update store details of loaded stores
    handleChangeStore = (idx, type, val,e) => {
        let cdataobj = this.state.dataObj;
        console.log(e)
        if(type === "fieldCount"){
            if(e && (e.target.value ||e.keyCode) &&!((/[0-9]/.test(e.target.value)) || (e.keyCode===8 ||e.keyCode===37||e.keyCode===39))){
                e.preventDefault();
                return
            }
            if(e && e.target.value && parseInt(e.target.value) > 100){
                alertService.error(this.props.t('validation.NumberInputValidation'))
                e.preventDefault();
                return
            }
        }
        cdataobj[idx][type] = val;

        this.setState({ dataObj: cdataobj });
    }
    //update nofield field added list
    handleUpdateNofields = () => {
        //get store list obj
        let cdataobj = this.state.dataObj; 

        //filter field count updated list
        // let countaddedlist = cdataobj.filter(x => x.fieldCount > 0);

        //check if count update fields available
        if(cdataobj && cdataobj.length > 0){

            confirmAlert({
                title: this.props.t('UPDATE_CHANGES'),
                message: (this.props.t('ARE_YOU_SURE_NOFIELD')),
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
            alertService.error(this.props.t("NO_COUNT_ADDED_FIELDS"));
        }
    }
    //continue update nofield stores
    continueUpdateStores = (countaddedlist) => {
        //create new object to send data to backend
        let saveobj = {
            mpId: (this.props.defSaveObj?this.props.defSaveObj.mp_id:-1),
            stores: countaddedlist
        };

        this.props.toggleLoadingModal(true, () => {
            submitSets(submitCollection.updateZeroFieldCountGroup, saveobj, false).then(res => {
                this.props.toggleLoadingModal(false);

                if(res && res.status){
                    //if success close modal
                    alertService.success(this.props.t("SUCCESSFULLY_UPDATED"));
                    this.props.handleToggleNoFields(false, true, this.state.dataObj);
                } else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                }
            });     
        });
    }


    render() {
        //get states
        let { dataObj } = this.state;

        return (<>
            <Modal centered className={'contimplement-modal nofieldedit-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.showNofieldsEdit} onHide={() => this.props.handleToggleNoFields(false)} backdrop="static">
                <Modal.Body>
                    <div className='closebtn' onClick={() => this.props.handleToggleNoFields(false)}><XIcon size={30} /></div>
                    <Row>
                        <Col xs={4} className="title-content">
                            <div className='icon-view'> 
                                <NoFieldViewIcon size={140} />
                            </div>
                            <h4>{this.props.t("WE_NOTICE_THAT_NO_FILLED")}</h4>
                            <div className='title-btns'>
                                <Button variant='success' onClick={() => this.handleUpdateNofields()}>{this.props.t("btnnames.update")}</Button>
                                <Button variant='default' onClick={() => this.props.handleToggleNoFields(false)}>{this.props.t("skip_btn")}</Button>
                            </div>
                        </Col>
                        <Col xs={8} className="details-view">
                            <Col xs={12} className='storelist-view'>
                                <Col xs={12} className="singlestore-item">
                                    <Row>
                                        <Col xs={12}>
                                            <Col xs={12} className='single-header'>
                                                <span>{this.props.t("NO_FIELDS")}</span>
                                                <span className='storecount-txt'><b>{(dataObj && dataObj.length > 0)?dataObj.length:0}</b> {this.props.t((dataObj && dataObj.length > 1?'stores':'STORE'))}</span>
                                            </Col>
                                            <Col className='single-content'>
                                                {dataObj?<ListGroup>
                                                    {dataObj.map((num, nidx) => {
                                                        return <React.Fragment key={nidx}>
                                                            <ListGroup.Item>
                                                                <Row>
                                                                    <Col className='single-wrapper' xs={12}>
                                                                        <Row>
                                                                            <Col xs={7} className="store-title">
                                                                                <NoFieldViewIcon size={35} /> <h5>{num.name}</h5>
                                                                                {num.updatedUser?<p>
                                                                                    {this.props.t("RESPONSE_STAT.updated")} {(num.updateDate?convertDate(num.updateDate):"-")} | 
                                                                                    @{num.updatedUser?(num.updatedUser.firstName+"_"+num.updatedUser.lastName):"-"}
                                                                                </p>:<></>}
                                                                            </Col>
                                                                            <Col xs={2} className="storeedit-title">{this.props.t("EDIT_FIELDS_NO")}:</Col>
                                                                            <Col xs={3} className="store-input">
                                                                                <div className={'input-wrapper'+(num.fieldCount > 0?" filled":"")}>
                                                                                    <Form.Control type='text' value={num.fieldCount} 
                                                                                        onChange={e => this.handleChangeStore(nidx, "fieldCount", e.target.value,e)} 
                                                                                        onBlur={e => this.handleChangeStore(nidx, "fieldCount", (e.target.value !== "" && e.target.value > 0?parseInt(e.target.value):0))}
                                                                                        onFocus={e => e.target.select()} 
                                                                                        />
                                                                                    <div className='form-controls'>
                                                                                        <span onClick={() => this.handleChangeStore(nidx, "fieldCount", (num.fieldCount + 1))}><ChevronUpIcon size={14} /></span>
                                                                                        <span onClick={() => this.handleChangeStore(nidx, "fieldCount", (num.fieldCount > 0?(num.fieldCount - 1):0))}><ChevronDownIcon size={14} /></span>
                                                                                    </div>
                                                                                </div>
                                                                            </Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Row>
                                                            </ListGroup.Item>
                                                        </React.Fragment>
                                                    })}
                                                </ListGroup>:<></>}
                                            </Col>
                                            <span className='warn-txt'>* {this.props.t("ZERO_FIELD_NUMBER_STORES")}</span>
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
