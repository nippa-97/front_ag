import React, { Component } from 'react';
import { Row, Col, Button, ButtonGroup, Modal, Tab } from 'react-bootstrap'; //Dropdown
import FeatherIcon from 'feather-icons-react';
import Select from 'react-select';
import { v4 as uuidv4 } from 'uuid'; //unique id
// import { NoteIcon } from '@primer/octicons-react';

import { catRectEnums, catRuleEnums } from '../../../../enums/masterPlanogramEnums';

import CustomProgressBar from '../../../common_layouts/customProgressBar';
import { alertService } from '../../../../_services/alert.service';
import { measureConverter, roundOffDecimal, convertUomtoSym, checkColorIsLight } from '../../../../_services/common.service';
import { RuleWarningValidations } from '../../AddMethods';

import { getNameorIdorColorofBox } from '../../AddMethods';

/**
 * #MP-RUL-01
 * Rules manage view
 *
 * @export
 * @class MPRulesAdd
 * @extends {Component}
 */
export default class MPRulesAdd extends Component {
    constructor(props){
        super(props);

        this._mainFieldDiv = React.createRef();
        this._isMounted = false;
        
        this.state = {
            viewtype: "sup",

            isaddfieldmodal: false, selectedField: null, selectedRuleIdx: null,

            activeTabKey: "fieldselect",
            divWidth: 0, divHeight: 0, displayUOM: "cm", displayRatio: 0,
            svgwidth: "100%",
            fieldLevelObj: null, fieldEyeLevels: [],

            selectSubRectList: [], defaultSelectRect: null,
            isChangesAvailable: false,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            this.setState({
                divWidth: 380,
                divHeight: 310,
            });

            if(this.props.viewtype === "brand"){
                this.loadSubCatRectList();
            }
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    //load sub category rects list for select
    loadSubCatRectList = () => {
        let rectlist = []; let defselectitem = null;
        if(this.props.selectedSubCat && this.props.selectedSubCat.rects){
            let cursubcat = this.props.selectedSubCat;
            //let issubsupbased = (cursubcat?cursubcat.type === catRectEnums.rule:false);
            let cursubcatname = (cursubcat?getNameorIdorColorofBox(cursubcat,"name"):"-");

            for (let i = 0; i < this.props.selectedSubCat.rects.length; i++) {
                rectlist.push({ value: i, label:  (cursubcatname + " - " + (i+1)) });

                if(i === 0){
                    defselectitem = { value: i, label: (cursubcatname + " - " + (i+1)) };
                }
            }
        }

        this.setState({ selectSubRectList: rectlist, defaultSelectRect: defselectitem });
    }
    //MP-RUL-03 change 
    changeAreaHandler = (selectobj, selecttype) => {
        let selectviewobj = null;
        if(selecttype === "sup"){
            let allsuplist = this.props.loadedSuppliersList;
            selectviewobj = allsuplist[selectobj.value];

            //console.log(selectviewobj);
        } else if(selecttype === "cat"){
            let allcatlist = this.props.loadedCategoryList;
            selectviewobj = allcatlist[selectobj.value];

        } else if(selecttype === "scat"){
            let allscatlist = this.props.loadedSubCatList;
            selectviewobj = allscatlist[selectobj.value];

        } else if(selecttype === "brand"){
            let allbrandlist = this.props.loadedBrandsList;
            selectviewobj = allbrandlist[selectobj.value];
        }

        this.handleRulesAdd(selecttype, selectviewobj);
    }
    // #MP-RUL-04
    handleRulesAdd = (type, selectviewobj) => {
        let cdefsaveobj = JSON.parse(JSON.stringify(this.props.defSaveObj));

        let newfieldobj = null;
        if(this.props.viewtype === "cat"){
            let notdeletedcatlist = cdefsaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
            // let isruledeleted = false;
            
            //new field rule obj
            let newrectobj = {
                id: uuidv4(),
                category: null,
                box_width_percentage: 0,
                contain_shelves: [],
                type: catRectEnums.rule,
                isNew: true, isDelete: false,
                rule: {},
                sub_categories: []
            }

            if(type === "sup"){
                //find already added
                let issupadded = false;
                for (let i = 0; i < cdefsaveobj.categories.length; i++) {
                    const catrecitem = cdefsaveobj.categories[i];
                    if(!catrecitem.isDelete && !catrecitem.is_unallocated_view){
                        let checkissupadded = catrecitem.rects.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && 
                            z.rule.level === catRuleEnums.sup && getNameorIdorColorofBox(z,"num") === selectviewobj.supplier_id));

                        if(checkissupadded > -1){
                            issupadded = true;
                        }
                    }
                }
                
                if(!issupadded){
                    let ruleobj = (selectviewobj?{
                        id: uuidv4(), level: catRuleEnums.sup,
                        isShelfRule: false,
                        supplier: { supplierId: selectviewobj.supplier_id, supplierName: selectviewobj.supplier_name, color: "#dc3545" },
                        isNew: true, isDelete: false,
                    }:null);

                    newrectobj.rule = ruleobj;
                    
                } else{
                    alertService.error(this.props.t("ALREADY_ADDED"));
                    return false;
                }
            } 
            else if(type === "cat"){
                //find already added
                let iscatadded = false;
                for (let i = 0; i < cdefsaveobj.categories.length; i++) {
                    const catrecitem = cdefsaveobj.categories[i];
                    if(!catrecitem.isDelete && !catrecitem.is_unallocated_view){
                        let checkiscatadded = catrecitem.rects.findIndex(z => (!z.isDelete &&
                            getNameorIdorColorofBox(z,"num") === selectviewobj.categoryId));
                        //z.rule.level === catRuleEnums.cat &&  z.type === catRectEnums.rule && 

                        if(checkiscatadded > -1){
                            iscatadded = true;
                        }
                    }
                }
                
                if(!iscatadded){
                    let catcontains = []; 
                    if(selectviewobj.field){
                        let newshelvelist = selectviewobj.field.shelf.map((xitem, xidx) => {

                            catcontains.push({ id: uuidv4(), gap: xitem.gap, height: xitem.height, rank: xitem.rank, uom: xitem.uom});

                            return { id: -1, shelve_id: xitem.id, gap: xitem.gap,
                                height: xitem.height, rank: xitem.rank,
                                reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                                isNew: true, isDelete: false,
                                isEyeLevel: xitem.isEyeLevel
                            };
                        });

                        newfieldobj = {
                            id: -1,
                            field_id: selectviewobj.field.id,
                            field_width: selectviewobj.field.width,
                            field_height: selectviewobj.field.height,
                            field_depth: selectviewobj.field.depth,
                            field_uom: selectviewobj.field.uom,
                            field_shelves: newshelvelist,
                            isNew: true, isDelete: false
                        };
                    }
                    
                    let ruleobj = (selectviewobj?{
                        id: uuidv4(), level: catRuleEnums.cat,
                        isShelfRule: false,
                        category: { categoryId: selectviewobj.categoryId, categoryName: selectviewobj.categoryName, color: selectviewobj.categoryColor },
                        isNew: true, isDelete: false,
                    }:null);

                    newrectobj.rule = ruleobj;
                    newrectobj.contain_shelves = catcontains;
                    
                } else{
                    alertService.error(this.props.t("ALREADY_ADDED"));
                    return false;
                }
            }
            else if(type === "scat"){
                //find already added
                let issupadded = false;
                for (let i = 0; i < cdefsaveobj.categories.length; i++) {
                    const catrecitem = cdefsaveobj.categories[i];
                    if(!catrecitem.isDelete && !catrecitem.is_unallocated_view){
                        let checkissupadded = catrecitem.rects.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && 
                            z.rule.level === catRuleEnums.subcat && getNameorIdorColorofBox(z,"num") === selectviewobj.subCategoryId));

                        if(checkissupadded > -1){
                            issupadded = true;
                        }
                    }
                }
                
                if(!issupadded){
                    let ruleobj = (selectviewobj?{
                        id: uuidv4(), level: catRuleEnums.subcat,
                        isShelfRule: false,
                        sub_category: { subCategoryId: selectviewobj.subCategoryId, subCategoryName: selectviewobj.subCategoryName, color: selectviewobj.subCategoryColor },
                        isNew: true, isDelete: false,
                    }:null);

                    newrectobj.rule = ruleobj;
                    
                } else{
                    alertService.error(this.props.t("ALREADY_ADDED"));
                    return false;
                }
            }
            else if(type === "brand"){
                //find already added
                let issupadded = false;
                for (let i = 0; i < cdefsaveobj.categories.length; i++) {
                    const catrecitem = cdefsaveobj.categories[i];
                    if(!catrecitem.isDelete && !catrecitem.is_unallocated_view){
                        let checkissupadded = catrecitem.rects.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && 
                            z.rule.level === catRuleEnums.brand && getNameorIdorColorofBox(z,"num") === selectviewobj.brandId));

                        if(checkissupadded > -1){
                            issupadded = true;
                        }
                    }
                }
                
                if(!issupadded){
                    let ruleobj = (selectviewobj?{
                        id: uuidv4(), level: catRuleEnums.brand,
                        isShelfRule: false,
                        brand: { brandId: selectviewobj.brandId, brandName: selectviewobj.brandName, color: selectviewobj.brandColor },
                        isNew: true, isDelete: false,
                    }:null);

                    newrectobj.rule = ruleobj;
                    
                } else{
                    alertService.error(this.props.t("ALREADY_ADDED"));
                    return false;
                }
            }

            let catnewobj = { 
                id: uuidv4(), 
                isNew: true, isDelete: false, field_obj: newfieldobj, 
                rank: (notdeletedcatlist.length + 1),
                rects: [newrectobj]
            };
            
            cdefsaveobj.categories.push(catnewobj);
            //console.log(cdefsaveobj);
            
            this.props.updateFromChild(cdefsaveobj.categories, true, false, false);
            this.setState({ isChangesAvailable: true });

            setTimeout(() => {
                this.scrollTolDivBottom();
            }, 100);
        } else if(this.props.viewtype === "scat"){
            let selectedCategory = this.props.selectedCategory;
            let selectedCatRect = this.props.selectedCatRect;
            let isalreadyadded = -1;

            //new rule obj
            let rulemdid = -1;
            let ruleobj = {
                id: uuidv4(), level: null,
                supplier: {}, sub_category: {}, brand: {},
                isNew: true, isDelete: false,
            }

            if(type === "sup"){
                ruleobj.level = catRuleEnums.sup;
                ruleobj.supplier = { supplierId: selectviewobj.supplier_id, supplierName: selectviewobj.supplier_name, color: "#dc3545" };

                isalreadyadded = selectedCatRect.sub_categories.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && z.rule.level === catRuleEnums.sup && getNameorIdorColorofBox(z, "num") === selectviewobj.supplier_id));
                rulemdid = selectviewobj.supplier_id;
            } 
            else if(type === "brand"){
                ruleobj.level = catRuleEnums.brand;
                ruleobj.brand = { brandId: selectviewobj.brandId, brandName: selectviewobj.brandName, color: selectviewobj.brandColor };

                isalreadyadded = selectedCatRect.sub_categories.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && z.rule.level === catRuleEnums.brand && getNameorIdorColorofBox(z, "num") === selectviewobj.brandId));
                rulemdid = selectviewobj.brandId;
            }

            if(isalreadyadded === -1){
                let catnewobj = { 
                    id: uuidv4(), 
                    isNew: true, isDelete: false,
                    sub_category: null,
                    rule: ruleobj,
                    type: catRectEnums.rule,
                    rects: []
                };

                let findruleadded = RuleWarningValidations("scat", cdefsaveobj, rulemdid, selectedCategory.id, selectedCatRect.id, null, true, ruleobj.level);
                // console.log(findruleadded);
                catnewobj["isRuleParentAdded"] = findruleadded.isAdded;
                catnewobj["isRuleParentList"] = findruleadded.addedRuleList;
                // console.log(catnewobj);

                if(findruleadded.isAdded){
                    alertService.warn(this.props.t("THIS_SCAT_IS_ALREADY_ADDED_RULE")+(" "+this.props.t("category")));
                    return false;
                }
    
                selectedCatRect.sub_categories.push(catnewobj);
                //console.log(firstrectobj);

                this.props.updateFromChild(selectedCatRect.sub_categories, null, true, catnewobj, true, false, false);
                this.setState({ isChangesAvailable: true });
                setTimeout(() => {
                    this.scrollTolDivBottom();
                }, 100);
            } else{
                alertService.error(this.props.t("ALREADY_ADDED"));
            }

        } else if(this.props.viewtype === "brand"){
            
            let selectedCatRect = this.props.selectedCatRect;
            let selectedSubCat = this.props.selectedSubCat;

            let findsubcidx = selectedCatRect.sub_categories.findIndex(z => z.id === selectedSubCat.id);
            let subcatobj = selectedCatRect.sub_categories[findsubcidx];

            let selectedrectobj = this.state.defaultSelectRect;
            let firstrectobj = subcatobj.rects[selectedrectobj.value];
            
            let isalreadyadded = -1;
            
            //new rule obj
            let ruleobj = {
                id: uuidv4(), level: null,
                supplier: {}, sub_category: {}, brand: {},
                isNew: true, isDelete: false,
            }

            if(type === "sup"){
                ruleobj.level = catRuleEnums.sup;
                ruleobj.supplier = { supplierId: selectviewobj.supplier_id, supplierName: selectviewobj.supplier_name, color: "#dc3545" };

                isalreadyadded = firstrectobj.brands.findIndex(z => (!z.isDelete && z.type === catRectEnums.rule && z.rule.supplier.supplierId === selectviewobj.supplier_id));
            } 
            
            if(isalreadyadded === -1){
                let catnewobj = { 
                    id: uuidv4(), 
                    isNew: true, isDelete: false,
                    brand: null,
                    rule: ruleobj,
                    type: catRectEnums.rule,
                    rects: []
                };
    
                firstrectobj.brands.push(catnewobj);
                //console.log(firstrectobj);

                this.props.updateFromChild(selectedCatRect.sub_categories, null, true);
                //reset rect select box
                this.setState({ defaultSelectRect: this.state.selectSubRectList[0], isChangesAvailable: true });
                setTimeout(() => {
                    this.scrollTolDivBottom();
                }, 100);
            } else{
                alertService.error(this.props.t("ALREADY_ADDED"));
            }
        }
        
    }
    //toggle open rule field select modal
    toggleAddFieldModal = (ruleidx, ruleitem) => {
        
        let selectefield = null; 
        let selectedeyelevel = [];

        let issubcatsavailable = false;
        let notdeletedrectlist = (ruleitem && ruleitem.rects?ruleitem.rects.filter(x => !x.isDelete):[]);

        if(!this.state.isaddfieldmodal){
            if(ruleitem && ruleitem.field_obj){
                
                for (let i = 0; i < notdeletedrectlist.length; i++) {
                    const catrectitem = notdeletedrectlist[i];
                    if(!catrectitem.isDelete && catrectitem.sub_categories.length > 0){
                        issubcatsavailable = true;
                    }
                }

                selectefield = this.props.loadDunitList.find(x => x.fieldId === ruleitem.field_obj.field_id);
                let shelveeyelevel = ruleitem.field_obj.field_shelves.find(x => x.isEyeLevel);

                if(shelveeyelevel){
                    selectedeyelevel.push(shelveeyelevel);
                }
            }
        }
        
        if(notdeletedrectlist.length === 1){
            if(!issubcatsavailable){
                this.setState({ 
                    isaddfieldmodal: !this.state.isaddfieldmodal, selectedRuleIdx: ruleidx,
                    activeTabKey: "fieldselect", fieldLevelObj: null, selectedField: selectefield, fieldEyeLevels: selectedeyelevel
                }); 
            } else{
                alertService.error(this.props.t("subcategories_available_in_rects"));
            }
        } else if(notdeletedrectlist.length > 1){
            alertService.error(this.props.t("multiple_category_boxes_available"));
        } else{
            this.setState({ 
                isaddfieldmodal: !this.state.isaddfieldmodal, selectedRuleIdx: ruleidx,
                activeTabKey: "fieldselect", fieldLevelObj: null, selectedField: selectefield, fieldEyeLevels: selectedeyelevel
            });
        }
    }

    handleModalReset = () => {
        /* this.setState({ selectedField: null, activeTabKey: "fieldselect", fieldLevelObj: null, selectedField: selectefield, fieldEyeLevels: selectedeyelevel  }); */
    }

    handleSelectfield = (fieldobj, isclick) => {
        this.setState({ selectedField: fieldobj, fieldEyeLevels: [] }, () => {
            this.toggleActiveTab("fielddraw");
        });
    }
    // #MP-RUL-05
    updateRuleDataUpdate = (selectidx, rectidx, type, value) => {
        let cdefsaveobj = JSON.parse(JSON.stringify(this.props.defSaveObj));

        let updateitem = cdefsaveobj.categories[selectidx];
        let updaterect = updateitem.rects[rectidx];

        let viewtype = ((updaterect.rule && !updaterect.rule.isShelfRule)?"percentage":"shelves");

        if(viewtype !== value){
            if(value === "shelves"){
                updateitem["field_obj"] = null;

                updaterect["box_width_percentage"] = 0;
                updaterect["percentage"] = 0;
                updaterect["contain_shelves"] = [];

                updaterect.rule["isShelfRule"] = true;
                
                this.handleSaveRemoveField(false, false, selectidx, updateitem);
            } else{
                //if change it to percentage
                let newrectobj = JSON.parse(JSON.stringify(updaterect));

                newrectobj["id"] = uuidv4();
                newrectobj["box_width_percentage"] = 0;
                newrectobj["percentage"] = 0;
                newrectobj["contain_shelves"] = []; 
                newrectobj["isNew"] = true;
                newrectobj["isDelete"] = false;

                //reset rule object
                newrectobj.rule["id"] = uuidv4();
                newrectobj.rule["isShelfRule"] = false;

                //remove sub categories if available
                if(newrectobj.sub_categories && newrectobj.sub_categories.length > 0){
                    for (let j = 0; j < newrectobj.sub_categories.length; j++) {
                        const nsubitem = newrectobj.sub_categories[j];
                        nsubitem["isDelete"] = true;
                    }
                }
                
                //remove from current category
                if(updateitem.rects[rectidx].isNew){
                    updateitem.rects.splice(rectidx,1);
                } else{
                    updateitem.rects[rectidx]["isDelete"] = true;
                }

                //check not deleted rect count again for set field shelves
                let checknotdeletedagain = updateitem.rects.filter(x => !x.isDelete);
                //if its equal one set all rects to the one rect
                if(checknotdeletedagain.length === 1){
                    let findleftitemidx = updateitem.rects.findIndex(x => !x.isDelete);
                    let newcontaishelves = [];
                    for (let i = 0; i < updateitem.field_obj.field_shelves.length; i++) {
                        const shelfitem = updateitem.field_obj.field_shelves[i];

                        let shelveobj = { rank : shelfitem.rank, height : shelfitem.height , gap : shelfitem.gap, uom : shelfitem.uom };
                        newcontaishelves.push(shelveobj);        
                    }
                    updateitem.rects[findleftitemidx]["contain_shelves"] = newcontaishelves;
                }

                let notdeletedrectlist = ((updateitem.rects && updateitem.rects.length > 0)?updateitem.rects.filter(x => !x.isDelete):[]);
                if(notdeletedrectlist.length === 0){
                    if(updateitem.isNew){
                        cdefsaveobj.categories.splice(selectidx,1);
                    } else{
                        updateitem["isDelete"] = true;
                    }
                }
                
                let availablecatitems = cdefsaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);

                let catnewobj = { 
                    id: uuidv4(), 
                    isNew: true, isDelete: false, field_obj: null, 
                    rank: (availablecatitems.length + 1),
                    rects: [newrectobj]
                };
                
                cdefsaveobj.categories.push(catnewobj);
                
                this.props.updateFromChild(cdefsaveobj.categories);
            }
        }
    }

    handleSaveRemoveField = (isaddfield, isremove, selecidx, selectitem, rectidx) => {
        if(this.props.viewtype === "cat"){
            let cdefsaveobj = JSON.parse(JSON.stringify(this.props.defSaveObj));

            if(isaddfield){
                let selectedfield = this.state.selectedField;
                
                if(selectedfield){
                    let selectedeyelevel = (this.state.fieldEyeLevels && this.state.fieldEyeLevels.length > 0?this.state.fieldEyeLevels[0]:false);

                    if(selectedeyelevel){
                        let catcontains = [];
                        let newshelvelist = selectedfield.fieldShelves.map((xitem, xidx) => {

                            catcontains.push({ id: uuidv4(), gap: xitem.gap, height: xitem.height, rank: xitem.rank, uom: xitem.uom});

                            let iseyelevel = (selectedeyelevel?(selectedeyelevel.rank === xitem.rank):false)

                            return { id: -1, shelve_id: xitem.shelfId, gap: xitem.gap,
                                height: xitem.height, rank: xitem.rank,
                                reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                                isNew: true, isDelete: false,
                                isEyeLevel: iseyelevel
                            };
                        });

                        let newfieldobj = {
                            id: -1,
                            field_id: selectedfield.fieldId,
                            field_width: selectedfield.width,
                            field_height: selectedfield.height,
                            field_depth: selectedfield.depth,
                            field_uom: selectedfield.uom,
                            field_shelves: newshelvelist,
                            isNew: true, isDelete: false
                        };

                        let selectedcat = cdefsaveobj.categories[this.state.selectedRuleIdx];
                        selectedcat["field_obj"] = newfieldobj;

                        for (let j = 0; j < selectedcat.rects.length; j++) {
                            const rectitem = selectedcat.rects[j];
                            if(!rectitem.isDelete && rectitem.type === catRectEnums.rule){
                                rectitem["contain_shelves"] = catcontains;
                            }
                        }

                        this.props.updateFromChild(cdefsaveobj.categories);
                        if(!isremove){
                            this.toggleAddFieldModal();
                        }
                    } else{
                        alertService.error(this.props.t("select_eye_level_to_continue"));
                    }
                } else{
                    alertService.error(this.props.t("selectfield"));
                }    
            } else{
                if(isremove){
                    let ccategoryitem = cdefsaveobj.categories[selecidx];
                    //if available more than one rect
                    let notdeletedrectlist = ccategoryitem.rects.filter(x => !x.isDelete);

                    let crectitem = ccategoryitem.rects[rectidx];
                    
                    if(this.props.isDrawEnabled){
                        if(this.props.selectedDrawCategory && crectitem.id === this.props.selectedDrawCategory.id){
                            alertService.error(this.props.t("close_shelvedrawview_first"));
                            return false;
                        }
                    }
                    
                    if(notdeletedrectlist.length > 1){
                        
                        if(!crectitem.isNew){
                            crectitem["isDelete"] = true;
                        } else{
                            ccategoryitem.rects.splice(rectidx,1);
                        }  
                        //check not deleted rect count again for set field shelves
                        let checknotdeletedagain = ccategoryitem.rects.filter(x => !x.isDelete);
                        //if its equal one set all rects to the one rect
                        if(checknotdeletedagain.length === 1){
                            let findleftitemidx = ccategoryitem.rects.findIndex(x => !x.isDelete);
                            let ccatrectitem = ccategoryitem.rects[findleftitemidx];
                            let newcontaishelves = [];
                            for (let i = 0; i < ccategoryitem.field_obj.field_shelves.length; i++) {
                                const shelfitem = ccategoryitem.field_obj.field_shelves[i];

                                let shelveobj = { rank : shelfitem.rank, height : shelfitem.height , gap : shelfitem.gap, uom : shelfitem.uom, category_id: ccategoryitem.id };
                                newcontaishelves.push(shelveobj);        
                            }
                            ccatrectitem["contain_shelves"] = newcontaishelves;
                        }

                    } else{
                        if(!ccategoryitem.isNew){
                            ccategoryitem["isDelete"] = true;
                        } else{
                            cdefsaveobj.categories.splice(selecidx,1);
                        }    
                    }
                } else{
                    cdefsaveobj.categories[selecidx] = selectitem;
                }   
                
                this.props.updateFromChild(cdefsaveobj.categories, isremove, false, isremove);
                /* if(!isremove){
                    this.toggleAddFieldModal();
                } */
            }    

        } else if(this.props.viewtype === "scat"){
            let selectedCatRect = this.props.selectedCatRect;
            
            if(isremove){
                let selectedRemoveitem = selectedCatRect.sub_categories[selecidx];
                if(!selectedRemoveitem.isNew){
                    selectedRemoveitem["isDelete"] = true;
                } else{
                    selectedCatRect.sub_categories.splice(selecidx,1);
                }
            } else{

            }

            this.props.updateFromChild(selectedCatRect.sub_categories, null, false, null, isremove, false);
        }
        
    }
    //toggle rules view type
    changeViewType = (ctype) => {
        this.setState({ viewtype: ctype });
    }
    toggleActiveTab = (ctab) => {
        //validate category and field
        if(ctab === "fielddraw"){
            let selectedfield = this.state.selectedField;
            
            if(selectedfield){
                this.calcFieldObject(selectedfield);
            } else{
                alertService.error(this.props.t("selectfield"));
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
        this.setState({ fieldLevelObj: exportfield }); //fieldEyeLevels: []
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
            this.handleSaveRemoveField(true);
        });
    }
    //change selected sub cat rect
    handleChangeSubRect = (selitem) => {
        this.setState({ defaultSelectRect: selitem });
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
    //div scroll to bottom
    scrollTolDivBottom = () => {
        var scrollDiv = document.getElementById("portionscroll-content");
        scrollDiv.scrollTop = scrollDiv.scrollHeight;
    }

    render() {

        let curcatrect = this.props.selectedCatRect;
        let cursubcat = this.props.selectedSubCat;
        
        let selectedDraw = this.props.selectedDraw;
        
        return (<>
            <Col className="mp-suppliersadd">
                <Col className="sub-content">
                    <Row>
                        <Col xs={12} md={5} className="col-xxl-6">
                            <ul className='list-inline supplier-switch'>
                                <li className={'list-inline-item'+(this.state.viewtype === "sup"?" active":"")} onClick={() => this.changeViewType("sup")}><h5>{this.props.t("suppliers")}</h5></li>

                                {this.props.viewtype === "cat"?<>
                                    <li className={'list-inline-item'+(this.state.viewtype === "cat"?" active":"")} onClick={() => this.changeViewType("cat")}><h5>{this.props.t("categories")}</h5></li>
                                    <li className={'list-inline-item'+(this.state.viewtype === "scat"?" active":"")} onClick={() => this.changeViewType("scat")}><h5>{this.props.t("sub_categories")}</h5></li>
                                </>:<></>}

                                {this.props.viewtype === "cat" || this.props.viewtype === "scat"?<>
                                    <li className={'list-inline-item'+(this.state.viewtype === "brand"?" active":"")} onClick={() => this.changeViewType("brand")}><h5>{this.props.t("brands")}</h5></li>
                                </>:<></>}
                            </ul>

                            {this.props.viewtype === "brand"?<>
                                <Col className='dynamic-search' style={{marginTop:"15px"}}>
                                    <label className='title-text'>{this.props.t("SELECT_RECT")}</label>
                                    <Select options={this.state.selectSubRectList}  
                                        onChange={(e) => this.handleChangeSubRect(e)}
                                        value={this.state.defaultSelectRect}
                                        className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                        components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                                </Col>
                            </>:<></>}
                            
                            {this.state.viewtype === "cat"?<Col className='dynamic-search'>
                                <Select placeholder={this.props.t('dynamic_search')} options={this.props.selectCategoryList} 
                                    onChange={(e) => this.changeAreaHandler(e, "cat")} 
                                    value={null}
                                    className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                    components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                            </Col>
                            :this.state.viewtype === "scat"?<Col className='dynamic-search'>
                                <Select placeholder={this.props.t('dynamic_search')} options={this.props.selectSubCatList} 
                                    onChange={(e) => this.changeAreaHandler(e, "scat")} 
                                    value={null}
                                    className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                    components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                            </Col>
                            :this.state.viewtype === "brand"?
                            <Col className='dynamic-search'>
                                <Select placeholder={this.props.t('dynamic_search')} options={this.props.selectBrandsList} 
                                    onChange={(e) => this.changeAreaHandler(e, "brand")} 
                                    value={null}
                                    className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                    components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                            </Col>
                            :<Col className='dynamic-search' style={this.props.viewtype === "brand"?{marginTop:"15px"}:{}}>
                                {this.props.viewtype === "brand"?<><label className='title-text'>{this.props.t("suplable")}</label></>:<></>}
                                <Select placeholder={this.props.t('dynamic_search')} options={this.props.selectSupplierList} 
                                    onChange={(e) => this.changeAreaHandler(e, "sup")} 
                                    value={null}
                                    className="filter-searchselect" classNamePrefix="searchselect-inner" 
                                    components={{ IndicatorSeparator: () => null }} maxMenuHeight={120} required />
                            </Col>}
                        </Col>
                        <Col className='percentage-content sub-cat-prg-bars' style={{padding: "10px 8px"}}>
                            <Row>
                                <Col xs={8} className="title-col">{this.props.t("EDIT_PORTION")}</Col>
                                <Col xs={2} className="title-col"></Col>
                                <Col xs={2} className="title-col">{this.props.t("pr")}</Col>
                            </Row>   

                            <Col id="portionscroll-content" className="scroll-content">
                                {this.props.viewtype === "cat"?<>
                                    {this.props.defSaveObj && this.props.defSaveObj.categories?<>
                                        {this.props.defSaveObj.categories.map((xitem, xidx) => {
                                            return <React.Fragment key={xidx}>
                                                {!xitem.isDelete && !xitem.is_unallocated_view?<>
                                                    {xitem.rects.map((ritem, ridx) => {
                                                        let isrulebased = (ritem.type === catRectEnums.rule);
                                                        let ispercentage = (ritem.rule && !ritem.rule.isShelfRule);

                                                        let cfullnametxt = getNameorIdorColorofBox(ritem, "name");
                                                        let catrectname = getNameorIdorColorofBox(ritem, "name").substring(0,15)+(getNameorIdorColorofBox(ritem, "name").length > 15?"..":"");
                                                        let ccatcolor = (getNameorIdorColorofBox(ritem, "color")?getNameorIdorColorofBox(ritem, "color"):"rgb(237, 50, 122)");
                                                        let cscattxtcolor = (checkColorIsLight(ccatcolor)?(this.props.dmode?"#29b485":"#5128a0"):isrulebased?ccatcolor:"white");

                                                        if(ritem.type === catRectEnums.rule){
                                                            catrectname = (catrectname+" - "+(ritem.rule?ritem.rule.level.substring(0,3):"-").toUpperCase());
                                                        }
                                                        
                                                        return <React.Fragment key={ridx}>
                                                            {(!ritem.isDelete && ritem.type === catRectEnums.rule)?
                                                                <Col xs={12} className="single-percentage">
                                                                    <Row>
                                                                        <Col xs={8} style={this.props.isRTL === "rtl"?{padding:"0px",paddingRight:"35px"}:{padding:"0px",paddingLeft:"35px"}}>
                                                                            <span className='remove-link' onClick={() => this.handleSaveRemoveField(false, true, xidx, null, ridx)}><FeatherIcon icon="x" size={16} /></span>
                                                                            <CustomProgressBar showtooltip={true} fulltext={cfullnametxt} text={catrectname} mainbarcolor={ccatcolor} isborder={true} mainbarpercentage={ritem.percentage} textcolor={cscattxtcolor} showsubbar={false} />
                                                                        </Col>
                                                                        <Col xs={2} className="links-col">
                                                                            <ButtonGroup>
                                                                                {ispercentage?<Button variant="primary" onClick={() => this.toggleAddFieldModal(xidx, xitem)} size="sm">
                                                                                    {/* <NoteIcon size={16} /> */}
                                                                                    <FeatherIcon icon="file-text" size={16} />
                                                                                </Button>
                                                                                :<>
                                                                                    {this.props.isDrawEnabled && ritem.id === this.props.selectedDrawCategory.id?<>
                                                                                        <Button variant="warning" onClick={() => this.props.toggleDrawShelveView(false)} size="sm"><FeatherIcon icon="check" size={16} /></Button>
                                                                                        <Button variant="danger" onClick={() => this.props.removeSelectShelve()} size="sm"><FeatherIcon icon="x" size={12} /></Button>
                                                                                    </>:<>
                                                                                        <Button variant="primary" onClick={() => this.props.toggleDrawShelveView(true, ritem, xidx, ridx)} size="sm"><FeatherIcon icon="layout" size={16} /></Button>
                                                                                    </>}
                                                                                </>}
                                                                            </ButtonGroup>
                                                                        </Col>
                                                                        <Col xs={2} className="val-col">{ritem.percentage && ritem.percentage > 0?roundOffDecimal(ritem.percentage,2):0}%</Col>
                                                                        <Col xs={12}>
                                                                            <ul className='list-inline bottom-subtxt'>
                                                                                <li onClick={() => this.updateRuleDataUpdate(xidx, ridx, "data_type", "percentage")} className={'list-inline-item'+(ispercentage?" active":"")}>{this.props.t("percentage")}</li>
                                                                                {/* <li className='list-inline-item'>{this.props.t("fields")}</li> */}
                                                                                <li onClick={() => this.updateRuleDataUpdate(xidx, ridx, "data_type", "shelves")} className={'list-inline-item'+(!ispercentage?" active":"")}>{this.props.t("shelves")}</li>
                                                                            </ul>
                                                                        </Col>
                                                                    </Row>
                                                                </Col>        
                                                            :<></>}
                                                        </React.Fragment>;
                                                    })}
                                                </>:<></>}
                                            </React.Fragment>;
                                        })}
                                    </>:<></>}    
                                </>:<></>}
                                
                                {this.props.viewtype === "scat"?<>
                                    {curcatrect && curcatrect.sub_categories?<>
                                        {curcatrect.sub_categories.map((xitem, xidx) => {
                                            let issubrulebased = (xitem.type === catRectEnums.rule);
                                            let cfullscatname = getNameorIdorColorofBox(xitem,"name");
                                            let subcatname = (getNameorIdorColorofBox(xitem,"name").substring(0,15)+(getNameorIdorColorofBox(xitem,"name").length > 15?"..":""));
                                            let cscatcolor = (getNameorIdorColorofBox(xitem,"color")?getNameorIdorColorofBox(xitem,"color"):"#dc3545");
                                            let cscattxtcolor = (checkColorIsLight(cscatcolor)?(this.props.dmode?"#29b485":"#5128a0"):issubrulebased?cscatcolor:"white");

                                            if(xitem.type === catRectEnums.rule){
                                                subcatname = (subcatname+" - "+(xitem.rule?xitem.rule.level.substring(0,3):"-").toUpperCase());
                                            }
                                            
                                            return <React.Fragment key={xidx}>
                                                {(!xitem.isDelete && issubrulebased)?
                                                    <Col xs={12} className="single-percentage sub-view">
                                                        <Row>
                                                            <Col xs={8} style={this.props.isRTL === "rtl"?{padding:"0px",paddingRight:"35px"}:{padding:"0px",paddingLeft:"35px"}}>
                                                                <span className='remove-link' onClick={() => this.handleSaveRemoveField(false, true, xidx)}><FeatherIcon icon="x" size={16} /></span>
                                                                <CustomProgressBar showtooltip={true} fulltext={cfullscatname} text={subcatname} mainbarcolor={cscatcolor} isborder={true} mainbarpercentage={xitem.percentage} textcolor={cscattxtcolor} showsubbar={false} />
                                                            </Col>
                                                            <Col xs={2} className="links-col">
                                                                <ButtonGroup>
                                                                    <Button variant="primary" className='action-btn' onClick={e => this.props.handleSelectDraw(xitem)} size="sm" active={(selectedDraw && selectedDraw.id === xitem.id?true:false)}>
                                                                        <FeatherIcon icon="layout" size={16} />
                                                                    </Button>
                                                                </ButtonGroup>
                                                            </Col>
                                                            <Col xs={2} className="val-col">{xitem.percentage && xitem.percentage > 0?roundOffDecimal(xitem.percentage,2):0}%</Col>
                                                        </Row>
                                                    </Col>        
                                                :<></>}
                                            </React.Fragment>;
                                        })}
                                    </>:<></>}
                                </>:<></>}

                                {this.props.viewtype === "brand"?<>
                                    {curcatrect && curcatrect.sub_categories?<>
                                        {curcatrect.sub_categories.map((xitem, xidx) => {
                                            return <React.Fragment key={xidx}>
                                                {cursubcat && xitem.id === cursubcat.id?<>
                                                {xitem.rects.map((yitem, yidx) => {
                                                    return <React.Fragment key={yidx}>
                                                        {yitem.brands && yitem.brands.length? yitem.brands.map((zitem,zidx) => {

                                                            let isbrandsupbased = (zitem.type === catRectEnums.rule);
                                                            let cfullbrandname = getNameorIdorColorofBox(zitem,"name");
                                                            let brandname = (getNameorIdorColorofBox(zitem,"name").substring(0,15)+(getNameorIdorColorofBox(zitem,"name").length > 15?"..":""));

                                                            return <React.Fragment key={zidx}>
                                                                {(!zitem.isDelete && isbrandsupbased)?
                                                                    <Col xs={12} className="single-percentage sub-view">
                                                                        <Row>
                                                                            <Col xs={8} style={this.props.isRTL === "rtl"?{padding:"0px",paddingRight:"35px"}:{padding:"0px",paddingLeft:"35px"}}>
                                                                                <span className='remove-link' onClick={() => this.handleSaveRemoveField(false, true, xidx)}><FeatherIcon icon="x" size={16} /></span>
                                                                                <CustomProgressBar showtooltip={true} fulltext={cfullbrandname} text={brandname} mainbarcolor={"rgb(237, 50, 122)"} mainbarpercentage={zitem.percentage} textcolor={"white"} showsubbar={false} />
                                                                            </Col>
                                                                            <Col xs={2} className="links-col">
                                                                                <ButtonGroup>
                                                                                    <Button variant="primary" size="sm"><FeatherIcon icon="layout" size={16} /></Button>
                                                                                </ButtonGroup>
                                                                            </Col>
                                                                            <Col xs={2} className="val-col">{zitem.percentage && zitem.percentage > 0?roundOffDecimal(zitem.percentage,2):0}%</Col>
                                                                        </Row>
                                                                    </Col>        
                                                                :<></>}
                                                            </React.Fragment>;
                                                        })
                                                        :<></>}
                                                    </React.Fragment>
                                                })}</>:<></>}
                                            </React.Fragment>;
                                        })}
                                    </>:<></>}
                                </>:<></>}
                            </Col>
                            <Button variant='secondary' className="save-btn" onClick={this.props.toggleSupplierView} size="sm">{this.props.t("btnnames.close")}</Button>
                        </Col>
                    </Row>
                    
                </Col>
            </Col>

            {this.props.viewtype === "cat"?
            <Modal className={"MPselectCategory "+(this.props.isRTL === "rtl"?"rtl":"")} size="lg" centered show={this.state.isaddfieldmodal} onShow={this.handleModalReset} onHide={()=>this.toggleAddFieldModal()}>
                <Modal.Body>
                    <Modal.Header closeButton>
                        <Modal.Title>{this.props.t("SELECT_RULE_FIELD")}</Modal.Title>
                    </Modal.Header>

                    <Tab.Container activeKey={this.state.activeTabKey}>
                        <Tab.Content>
                            <Tab.Pane eventKey="fieldselect">
                                <div className='fieldsdiv'>
                                    <div className='SelectCategory'>
                                        <Col xs={12} className="field">
                                            <Row style={(this.props.isRTL === "rtl" ? { marginRight: "0px", width: "100%" } : { marginLeft: "0px", width: "100%" })}>
                                                {(this.props.loadDunitList.length>0 ? this.props.loadDunitList.map((field, i) =>
                                                    <Col md={3} key={i}>
                                                        <Col className={"sub-item "+(this.state.selectedField && field.fieldId === this.state.selectedField.fieldId?"active":"") }
                                                         onClick={()=>this.handleSelectfield(field, true)}>
                                                            <Col xs={12} id={field.fieldId} style={{padding:"0px"}}>
                                                                <Row>
                                                                    <Col xs={12} className="img-bg" style={{background:"#FFF", marginTop:"-5px", height:"70px"}}>
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

                                                {this.props.loadDunitList.length < this.props.fieldTotalCount?<Button className="load-more-btn" onClick={()=>this.props.loadMoreDunits()}>{this.props.t("btnnames.loadmore")}</Button>:<></>}
                                            </Row>
                                        </Col>
                                    </div>
                                </div> 
                            </Tab.Pane>
                            <Tab.Pane eventKey="fielddraw">
                                <Col  className='NDUrowStructuredraw fielddraw-view'>
                                    <label style={{marginTop:"8px"}}>{this.props.t("select_eye_level_to_continue")}</label>

                                    <div ref={this._mainFieldDiv} className="field-wrapper">

                                        {this.state.fieldLevelObj?<>
                                            <div className="measure-line vertical" dir="ltr" style={{width:"100%"}}>
                                                <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"86%"}:{}}>{this.dotTxtShow("width",1)}</div>
                                                <div className="dot-txt" style={{marginLeft:"42%",marginTop:"-15px"}}>{this.dotTxtShow("width",2)}</div>
                                                <div className="dot-txt" style={this.props.isRTL === "rtl"?{marginLeft:"0%",marginTop:"-15px"}:{marginLeft:"83%",marginTop:"-15px"}}>{this.dotTxtShow("width",3)}</div>
                                                <div className="dots"></div>
                                                <div className="dots" style={{marginLeft:"50%",marginTop:"-4px"}}></div>
                                                <div className="dots" style={{marginLeft:"99%",marginTop:"-4px"}}></div>
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
                        {/* <Button className="btn-save-cat" onClick={()=>this.handleSaveRemoveField(true)}>{this.props.t("SAVE_FIELD_INRULE")}</Button> */}
                    </Col>}
                </Modal.Footer>
            </Modal>:<></>}
        </>);
    }
}



