import React ,{ Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Row, Col , Button , Modal } from 'react-bootstrap';
import { ArrowRightIcon } from '@primer/octicons-react';
import { confirmAlert } from 'react-confirm-alert';

import { submitCollection } from '../../../../../_services/submit.service';
import { submitSets } from '../../../../UiComponents/SubmitSets';
import { alertService } from '../../../../../_services/alert.service';
import { AcViewModal } from '../../../../UiComponents/AcImports';
import { AllProducts } from './allProducts';

import { ResolveItem } from '../resolveItemComponent';

import "./productsResolve.css";

export class ProductResolve extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.whitecontainer=React.createRef();
        this.state = {
            loading:false,
            allProducts:[], showAllProducts:false,
            temporarySelectedItems:[],
            selectAllChecked:false,

            customIssuesResolveList:[], selectedIssueIndex:-1, selectedIssueObj:null, showCustomIssues:false,
            selectedCollapseItems:[],
            scrollPosition:0,
            isCollapse:false,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
           this.loadAllProducts();
           this.setScrollPosition();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    setScrollPosition = () =>{
        setTimeout(() => {
            document.getElementById('main-modal-body').scrollTo(0,this.state.scrollPosition); //(this.props.scrollPosition ? this.props.scrollPosition :0);
        }, 0);
    }

    setProductResolveScrollPosition = (val) =>{
        if(val !== 0 && val){
            this.setState({scrollPosition:val});
        }
    }

    loadAllProducts = () =>{//Not using
        this.setState({showAllProducts:false, loading:true});
        let sobj = { 
            search: "", 
            isReqPagination: false, 
            importHierarchyIssueId: this.props.importHierarchyIssueId,
            isNeedUnResolvedProducts: true
        }
        submitSets(submitCollection.loadHierachyIssueProducts, sobj, true).then(res => {
            this.setState({loading:false});
            if (res && res.status && res.extra && typeof res.extra !== "string") {
                this.setState({allProducts:res.extra},()=>{
                    this.setState({showAllProducts:true});
                    this.setScrollPosition();
                });
            }
        });
    }
    
    settemporarySelectedProducts = (list) =>{
        this.setState({temporarySelectedItems:list});
    }

    AddProducts = () =>{
        let mainIssueObj = JSON.parse(JSON.stringify(this.props.originalIssueObj));
        let temaddedprods = this.state.temporarySelectedItems;
        
        if(temaddedprods.length>0){
            if(this.state.selectedIssueIndex === -1){
                let scatobj = mainIssueObj.sobj;
                scatobj.issueProducts = temaddedprods;

                let selobj ={
                    isAllFixed:false,
                    issueDepartment:mainIssueObj.mobj.issueDepartment,
                    issueCategory:mainIssueObj.mobj.issueCategory,
                    issueSubCategories:[scatobj],
                }

                let customIssuesResolveList = this.state.customIssuesResolveList;
                customIssuesResolveList.push(selobj);

                //set index
                let selindex = (customIssuesResolveList.length - 1);
                let selindexes = [];
                selindexes.push(selindex);

                this.setState({customIssuesResolveList:customIssuesResolveList, showCustomIssues:false, selectedCollapseItems:selindexes, isCollapse:true},()=>{
                    this.setState({showCustomIssues:true});
                });
                this.updateOriginalData(true);
            }
            else{
                let customissuelist = this.state.customIssuesResolveList;
                customissuelist[this.state.selectedIssueIndex].issueSubCategories[0].issueProducts = customissuelist[this.state.selectedIssueIndex].issueSubCategories[0].issueProducts.concat(temaddedprods);

                this.setState({customIssuesResolveList:customissuelist, showCustomIssues:false},()=>{
                    this.setState({showCustomIssues:true});
                    
                });
                this.updateOriginalData(true);
            }
        }
        else{
            alertService.warn(this.props.t("SELECT_PRODUCTS"));
        }
    }

    handleSelectAllProduct = (type) =>{
        let temaddedprods = this.state.temporarySelectedItems;
        let allprods = JSON.parse(JSON.stringify(this.state.allProducts));
        
        if(type || (temaddedprods.length !== allprods.length)){
            temaddedprods = allprods;
        } else{
            // allprods.concat(temaddedprods);
            temaddedprods = [];
        }

        this.setState({temporarySelectedItems:temaddedprods, selectAllChecked: type, showAllProducts:false }, () => { // allProducts:allprods, 
            this.setState({showAllProducts:true});
        });
    }

    updateOriginalData = (cleanSelectedItems) =>{
        let temaddedprods = this.state.temporarySelectedItems;
        let updatedOriginalData = [];
        for (const item of this.state.allProducts) {
            let avlidx = temaddedprods.findIndex(x => x.id ===item.id);
            if(avlidx === -1){
                updatedOriginalData.push(item);
            }
        }

        this.setState({allProducts:updatedOriginalData, showAllProducts:false}, ()=>{
            this.setState({showAllProducts:true});
            this.setScrollPosition();
            if(cleanSelectedItems===true){
                this.setState({temporarySelectedItems:[], selectAllChecked:false});
            }
        });
    }

    updateIssueItem = (obj, index, ischeckvalidity) => {
        let customIssueList = this.state.customIssuesResolveList;
        customIssueList[index] = obj;
        this.setState({customIssuesResolveList:customIssueList, showCustomIssues:false},()=>{
            //this.setState({showCustomIssues:true});
            this.checkValidity();
            this.setScrollPosition();
        });
    }

    deleteAddedProduct = (obj, issueIndex, pindex) =>{
        let customIssueList = this.state.customIssuesResolveList;
        customIssueList[issueIndex].issueSubCategories[0].issueProducts.splice(pindex,1);

        let allprods = this.state.allProducts;
        allprods.push(obj);

        this.setState({customIssuesResolveList:customIssueList, allProducts:allprods, showAllProducts:false, showCustomIssues:false, selectedIssueIndex:-1},()=>{
            this.setState({showAllProducts:true});//showCustomIssues:true
            this.checkValidity();
            this.setScrollPosition();
        });
    }

    deleteCustomIssue = (index) =>{
        confirmAlert({
            title: this.props.t("suretodelete"),
            message: this.props.t("SURETO_CONTINUE"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    let customIssueList = this.state.customIssuesResolveList;
                    let allprods = this.state.allProducts;
            
                    allprods = allprods.concat(customIssueList[index].issueSubCategories[0].issueProducts);
                    customIssueList.splice(index,1);
                    
                    //remove index
                    let col_indxAvl = false;
                    let selindexes = this.state.selectedCollapseItems;
                    for (const item of selindexes) {
                        if(index === item){
                            col_indxAvl = true;
                        }
                    }
                    if(col_indxAvl===true){
                        selindexes.splice(index,1);
                        this.setState({selectedCollapseItems : selindexes});
                    }
                    
                    this.setState({customIssuesResolveList:customIssueList, allProducts:allprods, showAllProducts:false, showCustomIssues:false, selectedIssueIndex:-1},()=>{
                        this.setState({showAllProducts:true});//showCustomIssues:true
                        this.checkValidity();
                        this.setScrollPosition();
                    });
                    
                }
            }, {
                label: this.props.t("btnnames.no")
            }],
        })
        
    }

    selectIssueForAddingProducts = (index) =>{
        if(index === this.state.selectedIssueIndex){
            this.setState({selectedIssueIndex:-1});
        }
        else{
            this.setState({selectedIssueIndex:index});
        }
    }

    checkValidity = () =>{
        let cuslist = this.state.customIssuesResolveList;
        let flatHierarchy = [];
        for (let i = 0; i < cuslist.length; i++) {
            cuslist[i].isAllFixed = false;
            
            //cats
            let departmentId = (cuslist[i].issueDepartment.departmentId ? cuslist[i].issueDepartment.departmentId : -1);
            let originDepartmentId = (cuslist[i].issueCategory.originDepartment ? cuslist[i].issueCategory.originDepartment.departmentId : -1);
            let categoryId = (cuslist[i].issueCategory.categoryId ? cuslist[i].issueCategory.categoryId : -1);
            let fe_catid = (cuslist[i].issueCategory.fe_categoryId );
            
            cuslist[i]["depCatValid"] = false;

            if(categoryId>0){
                if(categoryId!==fe_catid){
                    cuslist[i]["depCatValid"] = true;
                }
                else{
                    if(departmentId>0){
                        if((originDepartmentId===departmentId) || (originDepartmentId===-1)){
                            cuslist[i]["depCatValid"] = true;
                        }
                    }
                }
            }

            //subcats
            let svalidcount = 0;
            for (let x = 0; x < cuslist[i].issueSubCategories.length; x++) {
                let flatObj = {};
                let originCategoryId = ( cuslist[i].issueSubCategories[x].originCategory ?  cuslist[i].issueSubCategories[x].originCategory.categoryId: -1);
                let scatId = ( cuslist[i].issueSubCategories[x].subCategoryId ?  cuslist[i].issueSubCategories[x].subCategoryId : -1);
                let fe_scatid = cuslist[i].issueSubCategories[x].fe_subCategoryId;

                flatObj["depId"] = departmentId;
                flatObj["catId"] = categoryId;
                flatObj["scatId"] = scatId;
                flatObj["isCatIssue"] = false;
                flatObj["isScatIssue"] = false;

                if(originDepartmentId < 1 || originCategoryId < 1){
                    flatHierarchy.push(flatObj);
                }
                
                cuslist[i].issueSubCategories[x]["CatSubcatValid"] = false;

                if(scatId>0){
                    if(scatId!==fe_scatid){
                        svalidcount = (svalidcount + 1);
                        cuslist[i].issueSubCategories[x]["CatSubcatValid"] = true;
                    }
                    else{
                        if(categoryId>0){
                            if((originCategoryId === categoryId) || (originCategoryId === -1)){
                                svalidcount = (svalidcount + 1);
                                cuslist[i].issueSubCategories[x]["CatSubcatValid"] = true;
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

        for (let x = 0; x < cuslist.length; x++) {
            let issue = cuslist[x];
            for (const flatObj of flatHierarchy) {
                if(issue.issueCategory.categoryId === flatObj.catId
                    && issue.issueDepartment.departmentId === flatObj.depId
                    && flatObj.isCatIssue){
                        cuslist[x].depCatValid = false;
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
                            cuslist[x].issueSubCategories[y].CatSubcatValid = false;
                            break;
                    }
                }    
            }
        }

        /////////////////////////////////////////////////////////////////
        let hasValidItem = false;

        for (let a = 0; a < cuslist.length; a++) {
            let robj =  cuslist[a];
            if( cuslist[a].resolve_status !=="Resolved"){
                let subcatvalidcount = 0;
                for (const subcat of robj.issueSubCategories) {
                    if(subcat.CatSubcatValid===true){
                        subcatvalidcount = (subcatvalidcount+1);
                    }
                }
    
                if(robj.depCatValid===true && subcatvalidcount===robj.issueSubCategories.length){
                    cuslist[a].isAllFixed = true;
                    hasValidItem = true;
                }
            }
    
        }
        
        this.setState({customIssuesResolveList:cuslist, resolveBtnEnabled:hasValidItem, showCustomIssues:true});
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
    }

    confirmResolveIssues = () =>{
        confirmAlert({
            title: this.props.t("ARE_YOU_SURE_TO_RESOLVE"),
            message: this.props.t("SURETO_CONTINUE"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    this.resolveCustomIssues();              
                }
            }, {
                label: this.props.t("btnnames.no")
                
            }],
        })
        
    }

    resolveCustomIssues = () =>{
        let customissues = JSON.parse(JSON.stringify(this.state.customIssuesResolveList));

        let sendingissues = []; 
        //let prodnotaddedissues = false;
        for (let i = 0; i < customissues.length; i++) {
            if(customissues[i].isAllFixed===true){
                if(customissues[i].issueSubCategories[0] && customissues[i].issueSubCategories[0].issueProducts.length > 0){
                    customissues[i].issueSubCategories[0]["importHierarchyIssueId"] = -1;
    
                    sendingissues.push(customissues[i]);
                } else{
                    //prodnotaddedissues = true;
                }
            }
        }
        //console.log(sendingissues);

        if(sendingissues.length === 0){
            alertService.error(this.props.t("allissues_noprods"));
            return false;
        }
        
        let sobj = {
            catelogueImportId : this.props.catelogueImportId,
            hierachyIssues: sendingissues,
        }

        this.setState({loading:true});
        submitSets(submitCollection.resolveCustomHierachyIssue, sobj, true, null, true).then(res => {
            this.setState({loading:false});
            if (res && res.status) {
                alertService.success(this.props.t("successfully")+" "+this.props.t("saved"));

                //load heirarhy resolved list
                this.props.mainSearch(true);

                setTimeout(() => {
                    let selectedCatImport = { catelogueImportId: this.props.catelogueImportId };
                    this.props.setHeirarchyIssue(selectedCatImport);
                }, 1000);

                this.props.loadHierachyIssues();
                this.props.handleToggleProductResolveModal(-1);

            } else {
                // alertService.error(res.extra && res.extra !== ""? res.extra :this.props.t("erroroccurred"));
            }
        });
    }

    resetData = () =>{
        confirmAlert({
            title: this.props.t("ARE_YOU_SURE_TO_RESET"),
            message: this.props.t("SURETO_CONTINUE"),
            overlayClassName: (this.props.isRTL === "rtl" ? "alertrtl-content" : ""),
            buttons: [{
                label: this.props.t("btnnames.yes"),
                onClick: () => {
                    this.setState({customIssuesResolveList:[], allProducts:[], showAllProducts:false, showCustomIssues:false, selectedIssueIndex:-1},()=>{
                        this.loadAllProducts();              
                    });
                }
            }, {
                label: this.props.t("btnnames.no")
            }],
        })
        
    }

    setCollapseIndex = (index) =>{
        let selindexes = this.state.selectedCollapseItems;
        let avlIndex = selindexes.findIndex(x => x === index);

        if(avlIndex === -1){
            selindexes.push(index);
        }
        else{
            selindexes.splice(avlIndex, 1);
        }
        
        this.setState({selectedCollapseItems : selindexes},()=>{
            this.handleCollapseState();
        });
    }

    handleCollapse = () =>{
        if(this.state.isCollapse===false){
            let collapsearr = [];
            let customissuslength = (this.state.customIssuesResolveList.length);
    
            for (let i = 0; i < customissuslength; i++) {
                collapsearr.push(i);
            }
    
            this.setState({selectedCollapseItems : collapsearr, isCollapse:true});
        }
        else{
            this.setState({selectedCollapseItems : [], isCollapse:false});
        }
    }

    handleCollapseState = () =>{
        this.setState({
            isCollapse : (this.state.selectedCollapseItems.length> 0 ? true : false)
        });
    }

    render(){
        
        return(
            <>
                <Modal size='lg' show={this.props.showProductResolve} className={"hierachy-resolve-modal product-hierachy-resolve-modal "+(this.props.isRTL==="rtl" ? "RTL":"LTR")} onHide={ e => { this.props.toggleHierachyModal() }} backdrop="static" dir={this.props.isRTL} animation={false}>
                    <Modal.Header>
                        <Modal.Title>
                            {this.props.t("RESOLVE_HIERACHY")}
                        </Modal.Title>
                    </Modal.Header> 
                    <Modal.Body id="main-modal-body" onScroll={(e) => this.setProductResolveScrollPosition(e.target.scrollTop)}>
                        {
                            this.props.originalSummaryItem ?
                                <Col style={{padding:"0px 10px"}}>
                                    <CurrentConflictComponent 
                                        t={this.props.t}
                                        oriobj={this.props.originalSummaryItem}
                                    />
                                </Col>
                            :<></>
                        }
                        
                        {
                            this.state.showAllProducts === true? 
                            <>
                                <h6 className='section-title'>{this.props.t("productslist")}</h6>
                                <AllProducts 
                                    importHierarchyIssueId={this.props.importHierarchyIssueId} 
                                    t = {this.props.t}
                                    isRTL={this.props.isRTL}
                                    allProducts = {this.state.allProducts}
                                    temporarySelectedItems={this.state.temporarySelectedItems}
                                    settemporarySelectedProducts={this.settemporarySelectedProducts}
                                    AddProducts = {this.AddProducts}
                                    handleSelectAllProduct={this.handleSelectAllProduct}
                                    selectAllChecked={this.state.selectAllChecked}
                                />
                            </>
                            :<></>
                        }

                        {
                            this.state.customIssuesResolveList.length > 0?
                                <Col xs={12} className='bottomissue-list' >
                                    <h6 className='section-title'>
                                        {this.props.t("resolvelist")}
                                        <Button className='collapse-all-btn' onClick={()=>this.handleCollapse()}>
                                            {this.state.isCollapse===true ? this.props.t("HIDE_ALL"):this.props.t("COLLAPSE_ALL")}
                                        </Button>
                                    </h6>
                                    {
                                        this.state.customIssuesResolveList.map((issue,index) => {
                                            return(
                                                <Col xs={12} key={index}>
                                                <ResolveItem 
                                                    isProdResolve={true}
                                                    key={index} 
                                                    index={index}
                                                    departments={this.props.departments} 
                                                    issue={issue}
                                                    t={this.props.t}
                                                    isRTL={this.props.isRTL}
                                                    loadAllDepartments={this.props.loadAllDepartments}
                                                    updateAllDepartments={this.props.updateAllDepartments}
                                                    updateIssueItem={this.updateIssueItem}
                                                    setDepartmentsList={this.props.setDepartmentsList}
                                                    deleteAddedProduct={this.deleteAddedProduct}
                                                    deleteCustomIssue={this.deleteCustomIssue}
                                                    showCustomIssues ={this.state.showCustomIssues}
                                                    selectIssueForAddingProducts={this.selectIssueForAddingProducts}
                                                    selectedIssueIndex = {this.state.selectedIssueIndex}
                                                    setCollapseIndex={this.setCollapseIndex}
                                                    selectedCollapseItems = {this.state.selectedCollapseItems}

                                                    />
                                                </Col>
                                            )
                                        })
                                    }    
                                </Col>
                            :<></>
                        }

                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant='secondary' className='reset' onClick={()=>this.props.handleToggleProductResolveModal()}>{this.props.t('btnnames.close')}</Button>

                        {
                            this.state.mstatus!=="PlanigoCompleted" ? 
                            <>
                                <Button variant='warning' style={{background:"#FFBF00"}} onClick={()=>this.resetData()} >{this.props.t('btnnames.reset')}</Button>
                                <Button variant='success' disabled={!this.state.resolveBtnEnabled} onClick={()=>this.confirmResolveIssues()} >{this.props.t('CATELOGUE_FILTERS.resolve')}</Button>
                            </>
                            :<></>
                        }
                    </Modal.Footer>
                </Modal>
               
                <AcViewModal showmodal={this.state.loading} message={this.props.t('PLEASE_WAIT')}/>
                
            </>
        )
    }

}

export default withTranslation()(withRouter(ProductResolve));

function CurrentConflictComponent(props){
    return(
        <Row>
            <Col xs={12} className={"current-conflict-main "+(props.oriobj.depCatValid===false || props.oriobj.subCategoryObj.CatSubcatValid===false ?" invalid ":"")}>
                <Col className={'current-conflict-title '+(props.oriobj.depCatValid===false || props.oriobj.subCategoryObj.CatSubcatValid===false ?" invalid ":"")}>{props.t("CURRENTLY_OPEN_CONFLICTS")}</Col>
                <Row>
                    <Col className={'conflict-item '+(props.oriobj.depCatValid===false ?" invalid ":"")} xs={3}>
                        <div className='small-title'>{props.t("department")}</div>
                        <div className='value'>{props.oriobj.issueCategory.fe_departmentName}</div>
                    </Col>
                    <Col xs={1} className="arrow-col">
                        <ArrowRightIcon size={20} />
                    </Col>
                    <Col className={'conflict-item '+(props.oriobj.depCatValid===false ?" invalid ":"")} xs={3}>
                        <div className='small-title'>{props.t("category")}</div>
                        <div className='value'>{props.oriobj.issueCategory.fe_categoryName}</div>
                    </Col>
                    <Col xs={1} className="arrow-col">
                        <ArrowRightIcon size={20} />
                    </Col>
                    <Col className={'conflict-item '+(props.oriobj.subCategoryObj.CatSubcatValid===false ?" invalid ":"")} xs={4}>
                        <div className='small-title'>{props.t("subcategory")}</div>
                        <div className='value'>{props.oriobj.subCategoryObj.fe_subCategoryName}</div>
                    </Col>

                </Row>
            </Col>
        </Row>
    )
}