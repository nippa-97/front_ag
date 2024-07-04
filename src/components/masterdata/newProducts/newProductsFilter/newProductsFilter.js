import React, { Component } from 'react';
import { Button, ButtonGroup, Col, Dropdown, Form, Row } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Icons } from '../../../../assets/icons/icons';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import "./newProductsFilter.css";
import { ImageSource, MasterProductCompleteStatus, ProductFilterProductTypes, ProductSearchCritieriaTypes } from '../../../../enums/productsEnum';
import { ArrowBothIcon, XIcon } from '@primer/octicons-react';
import { isdiamentionfilterOn } from '../newproductCommen';
import {preventinputToString, preventinputotherthannumbers } from '../../../../_services/common.service';


class NewProductsFilter extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.state = {
            srcList: {"":"All", "gs1":"GS1", "direct":"Direct", "arigo":"Arigo"},
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // console.log(this.props.searchObj);
            this.setState({DepartmetList:this.props.DepartmetList});
        }
    }

    _handleKeyDown=(e)=> {
      
        if (e.key === 'Enter') {
          this.props.triggerrSearch();
        }else{
            preventinputToString(e,e.target.value,(this.props.t('Character.search_text')))
        }
    }

    getptypename=(type)=>{
        var name=""
        name=(type===ProductFilterProductTypes.ALL)?this.props.t("ALL"):type===ProductFilterProductTypes.NONE?this.props.t("NONE"):type===ProductFilterProductTypes.MVP?this.props.t("MVP"):type===ProductFilterProductTypes.ONTOP?this.props.t("ONTOP"):type===ProductFilterProductTypes.MVP_AND_ONTOP?this.props.t("MVPnOPNTOP"):""
        return name
    }
    //check filters applied
    checkFiltersApplied = () => {
        let searchObj = this.props.searchObj;
        //check any of filters added
        let moreFiltersAvl = (searchObj && (
            searchObj.moreFilter.swiches.isMandatory || searchObj.moreFilter.swiches.isNoos|| searchObj.moreFilter.swiches.isFavorite || searchObj.moreFilter.swiches.isPremium || searchObj.moreFilter.swiches.isOverride || searchObj.moreFilter.swiches.isStackable ||searchObj.moreFilter.swiches.isBlock|| searchObj.moreFilter.mappings.departmentId > 0 || searchObj.moreFilter.mappings.categoryId > 0 ||
            searchObj.moreFilter.mappings.subCategoryId > 0 || searchObj.moreFilter.mappings.brandId > 0 || searchObj.moreFilter.mappings.supplierId > 0 || searchObj.moreFilter.completeStatus!=="None" || 
            searchObj.moreFilter.imageSource !== "None" || searchObj.moreFilter.productTags.length > 0 || searchObj.moreFilter.productSource !== "" || searchObj.moreFilter.productMissingTypes.length > 0 || searchObj.moreFilter.productTypes !== ProductFilterProductTypes.ALL ||
            searchObj.moreFilter.shouldIgnoreHiddenDepartment || 
            ((searchObj.moreFilter.createdDateRange.fromDate && searchObj.moreFilter.createdDateRange.fromDate !== "") || (searchObj.moreFilter.createdDateRange.toDate && searchObj.moreFilter.createdDateRange.toDate !== "")) ||
            (searchObj.moreFilter.saleDateCount && searchObj.moreFilter.saleDateCount > 0) ||
            searchObj.moreFilter.displayTags.length > 0 || isdiamentionfilterOn(searchObj.moreFilter.dimensions)
        ));

        return moreFiltersAvl;
    }

    handleKeyDown = (event) => {
        if(!(/[0-9/]/.test(event.key) || parseInt(event.keyCode) === 8  || parseInt(event.keyCode) === 37 || parseInt(event.keyCode) === 39)){
            event.preventDefault();
        }
    }
    
    render() {
        let filterSubcategories = JSON.parse(JSON.stringify(this.props.subcategorylist));
        filterSubcategories[0] = {value:0, label:"All Subcategories"};

        let filterBrands = JSON.parse(JSON.stringify(this.props.brands));
        filterBrands[0] = {value:0, label:"All Brands"};

        let filterDepartments = this.props.DepartmetList? JSON.parse(JSON.stringify(this.props.DepartmetList)):[];
        filterDepartments[0] = {value:-1, label:this.props.t("ALL")};

        let filtercategoryList = this.props.categoryList?JSON.parse(JSON.stringify(this.props.categoryList)):[];
        filtercategoryList[0] = {value:-1, label:this.props.t("ALL")};

        let filterSubcategoryList = this.props.subCategoryList?JSON.parse(JSON.stringify(this.props.subCategoryList)):[];
        filterSubcategoryList[0] = {value:-1, label:this.props.t("ALL")};

        var ProductType = Object.keys(ProductFilterProductTypes).map(x => {
            return <option key={x} value={ProductFilterProductTypes[x]}>{this.getptypename(ProductFilterProductTypes[x])}</option>
        });

        const srclist = Object.keys(this.state.srcList).map((x) => {
            return <option key={x} value={x}>{(x === ""?this.props.t("CatelogImportLogStatus.All"):x === "direct"?this.props.t("DIRECT"):this.state.srcList[x])}</option>;
        });

        var Imagesource = Object.keys(ImageSource).map(x => {
            return <option key={x} value={ImageSource[x]}>{(ImageSource[x]==="None"?this.props.t("ALL"):ImageSource[x]==="Custom"?this.props.t("custom"):ImageSource[x]==="Default"?this.props.t("default"):ImageSource[x])}</option>
        });

        let filterBrnadList = JSON.parse(JSON.stringify(this.props.brandsList));
        filterBrnadList[0] = {value:-1, label:this.props.t("ALL")};

        let filterSupplierList = JSON.parse(JSON.stringify(this.props.supplierList));
        filterSupplierList[0] = {value:-1, label:this.props.t("ALL")};

        let moreFiltersAvl = this.checkFiltersApplied();
        let searchObj = this.props.searchObj;

        return (
            <Col className="newproducts-filters-main">
                <Col className="newproducts-filters">
                    <Col xs={8} className="sub-design">
                        <Col className="custom-filters form-inline">
                            <label className="filter-label search_title">{this.props.t('FREE_SEARCH')}</label>
                            <span className='searchSec'>
                            <Form.Control 
                                className='searchfield'
                                placeholder={this.props.t("searchproduct")} 
                                onChange={(e) => this.props.changeFilters("freeSearchValue",e.target.value,null,null,this.props.t('Character.search_text'),e)}  
                                value={searchObj.freeSearchValue}
                                onKeyDown={this._handleKeyDown}
                                style={{width:"300px"}} 
                                />
                            {Icons.SearchIcon("#4F4F4F",14)}
                            </span>

                            <Dropdown className='morefilterbtn' show={this.props.isdropdownopen} onToggle={(isOpen, e, metadata) => this.props.onToggleHandler(isOpen, e, metadata)}>
                                <Dropdown.Toggle variant="outline-primary" size='sm' id="dropdown-basic">
                                    {this.props.t("MORE_FILTERS")}
                                        {moreFiltersAvl===true ?<div className='red-dot-more-filters'></div>:<></>}
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                    <Col xs={12} className="form-subcontent">
                                        <Col xs={12} className="form-section">
                                            <Row style={{marginTop:"0px"}}>
                                                <Col  className={"rtlcon "+(this.props.isRTL==="rtl"?"":"sepbox")} xs={this.props.size==="sm" ? 6 : 3}>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isMandatory" id="filter-isMandatory" label={this.props.t('IS_MANDATORY')}
                                                            checked={searchObj.moreFilter.swiches.isMandatory}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isMandatory, "isMandatory")}
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isNoos" id="filter-isNoos" label={this.props.t('isnoos')}
                                                            checked={searchObj.moreFilter.swiches.isNoos}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isNoos, "isNoos")}
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isFavorite" id="filter-isFavorite" label={this.props.t('isfav')}
                                                            checked={searchObj.moreFilter.swiches.isFavorite}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isFavorite, "isFavorite")}
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isPremium" id="filter-isPremium" label={this.props.t('ispremium')}
                                                            checked={searchObj.moreFilter.swiches.isPremium}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isPremium, "isPremium")} 
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="Override" id="filter-Override" label={this.props.t('manualOverride')}
                                                            checked={searchObj.moreFilter.swiches.isOverride}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isOverride, "isOverride")}
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isStackable" id="filter-isStackable" label={this.props.t('IS_stackable')}
                                                            checked={searchObj.moreFilter.swiches.isStackable}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isStackable, "isStackable")}
                                                                />
                                                    </Col>
                                                    <Col className="">
                                                            <Form.Check type="checkbox" name="isBlock" id="filter-isBlock" label={this.props.t('IS_BLOCK')}
                                                            checked={searchObj.moreFilter.swiches.isBlock}  onChange={()=>this.props.handleFilterSwitchChange(!searchObj.moreFilter.swiches.isBlock, "isBlock")}
                                                                />
                                                    </Col>
                                                    <Col>
                                                        <label>{this.props.t('product_type')}</label>
                                                        <br />
                                                        <Form.Control style={{width:"100%"}} as="select" value={searchObj.moreFilter.productTypes}   onChange={e => this.props.handleFilterObjectdropdown(e,"productTypes","click")}>
                                                            {ProductType}
                                                        </Form.Control>
                                                    </Col>
                                                </Col>
                                                <Col className="sepbox rtlcon" xs={this.props.size==="sm" ? 6 : 3}>
                                                    <Col style={{marginBottom: "20px"}}>
                                                        <label>{this.props.t('completeStatus')}</label>
                                                        <Form.Control style={{width:"100%"}} as="select" value={searchObj.moreFilter.completeStatus} onChange={e => this.props.handleFilterObjectdropdown(e,"completeStatus","click")}>
                                                            <option  value={MasterProductCompleteStatus.None}>{this.props.t("CatelogImportLogTypes.Other")}</option>
                                                            <option  value={MasterProductCompleteStatus.FullData}>{this.props.t("FULL_DATA")}</option>
                                                            <option  value={MasterProductCompleteStatus.DataMissing}>{this.props.t("DATA_MISSING")}</option>
                                                        </Form.Control>
                                                    </Col>

                                                    {this.props.missingtypes.map((item, i) => {
                                                        return <React.Fragment key={i}>
                                                            {!item.isProdType?<Col className="">
                                                                <Form.Check type="checkbox" name={item.Name} label={this.props.t("missingtypes."+item.Name)} id={"missingtype-"+i} disabled={searchObj.moreFilter.completeStatus!=="None"?true:false}
                                                                    checked={item.isCheck}  onChange={()=>this.props.handleMissingSwitchChange(item)}
                                                                    />
                                                            </Col>:<></>}
                                                        </React.Fragment>
                                                    })}
                                                    <hr />
                                                    <Col >
                                                        <label>{this.props.t('product_source')}</label>
                                                        <Form.Control style={{width:"100%"}} as="select" value={searchObj.moreFilter.productSource} onChange={e => this.props.handleFilterObjectdropdown(e,"productSource","click")}>
                                                            {srclist}
                                                        </Form.Control>
                                                    </Col>
                                                    <Col >
                                                        <label>{this.props.t('imageSource')}</label>
                                                        <br />
                                                        <Form.Control style={{width:"100%"}} as="select"  value={searchObj.moreFilter.imageSource} onChange={e => this.props.handleFilterObjectdropdown(e,"imageSource","click")}>
                                                            {Imagesource}
                                                        </Form.Control>
                                                    </Col>
                                                </Col>
                                                <Col className="sepbox rtlcon" xs={this.props.size==="sm" ? 6 : 3}>
                                                    <Col className="">
                                                        <Form.Check type="checkbox" name={this.props.t("is_hiddendepartment")} id="ishiddendept-check" label={this.props.t("is_hiddendepartment")}
                                                            checked={searchObj.moreFilter.shouldIgnoreHiddenDepartment}  onChange={()=>this.props.handleFilterObjectdropdown(!searchObj.moreFilter.shouldIgnoreHiddenDepartment,"shouldIgnoreHiddenDepartment")}
                                                            />
                                                    </Col>
                                                    <hr />
                                                    <Col className="">
                                                        <label>{this.props.t('department')}</label>
                                                        <Select 
                                                            placeholder={this.props.t("department")} 
                                                            options={filterDepartments} 
                                                            onChange={(e) => this.props.toggleDepCatSubCatFilter(e,"departmentId","dep")} 
                                                            value={filterDepartments.filter(option => option.value === searchObj.moreFilter.mappings.departmentId)} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}    
                                                            />
                                                    </Col>
                                                    <Col >
                                                    <label>{this.props.t('category')}</label>
                                                        <Select 
                                                            placeholder={this.props.t("category")} 
                                                            options={filtercategoryList} 
                                                            onChange={(e) => this.props.toggleDepCatSubCatFilter(e,"categoryId","cat")} 
                                                            value={filtercategoryList.filter(option => option.value === searchObj.moreFilter.mappings.categoryId)} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}  
                                                            />
                                                    </Col>
                                                    <Col >
                                                    <label>{this.props.t('subcategory')}</label>
                                                        <Select 
                                                            placeholder={this.props.t("subcategory")} 
                                                            options={filterSubcategoryList} 
                                                            onChange={(e) => this.props.toggleDepCatSubCatFilter(e,"subCategoryId","subcat")} 
                                                            value={filterSubcategoryList.filter(option => option.value === searchObj.moreFilter.mappings.subCategoryId)} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}    
                                                            />
                                                    </Col>
                                                    <Col >
                                                    <label>{this.props.t('brand')}</label>
                                                        <Select 
                                                            placeholder={this.props.t("brand")} 
                                                            options={filterBrnadList} 
                                                            onChange={(e) =>  this.props.toggleDepCatSubCatFilter(e,"brandId","click")} 
                                                            value={filterBrnadList.filter(option => option.value === searchObj.moreFilter.mappings.brandId)} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}    
                                                            />
                                                    </Col>
                                                    <Col >
                                                    <label>{this.props.t('suplable')}</label>
                                                        <Select 
                                                            placeholder={this.props.t("suplable")} 
                                                            options={filterSupplierList} 
                                                            onChange={(e) =>  this.props.toggleDepCatSubCatFilter(e,"supplierId","click")} 
                                                            value={filterSupplierList.filter(option => option.value === searchObj.moreFilter.mappings.supplierId)} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}    
                                                            />
                                                    </Col>
                                                </Col>
                                                <Col className={""+(this.props.isRTL==="rtl"?"rtlcon sepbox":"")} xs={this.props.size==="sm" ? 6 : 3}>
                                                    {this.props.missingtypes.map((item, i) => {
                                                        return <React.Fragment key={i}>
                                                            {item.isProdType?<Col className="">
                                                                <Form.Check type="checkbox" name={item.Name} id={"missingtype-"+i} label={this.props.t("missingtypes."+item.Name)}  disabled={searchObj.moreFilter.completeStatus!=="None"?true:false}
                                                                    checked={item.isCheck}  onChange={()=>this.props.handleMissingSwitchChange(item)}
                                                                    />
                                                            </Col>:<></>}
                                                        </React.Fragment>
                                                    })}
                                                    <hr />
                                                    <Col className="diemntiondiv">
                                                        <Col>
                                                            <label>{this.props.t('width')+" ("+this.props.t("MM")+")"}</label>
                                                            <ButtonGroup aria-label="Basic example">
                                                                <Button variant="secondary" title={this.props.t("equal")} active={(searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                                    onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Equal,"width","",true)}>=</Button>
                                                                <Button variant="secondary" title={this.props.t("range")} className='selector' active={(searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                                    onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Range,"width","",true)}><ArrowBothIcon size={12} /></Button>
                                                            </ButtonGroup>
                                                        </Col>
                                                        <div className="filter-diamention-box">
                                                            <Row>
                                                                <Col >
                                                                    {searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>} 
                                                                    <Form.Control placeholder='Min'  type="number"  value={searchObj.moreFilter.dimensions.width.lowerBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"width","lbound",false,e,(searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range?(this.props.t('Character.min_width')):(this.props.t('Character.width'))))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,(searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range?(this.props.t('Character.min_width')):(this.props.t('Character.width')))) } />
                                                                </Col>
                                                                {(searchObj.moreFilter.dimensions.width.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                                    <label>{this.props.t('MAX')}</label><br />
                                                                    <Form.Control placeholder='MAX'  type="number"  value={searchObj.moreFilter.dimensions.width.upperBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"width","ubound",false,e,this.props.t('Character.max_width'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,(this.props.t('Character.max_width'))) } />
                                                                </Col>:<></>}
                                                            </Row>
                                                        </div>
                                                    </Col>
                                                    <Col className="diemntiondiv">
                                                        <Col>
                                                            <Col> 
                                                                <label>{this.props.t('height')+" ("+this.props.t("MM")+")"}</label>
                                                                <ButtonGroup aria-label="Basic example">
                                                                    <Button variant="secondary" title={this.props.t("equal")} active={(searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                                        onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Equal,"height","",true)}>=</Button>
                                                                    <Button variant="secondary" title={this.props.t("range")} className='selector' active={(searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                                        onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Range,"height","",true)}><ArrowBothIcon size={12} /></Button>
                                                                </ButtonGroup>
                                                            </Col>
                                                    
                                                            <div className="filter-diamention-box">
                                                                <Row>
                                                                    <Col >
                                                                    {searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>}
                                                                    <Form.Control placeholder='Min'  type="number"  value={searchObj.moreFilter.dimensions.height.lowerBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"height","lbound",false,e,((searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_height'):this.props.t('Character.height'))))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,((searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_height'):this.props.t('Character.height'))) )} />
                                                                    </Col>
                                                                    {(searchObj.moreFilter.dimensions.height.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                                    <label>{this.props.t('MAX')}</label><br />
                                                                    <Form.Control placeholder='Max'  type="number"  value={searchObj.moreFilter.dimensions.height.upperBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"height","ubound",false,e,this.props.t('Character.max_height'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,(this.props.t('Character.max_height'))) } />
                                                                    </Col>:<></>}
                                                                </Row>
                                                            </div>
                                                        </Col>
                                                    </Col>
                                                    <Col className="diemntiondiv">
                                                        <Col>
                                                        <Col> <label>{this.props.t('depth')+" ("+this.props.t("MM")+")"}</label>
                                                            <ButtonGroup aria-label="Basic example">
                                                                <Button variant="secondary" title={this.props.t("equal")} active={(searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Equal)?true:false}
                                                                onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Equal,"depth","",true)}>=</Button>
                                                                <Button variant="secondary" title={this.props.t("range")} className='selector' active={(searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range)?true:false} 
                                                                onClick={() => this.props.handleDiamentions(ProductSearchCritieriaTypes.Range,"depth","",true)}><ArrowBothIcon size={12} /></Button>
                                                            </ButtonGroup>
                                                            </Col>
                                                    
                                                            <div className="filter-diamention-box">
                                                                <Row>
                                                                    <Col >
                                                                    {searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Equal?<></>:<label>{this.props.t('MIN')}</label>}
                                                                    <Form.Control placeholder='Min'  type="number"  value={searchObj.moreFilter.dimensions.depth.lowerBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"depth","lbound",false,e,(searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_depth'):this.props.t('Character.depth')))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,(searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range?this.props.t('Character.min_depth'):this.props.t('Character.depth'))) } />
                                                                    </Col>
                                                                    {(searchObj.moreFilter.dimensions.depth.searchCriteria===ProductSearchCritieriaTypes.Range)?<Col style={{}}>
                                                                    <label>{this.props.t('MAX')}</label><br />
                                                                    <Form.Control placeholder='Max'  type="number"  value={searchObj.moreFilter.dimensions.depth.upperBound} onFocus={e => e.target.select()} onChange={e => this.props.handleDiamentions(e.target.value,"depth","ubound",false,e,this.props.t('Character.max_depth'))} onKeyDown={ (evt) => preventinputotherthannumbers(evt,evt.target.value,(this.props.t('Character.max_depth'))) }/>
                                                                    </Col>:<></>}
                                                                </Row>
                                                            </div>
                                                        </Col>
                                                    </Col>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Col>
                        
                                    <Col xs={12} className="form-subcontent" >
                                        <Col xs={12} className="form-section">
                                            <Row style={{marginTop:"0px"}}>
                                                <Col xs={this.props.size==="sm" ? 6 : 4} className="filterdate-content">
                                                    <label className='datecontent-label'>{this.props.t("filter_datetype.range")}</label>
                                                    <Row>
                                                        <Col>
                                                            <small>{this.props.t('CATELOGUE_FILTERS.from')}</small>
                                                            <DatePicker
                                                                dateFormat="dd/MM/yyyy"
                                                                placeholderText={"DD/MM/YYYY"}
                                                                popperPlacement="bottom-start"
                                                                showYearDropdown
                                                                className="datepicker-txt"
                                                                selected={searchObj.moreFilter.createdDateRange.fromDate}
                                                                onChange={(e)=>this.props.handleFilterObjectdropdown(e, "fromDate", true, "createdDateRange")}
                                                                onKeyDown={this.handleKeyDown}
                                                                />
                                                        </Col>
                                                        <Col>
                                                            <small>{this.props.t('CATELOGUE_FILTERS.todate')}</small>
                                                            <DatePicker
                                                                dateFormat="dd/MM/yyyy"
                                                                placeholderText={"DD/MM/YYYY"}
                                                                popperPlacement="bottom-start"
                                                                showYearDropdown
                                                                className="datepicker-txt"
                                                                selected={searchObj.moreFilter.createdDateRange.toDate}
                                                                onChange={(e)=>this.props.handleFilterObjectdropdown(e, "toDate", true, "createdDateRange")}
                                                                onKeyDown={this.handleKeyDown}
                                                                />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={this.props.size==="sm" ? 6 : 2} className="filter-tagslist">
                                                    <label className='datecontent-label'>{this.props.t("filter_datetype.count")}</label>
                                                    <Row>
                                                        <Col className='form-inline'>
                                                            <small>{this.props.t('filter_datetype.backdays')}</small>
                                                            <Form.Control type="number"  value={searchObj.moreFilter.saleDateCount} onFocus={e => e.target.select()} onChange={e => this.props.handleFilterObjectdropdown(e, "saleDateCount", false, null, true)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,evt.target.value,(this.props.t('Character.saleDateCount'))) } />
                                                        </Col>
                                                    </Row>
                                                </Col>
                                                <Col xs={6} className="filter-tagslist">
                                                    <Col className='filtertags-formcontent'>
                                                        <label>{this.props.t('tags')}</label>
                                                        <Select 
                                                            menuPlacement="top"
                                                            placeholder={this.props.t("Select_tags")} 
                                                            options={this.props.tagList} 
                                                            onChange={e => this.props.handleTags(e)} 
                                                            value={-1} 
                                                            className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                                            maxMenuHeight={200}      
                                                            />
                                                    </Col>

                                                    <ul className='list-inline mpsim-tags prodftags'>
                                                        {searchObj.moreFilter.displayTags.map((xitem, xidx) => {
                                                            return <li key={xidx} className='list-inline-item prod-tags' title={xitem.tagName}>
                                                                <span className='close-icon' style={{opacity:this.state.selectedBranchidx>0?"0.3":"1"}} onClick={() => this.props.removeTag(xidx)}><XIcon size={16} /></span>
                                                                {xitem.tagName.substring(0,25)+(xitem.tagName.length > 25?"..":"")}
                                                            </li>
                                                        })}
                                                    </ul>
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Col>
                                    <Button className="filterbtn search d-inline" onClick={(e) => this.props.changeFilters("searchbtn",e.target.value, false, true)}>{this.props.t("btnnames.search")}</Button>
                                    <Button variant='outline-secondary' className="filterbtn Resetbtn d-inline" onClick={()=>this.props.resetFilters()}>{this.props.t("btnnames.reset")}</Button>
                                </Dropdown.Menu>
                            </Dropdown>

                            <span className='showResult'>
                                <label className="filter-label">{this.props.t("SHOW_RESULTS")}</label>
                                <Form.Control style={{width:"60px"}} type="number"  value={this.props.maxShowresultcount} onChange={e => this.props.handleShowingresults(e)} onKeyDown={ (evt) => evt.key === "."?evt.preventDefault(): preventinputotherthannumbers(evt,this.props.maxShowresultcount,(this.props.t('Character.results'))) } />
                            </span>
                            <Button variant='warning' className='search-link filter-btn' onClick={(e) => this.props.changeFilters("searchbtn",e.target.value, false, true)} size='sm'>{this.props.t("btnnames.search")}</Button>
                            <Button variant='outline-secondary' className='filter-btn Resetbtn' onClick={()=>this.props.resetFilters()} size='sm'>{this.props.t("btnnames.reset")}</Button>     
                        </Col>
                    </Col>

                </Col>
            </Col>
        );
    }
}


export default  withTranslation()(withRouter(NewProductsFilter));
