import React from 'react';
import { withRouter } from 'react-router-dom';
import {Col, Modal, Form, Button, Row } from 'react-bootstrap';
import Select from 'react-select';

import { confirmAlert } from 'react-confirm-alert';

import './styles.scss';
import { AcTable, AcInput, ValT, AcViewModal} from '../../../UiComponents/AcImports';
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

export class Category extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);
        this.state = {
            isButtonDisable:false,
            isedit: true,
            
            vobj: {},
            sobj: this.defaultFilterObjectLoad(), //filter
            cobj: this.defaultCategoryObjectLoad(),// category
            subcatobj: this.defaultSubCatObjectLoad(),// sub category
            brandobj: this.defaultBrandObjectLoad(),//brand

            isdataloaded: false, //is table data loaded
            isnottesting: true,
            ftablebody: [], //showing page table data
            toridata:[],startpage: 1, totalresults: 0, //startpage and total results 

            showBRandModal:false,
            brandList:[{value :0, label:"-"}],
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            //console.log(this.props.subcatobj);
            if(this.props.catobj && this.props.subcatobj){  
                let catobj = this.props.catobj;
                catobj.departmentId = this.props.depobj.departmentId;

                let srchobj = this.defaultFilterObjectLoad();
                srchobj.depCategoryId = this.props.catobj.id;
                srchobj.depSubCategoryId = this.props.subcatobj.subCategoryId

                this.setState({
                    sobj:srchobj,
                    subcatobj:this.props.subcatobj
                },()=>{
                    this.handleTableSearch(null, "click");
                });
            }

            if(this.props.brandlist){
                this.setState({brandList:this.props.brandlist});
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //default filter object
    defaultFilterObjectLoad = () => {
        return {searchValue:"", depCategoryId:0, isReqPagination:true, maxResult:8,startIndex:0};
    }

    //default category object
    defaultCategoryObjectLoad = () => {
        return {
            id:0,
            chainDepartmentId:0,
            categoryName:"",
            subCategory:[],
            isDelete:false,
            isNew:true,
        };
    }

    //default subcategory object
    defaultSubCatObjectLoad = () => {
        return {
            isDelete: false,
            isNew: true,
            brands: [],
            categoryId: 0,
            subCategoryId: 0,
            subCategoryName: "",
            color:"#999999",
        };
    }

    //default brand object
    defaultBrandObjectLoad = () => {
        return {
            brandId:0,
            brandName: "",
            supplierId: 0,
            supplierName:"",
            supplierCode:"",
            isDelete: false,
            isNew: true,
        };
    }

    //set filter object
    handleFilterObject = (evt,etype,ctype) => {
        var cobj = this.state.sobj;
        if(etype !== null){
            cobj[etype] = evt.target.value;
        }
        cobj.startIndex = 0;

        this.setState({sobj:cobj,startpage: 1,toridata:[],totalresults:0}, () => {
            if(ctype === "click" || (ctype === "enter" && evt.which === 13)){
                this.handleTableSearch(null,"click");
            }
        });
    }
    
    //filter search
    handleTableSearch = (evt,etype) => {
        if(etype === "click" || (etype === "enter" && evt.which === 13)){
            this.setState({
                isdataloaded: false,
                loading:true
            });


            submitSets(submitCollection.getSubCategoryBrands, this.state.sobj, true).then(res => {
                var cdata = this.state.toridata;
                if(res && res.status){
                    var cpageidx = cdata.findIndex(x => x.page === this.state.startpage);
                    if(cpageidx > -1){
                        cdata[cpageidx].data = res.extra;
                    } else{
                        cdata.push({page:(this.state.startpage),data:res.extra});
                    }
                    
                    this.setState({
                        toridata: cdata,
                        totalresults: (this.state.startpage === 1?res.count:this.state.totalresults),
                        loading:false
                    }, () => {
                        this.loadTableData();
                    });
                } else{
                    this.setState({
                        toridata: cdata,loading:false
                    }, () => {
                        this.loadTableData();
                    });
                }
            });
        }
    }

    //on pagination page change or after tabledata loaded, 
    //this function use to select current selected page table data from toridata
    loadTableData = () => {
        var cdata = [];
        if(this.state.toridata && this.state.toridata.length > 0){

            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                for (var i = 0; i < cfindList.data.length; i++) {
                    const citem = cfindList.data[i];
                    cdata.push({0:citem.id,1:citem.brandName,
                        2:{type:"button", variant:"danger", size: "sm", text:"", icon: "x-circle", iconsize: 16, action: "delete"}
                    });
                }
            }

        }
        this.setState({ ftablebody: cdata }, () => {
            this.setState({isdataloaded: true});
        });
    }

    //pagination page change handle
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

    //reset table filters 
    resetTableFilters = () => {
        let srchobj = this.defaultFilterObjectLoad();
        srchobj.depCategoryId = this.props.catobj.id;
        srchobj.depSubCategoryId = this.props.subcatobj.subCategoryId;
        this.setState({ sobj: srchobj, startpage: 1}, () => {
            this.handleTableSearch(null,"click");
        });
    }

    //on tablerow click handle set object to redux and redirect to edit view
    handleRowClick = (cidx,citem,caction) => {
        if(caction){
            var cfindList = this.state.toridata.find(x => x.page === this.state.startpage);
            if(cfindList){
                if(citem && citem[0] && citem[0] !== ""){
                    let finditem = cfindList.data.find(z => z.subCategoryId === citem[0]);
                    if(finditem){
                        this.removeBrand(finditem);
                    }
                } else{
                    this.removeBrand(cfindList.data[cidx]);
                }
            }
        }
    }

    removeBrand = (robj) => {
        confirmAlert({
            title: this.props.t('CONFIRM_TO_SUBMIT'),
            message: this.props.t('ARE_YOU_SURE_TO_CONTINUE_THIS_TASK'),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    robj.isDelete = true;
                    let subcatobj = JSON.parse(JSON.stringify(this.props.subcatobj)) ;
                    subcatobj.brands = [robj];
                    submitSets(submitCollection.saveSubCategoryBrands, subcatobj, true, null, true).then(res => {
                        if(res && res.status){
                            alertService.success(this.props.t('SUCCESSFULLY_DELETED'));
                            this.handleTableSearch(null,"click");
                        } else{
                            // alertService.error((res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    //
                }
            }
            ]
        });
    }

    initNewSubCatModal = () =>{
        this.setState({brandobj:this.defaultBrandObjectLoad(), isButtonDisable:false});
        this.handleModalToggle();
    }

    //toggle tag add/edit modal
    handleModalToggle = () => {
        this.setState({showBRandModal: !this.state.showBRandModal})
    }

    //brand change
    handleBrandChange = (e) =>{
        let tempObj = this.state.brandobj;
        tempObj.brandId = e.value;
        tempObj.brandName = e.label;
        this.setState({brandobj:tempObj});
    }

    //add brand
    AddBrand = () =>{
        if(this.state.brandobj.brandId && this.state.brandobj.brandId>0){
            let subcatobj = this.props.subcatobj;
            subcatobj.brands = [this.state.brandobj];
            this.setState({isButtonDisable:true});
            submitSets(submitCollection.saveSubCategoryBrands, subcatobj, true, null, true).then(res => {
                this.setState({isButtonDisable:false});
                if(res && res.status){
                    alertService.success(this.props.t('SUCCESSFULLY_ADDED'));
                    this.handleModalToggle();
                    this.handleTableSearch(null,"click");
                } else{
                    // alertService.error((res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }
            });
        }
        else{
            alertService.warn(this.props.t('SELECT_BRAND'));
        }
    }

    handleSubCategoryUpdate = () =>{
        let subcatobj = this.state.subcatobj;
        subcatobj.isDelete = false;
        subcatobj.brands = [];
        this.setState({cobj:subcatobj, isButtonDisable:true});
        if(subcatobj.categoryName !== ""){
            submitSets(submitCollection.saveSubCategoryBrands, subcatobj, true, null, true).then(res => {
                this.setState({isButtonDisable:false});
                if(res && res.status){
                    alertService.success(this.props.t('SUCCESSFULLY_UPDATED'));
                    this.props.changeViewType("cat",true);
                } else{
                    // alertService.error((res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                }
            });
        }
        else{
            alertService.warn(this.props.t('SELECT_'));
        }
    }

    handleSubCategoryDelete = () => {
        confirmAlert({
            title: this.props.t('CONFIRM_TO_SUBMIT'),
            message: this.props.t('ARE_YOU_SURE_TO_CONTINUE_THIS_TASK'),
            buttons: [{
                label: this.props.t('btnnames.yes'),
                onClick: () => {
                    let subcatobj = this.state.subcatobj;
                    subcatobj.isDelete = true;
                    submitSets(submitCollection.saveSubCategoryBrands, subcatobj, true, null, true).then(res => {
                        if(res && res.status){
                            alertService.success(this.props.t('SUCCESSFULLY_DELETED'));
                            this.props.changeViewType("cat",true)
                        } else{
                            // if(res&&res.extra==="CANT_DELETE_REFERENCE"){
                            //     alertService.error(this.props.t("CANT_DELETE_REFERENCE"));
                            // }
                            // else{
                            //     alertService.error((res&&res.extra?res.extra:this.props.t('ERROR_OCCURRED')));
                            // }
                        }
                    });
                }
            }, {
                label: this.props.t('btnnames.no'),
                onClick: () => {
                    //
                }
            }
            ]
        });
    }

    render(){
        const ftableheaders = ["", this.props.t('brandname'),""];

        return(
            <>
                <Col xs={12}>
                    <h5>{this.props.subcatobj.SubCategoryName}</h5>
                    <Col className="formcontrol-main">
                        <Col xs={12}>
                            <Row>
                                <Col xs={12}>
                                    <Row>
                                        <Form.Group as={Col} xs={4}>
                                            <AcInput eleid="catnametxt" atype="text" aid="subCategoryName" adefval={this.state.subcatobj.subCategoryName} aobj={this.state.subcatobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('subCategory')} showlabel={true} arequired={true}/>
                                        </Form.Group>
                                        <Col xs={1}></Col>
                                        <Form.Group as={Col} xs={4} className="subcatedit-colorpicker">
                                            <AcInput atype="color" aid="color" adefval={this.state.subcatobj.color} aobj={this.state.subcatobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/>
                                        </Form.Group>

                                    </Row>
                                </Col>
                                <Col xs={12} className={"brand-table-depcat "+(this.props.isRTL)}>
                                    <Button type="submit" className="highlight-btn" onClick={this.initNewSubCatModal} variant="success">{this.props.t('btnnames.addnewbrand')}</Button>
                                    <Col className="custom-filters form-inline">
                                        {/* <label className="filter-label">{this.props.t('departmentname')}</label> */}
                                        <Form.Control placeholder={this.props.t('searchbrand')} value={this.state.sobj.searchValue} onChange={e => this.handleFilterObject(e,"searchValue","change")} onKeyUp={e => this.handleFilterObject(e,"searchValue","enter")} />
                                        <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilterObject(e,null,"click")}>{this.props.t('btnnames.search')}</Button>
                                        <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetTableFilters}>{this.props.t('btnnames.reset')}</Button>
                                    </Col>
                                    
                                    {this.state.isdataloaded?
                                        <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                    :<></>}
                                
                                </Col>

                            </Row>
                        </Col>
                        
                        <Col className="savebtns-section">
                            <Button variant="secondary" type="button" style={{float:(this.props.isRTL==="rtl"?"right":"left")}} onClick={() => this.props.changeViewType("cat")}>{this.props.t('btnnames.back')}</Button>
                            {this.state.isedit?<>
                                <Button style={{float:(this.props.isRTL==="rtl"?"left":"right"), marginLeft:"10px"}} onClick={()=>this.handleSubCategoryUpdate()} disabled={this.state.isButtonDisable} size='lg' id="updatebtnlink" variant="success" className="float-right formview-btn">{this.props.t('btnnames.updatesubcategory')}</Button> 
                                <Button style={{float:(this.props.isRTL==="rtl"?"left":"right"), marginLeft:"10px"}} onClick={()=>this.handleSubCategoryDelete()} size='lg' id="deletebtnlink" variant="danger" className="float-right formview-btn">{this.props.t('btnnames.deletesubcategory')}</Button> 
                            </>:
                                <Button style={{float:(this.props.isRTL==="rtl"?"left":"right")}} onClick={()=>this.handleDepartmentSave()} size='lg' id="savebtnlink" variant="success" className="float-right formview-btn">{this.props.t('btnnames.update')}</Button>
                            }

                        </Col>

                    </Col>

                    <Modal show={this.state.showBRandModal} className="tagmodal-view depatartment-category-modal" dir={this.props.isRTL} onHide={this.handleModalToggle} backdrop="static">
                        <Modal.Header closeButton>
                            <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{this.props.t('addnewbrand')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Col className="formcontrol-main">
                                <>
                                <Col xs={12} className="form-subcontent">
                                    <Form.Group style={{marginBottom:"25px"}}>
                                        <Form.Label>{this.props.t("brand")}<span style={{color:"red"}}>*</span></Form.Label>
                                        <Select id="brandId" name="brandId" placeholder={""} options={this.state.brandList} onChange={(e) => this.handleBrandChange(e)} value={this.state.brandList.filter(option => option.value === this.state.brandobj.brandId)} className="filter-brandlist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="brand" />
                                    </Form.Group>
                                </Col>
                                </>

                            <div>
                                <Button variant="secondary" onClick={this.handleModalToggle} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                                <Button className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} disabled={this.state.isButtonDisable} variant="success" onClick={()=>this.AddBrand()} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.add')}</Button>
                            </div>
                            </Col>
                        </Modal.Body>
                    </Modal>
                    <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
                </Col>
            </>
        )

    }
}

export default  withTranslation()(withRouter(Category));