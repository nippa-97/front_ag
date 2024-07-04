import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import {Breadcrumb, Button, Col, Form, Modal, Row, Tabs, Tab} from 'react-bootstrap';

import './tags.scss';

import { AcTable, AcButton, AcInput, ValT, AcViewModal, AcNoDataView } from '../../UiComponents/AcImports';
import { submitSets } from '../../UiComponents/SubmitSets';
import { alertService } from '../../../_services/alert.service';
import { submitCollection } from '../../../_services/submit.service';

import MDSidebarMenu from '../../common_layouts/mdsidebarmenu';

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
export class TagsComponent extends React.Component{
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

            tagsType:"store",//planogram

            oneresultheight: 55, maxShowresultcount: 0, orimaxShowresultcount: 0, //find max result varibles
            initialTagName: "",
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            var maxresutcount=FindMaxResult(this.whitecontainer.current?(this.whitecontainer.current.offsetHeight) : 0,this.state.oneresultheight,165)
            this.setState({
                maxShowresultcount:maxresutcount.maxresultCount,orimaxShowresultcount:maxresutcount.maxresultCount
            },()=>{
                this.handleTableSearch(null,"click");
            })
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultFilterObject = () => {
        return { type:"store", tagName: "", isReqPagination:true, startIndex:0, maxResult:8, isReqCount:false, };
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
                    cdata.push({0:citem.id, 1:citem.tagName});
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

        if(etype === "tagName"){
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
    //search tags onload or when filter
    handleTableSearch = (evt,etype) => {
        this.setState({
            isdataloaded: false,
            loading:true,
        });
        var maxresutcount = this.state.maxShowresultcount;
        let sobj = this.state.sobj;
        sobj.type = this.state.tagsType;
        sobj.maxResult = maxresutcount;

        submitSets(submitCollection.searchTags, sobj, true).then(res => {
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
                    totalresults: (this.state.startpage === 1 || this.state.sobj.isReqCount===true ?res.count:this.state.totalresults),
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
        return {name: ""};
    }
    //new tag link
    handleNewLink = () => {
        let cobj = this.defaultObjectLoad();
        cobj.type = this.state.tagsType;
        this.setState({cobj:cobj,isedit:false});
        this.handleModalToggle();
    }
    //table row click - edit tag
    handleRowClick = (cidx,citem) => {
        var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
        if(cfindList){
            if(citem && citem[0] && citem[0] !== ""){
                let finditem = cfindList.data.find(z => z.id === citem[0]);
                //console.log(finditem);
                if(finditem){
                    this.setState({cobj:JSON.parse(JSON.stringify(finditem)),isedit:true},() => {
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
    //toggle tag add/edit modal
    handleModalToggle = () => {
        this.setState({showdetailmodal: !this.state.showdetailmodal, initialTagName: this.state.cobj.tagName});
    }
    //save/edit tag
    handleTagSave = (resp,type) => {
        if(resp && resp.status){
            alertService.success(this.props.t('SUCCESSFULLY_TAG_DETAILS')+(type===1?"saved":"updated"));
            if(type===1){
                let serachobj = this.state.sobj;
                serachobj.isReqCount = true;
                serachobj.startIndex = 0;
                this.setState({sobj:serachobj, startpage:1},()=>{
                    this.handleTableSearch(null,"click");
                });
            }   
            else{
                this.handleTableSearch(null,"click");
            }
            this.handleModalToggle();
        } else{
            // alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
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
        }

        if(type === 2){
            let isUpdated = false;
    
            let initialTagName = this.state.initialTagName;
            let currentTagName = this.state.cobj.tagName;
    
            if(initialTagName !== currentTagName){
                isUpdated = true;
            }

            if(!isUpdated){
                alertService.warn(this.props.t('NO_CHANGES_AVAILABLE'));
                return;
            }
        }

        this.setState({loading:true},()=>{
            submitSets(type===1?submitCollection.saveTags:submitCollection.updateTags, obj, true).then(resp => {
    
                if(resp && resp.status){
                    this.setState({loading:false},()=>{
                        alertService.success(this.props.t('SUCCESSFULLY_TAG_DETAILS')+(type===1?this.props.t("saved"):this.props.t("updated")));
                        if(type===1){
                            let serachobj = this.state.sobj;
                            serachobj.isReqCount = true;
                            serachobj.startIndex = 0;
                            this.setState({sobj:serachobj, startpage:1},()=>{
                                this.handleTableSearch(null,"click");
                            });
                        }   
                        else{
                            this.handleTableSearch(null,"click");
                        }
                        this.handleModalToggle();
                    })
                } else{
                    this.setState({loading:false},()=>{
                        // alertService.error((resp&&resp.extra?resp.extra:resp.msg?resp.msg:this.props.t('ERROR_OCCURRED')));
                        if(resp.validation){
                        
                            let codeMessage = this.props.t(resp.validation.code);
                
                            if(resp.validation.msgParams && resp.validation.msgParams.length > 0){
                                
                                let filledMessage = codeMessage.replace(/\[\$\]/g, () => resp.validation.msgParams.shift());
                
                                resp.validation.type === "error" ? alertService.error(filledMessage) : alertService.warn(filledMessage);
                
                            }else{
                                resp.validation.type === "error" ? alertService.error(codeMessage) : alertService.warn(codeMessage);
                            }
                
                        } else{
                            alertService.error(this.props.t("ERROR_OCCURRED"));
                        }
                    });
                }
    
            });
        });
    }
    //delete tag
    handleTagDelete = (resp) => {
        if(resp && resp.status){
            alertService.success(this.props.t('SUCCESSFULLY_TAG_DETAILS_DELETED'));

            let serachobj = this.state.sobj;
            const stindx = serachobj.startIndex;
            const maxresult = serachobj.maxResult;
            
            if(this.state.ftablebody.length===1 && this.state.startpage>1 ){
                serachobj.startIndex = (stindx - maxresult);
                serachobj.isReqCount = true;
                this.setState({sobj:serachobj , startpage:(this.state.startpage - 1)},()=>{
                    this.handleTableSearch(null,"click");
                });
            }
            else{
                // serachobj.isReqCount = true;
                // this.setState({sobj:serachobj},()=>{
                // });
                this.handleTableSearch(null,"click");
            }
            
            this.handleModalToggle();
        } else{
            // alertService.error((resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
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
        }
    }

    //tab change event
    handleTabChange = (type) =>{
        //console.log(type);
        if(type!==this.state.tagsType){
            let serchobj = this.state.sobj;
            serchobj.startIndex = 0;
            this.setState({tagsType:type, sobj:this.defaultFilterObject(), startpage:1},()=>{
                this.handleTableSearch(null,"click");
            });
        }
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
        const ftableheaders = [{text: "", width: "1%"},(this.props.t('tagname'))];
        return (<>
            <Col xs={12} className={"main-content tags-md-page rg-mdview "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                <Row>
                  <MDSidebarMenu/>
                  <Col xs={12} lg={10}>
                    <Breadcrumb dir="ltr">
                        {this.props.isRTL==="rtl"?<>
                        <Breadcrumb.Item active>{this.props.t('tags')}</Breadcrumb.Item>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        </>:<>
                        <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                        <Breadcrumb.Item active>{this.props.t('tags')}</Breadcrumb.Item>
                        </>}
                    </Breadcrumb>  
                    <Col className="white-container" ref={this.whitecontainer}>
                        <Col xs={12} lg={7} className="col-centered ">
                            <Tabs defaultActiveKey="store" id="uncontrolled-tab-example" className="mb-3 tasktab" transition={false} onSelect={(k) => this.handleTabChange(k)}>
                                <Tab eventKey="store" title={this.props.t("store_tags")} className="store-tab">
                                    <Col className='store'>
                                        <Col className="custom-filters form-inline">
                                            <Form.Control placeholder={this.props.t('srchstoretag')} value={this.state.sobj.tagName} onChange={e => this.handleFilterObject(e,"tagName","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"tagName","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.tagName,(this.props.t('Character.search_text')))}/>
                                            <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                            <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e, false)} onBlur={e => this.handleShowingresults(e, true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                        </Col>
                                        <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success" style={{marginTop:"-40px"}}>{this.props.t('btnnames.addnew')}</Button>

                                        {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                        :this.state.isdataloaded?<>
                                            <AcNoDataView />
                                        </>:<></>}
                                    </Col>
                                </Tab>

                                <Tab eventKey="planogram" title={this.props.t("planogram_tags")} className="pl-tab">
                                    <Col className='planogram'>
                                        <Col className="custom-filters form-inline">
                                            <Form.Control  placeholder={this.props.t('srchpltag')} value={this.state.sobj.tagName} onChange={e => this.handleFilterObject(e,"tagName","change",this.props.t('Character.search_text'))} onKeyUp={e => this.handleFilterObject(e,"tagName","enter")} onKeyDown={(e)=>preventinputToString(e,this.state.sobj.tagName,(this.props.t('Character.search_text')))}/>
                                            <span> <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                            <Form.Control style={{width:"60px"}} type="number"  value={this.state.maxShowresultcount} onChange={e => this.handleShowingresults(e,false)} onBlur={e => this.handleShowingresults(e,true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.state.maxShowresultcount,(this.props.t('Character.results'))) } /></span>
                                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                        </Col>
                                        <Button type="submit" className="highlight-btn" onClick={this.handleNewLink} variant="success" style={{marginTop:"-40px"}}>{this.props.t('btnnames.addnew')}</Button>

                                        {this.state.isdataloaded && this.state.ftablebody && this.state.ftablebody.length > 0?
                                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                        :this.state.isdataloaded?<>
                                            <AcNoDataView />
                                        </>:<></>}
                                    </Col>
                                </Tab>

                            </Tabs>

                        </Col>
                    </Col>    
                  </Col>
                </Row>
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </Col>

            <Modal show={this.state.showdetailmodal} className="tagmodal-view tagmd-modal" dir={this.props.isRTL} onHide={this.handleModalToggle} backdrop="static">
                <Modal.Header>
                    <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{this.props.t('tagdetails')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Col className="formcontrol-main">
                        <>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="tagnametxt" atype="text" aid="tagName" adefval={this.state.cobj.tagName} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('tagname')} showlabel={true} arequired={true} msg={this.props.t('Character.tagName')} characterValidate={maxInputLength}  validateString={true}/>
                            </Form.Group>
                        </Col>
                        </>
                      <div>
                      <Button variant="secondary" onClick={this.handleModalToggle} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                        {this.state.isedit?<>
                            {/* <AcButton eleid="updatetaglink" avariant="success" asubmit={submitCollection.updateTags} aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={e => this.handleTagSave(e,2)}>{this.props.t('btnnames.update')}</AcButton> */}
                            <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} variant="success" style={{marginLeft:"5px"}} onClick={()=>this.handleTagSave(this.state.cobj, 2)}>{this.props.t('btnnames.update')}</Button>
                            <AcButton eleid="dangertaglink" avariant="danger" confirmtitle={this.props.t("CONFIRM_TO_DELETE")} confirmmsg={this.props.t("CONFIRM_TO_DELETE_MSG")} aconfirm={true} adelete={true} asubmit={submitCollection.deleteTags}  aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={this.handleTagDelete}>{this.props.t('btnnames.delete')}</AcButton>
                        </>:
                        <>
                            {/* <AcButton eleid="savetaglink" avariant="success" asubmit={submitCollection.saveTags} aobj={this.state.cobj} avalidate={this.state.vobj} aclass={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} atype="button" aresp={e => this.handleTagSave(e,1)}>{this.props.t('btnnames.save')}</AcButton> */}
                            <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} variant="success" onClick={()=>this.handleTagSave(this.state.cobj, 1)}>{this.props.t('btnnames.save')}</Button>
                        </>}
                      </div>
                    </Col>
                </Modal.Body>
            </Modal>
        </>);
    }
}

export default withTranslation()(withRouter(TagsComponent));
