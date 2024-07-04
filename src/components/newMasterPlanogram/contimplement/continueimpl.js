import React from 'react';
import { Col, Row, Modal, Button, ListGroup } from 'react-bootstrap';
import { CheckCircleFillIcon, KebabHorizontalIcon, XIcon } from '@primer/octicons-react'; //, KebabHorizontalIcon
import FeatherIcon from 'feather-icons-react';

import { BrokenConnectionIcon } from '../../../assets/icons/icons';

import "./continueimpl.css";

import warnIcon from '../../../assets/img/icons/warn_full.png';
import takeTimeImg from '../../../assets/img/timetake_modal_img.jpg';
import { convertDate } from '../../../_services/common.service';
import { TooltipWrapper } from '../AddMethods';
import OssemModel from './Ossem/OssemModel';
import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
export class ContImplementModal extends React.Component {
    constructor(props) {
        super(props);

        this._ismounted = false;

        this.state = {
            dataObj: [],
            totalDisStoreCount: 0,
            showOssemModel:false,
            subObj:{store:"",update:"",name:""},
            cdata:[],
            maindata:[],
            totalAvailableDisStores: 0,
            issendOssemcall:false
        };
    }

    componentDidMount() {
        this._ismounted = true;
        var issendOssemcall=this.props.signedobj.signinDetails&&this.props.signedobj.signinDetails.isOssemOn&&this.props.signedobj.signinDetails.isOssemOn?true:false
        if(this._ismounted){
            this.setState({
                dataObj: this.props.dataObj,
            }, () => {
                // console.log(this.props.dataObj);
                this.recalcTotalDisapprove("disconnectedStores");
            });
           
            if(issendOssemcall){
                this.loadData();
            }else{
                this.setState({
                    maindata:this.props.dataObj
                })
            }
        }
      }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    //change and update field and store tag
    changeDataObjCheck = (ischild, subchildType, parentidx, storeidx, tagidx, cval, _callback) => {
        let cdataobj = this.state.dataObj;
        let storelist = [];
        
        let cstoreobj = cdataobj[parentidx].storesGroupByTags[storeidx];

        cstoreobj[subchildType][tagidx].isReApproved = cval;
        cdataobj[parentidx] = this.props.checkIsStoreApproved(cdataobj[parentidx], true);
        
        storelist.push(cstoreobj[subchildType][tagidx]);
        
        this.setState({ dataObj: cdataobj }, () => {
            this.recalcTotalDisapprove(subchildType);
            this.props.updateStoreApproveStatus(storelist);
        });
      }

    recalcTotalDisapprove = (subchildType) => {
        let cdataobj = this.state.dataObj;
        // console.log(cdataobj);

        //get total disapproved store count
        let totaldiscount = 0;
        let totalavailcount = 0;
        for (let i = 0; i < cdataobj.length; i++) {
            const fieldobj = cdataobj[i];

            let allReApproveCount = 0;
            let totalAllStoreCount = 0;
            for (let l = 0; l < fieldobj.storesGroupByTags.length; l++) {
                const storegroupitem = fieldobj.storesGroupByTags[l];
                
                for (let z = 0; z < storegroupitem[subchildType].length; z++) {
                    const storeitem = storegroupitem[subchildType][z];
                    if(storeitem.prevApproved && (!storeitem.isDifferentShelfStruc || (storeitem.isDifferentShelfStruc && storeitem.isForced))){
                        if(!storeitem.isReApproved){
                            totaldiscount = (totaldiscount + 1);
                        } else{
                            allReApproveCount = (allReApproveCount + 1);
                        }

                        totalAllStoreCount = (totalAllStoreCount + 1);
                        totalavailcount = (totalavailcount + 1);
                    }
                }
            }

            fieldobj.isAllReApproved = (allReApproveCount === totalAllStoreCount?true:false);
            // console.log(totalviewstores);
        }
        // console.log(totalavailcount, totaldiscount);

        this.setState({ totalDisStoreCount: totaldiscount, totalAvailableDisStores: totalavailcount });
    }

    loadData =()=>{    
        let sobj = {id:this.props.mpId}
        submitSets(submitCollection.getComparisonChanges,sobj, true).then(res => {
           if(res && res.status){
            for (const [dataIndex,data] of this.props.dataObj.entries()) {
                if(data.prevApproved && data.isFieldDisconSelected){
                    for (const [itemsIndex,item] of data.storesGroupByTags.entries()) {
                            for (const [index,val] of item.disconnectedStores.entries()) {
                                if(val.isApproved && (!val.isDifferentShelfStruc || (val.isDifferentShelfStruc && val.isForced))){
                                 this.props.dataObj[dataIndex].storesGroupByTags[itemsIndex].disconnectedStores[index].brands =  res.extra.filter((d)=> d.store_id === val.id)
                                }
                            }
                
                    }
                }
            }
            this.setState({
                maindata:this.props.dataObj,
                issendOssemcall:true
            })
           }
        });
        
    }

    handleModel = (store,update,name,data)=>{
        let subObj = {store:store,update:update,name:name}
        this.setState({
            subObj: subObj,
            cdata:data[0].details
        },()=>{
            this.setState({
                showOssemModel : true
            })
        })
    }

    handleModelClose=()=>{
        let subObj = {store:"",update:"",name:""}
        this.setState({
            subObj: subObj
        },()=>{
            this.setState({
                showOssemModel : false
            })
        })
    }

    toggleAllApprove = (parentidx) => {
        //console.log(parentobj);
        let maindata = this.state.maindata;
        let selectedGroup = maindata[parentidx];
        let togglestatus = (selectedGroup.isAllReApproved?false:true);

        let storelist = [];
        for (let i = 0; i < selectedGroup.storesGroupByTags.length; i++) {
            const storegroup = selectedGroup.storesGroupByTags[i];
            
            for (let j = 0; j < storegroup.disconnectedStores.length; j++) {
                const storeobj = storegroup.disconnectedStores[j];
                if(storeobj.isApproved){
                    storeobj.isReApproved = togglestatus;
                    
                    storelist.push(storeobj);
                }
            }
        }

        selectedGroup.isAllReApproved = togglestatus;

        this.setState({ maindata: maindata }, () => {
            this.recalcTotalDisapprove("disconnectedStores");
            this.props.updateStoreApproveStatus(storelist);
        });
    }

    render() {
        
        return (<>
            <Modal centered className={'contimplement-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.isShowContImpleModal} onHide={() => this.props.toggleContinueImpleModal()} backdrop="static">
                <Modal.Body>
                    <Row>
                        <Col xs={4} className="title-content">
                            <div className={'title-icon'+(this.state.totalDisStoreCount === 0?" no-cons":"")}>
                                {this.state.totalDisStoreCount === 0?<span className='linkicon'><FeatherIcon icon="link" size={50} /></span>:<BrokenConnectionIcon size={50} />}
                            </div>
                            <h4>{this.props.t("YOURE_ABOUT_TO_IMPLEMENT")} 
                                {this.state.totalDisStoreCount > 0?<>
                                    <span>{this.props.t("THIS")} <b className='highlight-txt'>{this.state.totalDisStoreCount} {this.props.t(this.state.totalDisStoreCount > 1?"branches":"branch")}</b> {this.props.t("NOT_CONNECTED")}</span>
                                </>:<>
                                    <b style={{fontWeight:"700"}}>{this.props.t("ALL_BRANCHES_CONNECTED")}</b>
                                </>}
                            </h4>
                            <div className='title-btns'>
                                {this.state.totalDisStoreCount === 0 || (this.state.totalAvailableDisStores > this.state.totalDisStoreCount)?
                                    <Button variant='success' onClick={() => this.props.toggleContinueImpleModal(true)}>{this.props.t("continue_btn")}</Button>
                                :<></>}
                                {( this.props.otherApproveCount > 0 && this.state.totalAvailableDisStores === this.state.totalDisStoreCount)?
                                    <Button variant='success' onClick={() => this.props.toggleContinueImpleModal(true)}>{this.props.t("CONTINUE_WITHOUT_THEM")}</Button>
                                :<></>}
                                <Button variant='default' onClick={() => this.props.toggleContinueImpleModal(true, true, this.state.dataObj)}>{this.props.t("BACK_TO_EDIT")}</Button>
                            </div>
                        </Col>
                        <Col xs={8} className="details-view">
                            <Col xs={12} className='storelist-view'>
                                {this.state.maindata && this.state.maindata.length >0?<>
                                    {this.state.maindata.map((fitem, fidx) => {
                                        return (<React.Fragment key={fidx}>{fitem.prevApproved && fitem.isFieldDisconSelected?
                                        <Col xs={12} className="singlestore-item">
                                            <Row>
                                                <Col xs={12}>
                                                    <Col xs={10} className='single-header'>
                                                        <div className="single-icon selectall">
                                                            <div className={'toggle-icon'+(fitem.isAllReApproved?" active":"")} onClick={() => this.toggleAllApprove(fidx)}>
                                                                <div className='linkicon'>{fitem.isAllReApproved?<FeatherIcon icon="link" size={12} />:<BrokenConnectionIcon size={12} />}</div>
                                                            </div>
                                                        </div>

                                                        <span><b>{fitem.fieldCount}</b> {this.props.t("fields")}</span>
                                                        <ul className='list-inline'>
                                                            {fitem.showingTagsList.map((stgitem, stgidx) => {
                                                                return <React.Fragment key={stgidx}>{stgidx < 5?<li className='list-inline-item'>
                                                                    <TooltipWrapper text={stgitem.name}>
                                                                        <span>{stgitem.name.substring(0,8)+(stgitem.name.length > 8?"..":"")}</span>
                                                                    </TooltipWrapper>
                                                                </li>:<></>}</React.Fragment>
                                                            })}

                                                            {fitem.showingTagsList && fitem.showingTagsList.length > 5?<>
                                                                <li className='list-inline-item'><div className='drop-wrapper'>
                                                                    <span className='drop-link'><KebabHorizontalIcon size={16}/></span>
                                                                    <div className='drop-menu'><ul>
                                                                        {fitem.showingTagsList.map((stagitem, stagidx) => {
                                                                            return <React.Fragment key={stagidx}>
                                                                                {stagidx > 4?<li>
                                                                                    <TooltipWrapper text={stagitem.name}>
                                                                                        <span>{stagitem.name.substring(0,8)+(stagitem.name.length > 8?"..":"")}</span>
                                                                                    </TooltipWrapper>
                                                                                </li>
                                                                            :<></>}</React.Fragment>
                                                                        })}
                                                                    </ul></div>
                                                                </div></li>
                                                            </>:<></>}
                                                            {/* {fitem.storesGroupByTags.length > 2?<>
                                                                <li className='list-inline-item more-link'>
                                                                    <span><KebabHorizontalIcon size={16} /></span>
                                                                </li>
                                                            </>:<></>} */}
                                                        </ul>
                                                    </Col>
                                                    <Col className='single-content'>
                                                        <ListGroup>
                                                            {fitem.storesGroupByTags.map((stgitem, stgidx) => {
                                                                return <React.Fragment key={stgidx}>
                                                                    {stgitem.disconnectedStores.map((sstoreitem, sstoreidx) => {
                                                                        return <React.Fragment key={sstoreidx}>
                                                                            {sstoreitem.isApproved && (!sstoreitem.isDifferentShelfStruc || (sstoreitem.isDifferentShelfStruc && sstoreitem.isForced))?<ListGroup.Item key={sstoreidx}>
                                                                                <Row>
                                                                                    <Col className='single-wrapper' xs={10}>
                                                                                        <Row>
                                                                                            <Col xs={6}>{sstoreitem.name}</Col>
                                                                                            {
                                                                                                this.state.issendOssemcall ?
                                                                                            <Col className='store-brands' xs={4} onClick={()=>this.handleModel(sstoreitem.name,convertDate(sstoreitem.ApprovedAt),(sstoreitem.isApprovedBy?(sstoreitem.isApprovedBy.fName+"_"+sstoreitem.isApprovedBy.lName):"-"),sstoreitem.brands)} style={{"cursor":"pointer"}}>
                                                                                               <p>
                                                                                                {
                                                                                                    sstoreitem.brands.map((brands)=>{
                                                                                                        return(
                                                                                                            brands.details.map((d)=>{
                                                                                                                return `${d.brand_name} `
                                                                                                            })
                                                                                                        )
                                                                                                       
                                                                                                    })
                                                                                                }
                                                                                                </p>
                                                                                            </Col>: <Col></Col>
                                                                                            }
                                                                                            <Col xs={2}>100/0</Col>
                                                                                        </Row>
                                                                                        <p><CheckCircleFillIcon size={16} /> {this.props.t("updated")} {convertDate(sstoreitem.ApprovedAt)} | @{(sstoreitem.isApprovedBy?(sstoreitem.isApprovedBy.fName+"_"+sstoreitem.isApprovedBy.lName):"-")}</p>
                                                                                    </Col>
                                                                                    <Col xs={2} className="single-icon">
                                                                                        <div className={'toggle-icon '+(sstoreitem.isReApproved?"active":"")} onClick={() => this.changeDataObjCheck(true, "disconnectedStores", fidx, stgidx, sstoreidx, !sstoreitem.isReApproved)}>
                                                                                            {sstoreitem.isReApproved?<span className='linkicon'><FeatherIcon icon="link" size={16} /></span>:<BrokenConnectionIcon size={16} />}
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                            </ListGroup.Item>:<></>}
                                                                        </React.Fragment>})}
                                                                </React.Fragment>
                                                            })}
                                                        </ListGroup>
                                                    </Col>
                                                </Col>
                                            </Row>
                                        </Col>:<></>}</React.Fragment>)
                                    })}
                                </>:<></>}
                                
                            </Col>
                            <h4 className='footer-txt'>{this.props.t("SELECT")} <div className='small-rect'></div> {this.props.t("TOCONNECT_AND_OVERIDE")}</h4>
                        </Col>
                    </Row>
                 
                </Modal.Body>
            </Modal>
            <OssemModel isRTL={this.props.isRTL} t={this.props.t} subObj={this.state.subObj} data={this.state.cdata}   show={this.state.showOssemModel} onHide={this.handleModelClose}/>
        </>);
    }
}

export class DisconStoreSelectWarn extends React.Component{
    render(){
        return <Modal size="md" centered className={'new-notice-modal disstore-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.showDisStoreSelWarn} onHide={() => this.props.toggleDisStoreWarn()} backdrop="static">
        <Modal.Body>
            <div className='closebtn' onClick={() => this.props.toggleDisStoreWarn()}><XIcon size={20} /></div>
            
            <Row>
                <Col xs={10} className="col-centered" style={{textAlign:"center",padding:"0px"}}>
                    <div className='title-icon'><BrokenConnectionIcon size={40} /></div><br/>
                    <Col className={'txt-label'}><span>{this.props.t("SEVERAL_DISCONNECTED_STORES")}. <b>{this.props.t("IMPLEMENT_WILL_OVERRIDE")}.</b></span></Col>
                    
                    <ul className='list-inline'>
                        <li className='list-inline-item'>
                            <Button className='backto-btn' onClick={()=>this.props.toggleDisStoreWarn()}>{this.props.t("BACK_TO_SIM")}</Button>
                        </li>
                        <li className='list-inline-item'>
                            <Button className='gotit-btn' onClick={()=>this.props.toggleDisStoreWarn(true)}>{this.props.t("ITS_OKAY")}</Button>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
    }
}

export class CategoryAssingWarn extends React.Component{
    render(){
        return <Modal size="md" centered className={'new-notice-modal categoryassign-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.showCatAssignWarn} onHide={() => this.props.toggleCatAssignWarn()} backdrop="static">
        <Modal.Body>
            <div className='closebtn' onClick={() => this.props.toggleCatAssignWarn()}><XIcon size={20} /></div>
            
            <Row>
                <Col xs={10} className="col-centered" style={{textAlign:"center"}}>
                    <img className='notice-png' src={warnIcon} alt="notice" /><br/>
                    <Col className={'txt-label'}><span>{this.props.t("IMPLEMENT_CANNOT_CONTINUE")}. <b>{this.props.t("PLEASE_ASSIGN_CAT_LOCATION")}.</b></span></Col>
                    
                    <Button className='gotit-btn' onClick={()=>this.props.toggleCatAssignWarn(true,"letsgo")}>{this.props.t("LETS_GO")}</Button>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
    }
}

export class ImplementSuccesMsg extends React.Component{
    render(){
        return <Modal size="md" centered className={'new-notice-modal categoryassign-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.showImplemSucMsg} onHide={() => this.props.toggleImplemSucMsg()} backdrop="static">
        <Modal.Body>
            {/* <div className='closebtn' onClick={() => this.props.toggleImplemSucMsg()}><XIcon size={20} /></div> */}
            
            <Row>
                <Col xs={10} className="col-centered" style={{textAlign:"center"}}>
                    <img className='notice-png' src={takeTimeImg} style={{width: "auto", height: "120px"}} alt="" /><br/>
                    <Col className={'txt-label'}><span>{this.props.t("IMPLEMENT_PROCESS_STARTED")}. <b>{this.props.t("NOTIFY_AFTER_COMPLETE")}.</b></span></Col>
                    
                    <Button className='gotit-btn' onClick={()=>this.props.toggleImplemSucMsg()}>{this.props.t("OKAY_NOTED")}</Button>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
    }
}

export class TakeBackOverlapWarn extends React.Component{
    render(){
        let takebackobj = this.props.takeBackErrorObj;

        return <Modal size="md" centered className={'new-notice-modal disstore-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.isShowTakeBackError} onHide={() => this.props.toggleTakebackWarnModal(false)} backdrop="static">
        <Modal.Body>
            <div className='closebtn' onClick={() => this.props.toggleTakebackWarnModal(false)}><XIcon size={20} /></div>
            
            <Row>
                <Col xs={10} className="col-centered" style={{textAlign:"center"}}>
                    <div className='tag-warn-fields-store'>
                        <div className="card m-1">
                            <div className="card-body">
                                {this.props.takeBackErrorObj?<div>
                                    <span className="collapsible-section-title-count">{takebackobj.fieldCount}</span>
                                    <span className="collapsible-section-title">{this.props.t((takebackobj.fieldCount > 1?'fields':'FIELD'))}</span>
                                    
                                    {/* {takebackobj.selectedTagsId.length > 0?<ul className='list-inline'>
                                        {takebackobj.selectedTagsId.map((mitem, midx) => {
                                            return <li className='list-inline-item' key={midx}>
                                                <Badge bg='secondary'>{mitem.name}</Badge>
                                            </li>;
                                        })}
                                    </ul>:<></>} */}
                                </div>:<></>}
                            </div>
                        </div>
                    </div>
                    <Col className={'txt-label'}><span>{this.props.t("TACKBACK_BLOCKED")}.<br/><b>{this.props.t("SURETO_CONTINUE")}</b></span></Col>
                    
                    <ul className='list-inline'>
                        <li className='list-inline-item'>
                            <Button className='backto-btn' onClick={()=>this.props.toggleTakebackWarnModal(false)}>{this.props.t("btnnames.no")}</Button>
                        </li>
                        <li className='list-inline-item'>
                            <Button className='gotit-btn' onClick={()=>this.props.toggleTakebackWarnModal(false, true)}>{this.props.t("btnnames.yes")}</Button>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
    }
}

export class TagWarning extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            dataObj:[]
        }
    }

    componentDidMount() {
        this.initData();
    }

    initData = () => {
        let dataobj = JSON.parse(JSON.stringify(this.props.dataObj));
        //let tagmix = this.props.newData;
        
        for (let i = 0; i < dataobj.length; i++) {
            const fieldobj = dataobj[i];
            let isvailablestores = 0;

            for (let j = 0; j < fieldobj.storesGroupByTags.length; j++) {
                const taggroup = fieldobj.storesGroupByTags[j];
                
                for (let l = 0; l < taggroup.disconnectedStores.length; l++) {
                    const disconstore = taggroup.disconnectedStores[l];
                    
                    if(disconstore.isApproved && (!disconstore.isDifferentShelfStruc || (disconstore.isDifferentShelfStruc && disconstore.isForced))){
                        isvailablestores = (isvailablestores + 1);
                    }
                }

                let constorecount = taggroup.connectedStores.filter(x => x.isApproved);
                if(constorecount && constorecount.length > 0){
                    isvailablestores = (isvailablestores + constorecount.length);
                }
            }
            //console.log(fieldobj.fieldCount, isvailablestores);

            fieldobj["isShowInTagModal"] = (isvailablestores > 0);
            fieldobj["showTagStoreCount"] = isvailablestores;
        }
        // console.log(dataobj);

        this.setState({ dataObj: dataobj });
    }

    render(){
        return <Modal size="md" centered className={'new-notice-modal disstore-warn-modal '+(this.props.isRTL === "rtl" ? "RTL":"LTR")} show={this.props.showTagWarn} onHide={() => this.props.toggleTagWarn()} backdrop="static">
        <Modal.Body>
            <div className='closebtn' onClick={() => this.props.toggleTagWarn()}><XIcon size={20} /></div>
            
            <Row>
                <Col xs={10} className="col-centered" style={{textAlign:"center",padding:"0px"}}>
                    <div className='tag-warn-fields-store'>
                    {this.state.dataObj.map((item, index)=>{
                            return(<React.Fragment key={index}>
                                { this.props.newData.find(dt => dt.fieldCount === item.fieldCount && dt.mixTags === true && item.isShowInTagModal === true)?<> 
                                    <div key={index} className="card m-1">
                                        <div className="card-body">
                                            <div>
                                                <span className="collapsible-section-title-count">{item.fieldCount}</span>
                                                <span className="collapsible-section-title">{this.props.t((item.fieldCount > 1?'fields':'FIELD'))}</span>
                                                <span className="collapsible-section-sub-title">(<b>{item.showTagStoreCount}</b> { this.props.t((item.showTagStoreCount > 1?'stores':'STORE'))})</span>
                                            </div>
                                        </div>
                                    </div>
                                </>:<></>}
                            </React.Fragment>
                            )})}
                    </div>
                
                    <Col className={'txt-label'}><span>{this.props.t("THIS_SELECTION_CONTAINS_TAGED")}.<br/> <b>{this.props.t("DO_YOU_WANT_TO_INGNORE")}</b></span></Col>
                    
                    <ul className='list-inline'>
                        <li className='list-inline-item'>
                            <Button className='backto-btn' onClick={()=>this.props.toggleTagWarn(false, true)}>{this.props.t("btnnames.yes")}</Button>
                        </li>
                        <li className='list-inline-item'>
                            <Button className='gotit-btn' onClick={()=>this.props.toggleTagWarn(true, true)}>{this.props.t("btnnames.no")}</Button>
                        </li>
                    </ul>
                </Col>
            </Row>
        </Modal.Body>
    </Modal>
    }
}
