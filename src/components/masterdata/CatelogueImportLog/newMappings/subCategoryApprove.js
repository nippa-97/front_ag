import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import {Col, Row, Button , Modal, Form } from 'react-bootstrap';
import Select from 'react-select';
import Switch from "react-switch";

import { submitSets } from '../../../UiComponents/SubmitSets';
import { submitCollection } from '../../../../_services/submit.service';
import { alertService } from '../../../../_services/alert.service';
import { Icons } from '../../../../assets/icons/icons';
import { AcInput, AcViewModal, ValT} from '../../../UiComponents/AcImports';

import "./catelogueApprovals.css";
import { PlusCircleIcon, XIcon } from '@primer/octicons-react';

import { CustomColorPicker } from '../../../common_layouts/color-picker';

export class SubcategoryApprove extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            ApproveObj:this.defaultApproveObj(),
            departmentList:[],
            categoryList: [],
            subcategoryList:[],
            categoryListLoading:false,
            subcategoryListLoading:false,

            showDepartmentAddModal:false,
            depObj: this.defaultDepartentObjectLoad(), 
            selectedIcon:{departmentIconId:0,departmentIconName:"DEP_DEFAULT"},
            showdepiconmodal:false,

            showCategoryAddModal:false,
            catObj:this.defaultCategoryObjectLoad(),

            showSubCategoryAddModal:false,
            subCatObj:this.defaultSubCategoryObjectLoad(),
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            if(this.props.mappingObj){
                this.setState({ApproveObj:JSON.parse(JSON.stringify(this.props.mappingObj)) , departmentList:(this.props.departmentList ? JSON.parse(JSON.stringify(this.props.departmentList)) : [] )},()=>{
                    this.setDepartmentsList();
                });
            }
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultApproveObj = () =>{
        return {
            categoryId: 0,
            categoryRefCode: "",
            departmentId: 0,
            departmentRefCode: "",
            importCode: "",
            importName: "",
            pendingSubCategoryId: 0,
            isApprove: false,
            isNewCategory: false,
            isNewSubCategory: true,
            isNewDepartment: false,
            subCategoryId:0,
            departmentRefName:"",
            categoryRefName:"",
            pendingCategoryId : 0,
            pendingDepartmentId : 0,
            catelogId:0,
        };
    }

    handleNewSwitchChanges = (ctxt) =>{
        setTimeout(() => {
            var csobj = this.state.ApproveObj;
            csobj.isNewSubCategory = !ctxt;
            csobj.subCategoryId = -1;
            this.setState({ApproveObj: csobj});
        }, 100);
    }

    addDepartmentAfterSave = (item) =>{
        let deps = this.state.departmentList;
        deps.push(item);
        this.setState({departmentList:deps},()=>{
            this.setDepartmentsList();
        });
    }

    setDepartmentsList = () =>{
        let department_list = (this.state.departmentList ? JSON.parse(JSON.stringify(this.state.departmentList)) : []);
        let dep_refName = (this.state.ApproveObj.departmentRefName ? this.state.ApproveObj.departmentRefName : "N/A");
        let dep_refId = (this.state.ApproveObj.departmentId ? this.state.ApproveObj.departmentId : null);
        let approve_obj = this.state.ApproveObj;

        let find_index = -1;
        if(dep_refId){
            find_index = department_list.findIndex(x => x.value === dep_refId);
        }
        else{
            find_index = department_list.findIndex(x => (x.label).toLowerCase() === dep_refName.toLowerCase());
        }

        if(find_index === -1){
            department_list.unshift({value:-1, label:(dep_refName+ " ["+this.props.t("NEW")+"]")});
            approve_obj.departmentId = -1;
            approve_obj.departmentName = dep_refName;
            approve_obj.isNewDepartment = true;
            approve_obj.isNewSubCategory = true;
            approve_obj.subCategoryId = -1;
            this.setState({departmentList:department_list, ApproveObj:approve_obj},()=>{
                this.loadDepartmentCategories(-1);
            });
        }
        else{
            approve_obj.departmentId = department_list[find_index].value;
            approve_obj.isNewDepartment = false;
            approve_obj.isNewSubCategory = true;
            approve_obj.subCategoryId = -1;
            this.setState({ ApproveObj:approve_obj},()=>{
                this.loadDepartmentCategories(approve_obj.departmentId);
            });
        }
    }

    handleDepartmentChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.departmentId = e.value;
        obj.departmentName = e.label;
        obj.isNewDepartment = (e.value < 0 ? true : false);
        console.log(obj);
        this.setState({ApproveObj:obj},()=>{
            this.loadDepartmentCategories(e.value);
        });
    }

    loadDepartmentCategories = (depid) =>{
        let sobj ={departmentId:depid, isReqPagination:false,}
        this.setState({categoryList: [], subcategoryList: []},()=>{
            if(depid>0){
                this.setState({categoryListLoading:true});
                submitSets(submitCollection.getAllCategoriesFromDepartment, sobj, true).then(res => {
                    this.setState({categoryListLoading:false});
                    if(res && res.status){
                        let temarr = [];
                        for (let i = 0; i < res.extra.length; i++) {
                            temarr.push({value:res.extra[i].id, label:res.extra[i].categoryName});
                        }
                        this.setState({categoryList:temarr},()=>{
                            this.setCategoryList();
                        });
                    }
                });
            }
            else{
                this.setCategoryList();
            }

        });
    }

    setCategoryList = () =>{
        let category_list = (this.state.categoryList ? JSON.parse(JSON.stringify(this.state.categoryList)) : []);
        let cat_refName = (this.state.ApproveObj.categoryRefName ? this.state.ApproveObj.categoryRefName : "N/A");
        let cat_refId = (this.state.ApproveObj.categoryId ? this.state.ApproveObj.categoryId : null);
        let approve_obj = this.state.ApproveObj;

        let find_index = -1;
        if(cat_refId){
            find_index = category_list.findIndex(x => x.value === cat_refId);
        }
        else{
            find_index = category_list.findIndex(x => (x.label).toLowerCase() === cat_refName.toLowerCase());
        }

        if(find_index === -1){
            category_list.unshift({value:-1, label:(cat_refName+ " ["+this.props.t("NEW")+"]")});
            approve_obj.categoryId = -1;
            approve_obj.categoryName = cat_refName;
            approve_obj.isNewCategory = true;
            approve_obj.subCategoryId = -1;
            this.setState({categoryList:category_list, ApproveObj:approve_obj},()=>{
                this.loadSubcategories(-1);
            });

        }
        else{
            approve_obj.categoryId = category_list[find_index].value;
            approve_obj.isNewCategory = false;
            approve_obj.subCategoryId = -1;
            this.setState({ ApproveObj:approve_obj},()=>{
                this.loadSubcategories(category_list[find_index].value);
            });
        }

    }

    handleCategoryChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.categoryId = e.value;
        obj.categoryName= (e.label).replace('[Ref]','');
        obj.isNewCategory = (e.value < 0 ? true : false);
        this.setState({ApproveObj:obj},()=>{
            this.loadSubcategories(e.value);
        });
    }

    loadSubcategories = (catid) =>{
        this.setState({subcategoryList: []});
        if(catid>0){
            let sobj ={depCategoryId:catid, isReqPagination:false,}
            this.setState({subcategoryListLoading:true});
            submitSets(submitCollection.getSubCategories, sobj, true).then(res => {
                this.setState({subcategoryListLoading:false});
                if(res && res.status){
                    let temarr = [];
                    for (let i = 0; i < res.extra.length; i++) {
                        temarr.push({value:res.extra[i].subCategoryId, label:res.extra[i].subCategoryName});
                    }
                    this.setState({subcategoryList:temarr},()=>{
                        this.setSubcategoryList();
                    });
                }
            });
        }
        else{
            this.setSubcategoryList();
        }
    }

    setSubcategoryList = () =>{
        let approve_obj = this.state.ApproveObj;
        approve_obj.subCategoryId = -1;
        //approve_obj.isNewSubCategory = false;
        this.setState({ ApproveObj:approve_obj});
    }

    handleSubCategoryChange = (e) =>{
        let obj = this.state.ApproveObj;
        obj.subCategoryId = e.value;

        this.setState({ApproveObj:obj},()=>{});
    }

    toggleAddingModals = (type,isshow)=>{
         this.setState({[type]:isshow, depObj:this.defaultDepartentObjectLoad(),catObj:this.defaultCategoryObjectLoad(),subCatObj:this.defaultSubCategoryObjectLoad()});
    }

    //department 
    defaultDepartentObjectLoad = () => {
        return {name: "", color: "#ccc",departmentIconId:"",departmentIconName:"DEP_DEFAULT"};
    }

    changeDepColor = (color) =>{
        let ssobj = this.state.depObj;
        ssobj.color = color;
        this.setState({depObj:ssobj});
    }
    
    handleDeptSave = (resp,type) => {
        let depobj = this.state.depObj;
        if(depobj.name===""){
            alertService.warn("Department Name Cannot be empty!");
            return false;
        }
        this.setState({ loading:true});
        submitSets(submitCollection.saveDepatments, depobj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.setState({categoryList: [{value:0, label:"-"}], subcategoryList: [{value:0, label:"-"}]});
                this.props.loadAllDepartments(false);
                this.addDepartmentAfterSave({value:resp.extra , label:depobj.name});
                this.toggleAddingModals("showDepartmentAddModal",false);
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
        
    }

    initIconChangeModal = () => {
        let temobj = JSON.parse(JSON.stringify(this.state.depObj));
        let obj = {departmentIconId : temobj.departmentIconId, departmentIconName : temobj.departmentIconName};
        this.setState({selectedIcon:obj});
        this.handleDepIconModalToggle();
    }

    //toggle icon modal
    handleDepIconModalToggle = () => {
        this.setState({showdepiconmodal: !this.state.showdepiconmodal});
    } 

    handleIconSelect = (citem) =>{
        this.setState({selectedIcon:citem});
    }

    changeIcon = () =>{
        let temobj = this.state.depObj;
        temobj.departmentIconName = this.state.selectedIcon.departmentIconName;
        temobj.departmentIconId = this.state.selectedIcon.departmentIconId;
        this.handleDepIconModalToggle();
    }

    //categories
    defaultCategoryObjectLoad = () => {
        return {
            id: -1,
            categoryName: "",
            isDelete: false,
            isNew: true,
            subCategory: [],
            color:"#ccc",
        };
        
    }

    changeCatColor = ( color) =>{
        let sobj = this.state.catObj;
        sobj.color = color;
        this.setState({catObj:sobj});
    }

    AddCategory = () =>{
        let approveObj = this.state.ApproveObj;
        let catobj = this.state.catObj;
        let depobj = {
            categories: [catobj],
            isDelete: false,
            isNew: false,
            chainDepartmentId: approveObj.departmentId,
            departmentId: approveObj.departmentId,
        }

        if(catobj.categoryName===""){
            alertService.warn("Category Name Cannot be empty!");
            return false;
        }
        this.setState({ loading:true});
        submitSets(submitCollection.AddNewCategoryToDepartment, depobj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.toggleAddingModals("showCategoryAddModal",false);
                this.loadDepartmentCategories(approveObj.departmentId);
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
            
        });
    }

    //sub category
    defaultSubCategoryObjectLoad = () =>{
        return  {
            categoryId: 0,
            color: "#ccc",
            isDelete: false,
            isNew: true,
            subCategoryId: 0,
            subCategoryName: "",
        }
    }

    changeSubCatColor = (color) =>{
        let sobj = this.state.subCatObj;
        sobj.color = color;
        this.setState({subCatObj:sobj});
    }

    AddSubCategory = () =>{
        let approveObj = this.state.ApproveObj;
        let scatobj = this.state.subCatObj;
        let catobj = {
            subCategory:[scatobj],
            chainDepartmentId: approveObj.departmentId,
            departmentId: approveObj.departmentId,
            categoryName:approveObj.categoryName,
            id: approveObj.categoryId,
            isDelete: false,
            isNew: false,
        }

        if(scatobj.subCategoryName===""){
            alertService.warn("Subcategory Name Cannot be empty!");
            return false;
        }
        this.setState({ loading:true});
        submitSets(submitCollection.AddNewSubCategoryToCategory, catobj, true, null, true).then(resp => {
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.toggleAddingModals("showSubCategoryAddModal",false);
                this.loadSubcategories(approveObj.categoryId);
            } else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
            
        });
    }

    //main mapping save
    approveMappingData = () =>{
        let approve_obj = this.state.ApproveObj;

        if(approve_obj.departmentId===null || approve_obj.departmentId===undefined){
            alertService.warn("Select a department");
            return false;
        }
        if(approve_obj.categoryId===null || approve_obj.categoryId===undefined){
            alertService.warn("Select a category");
            return false;
        }
        if(approve_obj.isNewSubCategory===false && approve_obj.subCategoryId <= 0){
            alertService.warn("Select a subcategory");
            return false;
        }
        this.props.toggleLoadingModal();
        this.setState({ loading:true});
        submitSets(submitCollection.approveSubCategoryData, approve_obj, true, null, true).then(resp => {
            this.props.toggleLoadingModal();
            this.setState({ loading:false});
            if(resp && resp.status){
                alertService.success(this.props.t("succussfuly")+" " +this.props.t("saved"));
                this.props.loadAllDepartments();
                this.props.mainSearch();
                this.props.toggleApproveModals("showSubcategoryApproveModal",false);
            }
            else{
                // alertService.error((resp&&resp.msg?resp.msg:resp&&resp.extra?resp.extra:this.props.t('ERROR_OCCURRED')));
            }
        });
    }

    render(){
        
        return(
            <>
                <Modal show={this.props.showSubcategoryApproveModal} className={"approve-modal subcat-approve "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleApproveModals("showSubcategoryApproveModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>
                            <h6>{this.props.t("CATELOG_NEW_INFO_LABELS.new_scat_title")}</h6>
                            {this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }
                        </Modal.Title>
                        <button className="close-btn" onClick={ () => this.props.toggleApproveModals("showSubcategoryApproveModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Col xs={12} className="form-subcontent">

                            
                            <Form.Group>
                                <h5>{this.props.t("department")} <span onClick={()=>this.toggleAddingModals("showDepartmentAddModal",true)}><PlusCircleIcon /></span> </h5>
                                <Col xs={12} className={"select-label-wrapper "+(this.state.ApproveObj.departmentId<=0 ? "new" : "exist")}>
                                    <Select
                                        options={this.state.departmentList} 
                                        onChange={(e) => this.handleDepartmentChange(e)}
                                        value={this.state.departmentList.filter(option => option.value === this.state.ApproveObj.departmentId)}
                                        classNamePrefix="searchselect-inner" maxMenuHeight={200}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        placeholder=""
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                    />
                                    {/* <p className={'info-des-txt '+(this.state.ApproveObj.departmentId<=0 ? "" : " d-none")}>{this.props.t("CATELOG_NEW_INFO_LABELS.department_create")} <span>{this.state.ApproveObj.departmentName ? this.state.ApproveObj.departmentName : "N/A" }</span></p> */}
                                </Col>
                            </Form.Group>
                            
                            
                        
                            <Form.Group>
                                <h5 className={(this.state.ApproveObj.isNewDepartment === true ?"disabled-add":"")}>{this.props.t("category")} <span onClick={()=>this.toggleAddingModals("showCategoryAddModal",true)}><PlusCircleIcon /></span></h5>
                                <Col xs={12} className={"select-label-wrapper "+ (this.state.ApproveObj.categoryId<=0 ? "new" : " exist")}>
                                    <Select 
                                        options={this.state.categoryList} 
                                        onChange={(e) => this.handleCategoryChange(e)}
                                        value={this.state.categoryList.filter(option => option.value === this.state.ApproveObj.categoryId)}
                                        classNamePrefix="searchselect-inner" maxMenuHeight={200}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        placeholder=""
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                    />
                                
                                    <Col xs={12} className={"combo-loading-div "+(this.state.categoryListLoading===true ? "" :" d-none")}>{this.props.t("LOADING")}</Col>

                                    {/* <p className={'info-des-txt '+(this.state.ApproveObj.categoryId<=0 ? "" : " d-none")}>{this.props.t("CATELOG_NEW_INFO_LABELS.category_create")} <span>{this.state.ApproveObj.categoryName ? this.state.ApproveObj.categoryName : "N/A" }</span></p> */}
                                </Col>
                            </Form.Group>
                           
                            <Form.Group className='switch-col'>
                                <Row>
                                    <Col xs={10}>
                                        <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.subcat")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                                    </Col>
                                    <Col xs={2}>
                                        <Switch onChange={()=> this.handleNewSwitchChanges(this.state.ApproveObj.isNewSubCategory)} checked={this.state.ApproveObj.isNewSubCategory} onColor={"#5128a0"} />
                                    </Col>
                                </Row>
                           </Form.Group>

                            {/* <Form.Group className='d-none'>
                                <div className={"switch-main-div"}>
                                    <label className="pure-material-switch" style={{ width: "100%" }}>
                                        <input type="checkbox" checked={this.state.ApproveObj.isNewSubCategory} onChange={(e) => this.handleNewSwitchChanges(this.state.ApproveObj.isNewSubCategory)} />
                                        {this.props.t("NEW_SUB_CAT")}
                                    </label>    
                                    <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.subcat")} <span>{this.state.ApproveObj.importName ? this.state.ApproveObj.importName : "N/A" }</span></p>
                                </div>
                            </Form.Group> */}

                            <Form.Group className={(this.state.ApproveObj.isNewSubCategory===false?"":" d-none")}>
                                <p className='info-des-txt'>{this.props.t("CATELOG_NEW_INFO_LABELS.subcat_already_exist_msg")}</p>
                                <h5 className={(this.state.ApproveObj.isNewDepartment === true || this.state.ApproveObj.isNewCategory ?"disabled-add":"")}>{this.props.t("subcategory")} <span onClick={()=>this.toggleAddingModals("showSubCategoryAddModal",true)}><PlusCircleIcon /></span></h5>
                                <Col xs={12} className={"select-label-wrapper "}>
                                    <Select 
                                        options={this.state.subcategoryList}
                                        onChange={(e) => this.handleSubCategoryChange(e)}
                                        value={this.state.subcategoryList.filter(option => option.value === this.state.ApproveObj.subCategoryId)}
                                        classNamePrefix="searchselect-inner" maxMenuHeight={200}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed"
                                        placeholder=""
                                        styles={{
                                            menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),
                                            menu: (provided) => ({ ...provided, zIndex: 9999 })
                                        }}
                                    />
                                    <Col xs={12} className={"combo-loading-div "+(this.state.subcategoryListLoading===true ? "" :" d-none")}>{this.props.t("LOADING")}</Col>
                                </Col>
                            </Form.Group>

                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button  variant='success' disabled={this.state.loading===true?true:false} onClick={()=>this.approveMappingData()}>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showDepartmentAddModal} className={"adding-modal department "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showDepartmentAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("addNewDepartment")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showDepartmentAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group>
                            <AcInput atype="text" aid="name" adefval={this.state.depObj.name} aobj={this.state.depObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('departmentname')} showlabel={true}/>
                        </Form.Group>
                    
                        <Form.Group>
                            {/* <AcInput atype="color" aid="color" adefval={this.state.depObj.color} aobj={this.state.depObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('depcolor')} showlabel={true}/> */}
                            <CustomColorPicker 
                                isRTL = {this.props.isRTL}
                                selectedColor={this.state.depObj.color}
                                label={this.props.t('depcolor')}
                                isCompulsary={false}
                                changeColor = {this.changeDepColor}    
                                type={"department"}
                                departmentId={-1}
                                categoryId={-1}
                                isNew ={true}
                                t ={this.props.t}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.Label style={{width:"100%"}}>
                                {this.props.t("icon")} 
                            </Form.Label>
                            <Button onClick={this.initIconChangeModal} variant='success' className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} style={{borderRadius:"25px"}} size="sm" >{this.props.t("changeicon")}</Button>
                            <Col xs={12}>
                                {Icons.DepIconsLoad((this.state.depObj.departmentIconName ? this.state.depObj.departmentIconName : "DEP_DEFAULT") , {size:70, color:"#AF7AC5"})}
                            </Col>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="success" onClick={this.handleDeptSave} disabled={this.state.loading===true?true:false} className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")}>{this.props.t("btnnames.save")}</Button>
                        {/* <AcButton eleid="savebtnlink" avariant="success" asubmit={submitCollection.saveDepatments} aobj={this.state.depObj} avalidate={this.state.vobj} aclass="float-right formview-btn" atype="button" aresp={e => this.handleDeptSave(e,1)}>{this.props.t('btnnames.save')}</AcButton> */}
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showdepiconmodal} className="icons-view adding-modal " dir={this.props.isRTL} onHide={this.handleDepIconModalToggle}>
                    <Modal.Header>
                        <Modal.Title style={{fontSize:"22px",fontWeight:"700"}}>{this.props.t('selecticon')}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Col className="formcontrol-main">
                            <Row className="main-icons-col">
                                {  
                                    this.props.departmentIconsShowList.map((citem,index)=>{
                                        return(
                                            <Col xs={2} key={index} className="main-icons-item">
                                                <Col xs={12} className={"main-icons-item-inner "+(this.state.selectedIcon.departmentIconName === citem.departmentIconName ?" active " :"")} onClick={()=>this.handleIconSelect(citem)}>
                                                    {
                                                        this.state.selectedIcon.departmentIconName === citem.departmentIconName ?
                                                        Icons.DepIconsLoad(citem.departmentIconName, {size:40, color:"#FFF"}):
                                                        Icons.DepIconsLoad(citem.departmentIconName, {size:40, color:"#AF7AC5"})
                                                    }
                                                </Col>
                                            </Col>
                                        )
                                    })
                                }
                            </Row>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleDepIconModalToggle} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.back')}</Button>
                        <Button variant="success" className={"formview-btn "+(this.props.isRTL==="rtl"?"float-left":"float-right")} onClick={this.changeIcon} type="button" style={{borderRadius:"25px"}}>{this.props.t('btnnames.change')}</Button>       
                    </Modal.Footer>
                </Modal>

                <Modal show={this.state.showCategoryAddModal} className={"adding-modal category "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showCategoryAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("addnewcategory")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showCategoryAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="catnametxt" atype="text" aid="categoryName" adefval={this.state.catObj.categoryName} aobj={this.state.catObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('categoryName')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group>
                                {/* <AcInput atype="color" aid="color" adefval={this.state.catObj.color} aobj={this.state.catObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.catObj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={false}
                                    changeColor = {this.changeCatColor}    
                                    type={"category"}
                                    departmentId={(this.state.ApproveObj ? this.state.ApproveObj.departmentId : -1)}
                                    categoryId={-1}
                                    isNew ={true}
                                    t ={this.props.t}
                                />
                            </Form.Group>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' disabled={this.state.loading===true?true:false} onClick={()=>this.AddCategory()}>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>


                <Modal show={this.state.showSubCategoryAddModal} className={"adding-modal subcategory "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.toggleAddingModals("showSubCategoryAddModal",false) }} backdrop="static" dir={this.props.isRTL}>
                    <Modal.Header>
                        <Modal.Title>{this.props.t("addnewsubcategory")}</Modal.Title>
                        <button className="close-btn" onClick={ () => this.toggleAddingModals("showSubCategoryAddModal",false)} ><XIcon size={20}   /></button>
                    </Modal.Header>
                    <Modal.Body>
                        <Col xs={12} className="form-subcontent">
                            <Form.Group style={{marginBottom:"35px"}}>
                                <AcInput eleid="subcatnametxt" atype="text" aid="subCategoryName" adefval={this.state.subCatObj.subCategoryName} aobj={this.state.subCatObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('subCategory')} showlabel={true} arequired={true}/>
                            </Form.Group>
                            <Form.Group>
                                {/* <AcInput atype="color" aid="color" adefval={this.state.subCatObj.color} aobj={this.state.subCatObj} avset={this.state.vobj} avalidate={[ValT.empty]} aplace={this.props.t('color')} showlabel={true}/> */}
                                <CustomColorPicker 
                                    isRTL = {this.props.isRTL}
                                    selectedColor={this.state.subCatObj.color}
                                    label={this.props.t('color')}
                                    isCompulsary={false}
                                    changeColor = {this.changeSubCatColor}    
                                    type={"sub_category"}
                                    departmentId={(this.state.ApproveObj ? this.state.ApproveObj.departmentId : -1)}
                                    categoryId={(this.state.ApproveObj ? this.state.ApproveObj.categoryId : -1)}
                                    isNew ={true}
                                    t ={this.props.t}
                                />
                            </Form.Group>
                        </Col>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='success' disabled={this.state.loading===true?true:false} onClick={()=>this.AddSubCategory()}>{this.props.t("btnnames.save")}</Button>
                    </Modal.Footer>
                </Modal>

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')} />
            </>
        )
    }
}

export default withTranslation()(withRouter(SubcategoryApprove));