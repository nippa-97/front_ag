import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button , Modal} from 'react-bootstrap';

import { submitCollection } from '../../../../_services/submit.service';
import { submitSets } from '../../../UiComponents/SubmitSets';
import { AcViewModal } from '../../../UiComponents/AcImports';
import { confirmAlert } from 'react-confirm-alert';

import ResolveItem from './resolveItemComponent';
import HierachyIssueProduct from './productsView';
import ProductResolve from './productsResolve/productsResolve';
import { DepartmentDetailsComponent } from '../../departments/AddNew/addnew';
import { alertService } from '../../../../_services/alert.service';

import "./hierachyResolve.css";
import { InfoIcon } from '@primer/octicons-react';
import { PopoverWrapper } from '../../../newMasterPlanogram/AddMethods';

export class HierachyResolve extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            mstatus:"",
            dataLoaded:false,
            mobj:{catelogueImportId:-1, hierachyIssues:[]},
            isShowDeptMDModal: false,
            
            //products
            isShowProductModal:false,
            importHierarchyIssueId:-1,

            resolveBtnEnabled:false,issuesLoaded:false,

            showProductResolve:false, originalIssueObj:null, originalSummaryObj:null, originalSummaryItem:{},
            scrollPosition:0,

            isShowResolveModal: false,
            //resolve prod pagination
            resolveProdPagination: { 
                totalCount: 0, 
                startIndex: 0, 
                maxResults: 10,
                searchTxt: "", 
                products: [],
            },
            isResolvePaginating: false,
            //product edit
            productObject:null,
            showProductEditModal:false,

        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setState({mstatus:this.props.issueState});
            this.loadHierachyIssues();
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    loadHierachyIssues = () =>{
        this.setState({loading:true, dataLoaded:false, resolveBtnEnabled:false});
        submitSets(submitCollection.loadHierachyIssues, "?catelogId="+this.props.catelogId).then(res => {
            this.setState({loading:false,});
            if (res && res.status && res.extra && typeof res.extra !== "string") {
                
                let tmobj = res.extra;//respose_mock;
                let harr = (tmobj.hierachyIssues ? tmobj.hierachyIssues : []);
                harr = harr.sort((a,b) => (b.resolvedStatus > a.resolvedStatus) ? 1 : ((a.resolvedStatus > b.resolvedStatus) ? -1 : 0))
                tmobj.hierachyIssues = harr;
               
                for (let i = 0; i < tmobj.hierachyIssues.length; i++) {
                    tmobj.hierachyIssues[i]["resolve_status"] = tmobj.hierachyIssues[i].resolvedStatus;

                    tmobj.hierachyIssues[i].issueCategory["ori_categoryName"] = tmobj.hierachyIssues[i].issueCategory.categoryName;
                    tmobj.hierachyIssues[i].issueCategory["fe_departmentName"] = (tmobj.hierachyIssues[i].issueDepartment.departmentName?tmobj.hierachyIssues[i].issueDepartment.departmentName:"[N/A]");
                    tmobj.hierachyIssues[i].issueCategory["fe_categoryId"] = tmobj.hierachyIssues[i].issueCategory.categoryId;
                    tmobj.hierachyIssues[i].issueCategory["fe_categoryName"] = ((tmobj.hierachyIssues[i].issueCategory.categoryName?tmobj.hierachyIssues[i].issueCategory.categoryName:"") + " " + (tmobj.hierachyIssues[i].issueCategory.originDepartment ? "["+tmobj.hierachyIssues[i].issueCategory.originDepartment.departmentName+"]" : "[N/A]"));
                    
                    for (let x = 0; x < tmobj.hierachyIssues[i].issueSubCategories.length; x++) {
                        tmobj.hierachyIssues[i].issueSubCategories[x]["fe_subCategoryId"] = tmobj.hierachyIssues[i].issueSubCategories[x].subCategoryId;
                        tmobj.hierachyIssues[i].issueSubCategories[x]["fe_subCategoryName"] = ((tmobj.hierachyIssues[i].issueSubCategories[x].subCategoryName?tmobj.hierachyIssues[i].issueSubCategories[x].subCategoryName:"") +"  "+(tmobj.hierachyIssues[i].issueSubCategories[x].originCategory ? "["+tmobj.hierachyIssues[i].issueSubCategories[x].originCategory.categoryName+"]" : "[N/A]"));
                    }
                }
                //console.log(tmobj);
                this.setState({mobj:tmobj},()=>{
                    this.setState({dataLoaded:true});
                    this.checkValidity(true);
                });
                
            } else {
                alertService.error(this.props.t('ERROR_OCCURRED'));
                this.props.toggleHierachyModal()
            }
        });

    }

    updateIssueItem = (obj,index,ischeckvalidity) =>{
        let mobj = this.state.mobj;
        mobj.hierachyIssues[index] = obj;
        this.setState({mobj:mobj},()=>{
            if(ischeckvalidity===true){
                this.checkValidity();
            }
        });

    }

    handleToggleProductsModal = (hid) =>{
        this.setState
        ({
            importHierarchyIssueId:(hid?hid:-1),
            isShowProductModal:!this.state.isShowProductModal,
        });
    }

    handleToggleProductResolveModal = (hid, mindx, sindx) =>{
        let oriobj = null;
        //let oobj = this.state.originalSummaryObj;
        let osobj = null;
        
        if(mindx!==undefined && sindx!==undefined){
            let mobj = this.state.mobj;
            oriobj = {
                mobj:mobj.hierachyIssues[mindx],
                sobj:mobj.hierachyIssues[mindx].issueSubCategories[sindx]
            };
            
            //
            if(mobj.hierachyIssues){
                osobj = mobj.hierachyIssues[mindx];
                osobj.subCategoryObj = mobj.hierachyIssues[mindx].issueSubCategories[sindx];
            }
        }
        

        this.setState
        ({
            originalIssueObj:oriobj,
            originalSummaryItem:osobj,
            importHierarchyIssueId:(hid?hid:-1),
            showProductResolve:!this.state.showProductResolve,
        });
    }
    
    //add subcat to new group
    AddSubcategoryAsNewGroup = (sobj, mindex, sindex) =>{
        let mobj = this.state.mobj;
        mobj.hierachyIssues[mindex].issueSubCategories.splice(sindex,1);

        sobj.subCategoryId = sobj.fe_subCategoryId;
        sobj.subCategoryName = sobj.fe_subCategoryName;
        var temhieobj = JSON.parse(JSON.stringify(mobj.hierachyIssues[mindex])) ;
        temhieobj.issueSubCategories = [sobj];
        mobj.hierachyIssues.splice((mindex+1), 0, temhieobj);

        //console.log(sobj,mindex ,sindex);
        this.setState({mobj:mobj, issuesLoaded:false},()=>{
            this.checkValidity();
        });
        
    }

    checkValidity = (setSummaryObj) =>{
        let mobj = this.state.mobj;
        let flatHierarchy = [];
        for (let i = 0; i < mobj.hierachyIssues.length; i++) {
            mobj.hierachyIssues[i].isAllFixed = false;
            
            //cats
            let departmentId = (mobj.hierachyIssues[i].issueDepartment.departmentId ? mobj.hierachyIssues[i].issueDepartment.departmentId : -1);
            let originDepartmentId = (mobj.hierachyIssues[i].issueCategory.originDepartment ? mobj.hierachyIssues[i].issueCategory.originDepartment.departmentId : -1);
            let categoryId = (mobj.hierachyIssues[i].issueCategory.categoryId ? mobj.hierachyIssues[i].issueCategory.categoryId : -1);
            let fe_catid = (mobj.hierachyIssues[i].issueCategory.fe_categoryId );
            
            mobj.hierachyIssues[i]["depCatValid"] = false;

            if(categoryId>0){
                if(categoryId!==fe_catid){
                    mobj.hierachyIssues[i]["depCatValid"] = true;
                }
                else{
                    if(departmentId>0){
                        if((originDepartmentId===departmentId) || (originDepartmentId===-1)){
                            mobj.hierachyIssues[i]["depCatValid"] = true;
                        }
                    }
                }
            }

            //subcats
            let svalidcount = 0;
            for (let x = 0; x < mobj.hierachyIssues[i].issueSubCategories.length; x++) {
                let flatObj = {};
                let originCategoryId = ( mobj.hierachyIssues[i].issueSubCategories[x].originCategory ?  mobj.hierachyIssues[i].issueSubCategories[x].originCategory.categoryId: -1);
                let scatId = ( mobj.hierachyIssues[i].issueSubCategories[x].subCategoryId ?  mobj.hierachyIssues[i].issueSubCategories[x].subCategoryId : -1);
                let fe_scatid = mobj.hierachyIssues[i].issueSubCategories[x].fe_subCategoryId;

                flatObj["depId"] = departmentId;
                flatObj["catId"] = categoryId;
                flatObj["scatId"] = scatId;
                flatObj["isCatIssue"] = false;
                flatObj["isScatIssue"] = false;

                if(originDepartmentId < 1 || originCategoryId < 1){
                    flatHierarchy.push(flatObj);
                }
                
                mobj.hierachyIssues[i].issueSubCategories[x]["CatSubcatValid"] = false;

                if(scatId>0){
                    if(scatId!==fe_scatid){
                        svalidcount = (svalidcount + 1);
                        mobj.hierachyIssues[i].issueSubCategories[x]["CatSubcatValid"] = true;
                    }
                    else{
                        if(categoryId>0){
                            if((originCategoryId === categoryId) || (originCategoryId === -1)){
                                svalidcount = (svalidcount + 1);
                                mobj.hierachyIssues[i].issueSubCategories[x]["CatSubcatValid"] = true;
                            }
                        }
                    }
                }
            }
        }

        ///////////////////////////////////////////////////
        //group by category
        let catGroup = this.groupBy(flatHierarchy,"catId"); 

        for (const key in catGroup) {
            if(catGroup[key].length > 1){
                let dep = -1;
                for (const cat of catGroup[key]) {
                    if(dep < 0){
                        dep = cat.depId;
                    }else{
                        if(cat.depId !== dep){
                            cat.isCatIssue = true;
                        }
                    }
                }
            }
        }
              
        //group by sub category
        let sCatGroup = this.groupBy(flatHierarchy,"scatId"); 

        for (const key in sCatGroup) {
            if(sCatGroup[key].length > 1){
                let cat = -1;
                for (const scat of sCatGroup[key]) {
                    if(cat < 0){
                        cat = scat.catId;
                    }else{
                        if(scat.catId !== cat){
                            scat.isScatIssue = true;
                        }
                    }
                }
            }
        }

        for (let x = 0; x < mobj.hierachyIssues.length; x++) {
            let issue = mobj.hierachyIssues[x];
            for (const flatObj of flatHierarchy) {
                if(issue.issueCategory.categoryId === flatObj.catId
                    && issue.issueDepartment.departmentId === flatObj.depId
                    && flatObj.isCatIssue){
                        mobj.hierachyIssues[x].depCatValid = false;
                        break;
                }
            }

            for (let y = 0; y < issue.issueSubCategories.length; y++) {
                let subcatIssue = issue.issueSubCategories[y];
                for (const flatObj of flatHierarchy) {
                    if(issue.issueCategory.categoryId === flatObj.catId
                        && issue.issueDepartment.departmentId === flatObj.depId
                        && subcatIssue.subCategoryId === flatObj.scatId
                        && flatObj.isScatIssue){
                            mobj.hierachyIssues[x].issueSubCategories[y].CatSubcatValid = false;
                            break;
                    }
                }    
            }
        }

        /////////////////////////////////////////////////////////////////
        let hasValidItem = false;

        for (let a = 0; a < mobj.hierachyIssues.length; a++) {
            let robj =  mobj.hierachyIssues[a];
            if( mobj.hierachyIssues[a].resolve_status !=="Resolved"){
                let subcatvalidcount = 0;
                for (const subcat of robj.issueSubCategories) {
                    if(subcat.CatSubcatValid===true){
                        subcatvalidcount = (subcatvalidcount+1);
                    }
                }
    
                if(robj.depCatValid===true && subcatvalidcount===robj.issueSubCategories.length){
                    mobj.hierachyIssues[a].isAllFixed = true;
                    hasValidItem = true;
                }
            }
    
        }

        if(setSummaryObj===true){
            this.setState({originalSummaryObj:JSON.parse(JSON.stringify(mobj))});
        }
        
        this.setState({mobj:mobj, resolveBtnEnabled:hasValidItem, issuesLoaded:true});
    }

    groupBy = (array, key) => {
        // Return the end result
        return array.reduce((result, currentValue) => {
          // If an array already present for key, push it to the array. Else create an array and push the object
          (result[currentValue[key]] = result[currentValue[key]] || []).push(
            currentValue
          );
          // Return the current iteration `result` value, this will be taken as next iteration `result` value and accumulate
          return result;
        }, {}); // empty object is the initial value for result object
    };

    unlockResolvedItem = (obj, index) =>{
        obj.resolve_status = "Unresolved";
        this.updateIssueItem(obj,index,true);
    }

    resetData = () =>{
        confirmAlert({
            title: this.props.t("ARE_YOU_SURE_TO_RESET"),
            message: this.props.t("SURETO_CONTINUE"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    this.loadHierachyIssues();              
                }
            }, {
                label: this.props.t("btnnames.no")
                
            }],
        })
        
    }

    confirmResolveIssues = () =>{
        confirmAlert({
            title: this.props.t("ARE_YOU_SURE_TO_RESOLVE"),
            message: this.props.t("SURETO_CONTINUE"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    this.resolveIssues();              
                }
            }, {
                label: this.props.t("btnnames.no")
                
            }],
        })
        
    }

    resolveIssues = () =>{
        let mobj = this.state.mobj;
        
        this.setState({loading:true});
        submitSets(submitCollection.resolveHierachyIssue, mobj, true, null, true).then(res => {
            this.setState({loading:false});

            if (res && res.status) {
                alertService.success(this.props.t("successfully")+" "+this.props.t("saved"));
                
                //load heirarhy resolved list
                this.props.setHeirarchyIssue(this.state.mobj);

                this.props.mainSearch();
                this.props.toggleHierachyModal();
            } else {
                alertService.error(res.error ? res.error :this.props.t("erroroccurred"));
            }
        });
    }

    render(){
        return(
            <>
                {
                    this.state.dataLoaded === true ? 
                        <Modal size='lg' show={true} className={"hierachy-resolve-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleHierachyModal() }} backdrop="static" dir={this.props.isRTL} animation={false}>
                            <Modal.Header>
                                <Modal.Title>
                                    {this.props.logObj ? this.props.logObj.description : this.props.t("RESOLVE_HIERACHY")}
                                    
                                    <PopoverWrapper text={<>
                                        <h4>{this.props.t("MANUAL_FIXED_CANNOT_RESOLVED")}</h4>
                                    </>} cusid="resolvelog-info" trigger={["hover", "focus"]}>
                                        <span className='info-icon'><InfoIcon size={20} /></span>
                                    </PopoverWrapper>
                                </Modal.Title>
                            </Modal.Header> 
                            <Modal.Body>
                            {/* <button className="close-btn" onClick={ () => this.props.toggleHierachyModal()} ><XIcon size={20}   /></button>  */}

                            {
                                this.state.issuesLoaded === true ?
                                    <>
                                        {
                                            this.state.mobj.hierachyIssues.map((issue,index)=>{
                                                return (<ResolveItem 
                                                    key={index} 
                                                    index={index}
                                                    departments={this.props.departmentList} 
                                                    issue={issue}
                                                    isRTL={this.props.isRTL}
                                                    handleToggleProductsModal = {this.handleToggleProductsModal}
                                                    loadAllDepartments={this.props.loadAllDepartments}
                                                    updateAllDepartments={this.props.updateAllDepartments}
                                                    updateIssueItem={this.updateIssueItem}
                                                    AddSubcategoryAsNewGroup={this.AddSubcategoryAsNewGroup}
                                                    setDepartmentsList={this.props.setDepartmentsList}
                                                    unlockResolvedItem={this.unlockResolvedItem}
                                                    handleToggleProductResolveModal = {this.handleToggleProductResolveModal}
                                                    />
                                            )})
                                        }
                                    </>
                                
                                :<></>
                            }

                                
                            </Modal.Body>
                            <Modal.Footer>
                                <Button variant='secondary' className='reset' onClick={()=>this.props.toggleHierachyModal()}>{this.props.t('btnnames.close')}</Button>

                                {
                                    this.state.mstatus!=="PlanigoCompleted" ? 
                                    <>
                                        <Button variant='warning' style={{background:"#FFBF00"}} onClick={()=>{this.resetData()}}>{this.props.t('btnnames.reset')}</Button>
                                        <Button variant='success' disabled={!this.state.resolveBtnEnabled} onClick={()=>this.confirmResolveIssues()}>{this.props.t('CATELOGUE_FILTERS.resolve')}</Button>
                                    </>
                                    :<></>
                                }
                            </Modal.Footer>
                        </Modal>

                    :<></>
                }


                {this.state.isShowDeptMDModal?
                <DepartmentDetailsComponent t={this.props.t}
                    isShowUpdateModal={this.state.isShowDeptMDModal}
                    selectedDept={null} 
                    handleUpdateModalToggle={this.handleDeptModalToggle}
                    />
                :<></>}


                {
                    this.state.isShowProductModal ?
                        <HierachyIssueProduct 
                            isRTL={this.props.isRTL} 
                            isShowProductModal={this.state.isShowProductModal} 
                            importHierarchyIssueId={this.state.importHierarchyIssueId} 
                            handleToggleProductsModal = {this.handleToggleProductsModal}
                        />
                    :<></>
                }

                {
                    this.state.showProductResolve===true ?
                        <ProductResolve
                            isRTL={this.props.isRTL}
                            showProductResolve={this.state.showProductResolve}
                            departments={this.props.departmentList}
                            updateAllDepartments={this.props.updateAllDepartments}
                            handleToggleProductResolveModal = {this.handleToggleProductResolveModal}
                            importHierarchyIssueId={this.state.importHierarchyIssueId}
                            originalIssueObj = {this.state.originalIssueObj}
                            catelogueImportId = {this.state.mobj.catelogueImportId}
                            loadHierachyIssues={this.loadHierachyIssues}
                            mainSearch={this.props.mainSearch}
                            setHeirarchyIssue={this.props.setHeirarchyIssue}
                            originalSummaryItem = {this.state.originalSummaryItem}
                         />
                    :<></>
                }

                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
            </>
        )
    }

}

export default withTranslation()(withRouter(HierachyResolve));