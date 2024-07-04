import React, { Component } from 'react';
import { Button, Col, Modal, Row, Tab } from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid'; //unique id

import { alertService } from '../../../../../_services/alert.service';
import { measureConverter, roundOffDecimal, convertUomtoSym } from '../../../../../_services/common.service';

import './addcatmodal.css';
import { TooltipWrapper } from '../../../AddMethods';

class AddCategoryModal extends Component {
    constructor(props){
        super(props);

        this._mainFieldDiv = React.createRef();
        this._isMounted = false;
        
        this.state = {
            activeTabKey: "fieldselect",
            selectedCategory: null, selectedSupplier: null,
            allSelectCategories: [], allSelectSuppliers: [],

            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%",
            fieldLevelObj: null, fieldEyeLevels: [],
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if (this._isMounted) {
            this.convertMDView();
            
            // divWidth: (this._mainFieldDiv && this._mainFieldDiv.current && this._mainFieldDiv.current.offsetWidth?(this._mainFieldDiv.current.offsetWidth - 50):0),
            // divHeight: (this._mainFieldDiv && this._mainFieldDiv.current && this._mainFieldDiv.current.offsetHeight?(this._mainFieldDiv.current.offsetHeight):0),

            this.setState({
                divWidth: 380,
                divHeight: 310,
            });
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    convertMDView = () => {
        let convlist = [];
        for (let i = 0; i < this.props.loadedCategoryList.length; i++) {
            const catitem = this.props.loadedCategoryList[i];
            convlist.push({ value: i, label: catitem.categoryName});
        }

        let suplist = [{ value: -1, label: "Any Supplier"}];
        for (let j = 0; j < this.props.loadedSuppliersList.length; j++) {
            const supitem = this.props.loadedSuppliersList[j];
            suplist.push({ value: j, label: supitem.supplier_name});
        }
        //console.log(convlist);
        this.setState({ allSelectCategories: convlist, allSelectSuppliers: suplist });
    }
    //change category select textbox
    handleCatFormChange=(type,e)=>{
        if(type === "category"){
            this.setState({selectedCategory: e});
        } else{
            this.setState({selectedSupplier: e});
        }
    }
    //handle save category details
    handleSaveCategory = (isupdate) => {
        if(this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0){
            let seleyelevel = this.state.fieldEyeLevels[0];
            if(!isupdate){
                let citem = this.props.loadedCategoryList[this.state.selectedCategory.value];
                let sitem = (this.state.selectedSupplier && this.state.selectedSupplier.value > -1?this.props.loadedSuppliersList[this.state.selectedSupplier.value]:null);
                //console.log(citem);
                this.props.handleAddCateory(citem, sitem, seleyelevel);
            } else{
                //update category field details
                let saveobj = JSON.parse(JSON.stringify(this.props.defSaveObj));

                let updatecobj = this.props.updateCategoryObj;
                let updateidxs = this.props.updateCatIdx;
                
                let selectedfield = this.props.loadDunitList.find(x => x.isSelected);
                
                // if(updatecobj.field_obj.field_id !== selectedfield.fieldId){
                    //field shelfs
                    let catcontains = [];
                    let checkFieldShelves = (selectedfield.fieldShelves?selectedfield.fieldShelves:selectedfield.shelf);
                    let newshelvelist = checkFieldShelves.map((xitem, xidx) => {
                        
                        catcontains.push({ id: uuidv4(), gap: xitem.gap, height: xitem.height, rank: xitem.rank, uom: xitem.uom});
                        
                        let iseyelevel = (seleyelevel?(seleyelevel.rank === xitem.rank):false)

                        return { id: -1, shelve_id: xitem.shelfId, gap: xitem.gap,
                            height: xitem.height, rank: xitem.rank,
                            reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                            isNew: true, isDelete: false,
                            isEyeLevel: iseyelevel
                        };
                    });
                    //new field object
                    let newfieldobj = {
                        id: -1,
                        field_id: (selectedfield.fieldId?selectedfield.fieldId:selectedfield.id),
                        field_width: selectedfield.width,
                        field_height: selectedfield.height,
                        field_depth: selectedfield.depth,
                        field_uom: selectedfield.uom,
                        field_shelves: newshelvelist,
                        isNew: true, isDelete: false
                    };

                    updatecobj.field_obj = newfieldobj;
                    
                    for (let j = 0; j < updatecobj.rects.length; j++) {
                        const rectitem = updatecobj.rects[j];
                        rectitem.contain_shelves = catcontains;
                    }

                    saveobj.categories[updateidxs.idx] = updatecobj;
                    
                    // console.log(saveobj);
                    this.props.updateFromChild(saveobj.categories);
                // } else{
                //     alertService.error(this.props.t("NO_CHANGES_AVAILABLE"));
                // }
                
                this.props.toggleCategoryModal();
            }
            
        } else{
            alertService.error(this.props.t("select_eye_level_to_continue"));
        }
        
    }

    handleModalReset = () => {
        this.setState({
            selectedCategory: null, selectedSupplier: null,
        }, () => {
            //if selected category available
            if(this.props.showcatiteminmodal){
                let selcatitem = this.props.showcatiteminmodal;
                let findcatidx = this.props.loadedCategoryList.findIndex(x => x.categoryId === selcatitem.categoryId);
                this.setState({ selectedCategory: { value: findcatidx, label: selcatitem.categoryName} });
            } 
            else if(this.props.isupdatecategory){
                let updatecatobj = this.props.updateCategoryObj;
                let notdeletedrectlist = updatecatobj.rects.filter(x => !x.isDelete);
                
                let findcatidx = this.props.loadedCategoryList.findIndex(x => x.categoryId === notdeletedrectlist[0].category.category_id);

                let findeyelevel = updatecatobj.field_obj.field_shelves.find(z => z.isEyeLevel);
                
                this.setState({ selectedCategory: { value: findcatidx, label: notdeletedrectlist[0].category.category_name}, 
                    fieldEyeLevels: (findeyelevel?[findeyelevel]:[])
                }, () => {
                    this.props.handleSelectfield({ fieldId: updatecatobj.field_obj.field_id });
                });
            }
        });
        this.props.handleSelectfield(null);
    }

    toggleActiveTab = (ctab) => {
        //validate category and field
        if(ctab === "fielddraw"){
            let selectedfield = this.props.loadDunitList.find(x => x.isSelected);
            
            if(this.state.selectedCategory && this.state.selectedCategory.value > -1){
                let selectedCategory = this.props.loadedCategoryList[this.state.selectedCategory.value];
                let selectedSupplier = (this.state.selectedSupplier && this.state.selectedSupplier.value > -1?this.props.loadedSuppliersList[this.state.selectedSupplier.value]:null);

                let cdefsaveobj = this.props.defSaveObj;
                let findalreadyadded = cdefsaveobj.categories.find(xitem => 
                    !xitem.isDelete &&
                    ((!selectedSupplier && !xitem.is_supplier_based && xitem.category_id === selectedCategory.categoryId) ||
                    (selectedSupplier && xitem.is_supplier_based && xitem.supplier_obj.supplier_id === selectedSupplier.supplier_id && xitem.category_id === selectedCategory.categoryId))
                );
                //console.log(findalreadyadded);
                if(!findalreadyadded){
                    if(selectedfield){
                        this.calcFieldObject(selectedfield);
                    } else{
                        alertService.error(this.props.t("selectfield"));
                        return false;
                    }
                } else{
                    alertService.error(this.props.t("catalreadyadded"));
                    return false;
                }
            } else{
                alertService.error(this.props.t("SELECT_CATEGORY"));
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
            if(this.props.isupdatecategory){
                this.handleSaveCategory(true)
            } else{
                this.handleSaveCategory()
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
    //select new field
    handleSelectfield = (field, isclick) => {
        this.setState({ fieldEyeLevels: [] }, () => {
            this.props.handleSelectfield(field);

            if(isclick){
                setTimeout(() => {
                    this.toggleActiveTab("fielddraw");
                }, 200);
            }
        });
    }

    render() {
        return (
            
                <Modal className={"MPselectCategory "+(this.props.isRTL === "rtl"?"rtl":"")} size="lg" centered show={this.props.isaddcatmodal} onShow={this.handleModalReset} onHide={()=>this.props.toggleCategoryModal()}>
                    <Modal.Body>
                        <Modal.Header closeButton>
                            <Modal.Title>{this.props.t("addnewcategory")}</Modal.Title>
                        </Modal.Header>

                        <Tab.Container activeKey={this.state.activeTabKey}>
                            <Tab.Content>
                                <Tab.Pane eventKey="fieldselect">
                                    <div className='fieldsdiv'>
                                        <div className='SelectCategory'>
                                            <div className='categoryselect'>
                                                <div className={this.props.isupdatecategory?'d-none':''} style={{width:"200px",margin:"0px 10px"}}>
                                                    <label style={{color: "#fff", marginBottom:"5px",fontWeight:"600"}}>{this.props.t("SELECT_CATEGORY")}</label>
                                                    <Select 
                                                        value={this.state.selectedCategory!==null?this.state.selectedCategory:""} 
                                                        placeholder={this.props.t('select')} 
                                                        className="filter-searchselect" 
                                                        classNamePrefix="searchselect-inner" 
                                                        options={this.state.allSelectCategories}  
                                                        autosize={false}  
                                                        onChange={(e)=>this.handleCatFormChange("category",e)} 
                                                    />
                                                </div>

                                                {/* <div style={{width:"200px",margin:"0px 10px"}}>
                                                    <label style={{color: "#fff", marginBottom:"5px",fontWeight:"600"}}>{this.props.t("suplable")}</label>
                                                    <Select 
                                                        value={this.state.selectedSupplier!==null?this.state.selectedSupplier:""} 
                                                        placeholder={this.props.t('select')} 
                                                        className="filter-searchselect" 
                                                        classNamePrefix="searchselect-inner" 
                                                        options={this.state.allSelectSuppliers}  
                                                        autosize={false}  
                                                        onChange={(e)=>this.handleCatFormChange("supplier",e)} 
                                                    />
                                                </div> */}
                                            </div>
                                            <Col xs={12} className="field">
                                                <label style={{color: "#fff", paddingBottom:"5px",fontWeight:"600",margin:"0px 10px"}}>{this.props.t("selectfield")}</label>

                                                <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                                    {(this.props.loadDunitList.length>0 ? this.props.loadDunitList.map((field, i) =>
                                                        <Col md={3} key={i}>
                                                            <Col className={"sub-item "+(field.isSelected?"active":"") } onClick={()=>this.handleSelectfield(field, true)}>
                                                                <Col xs={12} id={field.fieldId} style={{padding:"0px"}}>
                                                                    <Row>
                                                                        <Col xs={12} className="img-bg" style={{background:"#FFF", marginTop:"-5px", height:"70px"}}>
                                                                            <div className="thumb-div">
                                                                                <img key={i} className="img-fluid" src={field.fieldImgUrl} alt="" />
                                                                            </div>
                                                                        </Col>
                                                                        <Col xs={12} className="fieldName">
                                                                            <TooltipWrapper text={field.fieldName}><span>{field.fieldName.substring(0,22)+(field.fieldName.length > 22?"..":"")}</span></TooltipWrapper>
                                                                        </Col>
                                                                        
                                                                        <Col xs={4} className="field-value-title">{this.props.t("width")}</Col>
                                                                        <Col xs={4} className="field-value-title">{this.props.t("height")}</Col>
                                                                        <Col xs={4} className="field-value-title">{this.props.t("depth")}</Col>

                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.width,2)}{ field.uom }</Col>
                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.height,2)}{field.uom}</Col>
                                                                        <Col xs={4} className="field-value">{roundOffDecimal(field.depth,2)}{field.uom }</Col>
                                                                    </Row>
                                                                </Col>
                                                            </Col>
                                                        </Col>
                                                        ) : (<></>))}

                                                    {this.props.loadDunitList.length < this.props.fieldTotalCount?<Button className="load-more-btn" onClick={()=>this.props.loadMoreDunits()}>{this.props.t("btnnames.loadmore")}</Button>:<></>}
                                                </Row>
                                            </Col>
                                        </div>
                                    </div>
                                </Tab.Pane>
                                <Tab.Pane eventKey="fielddraw">
                                    <Col className='NDUrowStructuredraw fielddraw-view'>
                                        <label style={{marginTop:"8px"}}>{this.props.t("select_eye_level_to_continue")}</label>
                                        <div ref={this._mainFieldDiv} className="field-wrapper">

                                            {this.state.fieldLevelObj?<>
                                                <div className="measure-line vertical" dir="ltr" style={{width:this.state.viewWidth+3}}>
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
                    <Modal.Footer>
                        {this.state.activeTabKey === "fieldselect"?<>
                            {/* <Button className="btn-save-cat" onClick={()=>this.toggleActiveTab("fielddraw")}>{this.props.t("continue_btn")}</Button> */}
                        </>:<Col style={{padding: "0px", height: "30px"}}>
                            <Button variant="secondary" className='float-left btn-back-cat' onClick={()=>this.toggleActiveTab("fieldselect")}>{this.props.t("btnnames.back")}</Button>
                            {/* {this.props.isupdatecategory?<>
                                <Button className="btn-save-cat" onClick={()=>this.handleSaveCategory(true)}>{this.props.t("btnnames.updatecategory")}</Button>
                            </>:<>
                                <Button className="btn-save-cat" onClick={()=>this.handleSaveCategory()}>{this.props.t("btnnames.addnewcat")}</Button>
                            </>} */}
                            
                        </Col>}
                    </Modal.Footer>
        </Modal>
            
        );
    }
}

export default withTranslation()(withRouter(AddCategoryModal));