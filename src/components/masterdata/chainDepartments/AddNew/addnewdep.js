import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import { connect } from "react-redux";
import {Col, Modal, Form, Button, Row, Breadcrumb, Table, Pagination, Tab } from 'react-bootstrap'; //, Badge
import Select from 'react-select';
import { ChevronLeftIcon, ChevronRightIcon, XIcon } from '@primer/octicons-react';

import './styles.scss';
import { AcInput, ValT} from '../../../UiComponents/AcImports'; //AcTable, 
import { alertService } from '../../../../_services/alert.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';

import { viewSetChainDepAction, viewSetChainDepPrevAction } from '../../../../actions/dept/dept_action';

import { getPager, measureConverter, roundOffDecimal, convertUomtoSym } from "../../../../_services/common.service";

import {  withTranslation } from "react-i18next";
import "../../../../_translations/i18n";

import MDSidebarMenu from '../../../common_layouts/mdsidebarmenu';

const pageLength = 8;

export class AddNewDepartment extends React.Component{
    _isMounted = false;

    constructor(props){
        super(props);

        this._mainFieldDiv = React.createRef();

        this.state = {
            isedit: false,
            isButtonDisable:false,
            departmentslist:[{value :0, label:"-"}],
            
            sobj: this.defaultFilterObjectLoad(), vobj: {},
            dobj: this.defaultDepartmentObjectLoad(),
            cobj : this.defaultCategoryObjectLoad(),

            catIndx:-1,

            isdataloaded: false, //is table data loaded
            isnottesting: true,
            ftablebody: [], //showing page table data
            toridata:[],startpage: 1, totalresults: 0, //startpage and total results 

            showaddnewmodal:false,

            paginatedItems:[],
            currentPage:1,
            totalPages: 0,
            filtertxt:"",

            //new category add
            loadDunitList:[], 
            fieldStartIdx: 0, fieldMaxResults: 12, fieldTotalCount: 0,
            singleFieldWidth: 300, singleFieldHeight: 310, minWidthCheckValue: 160, oldCatLength: 0,
            activeTabKey: "fieldselect", 

            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%",
            fieldLevelObj: null, fieldEyeLevels: [],
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setState({
                divWidth: 380,
                divHeight: 350,
            });

            //md load
            this.getDunits();
            this.loadDepartments();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

   //load departments
   loadDepartments = () => {
        let sobj = { isReqPagination: false, isIgnoreHide: false }
        submitSets(submitCollection.searchDepatments, sobj, true).then(res => {
            if(res && res.status){
                let deps = res.extra;
                let tempdeps = [{value :0, label:"-"}];
                for (let i = 0; i < deps.length; i++) {
                    tempdeps.push({value :deps[i].departmentId, label:deps[i].name});
                }
                this.setState({departmentslist:tempdeps});
            } 
        });
    }
    //get all Dunits
    getDunits = () => {
        var csobj = { isReqPagination: true, startIndex: this.state.fieldStartIdx, maxResult: this.state.fieldMaxResults };
        submitSets(submitCollection.mpFieldList, csobj).then(res => {
            //console.log(res.extra);

            if (res && res.status) {
                var list = this.state.loadDunitList.concat(res.extra);
                list.forEach(ele => { ele["isSelected"] = false });

                this.setState({ 
                    loadDunitList: list, 
                    fieldTotalCount: (this.state.fieldStartIdx === 0?res.count:this.state.fieldTotalCount),
                });
            }
        });
    }
    //display unit load more items
    loadMoreDunits = () => {
        this.setState({ fieldStartIdx: (this.state.fieldStartIdx + this.state.fieldMaxResults) }, () => {
            this.getDunits();
        });
    }

    //default filter object
    defaultFilterObjectLoad = () => {
        return {categoryName:"", isDelete: false, isNew: true, brands:[], maxResult:8,startIndex:0};
    }

    //default department object
    defaultDepartmentObjectLoad = () => {
        return {
            isDelete: false,
            isNew: false,
            categories: [],
            departmentId: 0,
            departmentName: ""
        };
    }

    defaultCategoryObjectLoad = () => {
        return {
            categoryName:"",color:"#FFF", isDelete:false,id:-1,isNew:true,subCategory:[]
        };
    }

     //dep change
     handleDepartmentChange = (e) =>{
        let tempObj = this.state.dobj;
        tempObj.departmentId = e.value;
        tempObj.displayName = e.label;
        this.setState({dobj:tempObj});
    }

    //add new category btn
    initNewCatModal = () =>{
        this.setState({cobj:this.defaultCategoryObjectLoad(), isedit:false, catIndx:-1, fieldEyeLevels: []});
        this.handleModalToggle();
    }

    //toggle tag add/edit modal
    handleModalToggle = () => {
        this.setState({showaddnewmodal: !this.state.showaddnewmodal})
    }

    AddCategory = () =>{
        let catobj = this.state.cobj;
        if(catobj.categoryName !== ""){
            if(this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0){
                let fieldeyelevel = this.state.fieldEyeLevels[0];
                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

                let dobj = this.state.dobj;
                for (let i = 0; i < dobj.categories.length; i++) {
                    if(dobj.categories[i].categoryName === catobj.categoryName){
                        alertService.warn(this.props.t('already_added'));
                        return false;
                    }
                }
    
                catobj["isEyeLevelRank"] = fieldeyelevel.rank;
                catobj["fieldId"] = selectedfield.fieldId;
                catobj["field"] = selectedfield;

                dobj.categories.push(catobj);

                this.setState({dobj:dobj},()=>{
                    this.handleModalToggle();
                    this.setPage(1);
                });
            } else{
                alertService.error(this.props.t("select_eye_level_to_continue"));
            }
        } else{
            alertService.warn(this.props.t('category_name_empty_warn'));
        }
    }

    handleDepartmentSave = () =>{
        let sobj = this.state.dobj;
        
        if(sobj.departmentId===undefined || sobj.departmentId<1){
            alertService.warn(this.props.t('select_departement_warn'));
            return false;
        } 

        let validated  = true;
        let categories = sobj.categories;

        if(categories===undefined || categories.length<1){
            alertService.warn(this.props.t('add_categories_warn'));
            return false;
        }

        for (let c = 0; c < categories.length; c++) {
            if(categories[c].categoryName==="" && categories[c].isDelete===false){
                alertService.warn(this.props.t('category_name_empty_warn'));
                validated = false;
                return false;

            } else{
                for (let s = 0; s < categories[c].subCategory.length; s++) {
                    if(categories[c].subCategory[s].subCategoryName==="" && categories[c].subCategory[s].isDelete===false){
                        alertService.warn(this.props.t('subcategory_name_empty_warn'));
                        this.handleMainCatCollapse(c,false);
                        validated = false;
                        return false;
                    }
                    else{
                        for (let b = 0; b < categories[c].subCategory[s].brands.length; b++) {
                           if((categories[c].subCategory[s].brands[b].brandId<1 || categories[c].subCategory[s].brands[b].brandId===undefined) && categories[c].subCategory[s].brands[b].isDelete === false){
                            alertService.warn(this.props.t('brand_empty_warn'));
                            this.handleSubCatCollapse(c,s,false);
                            validated = false;
                            return false;
                           }
                        }
                    }
                }
            }
        }

        if(validated===false){
            return false;
        }

        this.setState({isButtonDisable:true});

        submitSets(submitCollection.saveChainDepatments, sobj, true, null, true).then(resp => {
            this.setState({isButtonDisable:false});
            if(resp && resp.status){
                alertService.success(this.props.t('SUCCESSFULLY_DEPARTMENT')+("saved"));
                this.props.setDunitView(resp.extra);
                this.props.history.push("/chaindepartments/details");
            } 
            else{
                // if(resp.extra){
                //     if(resp.extra==="DEP_WITH_CAT_EXISTS"){
                //         alertService.error(this.props.t('DEP_WITH_CAT_EXISTS'));
                //     }
                //     else{
                //         alertService.error(resp.extra);
                //     }
                // }
                // else{
                //     alertService.error(this.props.t('ERROR_OCCURRED'));
                // }
                //alertService.error((resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    handleClickCategoryItem = (item, i) => {
        let editobj = JSON.parse(JSON.stringify(item));
        this.setState({
            cobj: editobj, 
            fieldEyeLevels: [{ rank: editobj.isEyeLevelRank }],
            isedit: true, 
            catIndx: i
        });

        this.handleModalToggle();
        
    }

    UpdateCategory = () =>{
        if(this.state.cobj.categoryName !== ""){
            if(this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0){
                let dobj = this.state.dobj;
            
                for (let i = 0; i < dobj.categories.length; i++) {
                    if(dobj.categories[i].categoryName === this.state.cobj.categoryName && this.state.catIndx!==i){
                        alertService.warn(this.props.t('already_added'));
                        return false;
                    }
                }

                let ccatobj = this.state.cobj;
                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);

                ccatobj["field"] = selectedfield;
                
                dobj.categories[this.state.catIndx] = ccatobj;
                this.setState({dobj:dobj},()=>{
                    this.handleModalToggle();
                    this.setPage(1);
                });   
            } else{
                alertService.error(this.props.t("select_eye_level_to_continue"));
            }
        }
        else{
            alertService.warn(this.props.t('enter_catgory_name_placeholder'));
        }
    }

    DeleteCategory = (isrowdelete, rowidx) =>{
        let dobj = this.state.dobj;
        dobj.categories.splice((isrowdelete?rowidx:this.state.catIndx), 1);
        
        this.setState({dobj:dobj},()=>{
            if(!isrowdelete){
                this.handleModalToggle();
            }
            this.setPage(1);
        });

        if(dobj.categories.length===0){
            this.setState({paginatedItems:[]});
        }
    }


    setPage = (cpage) => {
        var citems = JSON.parse(JSON.stringify(this.state.dobj.categories));
        var pager = getPager(citems.length, cpage, pageLength);
        
        // check page isn't out of range
        if (cpage < 1 || cpage > pager.totalPages) {
            return;
        }
        var sspage = (pager.currentPage === 1 ? 0 : ((pager.currentPage - 1) * pageLength));
        var sepage = (pager.currentPage * pageLength);
        this.setState({
            paginatedItems: citems.slice(sspage, sepage),
            currentPage: pager.currentPage,
            totalPages: pager.totalPages,
        });
    }


    //
    changeFilterTxt = (e) => {
        this.setState({filtertxt:e.target.value});
    }

    handleFilter = () =>{
        if(this.state.filtertxt!==""){
            var temarr = [];
            for (let i = 0; i < this.state.dobj.categories.length; i++) {
                const cobj = this.state.dobj.categories[i];
                if(cobj.categoryName.toLowerCase().includes(this.state.filtertxt.toLowerCase())){
                    temarr.push(cobj);
                }
            }
            this.setState({paginatedItems:temarr});
        }
        else{
            this.setPage(1);
        }
    }

    resetFilter = () => {
        this.setState({filtertxt:""}, () =>{
            this.setPage(1);
        });
    }
    handleModalReset = () => {
        if(!this.state.isedit){
            this.handleSelectfield(null);
        } else{
            this.handleSelectfield({ fieldId: (this.state.cobj.fieldId?this.state.cobj.fieldId:-1) });
        }

        this.setState({ activeTabKey: "fieldselect" });
    }

    toggleActiveTab = (ctab) => {
        //validate category and field
        if(ctab === "fielddraw"){
            if(this.state.cobj.categoryName && this.state.cobj.categoryName !== ""){
                let selectedfield = this.state.loadDunitList.find(x => x.isSelected);
                console.log(selectedfield);
                if(selectedfield){
                    this.calcFieldObject(selectedfield);
                } else{
                    alertService.error(this.props.t("selectfield"));
                    return false;
                }
            } else{
                alertService.error(this.props.t("category_name_empty_warn"));
                return false;
            }
        }

        this.setState({ activeTabKey: ctab });
    }
    // creating field
    calcFieldObject = (fieldObj) => {
        let exportfield = JSON.parse(JSON.stringify(fieldObj));
        //calculate dimention
        var dimention = (this.state.divHeight / measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height));
        
        //current field width/height
        exportfield["drawHeight"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.height) * dimention;
        exportfield["drawWidth"] = measureConverter(exportfield.uom,this.state.displayUOM,exportfield.width) * dimention;
        
        if (exportfield.fieldShelves) {
            let cshelfs = (exportfield.fieldShelves?exportfield.fieldShelves:[]);
            
            let prevGap = 0;
            for (let i = 0; i < cshelfs.length; i++) {
                const shelf = cshelfs[i];
                let drawHeight = measureConverter(exportfield.uom,this.state.displayUOM,shelf.height) * dimention;
                let drawGap = measureConverter(exportfield.uom,this.state.displayUOM,shelf.gap) * dimention;

                //pick x, y
                shelf.x = 0;
                shelf.y = roundOffDecimal(prevGap,2);
                
                shelf.drawWidth = exportfield.drawWidth;
                shelf.drawHeight = roundOffDecimal(drawHeight,2);
                shelf.drawGap = roundOffDecimal(drawGap,2);

                prevGap = prevGap + (drawHeight + drawGap);
            }
        }
        //console.log(exportfield);
        this.setState({ fieldLevelObj: exportfield });
    }
    //
    handleSelectRow = (sidx, sitem) => {
        let ceyelevels = [];

        //check already added
        let fieldshelveidx = this.state.fieldEyeLevels.findIndex(x => x.rank === sitem.rank);
        if(fieldshelveidx > -1){
            ceyelevels.splice(fieldshelveidx,1);
        } else{
            ceyelevels.push(sitem);
        }

        this.setState({ fieldEyeLevels: ceyelevels }, () => {
            if(this.state.isedit === false){
                this.AddCategory();
            } else{
                this.UpdateCategory();
            }
        });
    }
    //selecting field
    handleSelectfield=(field, isreseteyelevels, ismanual)=>{
        var list=this.state.loadDunitList
        for (let i = 0; i < list.length; i++) {
            const ele = list[i];
         if(field && ele.fieldId === field.fieldId){
            ele.isSelected=true
         } else{
            ele.isSelected=false
         }  
        }
        
        this.setState({loadDunitList:list, fieldEyeLevels: (isreseteyelevels?[]:this.state.fieldEyeLevels)}, () => {
            if(ismanual){
                this.toggleActiveTab("fielddraw");
            }
        });
    }
    //show dot label
    dotTxtShow = (ctype, cposition) => {
        var cobj = (this.state.fieldLevelObj?this.state.fieldLevelObj:null);
        var rtxt = '0';
        if(cobj && Object.keys(cobj).length > 0){
            var cmtxt = convertUomtoSym((cobj.uom));
            var cptxt = (cposition===1?"0":cposition===2?(parseFloat(cobj[ctype]) / 2).toFixed(1):(parseFloat(cobj[ctype]).toFixed(1)));
            rtxt = cptxt + cmtxt;
        }
        return rtxt;
    }

    initBack = (path,viewType) =>{
        if(this.props.deptState.chainDepPrevData){
            let prevdata = this.props.deptState.chainDepPrevData;
            prevdata.viewType = viewType;
            this.props.setChainPrevFilters(prevdata);
            this.props.history.push(path);
        }
        else{
            this.props.history.push(path);
        }
    }

    render(){
        //const ftableheaders = ["", this.props.t('categoryName')];
        
        return(
            <>
                <Col xs={12} className={"main-content "+(this.props.isRTL==="rtl"?"RTL":"")} dir={this.props.isRTL}>
                    <Row>
                        <MDSidebarMenu />
                        <Col xs={12} lg={10}>
                            <Breadcrumb dir="ltr">
                                {this.props.isRTL==="rtl"?<>
                                <Breadcrumb.Item active>{this.props.t('addNewDepartment')}</Breadcrumb.Item>
                                <li className="breadcrumb-item"><Link to="/chaindepartments" role="button">{this.props.t('chaindepartments')}</Link></li>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                </>:<>
                                <li className="breadcrumb-item"><Link to={"/"+this.props.HomePageVal} role="button">{this.props.t('home')}</Link></li>
                                <li className="breadcrumb-item"><Link to="/chaindepartments" role="button">{this.props.t('chaindepartments')}</Link></li>
                                <Breadcrumb.Item active>{this.props.t('addNewDepartment')}</Breadcrumb.Item>
                                </>}
                            </Breadcrumb>      
                            <Col className="white-container formcontrol-main">
                                <Col xs={8} className="col-centered">
                                <Col xs={12} className="form-subcontent">
                                    <Col xs={6} className="">
                                        <Form.Group>
                                            <Form.Label>{this.props.t("department")}<span style={{color:"red"}}>*</span></Form.Label>
                                            <Select id="departmentId" name="departmentId" placeholder={""} options={this.state.departmentslist} onChange={(e) => this.handleDepartmentChange(e)} value={this.state.departmentslist.filter(option => option.value === this.state.dobj.departmentId)} className="filter-deplist" size="sm" classNamePrefix="searchselect-inner" maxMenuHeight={200} data-validation-type="dep" />
                                        </Form.Group>
                                    
                                    </Col>

                                    <Col xs={12} style={{marginTop:"-10px"}}>
                                        <Button type="submit" style={{marginBottom:"10px"}} className="highlight-btn" onClick={this.initNewCatModal} variant="success">{this.props.t('btnnames.addnew')}</Button>
                                        
                                        <Col className="custom-filters form-inline">
                                            <Form.Control className="addnewcdepcatfiltertxt" placeholder={this.props.t('searchcategory')} value={this.state.filtertxt} onChange={e => this.changeFilterTxt(e)} />
                                            <Button type="button" variant="warning" className="search-link filter-btn" onClick={e => this.handleFilter()}>{this.props.t('btnnames.search')}</Button>
                                            <Button type="button" variant="outline-secondary" className="filter-btn" onClick={this.resetFilter}>{this.props.t('btnnames.reset')}</Button>
                                        </Col>
                                        
                                        {/* {this.state.isdataloaded?
                                            <AcTable isRTL={this.props.isRTL} t={this.props.t} aheaders={ftableheaders} totalresults={this.state.totalresults} startpage={this.state.startpage} alldata={this.state.toridata} asearchobj={this.state.sobj} abody={this.state.ftablebody} showpaginate={true} pagetype="ajax" pagecount={this.state.sobj.maxResult} handleRowClick={this.handleRowClick} handlePageChange={this.handlePageChange}/>
                                        :<></>} */}

                                        <Table size='sm' className='filter-table table table-hover table-sm table-striped addnew-dep-cat-tbl'>
                                            <thead>
                                                <tr>
                                                    <th>{this.props.t("categoryName")}</th>
                                                    <th>{this.props.t("dunitname")}</th>
                                                    <th>{this.props.t("EYE_LEVEL")}</th>
                                                    <th width="25px"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.paginatedItems.map((citem, i)=>{
                                                        return(
                                                            <tr key={i}>
                                                                <td onClick={()=>this.handleClickCategoryItem(citem, i)}>{citem.categoryName}</td>
                                                                <td onClick={()=>this.handleClickCategoryItem(citem, i)}>{citem.fieldId && citem.fieldId > 0?citem.field.fieldName.substring(0, 25):"-"}</td>
                                                                <td onClick={()=>this.handleClickCategoryItem(citem, i)}>{citem.fieldId && citem.fieldId > 0?citem.isEyeLevelRank:"-"}</td>
                                                                <td onClick={()=>this.DeleteCategory(true, i)}><span><XIcon size={14} /></span></td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </Table>
                                        

                                        {
                                            this.state.paginatedItems.length>0 ?
                                                <Col style={{marginBottom:"40px"}}>
                                                    {/* <Badge bg="light" className="filtertable-showttxt" style={{color:"#142a33"}}>
                                                        {this.props.isRTL===""?<>{this.props.t("results")} {ptotalresults} {this.props.t("of")} {pendcount} {this.props.t("to")} {pstartcount} {this.props.t("showing")}</>:<>{this.props.t("showing")} {pstartcount} {this.props.t("to")} {pendcount} {this.props.t("of")} {ptotalresults} {this.props.t("results")}</>}
                                                    </Badge> */}
                                                    <Pagination>
                                                        <Pagination.Item onClick={() => this.setPage(1,true)} disabled={(this.state.currentPage === 1?true:false)}><ChevronLeftIcon/><ChevronLeftIcon/></Pagination.Item>
                                                        <Pagination.Item onClick={() => this.setPage((this.state.currentPage - 1),true)} disabled={(this.state.currentPage === 1?true:false)}><ChevronLeftIcon/></Pagination.Item>
                                                        <label>{this.state.currentPage} / {(this.state.totalPages?this.state.totalPages:0)}</label>
                                                        <Pagination.Item onClick={() => this.setPage((this.state.currentPage + 1),true)} disabled={(this.state.currentPage === this.state.totalPages?true:false)}><ChevronRightIcon/></Pagination.Item>
                                                        <Pagination.Item onClick={() => this.setPage(this.state.totalPages,true)} disabled={(this.state.currentPage === this.state.totalPages?true:false)}><ChevronRightIcon/><ChevronRightIcon/></Pagination.Item>
                                                    </Pagination>   
                                                </Col>
                                            :<></>
                                            
                                        }
                                    </Col>
                                </Col>
                                <Col className="">
                                    <Link to="#" onClick={()=>this.initBack("/chaindepartments", "back")} style={{float:(this.props.isRTL==="rtl"?"right":"left")}}><Button variant="secondary" type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button></Link>
                                    <Button style={{float:(this.props.isRTL==="rtl"?"left":"right")}} disabled={this.state.isButtonDisable} onClick={()=>this.handleDepartmentSave()} size='lg' id="savebtnlink" variant="success" className="float-right formview-btn">{this.props.t('btnnames.save')}</Button>
                                </Col>
                                
                                </Col>
                               
                            </Col>
                        </Col>
                        
                    </Row>

                    <Modal show={this.state.showaddnewmodal} className="tagmodal-view depatartment-category-modal" dir={this.props.isRTL} onShow={this.handleModalReset} onHide={this.handleModalToggle} backdrop="static">
                        <Modal.Header>
                            <span onClick={this.handleModalToggle} className='close-link'><XIcon size={22}/></span>
                            <Modal.Title style={{fontSize:"20px",fontWeight:"700"}}>{this.props.t('addnewcategory')}</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                        <Tab.Container activeKey={this.state.activeTabKey}>
                                <Tab.Content>
                                    <Tab.Pane eventKey="fieldselect">
                                        <div className='fieldsdiv'>
                                            <div className='SelectCategory'>
                                                <div className='categoryselect'>
                                                    <Col xs={12} md={6} className="form-subcontent">
                                                        <Form.Group style={{marginBottom:"35px"}}>
                                                            <AcInput eleid="catnametxt" atype="text" aid="categoryName" adefval={this.state.cobj.categoryName} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('categoryName')} showlabel={true} arequired={true}/>
                                                        </Form.Group>
                                                    </Col>
                                                    <Col xs={12} md={1}></Col>
                                                    <Col xs={12} md={5} className="form-subcontent color-content">
                                                        <Form.Group>
                                                            <AcInput atype="color" aid="color" adefval={this.state.cobj.color} aobj={this.state.cobj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/>
                                                        </Form.Group>
                                                    </Col>
                                                </div>
                                                <Col xs={12} className="field" style={{marginTop:"0px"}}>
                                                    <h6 className='field-title'>{this.props.t("selectfield")}</h6>
                                                    <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                                        {(this.state.loadDunitList && this.state.loadDunitList.length>0 ? this.state.loadDunitList.map((field, i) =>
                                                            <Col md={3} key={i}>
                                                                <Col className={"sub-item "+(field.isSelected?"active":"") } onClick={()=>this.handleSelectfield(field, true, true)}>
                                                                    <Col xs={12} id={field.fieldId} style={{padding:"0px"}}>
                                                                        <Row>
                                                                            <Col xs={12} style={{background:"#FFF", marginTop:"-5px", height:"55px", borderBottom: "1px solid #ddd"}}>
                                                                                <div className="thumb-div">
                                                                                    <img key={i} className="img-fluid" src={field.fieldImgUrl} alt="" />
                                                                                </div>
                                                                            </Col>
                                                                            <Col xs={12} className="fieldName" title={field.fieldName}>{field.fieldName.substring(0,22)+(field.fieldName.length > 22?"..":"")}</Col>
                                                                            
                                                                            <Col xs={4} className="field-value-title">{this.props.t("width")}</Col><Col xs={4} className="field-value-title">{this.props.t("height")}</Col><Col xs={4} className="field-value-title">{this.props.t("depth")}</Col>
                                                                            <Col xs={4} className="field-value">{field.width}{ field.uom }</Col><Col xs={4} className="field-value">{field.height}{field.uom}</Col><Col xs={4} className="field-value">{ field.depth}{field.uom }</Col>
                                                                        </Row>
                                                                    </Col>
                                                                </Col>
                                                            </Col>
                                                            ) : (<></>))}
                                                            
                                                        {this.state.loadDunitList.length < this.state.fieldTotalCount?<Button className="load-more-btn" onClick={()=>this.loadMoreDunits()}>{this.props.t("btnnames.loadmore")}</Button>:<></>}
                                                    </Row>
                                                </Col>
                                            </div>
                                        </div>
                                    </Tab.Pane>
                                    <Tab.Pane eventKey="fielddraw">
                                        <Col className='NDUrowStructuredraw fielddraw-view'>
                                            <label style={{marginTop:"8px"}}>{this.props.t("select_eye_level_to_continue")}</label>
                                            
                                            {this.state.fieldLevelObj?<>
                                                <div className="measure-line vertical" dir="ltr" style={{width:"100%"}}>
                                                    <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"86%"}:{}}>{this.dotTxtShow("width",1)}</div>
                                                    <div className="dot-txt" style={{marginLeft:"42%",marginTop:"-15px"}}>{this.dotTxtShow("width",2)}</div>
                                                    <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"0%",marginTop:"-15px"}:{marginLeft:"83%",marginTop:"-15px"}}>{this.dotTxtShow("width",3)}</div>
                                                    <div className="dots"></div>
                                                    <div className="dots" style={{marginLeft:"50%",marginTop:"-4px"}}></div>
                                                    <div className="dots" style={{marginLeft:"100%",marginTop:"-4px"}}></div>
                                                </div>

                                                <div className="measure-line horizontal" dir="ltr" style={{height:this.state.divHeight+3, marginLeft: -10}}>
                                                    <div className="dot-txt" style={{marginTop:(20)}}>{this.dotTxtShow("height",3)}</div>
                                                    <div className="dot-txt" style={{marginTop:((this.state.divHeight / 2) - 2)}}>{this.dotTxtShow("height",2)}</div>
                                                    <div className="dot-txt" style={{marginTop:(this.state.divHeight - 2)}}>{this.dotTxtShow("height",1)}</div>
                                                    <div className="dots"></div>
                                                    <div className="dots" style={{marginTop:(this.state.divHeight / 2)}}></div>
                                                    <div className="dots" style={{marginTop:(this.state.divHeight - 5)}}></div>
                                                </div>
                                            </>:<></>}
                                            
                                            <div ref={this._mainFieldDiv} className="field-wrapper">
                                                {this.state.fieldLevelObj?<>
                                                    <svg width={"100%"} height={this.state.divHeight} version="1.1" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                                                        
                                                        <rect x={0} y={0} width={"100%"} height={this.state.fieldLevelObj.drawHeight} strokeWidth={3} fill="none" style={{ stroke: (this.props.dmode?'#2CC990':'#cfbbf3'),display:"block",margin:"auto" }} ></rect>
                                                        
                                                        {(this.state.fieldLevelObj.fieldShelves?this.state.fieldLevelObj.fieldShelves.map((shelf, i) => {
                                                            let cisselected = this.state.fieldEyeLevels.findIndex(x => x.rank === shelf.rank);
                                                            return <React.Fragment key={i}>
                                                                <rect className={"sftrect shelve-row"+(cisselected > -1?" active":"")} onClick={() => this.handleSelectRow(i, shelf) } width={"100%"} height={shelf.drawHeight} x={0} y={shelf.y} style={{ strokeWidth: 1, stroke: (this.props.dmode?'#2CC990':'#cfbbf3'), fill: 'transparent' }} />
                                                                <rect className="sftrect" width={"100%"} height={shelf.drawGap} x={0} y={shelf.y + (shelf.drawHeight?shelf.drawHeight:0)} style={{ fill: (this.props.dmode?'#2CC990':'#cfbbf3') }} />
                                                            </React.Fragment>;
                                                        }) : (<></>))}
                                                    </svg>
                                                </>:<></>}
                                            </div>
                                        </Col>
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Modal.Body>
                        <Modal.Footer style={{height: "50px"}}>
                            {this.state.activeTabKey === "fieldselect"?<>
                                <Button variant="secondary" className='float-left btn-back-cat' onClick={this.handleModalToggle}>{this.props.t('btnnames.back')}</Button>
                                {/* <Button className="btn-save-cat" onClick={()=>this.toggleActiveTab("fielddraw")}>{this.props.t("continue_btn")}</Button> */}
                            </>:<>
                                <Button variant="secondary" className='float-left btn-back-cat' onClick={()=>this.toggleActiveTab("fieldselect")}>{this.props.t("btnnames.back")}</Button>
                                
                                {this.state.isedit === false?<> 
                                    {/* <Button className="btn-save-cat" onClick={() => this.AddCategory()}>{this.props.t("btnnames.addnewcat")}</Button> */}
                                </>
                                :
                                <>
                                    <Button className="btn-def-cat" variant="danger" onClick={() => this.DeleteCategory()}>{this.props.t('btnnames.delete')}</Button>
                                    {/* <Button className="btn-save-cat" onClick={() => this.UpdateCategory()}>{this.props.t("btnnames.update")}</Button> */}
                                </>
                                }
                            </>}
                        </Modal.Footer>
                    </Modal>

                </Col>

            </>
        )

    }
}

const mapDispatchToProps = dispatch => ({
    setChainPrevFilters: (payload) => dispatch(viewSetChainDepPrevAction(payload)),
    setDunitView: (payload) => dispatch(viewSetChainDepAction(payload)),
});

export default  withTranslation()(withRouter(connect(null,mapDispatchToProps)(AddNewDepartment)));