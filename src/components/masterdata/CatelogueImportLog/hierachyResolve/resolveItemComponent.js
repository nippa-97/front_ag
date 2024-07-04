import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import {Col, Row, Button, OverlayTrigger, Tooltip, Badge, Collapse} from 'react-bootstrap';
import { PlusIcon , CheckCircleFillIcon, XCircleFillIcon, UnlockIcon } from '@primer/octicons-react';
import Select from 'react-select';

import ResolveSubItem from './resolveItemSubComponent';
import { DepartmentDetailsComponent } from '../../departments/AddNew/addnew';
import { CategoryUpdate } from '../../chainDepartments/AddNew/additionalComps/cat_update';
import { SubCatUpdate } from '../../chainDepartments/AddNew/additionalComps/subcat_update';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { ResolveProductList } from './productsResolve/resolveProductList';

const selectColorStyles = {
    option: (styles, state) => {
      let data = state.data;
      return {
        ...styles,
        backgroundColor: (state.isSelected ? "#6495ED" :(data.color?data.color:"#fff"))
      };
    },
    menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),menu: (provided) => ({ ...provided, zIndex: 9999 })
};

export class ResolveItem extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            issueObj : null,//
            departmentList:[],
            categoryList:[],
            subCategoryList:[],

            //cat and scat load tracking flag
            lastLoadedDep:-1, lastLoadedCat:-1,

            isShowDeptMDModal: false,
            isShowCatMDModal: false, selectedDept: null,
            isShowSCatMDModal: false, selectedCategory: null, selectedSubCat: null, selectedSubCatIdx: 0,

            departmentsLoading:false, categoriesLoading:false, subcategoriesLoading:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            //check if departments are loaded from props
            if(this.props.departments && this.props.departments.length>0){
                this.initDepartments(this.props.departments);
            }
            else{
                this.loadAllDepartments();
            }
            this.initCategories();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //load departments from backend
    loadAllDepartments = () =>{
        let sobj = {isReqPagination:false,departmentName:""}
        this.setState({departmentsLoading:true});
        submitSets(submitCollection.searchDepatments, sobj, true).then(res => {
            this.setState({departmentsLoading:false});
            if(res && res.status && res.extra){
                let temarr = [];
                for (let i = 0; i < res.extra.length; i++) {
                    temarr.push({value:res.extra[i].departmentId, label:res.extra[i].name});
                }
                if(this.props.setDepartmentsList){
                    this.props.setDepartmentsList(temarr);
                }
                this.initDepartments(temarr);
            }
        });
    }

    initDepartments = (deplist) =>{
        let deps = [];
        deps[0] = {value:-1, label:"N/A"};
        deps = deps.concat(deplist);
        this.setState({departmentList: deps});
    }

    initCategories = (updateName) =>{
        let tmobj =  this.props.issue;
        let cats = [];
        cats[0] = {value:-1, label:"N/A"};
        if(tmobj.issueCategory.fe_categoryId>0){
            let avlindx = this.state.categoryList.findIndex(x => x.value ===tmobj.issueCategory.fe_categoryId);
            if(avlindx === -1){
                cats[1] = {value:tmobj.issueCategory.fe_categoryId, label:tmobj.issueCategory.fe_categoryName, color: "#ed327a73"};
                //set cat name
                if(updateName!==false){tmobj.issueCategory.categoryName = tmobj.issueCategory.fe_categoryName;}
                
                this.props.updateIssueItem(tmobj,this.props.index,false);
            }
        }

        if(this.props.isProdResolve===true){//only when product resolve
            if(tmobj.issueCategory.categoryId>0){
                let avlindx = this.state.categoryList.findIndex(x => x.value ===tmobj.issueCategory.categoryId);
                if(avlindx === -1){
                    cats[1] = {value:tmobj.issueCategory.categoryId, label:tmobj.issueCategory.categoryName};
                    //set cat name
                    //tmobj.issueCategory.categoryName = tmobj.issueCategory.categoryName;
                    this.props.updateIssueItem(tmobj,this.props.index,false);
                }
            }
        }

        cats = cats.concat(this.state.categoryList);
        this.setState({categoryList:cats});
    }

    handleDepartmentChange = (e) =>{
        let obj = this.props.issue;
        obj.issueDepartment.departmentId = e.value;
        obj.issueDepartment.departmentName = e.label;
        this.props.updateIssueItem(obj,this.props.index,true);
        this.setState({lastLoadedCat:-1});
        this.loadCategories(e.value);
        this.loadSubCategories(null);
    }

    handleCategoryChange = (e) =>{
        let obj = this.props.issue;
        obj.issueCategory.categoryId = e.value;
        obj.issueCategory.categoryName = e.label;

        this.props.updateIssueItem(obj,this.props.index,true);
        this.loadSubCategories(e.value);
    }

    handleCategoryComboClick = () =>{
        let mobj = this.props.issue;
        if(mobj.issueDepartment.departmentId>0){
            if(this.state.lastLoadedDep !== mobj.issueDepartment.departmentId){
                this.loadCategories(mobj.issueDepartment.departmentId);
            }
        }
    }

    handleSubcategoryChange = (e,index) =>{
        let obj = this.props.issue;
        obj.issueSubCategories[index].subCategoryId = e.value;
        obj.issueSubCategories[index].subCategoryName = e.label;
        this.props.updateIssueItem(obj,this.props.index,true);
    }

    setSubcatNameOnInit = (sobj, index) =>{
        let obj = this.props.issue;
        obj.issueSubCategories[index] = sobj;
        this.props.updateIssueItem(obj,this.props.index,false);
    } 

    handleSubcategoryComboClick = () =>{
        let mobj = this.props.issue;
        if(mobj.issueDepartment.departmentId>0 &&  mobj.issueCategory.categoryId > 0){
            if(this.state.lastLoadedCat !== mobj.issueCategory.categoryId){
                this.loadSubCategories(mobj.issueCategory.categoryId);
            }
        }
    }

    handleDeptModalToggle = (isreload, newdeptobj) => {
        this.setState({ isShowDeptMDModal: !this.state.isShowDeptMDModal }, () => {
            if(isreload){
                //reload departments md list
                this.props.updateAllDepartments(newdeptobj);
                this.handleDepartmentChange({ value: newdeptobj.departmentId, label: newdeptobj.name });

                let deps = this.state.departmentList;
                deps.push({ value: newdeptobj.departmentId, label: newdeptobj.name });
                this.setState({departmentList:deps});
                
                //setTimeout(() => {this.initDepartments();}, 800);
            }   
        });
    }

    handleCatModalToggle = (isreload, newcatobj) => {
        let issueobj = this.props.issue;
        //console.log(issueobj);

        this.setState({ 
            isShowCatMDModal: !this.state.isShowCatMDModal, 
            //selectedDept: (!this.state.isShowCatMDModal?issueobj.issueCategory.originDepartment:null) 
            selectedDept: (!this.state.isShowCatMDModal?{departmentId:issueobj.issueDepartment.departmentId, departmentName:issueobj.issueDepartment.departmentName}:null) 
        }, () => {
            if(isreload){
                //reload cat list
                let tcats = [];
                for (let i = 0; i < newcatobj.categories.length; i++) {
                    tcats.push({value: newcatobj.categories[i].id , label: newcatobj.categories[i].categoryName});
                }
                this.setState({categoryList: tcats , lastLoadedDep: newcatobj.departmentId},() => {
                    this.handleCategoryChange({ value: newcatobj.categories[newcatobj.categories.length-1].id, label: newcatobj.categories[newcatobj.categories.length-1].categoryName });
                    this.initCategories(false);
                });
            }
        });
    }
    
    handleScatModalToggle = (isreload, newscatobj, selectedSubCat, selectedSubCatIdx) => {
        // let issueobj = this.props.issue;
        let departmentobj = {departmentId:-1, departmentName:""};
        let ccatobj = {categoryId:-1, categoryName:""};
        let newcatobj = null;

        if(!this.state.isShowCatMDModal && selectedSubCat){
            //let cdepobj = selectedSubCat.originCategory.originDepartment;
            //let ccatobj = selectedSubCat.originCategory;

            //set category
            if(this.props.issue.issueCategory.categoryId === this.props.issue.issueCategory.fe_categoryId){
                ccatobj = {categoryId:this.props.issue.issueCategory.categoryId, categoryName:this.props.issue.issueCategory.ori_categoryName};
            }
            else{
                ccatobj = {categoryId:this.props.issue.issueCategory.categoryId, categoryName:this.props.issue.issueCategory.categoryName};
            }//
            //console.log(ccatobj);
            //let cdepobj = {departmentId:this.props.issue.issueDepartment.departmentId, departmentName:this.props.issue.issueDepartment.departmentName};
            ////let departmentobj = (this.props.issue.issueCategory.originDepartment?this.props.issue.issueCategory.originDepartment:null);

            //set department
            if(this.props.issue.depCatValid===false){
                departmentobj = (this.props.issue.issueCategory.originDepartment?this.props.issue.issueCategory.originDepartment:null);
            }
            else{
                departmentobj = {departmentId: this.props.issue.issueDepartment.departmentId, departmentName: this.props.issue.issueDepartment.departmentName
                };
            }

            // console.log(this.props.issue);
            
            newcatobj = {
                subCategory: [],
                isDelete: false,
                isNew: false,
                id: ccatobj.categoryId,
                chainDepartmentId: departmentobj.departmentId,
                categoryName: ccatobj.categoryName,
                departmentId: departmentobj.departmentId
            }
        }

        this.setState({ 
            isShowSCatMDModal: !this.state.isShowSCatMDModal, 
            //selectedDept: (!this.state.isShowCatMDModal && selectedSubCat?selectedSubCat.originCategory.originDepartment:null),
            selectedDept: (!this.state.isShowCatMDModal && departmentobj?departmentobj:null),
            selectedCategory: newcatobj,
            selectedSubCat: (!this.state.isShowCatMDModal && selectedSubCat?selectedSubCat:null),
            selectedSubCatIdx: (!this.state.isShowCatMDModal && selectedSubCat?selectedSubCatIdx:this.state.selectedSubCatIdx),
        }, () => {
            if(isreload){
                //reload subcat list
                let tscats = [];
                for (let i = 0; i < newscatobj.subCategory.length; i++) {
                    tscats.push({value: newscatobj.subCategory[i].subCategoryId , label: newscatobj.subCategory[i].subCategoryName});
                }
                
                this.setState({subCategoryList:tscats , lastLoadedCat: newscatobj.id}, () => {
                    let lastscatobj =  newscatobj.subCategory[(newscatobj.subCategory.length - 1)];
                    this.handleSubcategoryChange({ value: lastscatobj.subCategoryId, label: lastscatobj.subCategoryName }, this.state.selectedSubCatIdx);
                });
            }
        });
    }

    //
    loadCategories = (depid) =>{
        if(this.props.isProdResolve!==true){
            this.resetToCategoryDefaultValue();
        }

        if(depid && depid > 0){
            this.setState({categoriesLoading:true, categoryList:[]});
            let sobj = {departmentId:depid, isReqCount:false, isReqPagination:false,searchValue:""}
            submitSets(submitCollection.getAllCategoriesFromDepartment, sobj, true).then(res => {
                this.setState({categoriesLoading:false});
                if(res && res.status){
                    let tcats = [];
                    for (let i = 0; i < res.extra.length; i++) {
                        tcats.push({value:res.extra[i].id , label:res.extra[i].categoryName});
                    }
                    this.setState({categoryList:tcats , lastLoadedDep:depid},()=>{
                        this.initCategories();
                    });
    
                } else{
                    this.setState({categoryList:[]},()=>{this.initCategories();});
                }
            });
        }
        else{
            this.setState({categoryList:[]},()=>{this.initCategories();});
        }
    }

    resetToCategoryDefaultValue = () =>{
        let mobj = this.props.issue;
        mobj.issueCategory.categoryId = mobj.issueCategory.fe_categoryId;
        mobj.issueCategory.categoryName = mobj.issueCategory.fe_categoryName;

        this.props.updateIssueItem(mobj,this.props.index,true);
    }

    loadSubCategories = (catid) =>{
        if(this.props.isProdResolve!==true){
            this.resetToSubCategoryDefaultValue();
        }

        if(catid && catid>0){
            this.setState({subcategoriesLoading:true, subCategoryList:[] });
            let sobj = {depCategoryId:catid, isReqCount:false, isReqPagination:false,searchValue:""}
            submitSets(submitCollection.getSubCategories, sobj, true).then(res => {
                this.setState({subcategoriesLoading:false,});
                if(res && res.status){
                    let tscats = [];
                    for (let i = 0; i < res.extra.length; i++) {
                        tscats.push({value:res.extra[i].subCategoryId , label:res.extra[i].subCategoryName});
                    }
                    this.setState({subCategoryList:tscats , lastLoadedCat:catid},()=>{});
                } else{
                    this.setState({subCategoryList:[]},()=>{});
                }
            });
        }
        else{
            this.setState({subCategoryList:[]},()=>{});
        }
    }

    resetToSubCategoryDefaultValue = () =>{
        let mobj = this.props.issue;
        for (let i = 0; i < mobj.issueSubCategories.length; i++) {
            mobj.issueSubCategories[i].subCategoryId = mobj.issueSubCategories[i].fe_subCategoryId;
            mobj.issueSubCategories[i].subCategoryName = mobj.issueSubCategories[i].fe_subCategoryName;
        }
        this.props.updateIssueItem(mobj,this.props.index,true);
    }

    render(){
        //set department list
        let departmentslist = JSON.parse(JSON.stringify(this.state.departmentList));
        if(this.props.issue.isNoLongerValid===true){
            if(this.props.issue.issueDepartment){
                var isdepavl = departmentslist.findIndex(x => x.value === this.props.issue.issueDepartment.departmentId);
                if(isdepavl === -1){
                    departmentslist.push({value:this.props.issue.issueDepartment.departmentId, label:this.props.issue.issueDepartment.departmentName});
                }
            }
        }

        //set category list
        let categorieslist = JSON.parse(JSON.stringify(this.state.categoryList));
        if(this.props.issue.isNoLongerValid===true){
            if(this.props.issue.issueCategory){
                var iscatavl = categorieslist.findIndex(x => x.value === this.props.issue.issueCategory.categoryId);
                if(iscatavl === -1){
                    categorieslist.push({value:this.props.issue.issueCategory.categoryId, label:this.props.issue.issueCategory.categoryName});
                }
            }
        }

        //validations
        let isValid = false;
        isValid = (this.props.issue.depCatValid ? this.props.issue.depCatValid : false);
    
        let showCollapse = false;
        let selcolitems = (this.props.selectedCollapseItems ? this.props.selectedCollapseItems : []);
        
        for (const item of selcolitems) {
            if(this.props.index === item){
                showCollapse = true;
            }
        }
        
        return(
            <> 
            <Col xs={12} className={'main-group '+(this.props.issue.resolve_status+" ")+(this.props.issue.resolvedStatus==="Resolved" || this.props.issue.autoProcessed===true ? "pd-t" :"") + (this.props.selectedIssueIndex === this.props.index ? " selected ":"" ) + (" item-"+this.props.issue.resolvedStatus) }>
                <Col xs={12} className='main-group-top-items'>
                    {(this.props.issue.resolve_status==="Resolved" && this.props.issue.isNoLongerValid===false? <Button variant='danger' onClick={()=>this.props.unlockResolvedItem(this.props.issue,this.props.index)} className={'unlockicon d-inline '+(this.props.isRTL==="rtl" ? "float-right":"float-left")}><UnlockIcon size={12} /></Button>:<></>)}
                    {(this.props.issue.isNoLongerValid===true ? <Badge bg="primary" className={'nolongervalid d-inline '+(this.props.isRTL==="rtl" ? "float-right":"float-left")} >{this.props.t("NO_LONGER_VALID")}</Badge>:<></>)}
                    {(this.props.issue.autoProcessed===true ? <Badge bg="primary" className='auto-processed-lbl d-inline'>{this.props.t("AUTO_PROCESSED")}</Badge>:<></>)}
                    {(this.props.issue.resolvedStatus==="Resolved" ? <Badge bg="primary" className='resolved-lbl d-inline'>{this.props.t("CATELOGUE_FILTERS.resolved")}</Badge>:<></>)}
                </Col>
                <Row dir={this.props.isRTL}>
                    <Col xs={3} className={"content-col "}>
                        <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "+(this.props.issue.issueDepartment.departmentId>0?" ":" d-none")}><label></label>{this.props.issue.issueDepartment.departmentName}</Tooltip>}>
                            <Col xs={12} className={"content-item "+(isValid===true ? " " :" invalid")}>
                                <h6 className='content-item-title'>
                                    {this.props.t("department")}
                                    <div className={(this.props.isRTL==="rtl" ? "float-left":"float-right")}>
                                        <Button className='add' onClick={() => this.handleDeptModalToggle()}><PlusIcon size={11}/></Button>
                                    </div>
                                </h6>
                                    <Select 
                                        options={departmentslist} 
                                        onChange={(e) => this.handleDepartmentChange(e)}
                                        placeholder=""
                                        value={departmentslist.filter(option => option.value === this.props.issue.issueDepartment.departmentId)}
                                        classNamePrefix="hei-searchselect-inner" maxMenuHeight={200}
                                        menuPortalTarget={document.body}
                                        menuPosition="fixed" 
                                        //styles={{menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),menu: (provided) => ({ ...provided, zIndex: 9999 })}}
                                        styles={selectColorStyles}
                                        isLoading={this.state.departmentsLoading}
                                        isDisabled={this.props.issue.resolve_status==="Resolved"?true:false}
                                    />
                            </Col>
                        </OverlayTrigger>
                    </Col>
                    
                    <Col xs={1} className={"validity-indicator "+(isValid===true ? " " :" invalid")}>
                        {isValid===true ? <CheckCircleFillIcon size={22} /> :<XCircleFillIcon size={22}/>}
                    </Col>
                    
                    <Col xs={3} className={"content-col "}>
                        <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "+(this.props.issue.issueCategory.categoryId>0?" ":" d-none")}><label></label>{(this.props.issue.issueCategory.categoryName?this.props.issue.issueCategory.categoryName:"N/A")}</Tooltip>}>
                            <Col xs={12} className={"content-item "+(isValid===true ? " " :" invalid")}>
                                <h6 className='content-item-title'>
                                    {this.props.t("category")}
                                    {this.props.issue && this.props.issue.issueDepartment && this.props.issue.issueDepartment.departmentId > 0?
                                        <div className={(this.props.isRTL==="rtl" ? "float-left":"float-right")}>
                                            <Button className='add' onClick={() => this.handleCatModalToggle()}><PlusIcon size={11}/></Button>
                                        </div>
                                    :<></>}    
                                </h6>
                                <Select 
                                    options={categorieslist} 
                                    onChange={(e) => this.handleCategoryChange(e)}
                                    onFocus={()=>this.handleCategoryComboClick()}
                                    placeholder=""
                                    value={categorieslist.filter(option => option.value === this.props.issue.issueCategory.categoryId)}
                                    classNamePrefix="hei-searchselect-inner" maxMenuHeight={200}
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    //styles={{menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),menu: (provided) => ({ ...provided, zIndex: 9999 })}}
                                    styles={selectColorStyles}
                                    isLoading={this.state.categoriesLoading}
                                    isDisabled={this.props.issue.resolve_status==="Resolved"?true:false}
                                />
                            </Col>
                        
                        </OverlayTrigger>
                    </Col>


                    <Col xs={5} className="content-col">
                        {
                            this.props.issue.issueSubCategories.map((subcat,index)=>{
                                return(<ResolveSubItem
                                        isProdResolve={this.props.isProdResolve}
                                        key={index}
                                        index={index}
                                        issue={this.props.issue}
                                        issueindex={this.props.index}
                                        subcat={subcat}
                                        subCategoryList={this.state.subCategoryList}
                                        handleSubcategoryChange={this.handleSubcategoryChange}
                                        handleSubcategoryComboClick = {this.handleSubcategoryComboClick}
                                        handleScatModalToggle = {this.handleScatModalToggle}
                                        isRTL={this.props.isRTL}
                                        handleToggleProductsModal = {this.props.handleToggleProductsModal}
                                        subcategoriesLoading={this.state.subcategoriesLoading}
                                        pcategoryId = {this.props.issue.issueCategory.categoryId}
                                        pdepid = {this.props.issue.issueDepartment.departmentId}
                                        AddSubcategoryAsNewGroup = {this.props.AddSubcategoryAsNewGroup}
                                        subsLength = {(this.props.issue.issueSubCategories ? this.props.issue.issueSubCategories.length : 0)}
                                        resolved_st = {this.props.issue.resolve_status}
                                        setSubcatNameOnInit = {this.setSubcatNameOnInit}
                                        handleToggleProductResolveModal = {this.props.handleToggleProductResolveModal}
                                        deleteCustomIssue={this.props.deleteCustomIssue}
                                        selectIssueForAddingProducts={this.props.selectIssueForAddingProducts}
                                        setCollapseIndex={this.props.setCollapseIndex}
                                        selectedCollapseItems={this.state.selectedCollapseItems}
                                    />
                                    
                                )
                            })
                        }

                        
                    </Col>

                    {this.props.isProdResolve && this.props.showCustomIssues===true?<>
                        <Collapse in={showCollapse}>
                            <Col xs={12}>
                                <ResolveProductList 
                                    issueindex={this.props.index}
                                    isRTL={this.props.isRTL} 
                                    subcat={this.props.issue.issueSubCategories} 
                                    t={this.props.t} 
                                    deleteAddedProduct={this.props.deleteAddedProduct}
                                    deleteCustomIssue={this.props.deleteCustomIssue}
                                />
                            </Col>
                        </Collapse>
                    </>:<></>}

                </Row>
            </Col>

            {this.state.isShowDeptMDModal?
            <DepartmentDetailsComponent t={this.props.t}
                isShowUpdateModal={this.state.isShowDeptMDModal}
                selectedDept={null} 
                handleUpdateModalToggle={this.handleDeptModalToggle}
                />
            :<></>}

            {this.state.isShowCatMDModal?
            <CategoryUpdate t={this.props.t} isRTL={this.props.isRTL}
                deptobj={this.state.selectedDept}
                catobj={null}
                showCatNewModal={this.state.isShowCatMDModal}
                handleModalToggle={this.handleCatModalToggle}
                />
            :<></>}

            {this.state.isShowSCatMDModal?
            <SubCatUpdate t={this.props.t} isRTL={this.props.isRTL}
                deptobj={this.state.selectedDept}
                catobj={this.state.selectedCategory}
                isShowParents={true}
                subcatobj={null}
                showSubCatNewModal={this.state.isShowSCatMDModal}
                handleModalToggle={this.handleScatModalToggle}
                />
            :<></>}


            

            </>
        )
    }

}

export default withTranslation()(withRouter(ResolveItem));