import React, { Component } from 'react';
import { Breadcrumb, Button, Col, Form, Modal, Row, Tab, Tabs } from 'react-bootstrap';
import MDsidebarmenu from '../../common_layouts/mdsidebarmenu';
import { Link, withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import CryptoJS from "crypto-js";
import SaleSyncLog from './synclog/saleSyncLog';
import SaleProductLog from './productlog/saleProductLog';
import "./salesLog.scss"
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { AcViewModal } from '../../UiComponents/AcImports';
import { alertService } from '../../../_services/alert.service';
import { confirmAlert } from 'react-confirm-alert';
import { AlertIcon } from '@primer/octicons-react';
import SalelogDashboardTiles from './dashboardCard/salelogDashboardTiles';
import { preventinputToString } from '../../../_services/common.service';
import { maxInputLength } from '../../../_services/common.service';
import { BlockIcon } from '../../../assets/icons/icons';
import { FileImportQueueJobs } from './fileImportQueueJobs/FileImportQueueJobs';

export class SalesLog extends Component {
    constructor(props) {
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            mTrrigerloading: false,
            TiledateOrder:null,
            TileChainstatus:null,
            TileAllbranchsync:null,
            TileCurrbranchsync:null,
            branches:[],
            clickedTab:false,

            //secure manual sync
            manualSyncSecureModal: false,
            // manualSyncCheckPw: "aac1eaffc21487c13735c470773da1c7",
            manualSyncPwTxt: "",
            isShowQueueJob:false,
            activeTab:"synclog",
            isshowQueueJobSecureModal: false,
            isQueueTabOpen:false,
            queueTabPw:"",
            isShowInformationModel:false,

        }
    }
    componentDidMount() {
        // this.getTileDetails()
        this._isMounted = true;
        if(this._isMounted){
            this.loadBranches();
        }
    }
    componentWillUnmount(){
        this._isMounted = false;
    }
    loadBranches=()=>{
        submitSets(submitCollection.getStoreList).then(res => {
            if(res && res.status){
                this.setState({branches:res.extra},()=>{
                })
            }else{
                alertService.error(this.props.t("erroroccurred"))
            }
        });
        
    }
    getTileDetails=()=>{
        submitSets(submitCollection.GetTileInfoSales).then(res => {
            if(res && res.status){
                this.setTitleDetailsFrontObj(res.extra)

            }else{

            }
        })
        
        
    }
    //setting to front
    setTitleDetailsFrontObj=(obj)=>{
        var CTiledateOrder={
            status:obj.dateOrderStatus.status,
            count:obj.dateOrderStatus.count,
        }
        var CTileChainstatus={
            status:obj.chainStatus.status,
            count:obj.chainStatus.count,
        }
        var CTileAllbranchsync={
            date:obj.entireBranchLastSyncDate
        }
        var CTileCurrbranchsync={ date:obj.currentBranchLastSyncDate}
        this.setState({TiledateOrder:CTiledateOrder,TileChainstatus:CTileChainstatus,TileAllbranchsync:CTileAllbranchsync,TileCurrbranchsync:CTileCurrbranchsync})
    }

    //manual trigger pw confirm modal toggle
    clickManualTrigger = () => {
        this.toggleSecureManualSync();
    }

    toggleSecureManualSync = () => {
        this.setState({ manualSyncSecureModal: !this.state.manualSyncSecureModal });
    }

    continueManualTrigger = () => {
        confirmAlert({
            title: this.props.t('CONFIRM_SYNC'),
            message: this.props.t('ARE_YOU_RUN_iMMEDIATE_SYNC'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    this.clickManualTriggercall()
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    
    //send manual trigger call-sync now
    clickManualTriggercall=()=>{
        this.setState({ mTrrigerloading: true },()=>{
            submitSets(submitCollection.manualTriggerSales).then(res => {
                if(res && res.status){
                    this.setState({ mTrrigerloading: false });
                    alertService.success(this.props.t("SYNC_SUCCESS"))
                }else{
                    this.setState({ mTrrigerloading: false });
                    if(res.extra && res.extra !== "" && res.extra !== null && res.extra !== undefined){
                        alertService.error(res.extra);
                    }else{
                        alertService.error(this.props.t("SYNC_FAIL"));
                    }
                  
                }
            });
        })  
    }
    //trigger force sync
    clickforceIssueTrigger=()=>{
        confirmAlert({
            title: <Col><span className='waring-Icon-confimation'><AlertIcon size={26} /></span><span className='waring-title-confimation'>{this.props.t('ARE_YOU_SURE_YOU_WANT_TO_FORCE_SYNC_SALE_DATE_FILES')}</span></Col>,
            message: this.props.t('THOSE_FILES_CAN_CONTAINE_DATA_WITH_MISSMATCH_WITH_LAST_SYNC_DATE'),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    setTimeout(() => {
                        this.forssyncConfimAgain()
                      }, 100);
                  
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    forssyncConfimAgain=()=>{
        
        confirmAlert({
            title: <div><span className='waring-Icon-confimation'><AlertIcon size={26} /></span><span className='waring-title-confimation'>{this.props.t('ARE_YOU_SURE_THIS_CANNOT_BE_REVERSE')}</span></div>,
            message: <span className="waring-error-confimation">{this.props.t('THIS_PROCESS_CANNOT_BE_REVERSE_ARU_SURE')}</span>,
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                   this.clickforceIssueTriggercall()
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    return false;
                }
            }]
        });
    }
    // force sync call
    clickforceIssueTriggercall =()=>{
        this.setState({ mTrrigerloading: true },()=>{
            submitSets(submitCollection.forceIssueSync).then(res => {
                if(res && res.status){
                    this.setState({ mTrrigerloading: false });
                    alertService.success(this.props.t("SYNC_SUCCESS"))
                }else{
                    this.setState({ mTrrigerloading: false });
                    alertService.error(this.props.t("SYNC_FAIL"))
                }
            });
        })  
    }

    tabClick=(e)=>{
        if(e === "fileImportQueueJobs"){
            if(!this.state.isQueueTabOpen){
                this.setState({isShowInformationModel: true})
            }else{
                this.setState({isShowQueueJob: true,activeTab:"fileImportQueueJobs"});
            }
        }else if(e === "productlog"){
            this.setState({tabClick: true,activeTab:"productlog"});
        }else if(e === "synclog"){
            this.setState({activeTab:"synclog"});
        }
    }

    //onchange manual sync txt
    changeSecureTxt = (e) => {
        this.setState({ manualSyncPwTxt: e });
    } 

    changeQueueTabSecureTxt = (e) => {
        if(!preventinputToString(e,e.target.value,(this.props.t('password_limmit')))){
            return
        }
        this.setState({ queueTabPw: e.target.value});
    }

    //manualsync secure continue
    handleSecureManualSync = () => {
        let checkpw = this.props.globsettingobj?.password;
        let ctxt = CryptoJS.MD5(this.state.manualSyncPwTxt).toString();
        
        if( checkpw !== null && checkpw !== undefined && checkpw && checkpw === ctxt){
            this.toggleSecureManualSync();
            this.continueManualTrigger();
        } else{
            alertService.error(this.props.t("invalid_pw"));
        }
        
        this.changeSecureTxt("");
    }

    handleSecureQueueJobTab = () => {
        let checkpw = this.props.globsettingobj?.password;
        let ctxt = CryptoJS.MD5(this.state.queueTabPw).toString();
        
        if(checkpw !== null && checkpw !== undefined && checkpw && checkpw === ctxt){
            this.setState({isShowQueueJob: true,activeTab:"fileImportQueueJobs",isshowQueueJobSecureModal:false,isQueueTabOpen:true});
        } else{
            alertService.error(this.props.t("invalid_pw"));
        }
        
    }
    handleVerification = ()=>{
        this.setState({
            isShowInformationModel:false,
            isshowQueueJobSecureModal:true,
            queueTabPw:""
        })
    }
    
    render() {
        return (
            
                <Col xs={12} className={"main-content compmain-content mdatacontent-main mrformcontent-main "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <div className='saleslogmain'>
                        <Row>
                            <MDsidebarmenu />
                            <Col xs={12} lg={10}>
                                <Breadcrumb dir="ltr">
                                {this.props.isRTL==="rtl"?<>
                                    <Breadcrumb.Item active>{this.props.t('SALES_LOG')}</Breadcrumb.Item>
                                    <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                    </>:<>
                                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                        <Breadcrumb.Item active>{this.props.t('SALES_LOG')}</Breadcrumb.Item>
                                    </>}
                                </Breadcrumb>
                                <Col className="white-container pdunit-content" ref={this.whitecontainer}>
                                  
                                <Button id="syncNow" variant="outline-primary" className="task-exportexcel-link"  onClick={()=>this.clickManualTrigger()} > {this.props.t("MANUAL_TRIGGER")}</Button>
                                {/* <Button id="forceIssueSync" variant="outline-primary" className="task-exportexcel-link forceissue" onClick={()=>this.clickforceIssueTrigger()} > {this.props.t("FORCE_ISSUE_SYNC")}</Button> */}
                                   <Tabs activeKey={this.state.activeTab}  id="uncontrolled-tab-example" className="mb-3" onSelect={(e)=>this.tabClick(e)}>
                                  
                                        <Tab eventKey="synclog" title={this.props.t('SYNC_LOG')}>
                                        <SalelogDashboardTiles TiledateOrder={this.state.TiledateOrder} 
                                        TileChainstatus={this.state.TileChainstatus}
                                        TileAllbranchsync={this.state.TileAllbranchsync}
                                        TileCurrbranchsync={this.state.TileCurrbranchsync}/>
                                        { this._isMounted?
                                        <SaleSyncLog branches={this.state.branches} isRTL={this.props.isRTL}
                                            whitecontainer={this.whitecontainer}
                                            getTileDetails={this.getTileDetails} />
                                        :<></>}
                                        </Tab>
                                        <Tab eventKey="productlog" title={this.props.t('PRODUCT_LOG')}>
                                        <SalelogDashboardTiles TiledateOrder={this.state.TiledateOrder} 
                                        TileChainstatus={this.state.TileChainstatus}
                                        TileAllbranchsync={this.state.TileAllbranchsync}
                                        TileCurrbranchsync={this.state.TileCurrbranchsync}/>
                                       {this._isMounted?<SaleProductLog  tabClick={this.state.tabClick} whitecontainer={this.whitecontainer} getTileDetails={this.getTileDetails} />:<></>}
                                        </Tab>
                                        <Tab eventKey="fileImportQueueJobs" title={this.props.t('Queue_Jobs')}>
                                            <FileImportQueueJobs whitecontainer={this.whitecontainer} tabClick={this.state.isShowQueueJob}  t={this.props.t}  isRTL={this.props.isRTL}  />
                                        </Tab>
                                    </Tabs>
                                </Col>
                            </Col>
                        </Row>
                    </div>
                    <AcViewModal showmodal={this.state.mTrrigerloading} message={this.props.t('PLEASE_WAIT')} />

                    <Modal show={this.state.manualSyncSecureModal} centered dialogClassName="modal-50w" className='deletesecure-modal' style={{direction: this.props.isRTL}} onHide={this.toggleSecureManualSync}>
                        <Modal.Header style={{ padding: "8px 15px" }}>
                            <Modal.Title style={{ fontWeight: "700", fontSize: "20px", color: "#5128a0" }}>{this.props.t('CONFIRM_SYNC')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label style={{ marginBottom: "0px", fontSize: "14px", fontWeight: "600" }}>{this.props.t('entermanualsyncpw')}</Form.Label>
                                <Form.Control maxLength={maxInputLength} type="password" value={this.state.manualSyncPwTxt} autoFocus onChange={e => this.changeSecureTxt(e.target.value)} autoComplete='new-password' />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button size="sm" variant="danger" style={{ borderRadius: "15px", fontWeight: "700", padding: "3px 15px" }} onClick={() => this.handleSecureManualSync()}>{this.props.t('continue')}</Button>
                            <Button size="sm" variant="light" onClick={this.toggleSecureManualSync}>{this.props.t('btnnames.close')}</Button>
                        </Modal.Footer>
                    </Modal>
                    
                    <Modal show={this.state.isshowQueueJobSecureModal} centered dialogClassName="modal-50w" className='deletesecure-modal' style={{direction: this.props.isRTL}}>
                        <Modal.Header style={{ padding: "8px 15px" }}>
                            <Modal.Title style={{ fontWeight: "700", fontSize: "20px", color: "#5128a0" }}>{this.props.t('CONFIRM_QUEUE')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form.Group>
                                <Form.Label style={{ marginBottom: "0px", fontSize: "14px", fontWeight: "600" }}>{this.props.t('CONFIRM_QUEUE_L')}</Form.Label>
                                <Form.Control type="password" value={this.state.queueTabPw} autoFocus onChange={e => this.changeQueueTabSecureTxt(e)} autoComplete='new-password' />
                            </Form.Group>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button size="sm" variant="danger" style={{ borderRadius: "15px", fontWeight: "700", padding: "3px 15px" }} onClick={() => this.handleSecureQueueJobTab()}>{this.props.t('continue')}</Button>
                            <Button size="sm" variant="light" onClick={()=>this.setState({isshowQueueJobSecureModal:false})}>{this.props.t('btnnames.close')}</Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={this.state.isShowInformationModel} centered dialogClassName="modal-50w" className='deletesecure-modal' style={{direction: this.props.isRTL}} onHide={()=>this.setState({isShowInformationModel:false})}>
                        <Modal.Body>
                             <div className='information-model-body'>
                                <BlockIcon size={50} color={'#d50000'} />
                                <div className='content'>
                                    <h1 className='title'>{this.props.t('VERIFY_TITLE')}</h1>
                                    <span className='body-text'>{this.props.t('VERIFY_BODY_TEXT')}</span>
                                </div>
                                <Button variant="secondary" className='verify-btn' onClick={this.handleVerification}>{this.props.t('VERIFY_Btn')}</Button>
                            </div>
                        </Modal.Body>
                    </Modal>

                 </Col>
        
           
        );
    }
}


export default withTranslation()(withRouter(SalesLog));