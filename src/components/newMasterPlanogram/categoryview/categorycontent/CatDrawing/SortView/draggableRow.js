import React from "react";
import { SortableHandle } from "react-sortable-hoc";
import { Col } from 'react-bootstrap'; //, Form
import styled from "styled-components";
import { Resizable } from "re-resizable";
import { checkColorIsLight, roundOffDecimal } from "../../../../../../_services/common.service";
import FeatherIcon from 'feather-icons-react';

import { getNameorIdorColorofBox, convertWidthPercent, TooltipWrapper } from '../../../../AddMethods';

import { catRectEnums } from '../../../../../../enums/masterPlanogramEnums';
import { BookmarkFillIcon } from "@primer/octicons-react";

const LiWrapper = styled.li`
  cursor: default;
  padding: 0px;

  & h4 {
    font-size: 11px;
    font-weight: 700;
    color: #ccc;
    background: #5128a0;
    width: 60%;
    padding: 6px 10px;
    position: relative;
    max-height: 27px;
    overflow: hidden;
  }

  & .percentage-content {
    position: absolute;right: 50px;margin-top: -36px;z-index: 3;
  }

  & .layoutpreview{margin-top: -10px;}

  & .percentage-content .form-control{width: 80px;font-weight: 700;color: #5128a0;}
  & .percentage-content label{margin-left: 5px;font-size: 14px;font-weight: 700;color: #5128a0;}

  & .handle{position: absolute;right: -8px;top: 5px;}

  &.helperContainerClass {
    width: auto;
    border: 1px solid #efefef;
    box-shadow: 0 5px 5px -5px rgba(0, 0, 0, 0.2);
    background-color: rgba(255, 255, 255, 0.9);
    border-radius: 10px;

    &:active {
      cursor: grabbing;
    }

  }
`;

const Handle = styled.div`
  margin-right: 10px;
  padding: 0 5px;
  cursor: grab;
`;

const RowHandler = SortableHandle(() => <Handle className="handle"><FeatherIcon icon="move" size={16}/></Handle>);

class CategoryField extends React.Component {
  constructor(props){
      super(props);

      this.perContentDiv = React.createRef();

      this.state = {
        isResizing: false,
        startXY: {width: 0, height: 0, id: -1 },
        moveXY: {width: 0, height: 0 },
        singleFieldWidth: 300, 

        perContentWidth: 0,
      }
  }
  
  componentDidMount() {
    this._isMounted = true;
      
    if (this._isMounted) {
        this.setState({
          perContentWidth: (this.perContentDiv.current && this.perContentDiv.current.offsetWidth?(this.perContentDiv.current.offsetWidth / 2):0)
        });
    }
  }

  componentWillUnmount(){
      this._isMounted = false;
  }
  // #MP-CAT-09
  resizeStart = (e) => {
    //console.log(e.clientX, e.clientY);
    this.props.checkResizeStart(e,this.props.obj,true);
    this.setState({ isResizing: true, startXY: { x: e.clientX, y: e.clientY, id: this.props.obj.id } });
  }

  resizeDrag = (e) => {
    this.props.checkResizeStart(e,this.props.obj);
    //console.log(e.clientX, e.clientY);
    //this.setState({ moveXY: { x: e.clientX, y: e.clientY } });
  }
  // #MP-CAT-11
  resizeEnd = (e) => {
    this.props.checkResizeStart(e,this.props.obj);
    let cstartxy = this.state.startXY;
    let cendxy = { x: e.clientX, y: e.clientY };

    let gapwh = (cendxy.x - cstartxy.x);
    let newresizewidth = (this.props.obj.field_obj.drawWidth + gapwh);
    //console.log(newresizewidth);
    if(gapwh !== 0 && newresizewidth > 25){
      this.props.changeCatProps(this.props.rownumber,"width",gapwh);
    }
    this.setState({ isResizing: false });
  }

  percentageChange = (cvalue) => {
    if(cvalue > 0){
      this.props.changeCatProps(this.props.rownumber,"percentage",roundOffDecimal(parseFloat(cvalue),2));
    }
  }
  //high process - get percentage if resizing
  getChangingPercentage = (citem) => {
    let changingper = 0;

    if(citem && citem.percentage && citem.percentage > 0){
      let fielddrawboxwidth = this.state.singleFieldWidth;
      let notdeletedcatlist = this.props.rectsets.filter(x => !x.isDelete && !x.is_unallocated_view && x.field_obj); //not deleted categories
      let totalcatwidth = (fielddrawboxwidth * notdeletedcatlist.length);

      // let fieldshelfcount = (this.props.obj && this.props.obj.field_obj?this.props.obj.field_obj.field_shelves.length:0);
      
      // let totalperwidth = (notdeletedcatlist.length > 0?notdeletedcatlist.map(item => (fielddrawboxwidth * item.field_obj.field_shelves.length)).reduce((prev, next) => prev + next):0);
      // let totalperwidth = (this.props.defSaveObj?this.props.defSaveObj.totalshelfwidth:0);
      let changingvalueper = convertWidthPercent((citem.width + this.props.resizeChange),totalcatwidth);

      let totalcontainshelves = citem.contain_shelves.length;
      let changenewper = roundOffDecimal(((changingvalueper / (this.props.obj.field_obj?this.props.obj.field_obj.field_shelves.length:0)) * totalcontainshelves),2);

      // let cufieldper = ((citem.width + this.props.resizeChange));
      // let changingvalue = convertWidthPercent(cufieldper,totalperwidth);
      
      // let totalfieldwidth = (this.props.defSaveObj?this.props.defSaveObj.totalshelfwidth:0);
      // let checkcontwidth = roundOffDecimal(convertWidthPercent(changingvalue,totalfieldwidth),2);

      if(changenewper > 0){ //checkcontwidth
        changingper = changenewper;
      }
    }
    
    return changingper;
  }
  
  render(){
    let isunallowspace = (this.props.obj && this.props.obj.is_unallocated_view);
    let unallowwidth = (isunallowspace?(this.props.obj.drawWidth - this.props.resizeChange):0);
    
    let notdeletedrectlist = (this.props.obj && !this.props.obj.is_unallocated_view && this.props.obj.rects.length > 0?this.props.obj.rects.filter(x => !x.isDelete):null);
    let isrulesavailable = (this.props.obj?this.props.obj.is_rules_available:false);

    let firstrectitem = (notdeletedrectlist && notdeletedrectlist.length > 0?notdeletedrectlist[0]:null);
    let isfirstsupbased = (firstrectitem && firstrectitem.type === catRectEnums.rule?true:false);
    let ismultipleavailable = (notdeletedrectlist && notdeletedrectlist.length > 1);
    
    let categoryfullname = (isunallowspace?this.props.t("unallocated"):firstrectitem?(getNameorIdorColorofBox(firstrectitem,"name")):"-");
    let categoryviewname = (isunallowspace?this.props.t("unallocated"):
    firstrectitem?(getNameorIdorColorofBox(firstrectitem,"name").substring(0, Math.floor(this.state.perContentWidth / 7))+(getNameorIdorColorofBox(firstrectitem,"name").length > Math.floor(this.state.perContentWidth / 7)?"..":"")):"-")
    
    let categoryviewcolor = (!isunallowspace && !ismultipleavailable && firstrectitem && getNameorIdorColorofBox(firstrectitem,"color")?getNameorIdorColorofBox(firstrectitem,"color"):"#F39C12")
    let categorytxtcolor = (checkColorIsLight(categoryviewcolor)?"#5128a0":"white");
    // background: categoryviewcolor 
    // style={{borderColor: categoryviewcolor}}
    
    return (
      <Resizable className={"resizable-div"+(isunallowspace?" unallocated ":"")+(isfirstsupbased?" sup-based":"")}
      size={{ width: (isunallowspace?(this.props.obj.drawWidth):(this.props.obj.field_obj.drawWidth)), height: (isunallowspace?(this.props.obj.drawHeight):(this.props.obj.field_obj.drawHeight)) }}
      enable={{ top:false, right:(!isunallowspace && !this.props.isAUIDisabled), bottom:false, left:false, topRight:false, bottomRight:false, bottomLeft:false, topLeft:false }}
      onResizeStart={this.resizeStart}  onResize={this.resizeDrag} onResizeStop={this.resizeEnd}
      >
        <LiWrapper index={this.props.index} dir={this.props.isRTL} className={"list-inline-item"}>
            {this.props.obj?<>
              <Col className="catrect-view" ref={this.perContentDiv}>
                {/* {this.props.obj && this.state.startXY.id === this.props.obj.id && chaingingper > 0?<label style={{position: "absolute",zIndex:"2"}}>{chaingingper+"%"}</label>:<></>} */}
                <TooltipWrapper placement="bottom" text={categoryfullname}>
                  <h4 className={!ismultipleavailable && !isunallowspace?"redirect-item":""} 
                  onClick={() => (!ismultipleavailable && !isunallowspace?this.props.redirectToCategory(true, this.props.obj, firstrectitem):null)} 
                  style={isunallowspace?{width: "80%"}:{background: categoryviewcolor, color: categorytxtcolor}}>
                    {ismultipleavailable?this.props.t("multiplerows"):categoryviewname} {(isunallowspace?(" - "+(this.props.obj.percentage?this.props.obj.percentage:0)+"%"):"")}
                    {!isunallowspace?<RowHandler />:<></>}
                  </h4>
                </TooltipWrapper>
                
                {this.props.obj.field_obj?<>
                  <svg className="layoutpreview" style={{borderColor: categoryviewcolor}} width={this.props.obj.field_obj.drawWidth} height={(this.props.obj.field_obj.drawHeight?(this.props.obj.field_obj.drawHeight+3):0)} version="1.1" xmlns="http://www.w3.org/2000/svg">
                    {this.props.obj.rects.length > 0?
                      this.props.obj.rects.map((ritem, ridx) => {
                        return <React.Fragment key={ridx}>
                          {!ritem.isDelete?<>
                            {ritem.sub_categories && ritem.sub_categories.length > 0?
                                ritem.sub_categories.map((subcat,x) => {
                                  let subccolor = (getNameorIdorColorofBox(subcat, "color")?getNameorIdorColorofBox(subcat, "color"):"#dc3545");
                                  return <React.Fragment key={x}>
                                      {!subcat.isDelete && subcat.rects.length>0?<>
                                          {subcat.rects.map((rect,y)=>
                                              <React.Fragment key={y}>
                                                <rect  width={rect.drawWidth} height={rect.drawHeight} fill={subccolor} x={rect.drawX} y={rect.drawY}  style={{ opacity: 0.5}}></rect>
                                              
                                                {rect.brands.length>0?rect.brands.map((brnd,k) =>{
                                                    let brndcolor = (getNameorIdorColorofBox(brnd, "color")?getNameorIdorColorofBox(brnd, "color"):"#dc3545");
                                                    return <React.Fragment key={k}>
                                                      {!brnd.isDelete && brnd.rects && brnd.rects.length > 0?<>
                                                        {brnd.rects.map((brect, brectidx) =>
                                                          <React.Fragment key={brectidx}>
                                                              {!brect.isDelete?
                                                                <rect width={brect.drawWidth} height={brect.drawHeight} fill={brndcolor} stroke={brndcolor} x={brect.drawX} y={brect.drawY} fillOpacity="0.8"  />
                                                              :<></>}
                                                          </React.Fragment>
                                                        )}
                                                      </>:<></>}
                                                    </React.Fragment>
                                                }):<></>}
                                              </React.Fragment>
                                          )}
                                      </>
                                      :<></>}
                                  </React.Fragment>
                                })
                              :<></>}      
                          </>:<></>}
                        </React.Fragment>;
                      })
                    :<></>}
                    
                    <React.Fragment>
                        {(this.props.obj.field_obj.field_shelves?this.props.obj.field_obj.field_shelves.map((shelf, i) => {

                          let iscontainrule = (shelf.contain_rule?true:false);
                          let isrulesupbased = (shelf.contain_rule?(shelf.contain_rule.type === catRectEnums.rule?true:false):false);
                          let iseyelevel = (shelf.isEyeLevel);

                          let shelvefullcatname = (shelf.contain_rule?getNameorIdorColorofBox(shelf.contain_rule, "name"):categoryviewname);
                          let shelvecatname = (shelf.contain_rule?getNameorIdorColorofBox(shelf.contain_rule, "name").substring(0,15):categoryviewname.substring(0,15));
                          let shelvecatcolor = (shelf.contain_rule?getNameorIdorColorofBox(shelf.contain_rule, "color"):"#dc3545");
                          let shelvecattxtcolor = (checkColorIsLight(shelvecatcolor)?"#5128a0":"white");
                          
                          let chaingingper = (iscontainrule && !shelf.lastAddedIsSame && shelf.isFirstContain && shelf.contain_rule?this.getChangingPercentage(shelf.contain_rule):0);
                          // console.log(chaingingper);
                          // (isrulesavailable && iscontainrule)?(isrulesupbased?"#dc3545":"#5128a0"):"#5128a0"
                          
                          let isshelfcontrule = (iscontainrule && shelf.contain_rule.type === catRectEnums.rule);

                          return <React.Fragment key={i}>
                            
                              <rect className={(isrulesavailable && iscontainrule)?(isrulesupbased?"rect-rule":"rect-default"):""} width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x } y={shelf.y +0} style={{ strokeWidth: 1, stroke: (isfirstsupbased?'#dc3545':'#F39C12'), fill: 'transparent', fillOpacity: ".6" }} id={i} />
                              <rect className={iseyelevel?"eyelevel-highlight":""} width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={(shelf.y + 0)+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: shelvecatcolor, fill: shelvecatcolor }} strokeOpacity={0.5} fillOpacity={0.5} />

                              {/* {iseyelevel?<rect className='eyelevel-shelf' width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x } y={shelf.y +0} style={{ strokeWidth: 1, stroke: (isfirstsupbased?'#dc3545':'#F39C12'), fill: ((isrulesavailable && iscontainrule)?(isrulesupbased?'#dc3545':'#5128a0'):'transparent'), fillOpacity: ".6" }} />:<></>} */}

                              {(iscontainrule && !shelf.lastAddedIsSame && (shelf.isFirstContain || isrulesavailable))?<>

                                {isshelfcontrule?<>
                                  <rect x={(shelf.drawWidth-30)} y={(shelf.y + 1)} width={20} height={20} fill="transparent" stroke={shelvecatcolor} strokeWidth={1}></rect>
                                  <foreignObject x={(shelf.drawWidth-28)} y={(shelf.y - 4)} width={20} height={20}><span style={{color: shelvecatcolor}}><BookmarkFillIcon size={15}/></span></foreignObject>
                                </>:<></>}

                                <rect className='svgtext-content' onClick={() => this.props.redirectToCategory("scat", this.props.obj, shelf.contain_rule)} x={shelf.x} y={shelf.y} width={((50+(shelvecatname.length * 6)) < shelf.drawWidth)?(50+(shelvecatname.length * 6)):shelf.drawWidth} height={20} 
                                fill={shelvecatcolor} fillOpacity={"0.6"} />
                                
                                <TooltipWrapper placement="bottom" text={shelvefullcatname+((shelf.isFirstContain && shelf.contain_rule?(" - "+(this.state.isResizing?chaingingper:shelf.contain_rule.percentage)+"%"):""))}>
                                  <text className='svgtext-content shadow' onClick={() => this.props.redirectToCategory("scat", this.props.obj, shelf.contain_rule)} fill={shelvecattxtcolor} x={(shelf.x+5)} y={(shelf.y+13)} fontSize="10" fontWeight={"700"} >
                                    {shelvecatname+(shelvecatname.length >= 15?"..":"") + 
                                    (shelf.isFirstContain && shelf.contain_rule?(" - "+(this.state.isResizing?chaingingper:shelf.contain_rule.percentage)+"%"):"")}
                                  </text>
                                </TooltipWrapper>
                              </>:<></>}

                          </React.Fragment>;
                      }) : (<></>))}
                    </React.Fragment>;

                    {this.props.isDrawEnabled?<>
                        {(this.props.obj.field_obj.field_shelves?this.props.obj.field_obj.field_shelves.map((shelf, i) => {
                          let selectdraw = this.props.selectedDrawCategory;
                          let isselectrank = (selectdraw?selectdraw.contain_shelves.filter(x => (this.props.obj.id === x.category_id && x.rank === shelf.rank)):false);
                          
                          return <React.Fragment key={i}>
                              <rect onClick={() => this.props.updateDrawSelectShelves(this.props.obj, i, shelf)} width={shelf.drawWidth} height={shelf.drawHeight} x={shelf.x } y={shelf.y +0} style={{ strokeWidth: 1, stroke: (isfirstsupbased?'#dc3545':'#F39C12'), fill: (isselectrank && isselectrank.length > 0?'#48a633':'#fff'), fillOpacity: '0.8' }} className="drawselect-shelve" id={i} />
                              <rect width={shelf.drawWidth} height={shelf.drawGap} x={shelf.x} y={(shelf.y + 0)+(shelf.drawHeight?shelf.drawHeight:0)} style={{ strokeWidth: 1, stroke: (isfirstsupbased?'#dc3545':'#F39C12'), fill: (isfirstsupbased?'#dc3545':'#F39C12') }} strokeOpacity={0.5} fillOpacity={0.5} />
                          </React.Fragment>;
                      }) : (<></>))}
                    </>:<></>}

                    </svg>

                  </>
                  :isunallowspace?<>
                    <Col className="unallocate-space" style={{width:((this.props.obj.drawWidth >= unallowwidth)?unallowwidth:this.props.obj.drawWidth), height: this.props.obj.drawHeight, marginTop:-10}}></Col>
                  </>:<></>}
                  
              </Col>
            </>:<></>}
        </LiWrapper>
      </Resizable>
    )
  }
  
};

export default CategoryField;
