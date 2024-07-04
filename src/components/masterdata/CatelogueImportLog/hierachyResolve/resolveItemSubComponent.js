import { Component } from 'react';
import { withRouter,  } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Button , Row , Col , OverlayTrigger, Tooltip} from 'react-bootstrap';
import { PlusIcon , LinkExternalIcon, XCircleFillIcon, ListUnorderedIcon , CheckCircleFillIcon, XIcon, ChevronDownIcon} from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';
import Select from 'react-select';

import NoLongerValidLog from './noLongerValidLogModal';

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

export class ResolveSubItem extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)
        this.state = {
            loading:false,
            mobj:{catelogueImportId:-1, hierachyIssues:[]},

            showNolongerValidLogModal:false, issueImportId:-1,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.setSubcatNameonInit();
        }
    }

    setSubcatNameonInit = () =>{
        let subcatobj = this.props.subcat;
        // let subcats = [];

        if(subcatobj.fe_subCategoryId>0 && this.props.subcategoriesLoading===false){
             let avlindx = this.props.subCategoryList.findIndex(x => x.value === subcatobj.fe_subCategoryId);
            if(avlindx === -1){
                //set scat name
                subcatobj.subCategoryName = subcatobj.fe_subCategoryName;
                this.props.setSubcatNameOnInit(subcatobj,this.props.index );
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    //no longer valid
    toggleNoLongerValidLogModal = (id)=>{
        this.setState({issueImportId:(id ? id : -1)},()=>{
            this.setState({showNolongerValidLogModal:!this.state.showNolongerValidLogModal});
        });
    }

    render(){
        let subcatobj = this.props.subcat;
        let subcats = [];

        if(this.props.subcategoriesLoading===false){
            subcats[0] = {value:-1, label:"N/A"};
        }

        if(subcatobj.fe_subCategoryId>0 && this.props.subcategoriesLoading===false){
            let avlindx = this.props.subCategoryList.findIndex(x => x.value === subcatobj.fe_subCategoryId);
            if(avlindx === -1){
                subcats[1] = {value:subcatobj.fe_subCategoryId, label:subcatobj.fe_subCategoryName, color: "#ed327a73"};
            }
        }

        
        subcats = subcats.concat(this.props.subCategoryList);

        if(this.props.isProdResolve===true){//only when product resolve
            if(subcatobj.subCategoryId>0 && this.props.subcategoriesLoading===false){
                let avlindx = this.props.subCategoryList.findIndex(x => x.value === subcatobj.subCategoryId);
                if(avlindx === -1){
                    subcats.push({value:subcatobj.subCategoryId, label:subcatobj.subCategoryName, color: "#ed327a73"});
                }
            }
        }
        else{
            //set scat if is no longer available status is true
            if(this.props.issue.isNoLongerValid===true){
                if(this.props.subcat){
                    var isscatavl = subcats.findIndex(x => x.value === this.props.subcat.subCategoryId);
                    if(isscatavl === -1){
                        subcats.push({value:this.props.subcat.subCategoryId, label:this.props.subcat.subCategoryName});
                    }
                }
            }
        }


        //validations
        let isValid = false;
        let categoryId = (this.props.pcategoryId?this.props.pcategoryId:-1);
        // let originCategoryId = (this.props.subcat.originCategory ? this.props.subcat.originCategory.categoryId: -1);
        // let selSubcatId = (this.props.subcat.subCategoryId ? this.props.subcat.subCategoryId : -1);
       
        // if(selSubcatId>0){
        //     if(selSubcatId!==subcatobj.fe_subCategoryId){
        //         isValid = true;
        //     }
        //     else{
        //         if(categoryId>0){
        //             if((originCategoryId === categoryId) || (originCategoryId === -1)){
        //                 isValid = true;
        //             }
        //         }
        //     }
        // }
        isValid = (this.props.subcat.CatSubcatValid ? this.props.subcat.CatSubcatValid : false);
        
        return(
            <>
                <Row dir={this.props.isRTL}>
                    <Col xs={3} className={"validity-indicator "+(isValid===true ? " " :" invalid")+(this.props.index > 0?" short":"")}>
                        {isValid===true ? <CheckCircleFillIcon size={22} /> :<XCircleFillIcon size={22}/>}
                    </Col>
                    
                        <OverlayTrigger placement="top" overlay={<Tooltip className={"resolve-content-item-tooltip "+(this.props.subcat.subCategoryId>0?" ":" d-none")}><label></label>{(this.props.subcat.subCategoryName?this.props.subcat.subCategoryName:"N/A")}</Tooltip>}>
                            <Col xs={7} className={"content-item "+(isValid===true ? " " :" invalid")}>
                                    
                                        <h6 className='content-item-title'>
                                            {this.props.t("subcategory")}
                                            <div className={(this.props.isRTL==="rtl" ? "float-left":"float-right")}>
                                                <Button className={'d-inline add '+(categoryId>0 && this.props.pdepid>0 ? "" :" d-none")} onClick={() => this.props.handleScatModalToggle(false, null, this.props.subcat, this.props.index)}><PlusIcon size={11}/></Button>
                                                <Button className={'d-inline unlink '+(this.props.subsLength>1?"":"d-none")} onClick={()=>this.props.AddSubcategoryAsNewGroup(this.props.subcat, this.props.issueindex,this.props.index)}><LinkExternalIcon size={10}/></Button>
                                            </div>    
                                        </h6>
                                        <Select 
                                            options={subcats} 
                                            placeholder=""
                                            onChange={(e) => this.props.handleSubcategoryChange(e,this.props.index)}
                                            onFocus={()=>this.props.handleSubcategoryComboClick()}
                                            value={subcats.filter(option => option.value === this.props.subcat.subCategoryId)}
                                            classNamePrefix="hei-searchselect-inner" maxMenuHeight={200}
                                            menuPortalTarget={document.body}
                                            menuPosition="fixed"
                                            //styles={{menuPortal: (provided) => ({ ...provided, zIndex: 9999 }),menu: (provided) => ({ ...provided, zIndex: 9999 })}}
                                            styles={selectColorStyles}
                                            isLoading={this.props.subcategoriesLoading}
                                            isDisabled={this.props.resolved_st==="Resolved"?true:false}
                                        />

                                    
                            </Col>
                        </OverlayTrigger>
                        {!this.props.isProdResolve?
                            <Col xs={2} className="product-btn-col">
                                <Button className='d-inline list' onClick={()=>this.props.handleToggleProductsModal(this.props.subcat.importHierarchyIssueId)}><ListUnorderedIcon size={14}/></Button>
                                <Button className={'d-inline '+(this.props.issue.isNoLongerValid===true?"d-none":"")} disabled={this.props.resolved_st==="Resolved"?true:false} onClick={()=>this.props.handleToggleProductResolveModal(this.props.subcat.importHierarchyIssueId, this.props.issueindex, this.props.index)}><FeatherIcon size={14} icon="check-square"/></Button>
                                <Button className={'d-inline danger '+(this.props.issue.isNoLongerValid===true?"":"d-none")} onClick={()=>{this.toggleNoLongerValidLogModal(this.props.subcat.importHierarchyIssueId)}}><FeatherIcon size={18} icon="info"/></Button>
                            </Col>
                        :
                        <Col xs={2} className="product-btn-col resolvesel-btns">
                            <Button className='d-inline delete' onClick={()=>this.props.deleteCustomIssue(this.props.issueindex)}><XIcon size={16}/></Button>
                            <Button className='d-inline select' onClick={()=>this.props.selectIssueForAddingProducts(this.props.issueindex)}><FeatherIcon icon="plus" size={16}/></Button>
                            <Button className='collapse-btn' onClick={()=>this.props.setCollapseIndex(this.props.issueindex)}><ChevronDownIcon size={16}/></Button>
                        </Col>
                        }
                </Row>


                {this.state.showNolongerValidLogModal === true ? 
                    <NoLongerValidLog 
                        isRTL = {this.props.isRTL}
                        toggleNoLongerValidLogModal={this.toggleNoLongerValidLogModal} 
                        importHierarchyIssueId={this.state.issueImportId} 
                        issue={this.props.issue} 
                        subcat = {this.props.subcat}
                    />
                :<></>
            }
            </>
        )
    }

}

export default withTranslation()(withRouter(ResolveSubItem));