import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Col } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { v4 as uuidv4 } from 'uuid'; //unique id

import { catRectEnums } from '../../../../../enums/masterPlanogramEnums';
import CategorySortView from './SortView/SortCategories';
import { alertService } from '../../../../../_services/alert.service';
import { roundOffDecimal } from '../../../../../_services/common.service';
import { convertWidthPercent } from '../../../AddMethods';

import './CatDrawing.css';

class CatDrawing extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        this.displaydiv = React.createRef(); //main preview div

        this.state = {
            scrollStart: 0, 
            resizeStart: 0, resizeMove: 0, resizeChange: 0,
        }
    }

    componentDidMount() {
        this._isMounted = true;

        if (this._isMounted) {
            
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }
    
    //#MP-CAT-10
    checkResizeStart = (e,resizeitem,cstart) => {
        let editwrapper = document.getElementById("catset-scroll");
        let scrollvalue = editwrapper.scrollLeft;

        let resizevalue = this.state.resizeStart; 
        let resizemove = this.state.resizeMove;
        let resizechange = this.state.resizeChange;

        if(!cstart){
            /* const notdeletedlist = this.props.rectsets.filter(x => !x.isDelete);
            let getlastitem = notdeletedlist[(notdeletedlist.length - 1)];
            
            
            if(resizeitem.id === getlastitem.id){
                scrollvalue = editwrapper.scrollWidth;
            } */

            resizemove = e.clientX;
            resizechange = (resizemove - resizevalue);
        } else{
            resizevalue = e.clientX;
        }
        
        if(cstart){
            this.setState({ scrollStart: scrollvalue, resizeStart: resizevalue });
        } else{
            this.setState({ resizeMove: resizemove, resizeChange: resizechange });
        }
        editwrapper.scrollTo((cstart?scrollvalue:this.state.scrollStart),0);
    }

    handleChangeResize = (rownumber, type, value) => {
        this.props.changeCatProps(rownumber, type, value, this.state.scrollStart);
    }

    addAllCategories = () => {
        let cperlist = JSON.parse(JSON.stringify(this.props.loadedCatPercentages));
        let morethanlowlist = (cperlist.filter(x => x.suggestedPercentage >= 5));
        // console.log(morethanlowlist);
        
        if(morethanlowlist && morethanlowlist.length > 0){
            let catavllist = [];
            let isfieldnotadded = false;
            for (let l = 0; l < morethanlowlist.length; l++) {
                const clowitem = morethanlowlist[l];

                let findccat = this.props.loadedCategoryList.find(z => z.categoryId === clowitem.id);
                
                if(findccat && findccat.field){
                    clowitem["field"] = findccat.field;
                    catavllist.push(clowitem);
                } else{
                    isfieldnotadded = true;
                }
            }

            this.props.fieldHistoryAdd(JSON.parse(JSON.stringify(this.props.defSaveObj)),1);

            let highestfieldheight = null;

            let totalfieldwidth = (this.props.singleFieldWidth * catavllist.length);
            let cdefsaveobj = this.props.defSaveObj;

            let totalwidthper = 0;
            let totalunallowwidth = 0;  
            
            for (let i = 0; i < catavllist.length; i++) {
                const curcatitem = catavllist[i];
                
                if(curcatitem && curcatitem.field){
                    //field shelfs
                    let catcontains = [];
                    let selectedfield = curcatitem.field;

                    let checkFieldShelves = (selectedfield.shelf?selectedfield.shelf:[]);
                    let newshelvelist = checkFieldShelves.map((xitem, xidx) => {
                        catcontains.push({ id: uuidv4(), gap: xitem.gap, height: xitem.height, rank: xitem.rank, uom: xitem.uom});
                        
                        return { id: -1, shelve_id: xitem.id, gap: xitem.gap,
                            height: xitem.height, rank: xitem.rank,
                            reverseRowNumber: xitem.reverseRowNumber, uom: xitem.uom, width: xitem.width, x: xitem.x, y: xitem.y,
                            isNew: true, isDelete: false,
                            isEyeLevel: xitem.isEyeLevel
                        };
                    });
                    //new field object
                    let newfieldobj = {
                        id: -1,
                        field_id: (selectedfield.id?selectedfield.id:-1),
                        field_width: selectedfield.width,
                        field_height: selectedfield.height,
                        field_depth: selectedfield.depth,
                        field_uom: selectedfield.uom,
                        field_shelves: newshelvelist,
                        isNew: true, isDelete: false
                    };
                    //new field rule obj
                    let ccatwidth = convertWidthPercent(curcatitem.suggestedPercentage,totalfieldwidth,true);

                    let newrectobj = {
                        id: uuidv4(),
                        category: {category_id: curcatitem.id, category_name: curcatitem.name, color: curcatitem.color },
                        box_width_percentage: curcatitem.suggestedPercentage,
                        width: ccatwidth,
                        totalwidth: (ccatwidth * catcontains.length),
                        contain_shelves: catcontains,
                        type: catRectEnums.default,
                        isNew: true, isDelete: false,
                        rule: {},
                        sub_categories: []
                    }

                    totalwidthper += newrectobj.box_width_percentage;

                    let notdeletedcatlist = cdefsaveobj.categories.filter(x => !x.isDelete && !x.is_unallocated_view);
                    let catnewobj = { id: uuidv4(), 
                        isNew: true, isDelete: false, field_obj: newfieldobj, 
                        rank: (notdeletedcatlist.length + 1),
                        rects: [newrectobj]
                    };

                    if(this.props.singleFieldWidth > newrectobj.width){
                        let lowwidthgap = (this.props.singleFieldWidth - newrectobj.width);
                        totalunallowwidth += (lowwidthgap * newfieldobj.field_shelves.length);
                    }

                    if(!highestfieldheight || (highestfieldheight.field_height < newfieldobj.field_height)){
                        highestfieldheight = JSON.parse(JSON.stringify(newfieldobj));
                    }

                    cdefsaveobj.categories.push(catnewobj);    
                }
            }

            if(isfieldnotadded){
               alertService.warn(this.props.t("fields_notadded_categories")); 
            }

            cdefsaveobj["totalunallowwidth"] = totalunallowwidth;

            let roundtotalper = roundOffDecimal(totalwidthper,2);
            if(roundtotalper < 100){
                let unallocatedvalue = roundOffDecimal((100 - roundtotalper),2);
                
                if(roundtotalper > 0 && cdefsaveobj.categories.length > 0){
                    let newunallowobj = {
                        id: uuidv4(),
                        rank: (cdefsaveobj.categories.length + 1),
                        width: convertWidthPercent(unallocatedvalue,totalfieldwidth,true),
                        height: highestfieldheight.field_height,
                        uom: highestfieldheight.field_uom,
                        box_width_percentage: unallocatedvalue,
                        isDelete: false, isNew: false,
                        is_unallocated_view: true,
                        totalwidth: totalunallowwidth,
                    }
                    cdefsaveobj.categories.push(newunallowobj);
                }
            }
            
            // console.log(cdefsaveobj);
            this.props.addCategoriesFromChild(cdefsaveobj);

        } else{
            alertService.error(this.props.t("per_morethan_fiveper"));
        }
    }

    render() {
        const { rectsets } = this.props;
        const notdeletedlist = rectsets.filter(x => !x.isDelete);
        
        return (<>
            <div className="mainsvg-content" ref={this.displaydiv} onContextMenu={e => e.preventDefault()}>
                <ul className='list-inline cat-toolbox'>
                    {/* {notdeletedlist && notdeletedlist.length === 0?
                        <li className={'list-inline-item single-tool'} onClick={() => this.addAllCategories()} title="Add All">
                            <FeatherIcon icon="square" size="14" /> <small>{this.props.t("ADD_ALL")}</small>
                        </li>
                    :<></>} */}
                    
                    <li className={'list-inline-item single-tool '+(this.props.historyData && this.props.historyData.past.length > 0?'':'disabled')} onClick={() => this.props.handleUndoRedo("undo")} title="Undo">
                        <FeatherIcon icon="corner-up-left" size="14" />
                    </li>
                    <li className={'list-inline-item single-tool '+(this.props.historyData && this.props.historyData.future.length > 0?'':'disabled')} onClick={() => this.props.handleUndoRedo("redo")} title="Redo">
                        <FeatherIcon icon="corner-up-right" size="14" />
                    </li>
                </ul>
                <Col id="catset-scroll" className="scroll-content">
                    <ul className='list-inline' style={{marginBottom:"0px"}}>
                        {/* {console.log(rectsets)} */}
                        {notdeletedlist && notdeletedlist.length > 0?<>
                            <CategorySortView 
                                isDrawEnabled={this.props.isDrawEnabled} 
                                perContentWidth={this.props.perContentWidth}
                                defSaveObj={this.props.defSaveObj} 
                                isAUIDisabled={this.props.isAUIDisabled} 
                                selectedDrawCategory={this.props.selectedDrawCategory} 
                                updateDrawSelectShelves={this.props.updateDrawSelectShelves}
                                isMounted={this._isMounted} 
                                resizeChange={this.state.resizeChange} 
                                rectsets={rectsets} 
                                t={this.props.t} isRTL={this.props.isRTL} 
                                checkResizeStart={this.checkResizeStart} 
                                changeCatProps={this.handleChangeResize} 
                                updateFromChild={this.props.updateFromChild} 
                                redirectToCategory={this.props.redirectToCategory} 
                                />
                        </>:<>
                            <h4 className='nocontent-txt text-center' style={{padding:"135px 0px"}}>{this.props.t("no_added_categories")}</h4>
                        </>}
                    </ul>
                </Col>
            </div>
        </>);
    }
}

export default withTranslation()(withRouter(CatDrawing));



