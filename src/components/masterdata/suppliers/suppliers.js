import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Breadcrumb, Button, Col, Form, Modal, Row, Badge} from 'react-bootstrap';

import './suppliers.scss';

import { AcTable, AcButton, AcInput, ValT, AcViewModal, AcNoDataView } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';
import { CustomColorPicker } from '../../common_layouts/color-picker';

import { withTranslation } from 'react-i18next';
import "../../../_translations/i18n";
import { FindMaxResult, maxInputLength, preventinputToString, preventinputotherthannumbers } from '../../../_services/common.service';

/**
 * masterdata component for add/edit view tags
 * tags are using in planogra layout view, there also option for add new tags
 *
 * @class TagsComponent
 * @extends {React.Component}
 */
export class SuppliersComponent extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            toridata:[], isdataloaded: false,
            ftablebody: [],
            sobj: this.defaultFilterObject(),
            startpage: 1, totalresults: 0,
            showdetailmodal: false,
            cobj: this.defaultObjectLoad(), vobj: {}, isedit: false, //modal details
            initCobj: this.defaultObjectLoad(),
            isFromLog:false,
            oneresultheight:55, maxShowresultcount:0,orimaxShowresultcount:0//find max result varibles
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,145);
            this.setState({
            maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
            },()=>{
                this.handleTableSearch(null,"click");
                this.initExistinfSupplierLoad();
            })
           
        }
    }

    initExistinfSupplierLoad = () =>{
        const queryParams = new URLSearchParams(window.location.search);
        const isFromLog = queryParams.get('isFromLog');
        
        if(isFromLog==="true" && this.props.navigatedata){
            if(this.props.navigatedata.main_type === "Supplier" && this.props.navigatedata.main_obj){
                this.setState({isFromLog:isFromLog, cobj:this.props.navigatedata.main_obj},()=>{
                    this.setState({isedit:true,showdetailmodal:true});
                });
                
            }

        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { supplierId: -1,supplierName:"",supplierCode:"", color:"#FFF", isReqPagination:true, startIndex:0, maxResult:8, isReqCount:false, };
    }
    //reset table filters 
    resetTableFilters = () => {
        this.setState({ sobj: this.defaultFilterObject(), startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }
    //load table data
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);

            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({0:citem.supplierId, 1:citem.supplierCode, 2:citem.supplierName});
                }
            }

        }
        this.setState({ ftablebody: cdata}, () => {
            this.setState({isdataloaded: true});
        });
    }
    //set filter object
    handleFilterObject = (evt,etype,ctype,msg) => {
        var cobj = this.state.sobj;
        
        if(etype === "supplierName"){
            if(!preventinputToString(evt,evt.target.value,msg)){
                evt.preventDefault()
                return
            }
        }
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.setState({startpage: 1,toridata:[],totalresults:0}, () => {
                    this.handleTableSearch(null,"click");
                });
            }
        });
    }
    //search suppliers onload or when filter
    handleTableSearch = (evt,etype) => {
        var maxresutcount=this.state.maxShowresultcount
        var csobj=this.state.sobj
        csobj.maxResult=maxresutcount
        this.setState({
            cobj:csobj,
            isdataloaded: false,
            loading:true,
        });
        submitSets(submitCollection.searchSuppliers, this.state.sobj, true).then(res => {
            var cdata = [];
            if(res && res.status){
                var cfindList = cdata.findIndex(x => x.page === this.state.startpage);
                if(cfindList > -1){
                    cdata[cfindList].data = res.extra;
                } else{
                    cdata.push({page:(this.state.startpage),data:res.extra});
                }

                
                this.setState({
                    toridata: cdata,
                    totalresults: (this.state.startpage === 1 || this.state.sobj.isReqCount===true?res.count:this.state.totalresults),
                    loading:false,
                    
                }, () => {
                    this.loadTableData();
                    let serachobj = this.state.sobj;
                    serachobj.isReqCount = false;
                    this.setState({sobj:serachobj});
                });
            } else{
                this.setState({
                    toridata: cdata,
                    loading:false,
                }, () => {
                    this.loadTableData();
                });
            }
        });
    }
    //default save object
    defaultObjectLoad = () => {
        return {supplierId: -1,supplierName:"",supplierCode:"",};
    }
    //new supplier link
    handleNewLink = () => {
        this.setState({cobj:this.defaultObjectLoad(),isedit:false});
        this.handleModalToggle();
    }
    //table row click - edit suppliers
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.supplierId === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.setState({cobj:JSON.parse(JSON.stringify(finditem)), initCobj:{...JSON.parse(JSON.stringify(finditem))} ,isedit:true},() => {
                        this.handleModalToggle();
                    });
                }
            } else{
                this.setState({cobj:cfindList.data[cidx],isedit:true},() => {
                    this.handleModalToggle();
                });
            }
        }
    }
    //pagination page change
    handlePageChange = (cstartpage) => {
        var cfindList = this.state.toridata.find(x => x.page === cstartpage);
        var csobj = this.state.sobj;
        csobj.startIndex = ((cstartpage - 1) * this.state.sobj.maxResult);

        this.setState({ sobj: csobj, startpage: cstartpage, isdataloaded: false }, () => {
            if(cfindList){
                this.loadTableData();
            } else{
                this.handleTableSearch(null, "click");
            }
        });
    }
    //toggle supplier add/edit modal
    handleModalToggle = () => {
        this.setState({showdetailmodal: !this.state.showdetailmodal})
    }
    //save/edit suppliers
    handleSupSave = (obj) => {

        if(obj.supplierName === "" || obj.supplierCode === ""){
            alertService.error(this.props.t('FILL_ALL_REQ_FIELDS'));
            return false;
        }

        submitSets(submitCollection.saveSupplier, obj, null).then(resp => {

            if(resp && resp.status){
                
                alertService.success(this.props.t('SUCCESSFULLY_SUP_DETAILS_SAVED'));
                let serachobj = this.state.sobj;
                serachobj.isReqCount = true;
                this.setState({sobj:serachobj},()=>{
                    this.handleTableSearch(null,"click");
                });
                
                if(this.state.isFromLog === "true"){
                    this.props.history.push("/catelogueImport?isSavedLog=true");
                }
                else{
                    this.handleTableSearch(null,"click");
                    this.handleModalToggle();
                }
            } else{
                /* if(resp && resp.extra){
                    if(resp.extra === "SUPPLIER_CODE_DUPLICATE"){
                        alertService.error(this.props.t('SUPPLIER_CODE_DUPLICATE'));
                    }
                    else if(resp.extra === "SUPPLIER_NAME_DUPLICATE"){
                        alertService.error(this.props.t('SUPPLIER_NAME_DUPLICATE'));
                    }
                    else{
                        alertService.error(resp.extra);
                    }
                }
                else{
                    if(resp && resp.msg){
                        alertService.error(resp.msg);
                    }
                } */

                if(resp.validation){
            
                    let codeMessage = this.props.t(resp.validation.code);
        
                    if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                        
                        let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
        
                        resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
        
                    }else{
                        resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                    }
        
                }else{
                    alertService.error(this.props.t("ERROR_OCCURRED"));
                }

                //alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
            }
        });

    }

    //update suppliers
    handleSupUpdate = (obj) => {
        
        if(obj.supplierName === "" || obj.supplierCode === ""){
            alertService.error(this.props.t('FILL_ALL_REQ_FIELDS'));
            return false;
        }

        let nameUpdate = false;
        let codeUpdate = false;
        let colorUpdate = false;

        if(obj.supplierName !== this.state.initCobj.supplierName){
            nameUpdate = true;
        }
        
        if(obj.supplierCode !== this.state.initCobj.supplierCode){
            codeUpdate = true;
        }
        
        if(obj.color !== this.state.initCobj.color){
            colorUpdate = true;
        }

        if(!codeUpdate && !nameUpdate && !colorUpdate){
            alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
            return false;
        }

        submitSets(submitCollection.updateSupplier, obj, null).then(resp => {
            
            if(resp && resp.status){

                alertService.success(this.props.t('SUCCESSFULLY_SUP_DETAILS_UPDATED'));
                this.handleTableSearch(null,"click");

                if(this.state.isFromLog === "true"){
                    this.props.history.push("/catelogueImport?isSavedLog=true");
                }
                else{
                    this.handleTableSearch(null,"click");
                    this.handleModalToggle();
                }
                
            } else{
                if(resp && resp.extra){
                    if(resp.extra === "SUPPLIER_CODE_DUPLICATE"){
                        alertService.error(this.props.t('SUPPLIER_CODE_DUPLICATE'));
                    }
                    else if(resp.extra === "SUPPLIER_NAME_DUPLICATE"){
                        alertService.error(this.props.t('SUPPLIER_NAME_DUPLICATE'));
                    }
                    else{
                        alertService.error(resp.extra);
                    }
                }
                else{
                    if(resp && resp.msg){
                        alertService.error(resp.msg);
                    }
                }
            }
        });

    }

    //delete suppliers
    handleSupDelete = (resp) => {
        if(resp && resp.status){
            alertService.success(this.props.t('SUCCESSFULLY_SUP_DETAILS_DELETED'));
            if(this.state.isFromLog === "true"){
                this.props.history.push("/catelogueImport?isSavedLog=true");
            }
            else{
                let serachobj = this.state.sobj;
            const stindx = serachobj.startIndex;
            const maxresult = serachobj.maxResult;
            
            if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                serachobj.startIndex = (stindx - maxresult);
                serachobj.isReqCount = true;
                this.setState({sobj:serachobj, startpage:(this.state.startpage - 1)},()=>{
                    this.handleTableSearch(null,"click");
                });
            }
            else{
                serachobj.isReqCount = true;
                this.setState({sobj:serachobj},()=>{
                    this.handleTableSearch(null,"click");
                });
            }

            this.handleModalToggle();
            }
        } else{
            // if(resp.extra){
            //     if(resp.extra==="CANT_DELETE_REFERENCE"){
            //         alertService.error(this.props.t('CANT_DELETE_REFERENCE'));
            //     }
            //     else{
            //         alertService.error(resp.extra);
            //     }
            // }
            // else{
            //     alertService.error(this.props.t('ERROR_OCCURRED'));
            // }

            if(resp.validation){
            
                let codeMessage = this.props.t(resp.validation.code);
    
                if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                    
                    let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
    
                    resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
    
                }else{
                    resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                }
    
            }else{
                alertService.error(this.props.t("ERROR_OCCURRED"));
            }

           // alertService.error((resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
        }
    }

    changeColor = (color) =>{
        let ssobj = this.state.cobj;
        ssobj.color = color;
        this.setState({cobj:ssobj});
    }

    handleShowingresults=(e, isonblur)=>{
        if(isonblur===true){
            this.setState({maxShowresultcount: (e.target.value!=="" && e.target.value>0)?e.target.value:this.state.orimaxShowresultcount})
        }
        else{
            this.setState({maxShowresultcount: e.target.value})
        }
    }

    render(){
        const ftableheaders = [ {text: "", width: "1%"},(this.props.t('supcode')),(this.props.t('supname'))];
        return (<>
            <Col xs={12} className={"main-content rg-mdview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <MDSidebarMenu/>
                  <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('suppliers')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('suppliers')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>  
                    <Col className="white-container" ref={this.whitecontainer}>
                        <Col xs={12} lg={8} className="col-centered">
                            <Col className="custom-filters form-inline">
                                {/* <label className="filter-label">{this.props.t('tagname')}</label> */}
                                <Form.Control placeholder={this.props.t('search_suppliers')} value={this.state.sobj.supplierName} onChange={e => this.handleFilterObject(e,"supplierName","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"supplierName","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.supplierName,(this.props.t('Character.search_text')))}/>
                                <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault():preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                            </Col>
                            <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success">{this.props.t('btnnames.addnew')}</Button>
                            {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length>0?
                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                            :this.state.isdataloaded?<>
                                <AcNoDataView />
                            </>:<></>}
                        </Col>
                    </Col>    
                  </Col>
                </Row>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </Col>

            <Modal show={this.state.showdetailmodal} className="tagmodal-view supmodal-view" dir={this.props.isRTL} onHide={this.handleModalToggle} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{this.props.t('supdetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="formcontrol-main">
                        <>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierCode" adefval={this.state.cobj.supplierCode} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supcode')} showlabel={true} arequired={true} msg={this.props.t('Character.supplierCode')} validateString={true} characterValidate={maxInputLength}/>
                            </Form.Group>
                            
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="supplierName" atype="text" aid="supplierName" adefval={this.state.cobj.supplierName} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('supname')} showlabel={true} arequired={true} msg={this.props.t('Character.supplierName')} validateString={true} characterValidate={maxInputLength}/>
                            </Form.Group>

                            {
                                this.state.cobj.importName && (this.state.cobj.importStatus==="None" || this.state.cobj.importStatus==="ReferenceUpdatePending")  ?
                                    <div style={{marginTop:"-30px", marginBottom:"30px"}}>
                                        <Badge bg="warning" pill>{this.props.t("CATELOG_IMP_NAME")} : {this.state.cobj.importName}</Badge>
                                    </div>
                                :<></>
                            }

                            <Form.Group style={{marginBottom:"20px"}}>
                                {/* <AcInput atype="color" aid="color" adefval={this.state.cobj.color} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.cobj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={false}
                                    changeColor = {this.changeColor}    
                                    type={"supplier"}
                                    departmentId={-1}
                                    categoryId={-1}
                                    isNew ={!this.state.isedit}
                                    t ={this.props.t}
                                />

                            </Form.Group>

                        </Col>
                        </>
                      <div>
                      <Button variant="secondary" onClick={this.state.isFromLog==="true" ? ()=> this.props.history.push("/catelogueImport?isSavedLog=true") : this.handleModalToggle} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                        {this.state.isedit?<>
                            {/* <AcButton eleid="updatesuplink" avariant="success" asubmit={submitCollection.updateSupplier} aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={e => this.handleSupSave(e,2)}>{this.props.t('btnnames.update')}</AcButton> */}
                            <Button variant="success" style={{margin:"0px 5px 0px 5px"}} className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={()=>this.handleSupUpdate(this.state.cobj)}>{this.props.t('btnnames.update')}</Button>
                            <AcButton eleid="deletesuplink" avariant="danger" aconfirm={true} adelete={true} asubmit={submitCollection.deleteSupplier}  aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={this.handleSupDelete}>{this.props.t('btnnames.delete')}</AcButton>
                        </>:
                        <>
                            {/* <AcButton eleid="savesuplink" avariant="success" asubmit={submitCollection.saveSupplier} aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={e => this.handleSupSave(e,1)}>{this.props.t('btnnames.save')}</AcButton> */}
                            <Button variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={()=>this.handleSupSave(this.state.cobj)}>{this.props.t('btnnames.save')}</Button>
                        </>
                        }
                      </div>
                    </Col>
                </Modal.Body>
            </Modal>
        </>);
    }
}

export default withTranslation()(withRouter(SuppliersComponent));
