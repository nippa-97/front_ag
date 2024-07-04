import React from 'react';
import * as d3 from "d3";
//import { v4 as uuidv4 } from 'uuid'; //unique id
import { roundOffDecimal, checkColorIsLight } from '../../_services/common.service';
import { checkAllowMoveResize, updateRectProps } from './mpvalidators'; //findDropSpace

//import { catRectEnums } from '../../enums/masterPlanogramEnums';
import { getNameorIdorColorofBox, PopoverWrapper, getBoxResizePercentage, TooltipWrapper } from './AddMethods';
import { catRectEnums } from '../../enums/masterPlanogramEnums';

import WarningSmallIcon from '../../assets/img/icons/warning-small.png';

import i18n from "../../_translations/i18n"; 

const svgBorderHeight = 10;

export class Rect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isDragging: false, isResizing: false,
            startDragXY: { x: 0, y: 0 },
            totalSubCatWidth: 0, 
            lastAllowedXY: { x: 0, y: 0, width: 0, height: 0},
            moveXY: { x: 0, y: 0, width: 0, height: 0, percentage: 0},
        }
    }

    componentDidMount() {
      //onload set default xy values
      let mainperobj = (!this.props.isbrand?this.props.mainitem:this.props.rectitem);
      let rectobj = {x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height, 
        percentage: (mainperobj.percentage?mainperobj.percentage:0),
      };

      let totalrectwidth = 0;
      if(this.props.isbrand){
        for (let l = 0; l < this.props.parentitem.rects.length; l++) {
            const srectitem = this.props.parentitem.rects[l];
            
            if(!srectitem.isDelete){
                totalrectwidth = (totalrectwidth + (srectitem.width * srectitem.contain_shelves.length));
            }
        }
      }
      
      this.setState({ moveXY: rectobj, lastAllowedXY: rectobj, totalSubCatWidth: totalrectwidth }, () => {
        //console.log(this.state.moveXY);
      });
      
      //drag box in svg
      if(this.props.isAUIDisabled === false){
        const handleDrag = d3.drag()
          .subject(() => {
            const me = d3.select(this[this.props.fidx]);
            return { x: me.attr('x'), y: me.attr('y') }
          })
          .on('start', (event) => {
            this.setState({ startDragXY: {x: event.x, y: event.y}, isDragging: true });
          })
          .on('drag', (event) => {
            //if resize/move allowed
            if(this.props.isshowcontrols && !this.props.isAUIDisabled){
              this.setState({ moveXY: {x: event.x, y: event.y, width: this.state.moveXY.width, height: this.state.moveXY.height} });
            }
          })
          .on('end', (event) => {
            if(event.x !== this.state.startDragXY.x || event.y !== this.state.startDragXY.y){
              //console.log(event.x,event.y,this.state.startDragXY);
              if(this.props.isshowcontrols && !this.props.isAUIDisabled){
                let cevent = {x: event.x, y: event.y};

                let moveobj = this.state.moveXY;
                let lastobj = this.state.lastAllowedXY;

                this.setState({ moveXY: moveobj, lastAllowedXY: lastobj }, () => {
                  let isallowmove = checkAllowMoveResize(cevent, false, false, true, false, lastobj, moveobj, this.props);

                  //console.log(isallowmove);
                  if(isallowmove.isallow){
                    this.setState({ lastAllowedXY: {x: cevent.x, y: cevent.y, width: moveobj.width, height: moveobj.height}, moveXY: moveobj });
                    this.getupdateRectProps(true,cevent,cevent.x,cevent.y,null,null,null,isallowmove);
                  } else{
                    this.resetToLastAllow();
                  }
                });
              }
            }
            this.setState({ isDragging: false });
          });

        handleDrag(d3.select(this[this.props.fidx]));
      }
      
      
      //resize box from right
      var handleResizeX = d3.drag()
        .subject(() => {
          const me = d3.select(this[("rsx_"+this.props.fidx)]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('start', (event) => {
          this.setState({ startDragXY: {x: event.x, y: event.y}, isResizing: true });
        })
        .on('drag', (event) => {
          let reducex = (event.x + 5);
          if(reducex > (this.state.lastAllowedXY.x + 10)){
            let reducewidth = ((this.state.lastAllowedXY.x + this.state.lastAllowedXY.width) - reducex);

            let newmoveobj = {x: this.state.lastAllowedXY.x, y: this.state.lastAllowedXY.y, 
              width: (this.state.lastAllowedXY.width - reducewidth), 
              height: this.state.lastAllowedXY.height};

            let mainperobj = (!this.props.isbrand?this.props.mainitem:this.props.rectitem);
            let mainviewwidth = (!this.props.isbrand?this.props.viewWidth:this.state.totalSubCatWidth);
            let mainparentobj = (!this.props.isbrand?this.props.catrectitem:this.props.subrectitem);

            let returnperobj = getBoxResizePercentage(false, newmoveobj, mainperobj, mainviewwidth, this.props.fieldObj, mainparentobj, this.props.isbrand);
            // console.log(returnperobj);

            this.setState({ moveXY: returnperobj });
          }
        })
        .on('end', (event) => {
          if(event.x !== this.state.startDragXY.x){
            let isreducevalue = (event.x < this.state.startDragXY.x);
            let reducex = (event.x + 5);
            let cevent = {x:reducex, y:event.y};
            let isallowresize = checkAllowMoveResize(cevent, true, false, true, false, this.state.lastAllowedXY, this.state.moveXY, this.props);
            //console.log(isallowresize);
            if(isallowresize.isallow){
              this.setState({ lastAllowedXY: {x: cevent.x, y: cevent.y, width: this.state.moveXY.width, height: this.state.moveXY.height} });
              this.getupdateRectProps(false,event,reducex,event.y,true,false,isreducevalue,isallowresize);
            } else{
              this.resetToLastAllow();
            }  
          }
          this.setState({ isResizing: false });
        });
      handleResizeX(d3.select(this[("rsx_"+this.props.fidx)]));

      //resize box from left
      var handleResizeX2 = d3.drag()
        .subject(() => {
          const me = d3.select(this[("rsx2_"+this.props.fidx)]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('start', (event) => {
          this.setState({ startDragXY: {x: event.x, y: event.y}, isResizing: true });
        })
        .on('drag', (event) => {
          let reducex = (event.x);
          let lastobj = this.state.lastAllowedXY;

          if(reducex < ((lastobj.x + lastobj.width) - 10)){
            let reducewidth = (lastobj.x - reducex);
            
            let newmoveobj = {x: reducex, y:lastobj.y, width: (lastobj.width + reducewidth), height: this.state.lastAllowedXY.height};

            let mainperobj = (!this.props.isbrand?this.props.mainitem:this.props.rectitem);
            let mainviewwidth = (!this.props.isbrand?this.props.viewWidth:this.state.totalSubCatWidth);
            let mainparentobj = (!this.props.isbrand?this.props.catrectitem:this.props.subrectitem);

            let returnperobj = getBoxResizePercentage(false, newmoveobj, mainperobj, mainviewwidth, this.props.fieldObj, mainparentobj, this.props.isbrand);
            // console.log(returnperobj);

            this.setState({ moveXY: returnperobj });
          }
        })
        .on('end', (event) => {
          if(event.x !== this.state.startDragXY.x){
            let isreducevalue = (event.x > this.state.startDragXY.x);
            let reducex = (event.x);
            //console.log(event.x,event.y);
            let cevent = {x:reducex, y:event.y};
            let isallowresize = checkAllowMoveResize(cevent, true, false, true, true, this.state.lastAllowedXY, this.state.moveXY, this.props);
            //console.log(isallowresize);
            if(isallowresize.isallow){
              this.setState({ lastAllowedXY: {x: cevent.x, y: cevent.y, width: this.state.moveXY.width, height: this.state.moveXY.height} });
              this.getupdateRectProps(false,event,reducex,event.y,true,true,isreducevalue,isallowresize);
            } else{
              this.resetToLastAllow();
            }  
          }
          this.setState({ isResizing: false });
        });
        handleResizeX2(d3.select(this[("rsx2_"+this.props.fidx)]));

        //resize box from bottom
        var handleResizeY = d3.drag()
        .on('start', (event) => {
          this.setState({ startDragXY: {x: event.x, y: event.y}, isResizing: true });
        })
        .on('drag', (event) => {
          let reducey = (event.y + 5);
          if(reducey > (this.state.lastAllowedXY.y + 10)){
            let reduceheight = roundOffDecimal(((this.state.lastAllowedXY.y + this.state.lastAllowedXY.height) - reducey),2);
            
            let newmoveobj = {x: this.state.lastAllowedXY.x, y: this.state.lastAllowedXY.y, 
              width: this.state.lastAllowedXY.width, 
              height: (this.state.lastAllowedXY.height - reduceheight)};

            let mainperobj = (!this.props.isbrand?this.props.mainitem:this.props.rectitem);
            let mainviewwidth = (!this.props.isbrand?this.props.viewWidth:this.state.totalSubCatWidth);
            let mainparentobj = (!this.props.isbrand?this.props.catrectitem:this.props.subrectitem);

            let returnperobj = getBoxResizePercentage(true, newmoveobj, mainperobj, mainviewwidth, this.props.fieldObj, mainparentobj, this.props.isbrand);
            // console.log(returnperobj);

            this.setState({ moveXY: returnperobj });
          }
        })
        .on('end', (event) => {
          if(event.y !== this.state.startDragXY.y){
            let isreducevalue = (event.y < this.state.startDragXY.y);
            let reducey = (event.y + 5);
            let cevent = {x:event.x, y:reducey};
            let isallowresize = checkAllowMoveResize(cevent, true, true, true, false, this.state.lastAllowedXY, this.state.moveXY, this.props);
            //console.log(isallowresize);
            if(isallowresize.isallow){
              this.setState({ lastAllowedXY: {x: cevent.x, y: cevent.y, width: this.state.moveXY.width, height: this.state.moveXY.height} });
              this.getupdateRectProps(false,event,reducey,event.y,false,false,isreducevalue,isallowresize);
            } else{
              this.resetToLastAllow();
            }  
          }
          this.setState({ isResizing: false });
        });
        
        handleResizeY(d3.select(this[("rsy_"+this.props.fidx)]));
      
        //resize box from bottom
        var handleResizeY2 = d3.drag()
        .on('start', (event) => {
          this.setState({ startDragXY: {x: event.x, y: event.y}, isResizing: true });
        })
        .on('drag', (event) => {
          let reducey = (event.y);
          let lastobj = this.state.lastAllowedXY;

          if(reducey < ((lastobj.y + lastobj.height) - 10)){
            let reduceheight = roundOffDecimal((lastobj.y - reducey),2);
            
            let newmoveobj = {x: lastobj.x, y: reducey, width: lastobj.width, height: (lastobj.height + reduceheight)}

            let mainperobj = (!this.props.isbrand?this.props.mainitem:this.props.rectitem);
            let mainviewwidth = (!this.props.isbrand?this.props.viewWidth:this.state.totalSubCatWidth);
            let mainparentobj = (!this.props.isbrand?this.props.catrectitem:this.props.subrectitem);

            let returnperobj = getBoxResizePercentage(true, newmoveobj, mainperobj, mainviewwidth, this.props.fieldObj, mainparentobj, this.props.isbrand);
            // console.log(returnperobj);

            this.setState({ moveXY: returnperobj });
          }
        })
        .on('end', (event) => {
          if(event.y !== this.state.startDragXY.y){
            let isreducevalue = (event.y > this.state.startDragXY.y);
            let reducey = (event.y);
            let cevent = {x:event.x, y:reducey};
            let isallowresize = checkAllowMoveResize(cevent, true, true, true, true, this.state.lastAllowedXY, this.state.moveXY, this.props);
            //console.log(isallowresize);
            if(isallowresize.isallow){
              this.setState({ lastAllowedXY: {x: cevent.x, y: cevent.y, width: this.state.moveXY.width, height: this.state.moveXY.height} });
              this.getupdateRectProps(false,event,reducey,event.y,false,true,isreducevalue,isallowresize);
            } else{
              this.resetToLastAllow();
            }  
          }
          this.setState({ isResizing: false });
        });
        
        handleResizeY2(d3.select(this[("rsy2_"+this.props.fidx)]));
    }
    //reset to last allowed move/resize values
    resetToLastAllow = () => {
      this.setState({ moveXY: this.state.lastAllowedXY });
    }
    
    getupdateRectProps = (ismove, event, cx, cy, ischangex, isopposite, isreducevalue, checkreturnobj) => {
      let returnobj = updateRectProps(ismove, event, cx, cy, ischangex, isopposite, isreducevalue, this.state.lastAllowedXY, this.props, checkreturnobj);
      
      this.setState({ lastAllowedXY: returnobj.lastallow, moveXY: returnobj.lastallow });
      this.props.updateRectProps(returnobj.rectlist);
    }

    handleMouseClick = (e) => {
        if(e.nativeEvent.which === 3 && this.props.isshowcontrols && this.props.isAUIDisabled === false){ //right click
            this.props.handleContextMenu(true, this.props.mainitem, this.props.curno, this.props.parentidx, this.props.rectidx, e, null, 
              this.props.parentitem, this.props.boxno, this.props.brectidx, this.props.rectitem);
        }
    }

    handleResizeHandlers = (ismouseup) => {
      this.setState({ isDragging: ismouseup });
    }

    handleBrandRedirect = () => {
      let mainitem = this.props.mainitem;
      let viewobj = { id: mainitem.brand.brandId, name: mainitem.brand.brandName  }

      this.props.redirectList(false, viewobj, false);
    }

    render() {
      let bgfillcolor = (this.props.isbrand?(getNameorIdorColorofBox(this.props.mainitem,"color")):getNameorIdorColorofBox(this.props.parentitem, "color"));
      bgfillcolor = (bgfillcolor?bgfillcolor:"#dc3545");

      let iscolorlight = checkColorIsLight(bgfillcolor);
      
      let subcatname = (!this.props.isbrand?getNameorIdorColorofBox(this.props.parentitem,"name"):"");
      let brandname = (this.props.isbrand?getNameorIdorColorofBox(this.props.mainitem,"name"):"");
      
      let mainitemobj = (!this.props.isbrand?this.props.parentitem:this.props.mainitem);
      
      return <g>
        <clipPath id={("clip-"+this.props.fidx)}>
            <rect x={this.state.moveXY.x} y={this.state.moveXY.y} width={this.state.moveXY.width} height={50} />
        </clipPath>

        {!this.props.isbrand && !this.props.isshowcontrols?<g clipPath={"url(#clip-"+(this.props.fidx)+")"}><text fill={"#5128a0"} fillOpacity={0.6} x={(this.state.moveXY.x+35)} y={(this.state.moveXY.y+20)} fontSize="12" fontWeight={"700"} className="shadow" >
        {(getNameorIdorColorofBox(this.props.parentitem,"name").substring(0,15)+(getNameorIdorColorofBox(this.props.parentitem,"name").length > 15?"..":""))}</text>
        
        <text fill={"#5128a0"} fillOpacity={0.6} x={(this.state.moveXY.x+15)} y={(this.state.moveXY.y+25)} fontSize="20" fontWeight={"700"} className="shadow" >
        {(this.props.boxno)}</text>
        </g>:<></>}

        {/* rule highlight border */}
        {catRectEnums.rule === this.props.parentitem.type ?
          <>
            <rect x={this.state.moveXY.x} y={this.state.moveXY.y} width={this.state.moveXY.width} height={svgBorderHeight} fill={bgfillcolor} fillOpacity={0.4} />
            <rect x={this.state.moveXY.x} y={(this.state.moveXY.y + (this.state.moveXY.height - svgBorderHeight))} width={this.state.moveXY.width} height={svgBorderHeight} fill={bgfillcolor} fillOpacity={0.4} />
            
            <rect x={this.state.moveXY.x} y={(this.state.moveXY.y + svgBorderHeight)} width={svgBorderHeight} height={(this.state.moveXY.height > (svgBorderHeight*2)?this.state.moveXY.height - (svgBorderHeight*2):0)} fill={bgfillcolor} fillOpacity={0.4} />
            <rect x={(this.state.moveXY.x + (this.state.moveXY.width - svgBorderHeight))} y={(this.state.moveXY.y + svgBorderHeight)} width={svgBorderHeight} height={(this.state.moveXY.height > (svgBorderHeight*2)?this.state.moveXY.height - (svgBorderHeight*2):0)} fill={bgfillcolor} fillOpacity={0.4} />
          </>
          :<></>
        }

        <rect className={(this.props.isshowcontrols?'svgmove-content ':'')+(this.state.isDragging?" dragging":"")} x={this.state.moveXY.x} y={this.state.moveXY.y} width={this.state.moveXY.width} height={this.state.moveXY.height} onMouseDown={this.handleMouseClick} ref={(r) => this[this.props.fidx] = r} stroke={bgfillcolor} strokeWidth="2" strokeOpacity={this.props.isOpacityReduce?"0.3":"1"} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.1":this.props.isbrand?"0.6":"0.3"} />

        {!this.props.isbrand && this.props.isshowcontrols?<g clipPath={"url(#clip-"+(this.props.fidx)+")"}>
          <rect className='svgtext-content' onClick={() => this.props.saveCategoryObj(true, this.props.parentitem)} x={this.state.moveXY.x} y={this.state.moveXY.y} width={((70+(subcatname.length * 6)) < this.state.moveXY.width)?(70+(subcatname.length * 6)):this.state.moveXY.width} height={22} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.1":"0.6"} />
          
          <TooltipWrapper placement="bottom" text={(getNameorIdorColorofBox(this.props.parentitem,"name")+" "+this.props.boxno+" - "+(this.state.isResizing?this.state.moveXY.percentage:this.props.mainitem.percentage)+"%")}>
            <text className='svgtext-content shadow' onClick={() => this.props.saveCategoryObj(true, this.props.parentitem)} fill={iscolorlight?"#5128a0":"#fff"} x={(this.state.moveXY.x+15)} y={(this.state.moveXY.y+15)} fontSize="10" fontWeight={"700"} >
              {(getNameorIdorColorofBox(this.props.parentitem,"name").substring(0, (Math.floor((this.props.perContentWidth/2)/6)))+(getNameorIdorColorofBox(this.props.parentitem,"name").length > (Math.floor((this.props.perContentWidth/2)/6))?"..":""))+ " "} 
              {(this.props.boxno)+" - "} 
              {this.state.isResizing?this.state.moveXY.percentage:this.props.mainitem.percentage}%</text>
          </TooltipWrapper>
        </g>:this.props.isshowcontrols?<g clipPath={"url(#clip-"+(this.props.fidx)+")"}>
          <rect className='svgtext-content' onClick={() => this.handleBrandRedirect()} x={this.state.moveXY.x} y={this.state.moveXY.y} width={(70+(brandname.length * 6)) < this.state.moveXY.width?(70+(brandname.length * 6)):this.state.moveXY.width} height={22} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.1":"0.6"} />
          
          <TooltipWrapper placement="bottom" text={(brandname+" - "+(this.state.isResizing?this.state.moveXY.percentage:this.props.rectitem.percentage)+"%")}>
            <text className='svgtext-content shadow' onClick={() => this.handleBrandRedirect()} fill={iscolorlight?"#5128a0":"#fff"} x={(this.state.moveXY.x+15)} y={(this.state.moveXY.y+15)} fontSize="10" fontWeight={"700"} >
              {brandname+" - "} {this.state.isResizing?this.state.moveXY.percentage:this.props.rectitem.percentage}%
            </text>
          </TooltipWrapper>
        </g>:<></>}

        {this.props.isshowcontrols?<>
          <rect x={this.state.moveXY.x} className="resize-controls-x aui-disable" ref={(r) => this[("rsy2_"+this.props.fidx)] = r} y={(this.state.moveXY.y)} width={this.state.moveXY.width?this.state.moveXY.width:0} height={5} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.3":"0.9"} />
          <rect x={this.state.moveXY.x} className="resize-controls-x aui-disable" ref={(r) => this[("rsy_"+this.props.fidx)] = r} y={((this.state.moveXY.y+this.state.moveXY.height) - 5)} width={this.state.moveXY.width?this.state.moveXY.width:0} height={5} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.3":"0.9"} />
          
          <rect x={(this.state.moveXY.x)} className="resize-controls-y aui-disable" ref={(r) => this[("rsx2_"+this.props.fidx)] = r} y={this.state.moveXY.y} width={5} height={(this.state.moveXY.height?this.state.moveXY.height:0)} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.3":"0.9"} />
          <rect x={(this.state.moveXY.x + this.state.moveXY.width) - 5} className="resize-controls-y aui-disable" ref={(r) => this[("rsx_"+this.props.fidx)] = r} y={this.state.moveXY.y} width={5} height={this.state.moveXY.height?this.state.moveXY.height:0} fill={bgfillcolor} fillOpacity={this.props.isOpacityReduce?"0.3":"0.9"} />

          {/* shows resizing percentage */}
          {/* {this.state.isResizing?<>
            <rect x={(this.state.moveXY.x + this.state.moveXY.width) - 60} y={(this.state.moveXY.y + this.state.moveXY.height) - 20} width={60} height={20} fill={"red"} />
            <text fill={"#fff"} x={(this.state.moveXY.x + this.state.moveXY.width) - 45} y={(this.state.moveXY.y + this.state.moveXY.height) - 7} fontSize="10" fontWeight={"700"} >
              {this.state.moveXY.percentage}%
            </text>
          </>:<></>} */}
          
          {/* shows rule warnings */}
          {mainitemobj && mainitemobj.isRuleParentAdded?<>
            <PopoverWrapper text={<><ol>
              {mainitemobj.isRuleParentList.map((zitem, zidx) => {
                return <li key={zidx} onClick={() => this.props.warningRedirect(zitem)}>
                  {this.props.trans("USED_AS_RULE_IN")} <b>{zitem.foundLevel === "cat"?this.props.trans("category"):this.props.trans("sub_category")}</b> {this.props.trans("LEVEL")}
                  {zitem.foundLevel === "scat"?<> {this.props.trans("of")} <b>{zitem.catName}</b> {this.props.trans("category")}</>:<></>}
                </li>;
              })}
            </ol></>}>
              <image href={WarningSmallIcon} className="boxrule-warning" x={((this.state.moveXY.x + this.state.moveXY.width) - 30)} y={(this.state.moveXY.y + 5)} height="25" width="25" />
            </PopoverWrapper>
          </>:<></>}
          
        </>:<></>}
      </g>
    }
}

export function ContextMenu(props) {
  var xPos = props.xpos; //x position
  var yPos = props.ypos; //y position
  //console.log(props);
  //handle click a button. type: 1-expand, 2-delete, 3-close, 4-delete all
  const handleClick = (type,event) => {
      if(type === 1){
          props.handledelete();
      } else if(type === 3){
          props.handlechangeobj("color",event.target.value);
      } else if(type === 4){
          props.handleCutBox();
      } else if(type === 5){
          
      } else{
          props.handlclose();
      }
  }

  return (<div className="rect-context-menu" style={{ top: yPos, left: xPos, }}>
      <ul className="text-center" style={{paddingRight:"0px"}}>
          {/* <li><Form.Control type="color" value={(props.citem.color?props.citem.color:"#ff0000")} onChange={(e) => handleClick(3,e)} /></li><hr/> */}
          {!props.citem.islayoutclick?<>
            <li onClick={() => handleClick(4)}>{i18n.t("CUT")}</li>
            <li onClick={() => handleClick(1)}>{i18n.t("btnnames.delete")}</li><hr/>
          </>:<>
            <li onClick={() => handleClick(5)}>{i18n.t("PASTE")}</li><hr/>
          </>}
          <li onClick={() => handleClick(2)}>{i18n.t("btnnames.close")}</li>
      </ul>
  </div>
  );
}

export class GapRect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            ismoving: false,
        }
    }

    componentDidMount() {
      const handleDrag = d3.drag()
        .subject(() => {
          const me = d3.select(this[this.props.unqid]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('start', (event) => {
            
        })
        .on('drag', (event) => {
            
        })
        .on('end', (event) => {
            
        });
      
      handleDrag(d3.select(this[this.props.unqid]));

    }

    render() {
        return (<>
            <rect className={"sftrect"+(!this.props.shelfitem.isAllowEdit?" notallow-edit":"")} x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} ref={(r) => this[this.props.unqid] = r} style={{ strokeWidth: 1, stroke: (this.state.ismoving?"#dc3545":this.props.dmode?'#2CC990':'#bba2eb'), fill: (this.state.ismoving?"#dc3545":this.props.dmode?'#2CC990':'#bba2eb') }}></rect>
        </>)
    }
  }
// #MP-SML-E-BR1
  export class SimBrandRect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            isDragging: false,
            lastAllowedXY: { x: 0, y: 0, width: 0, height: 0}
        }
    }

    componentDidMount() {
      //onload set default xy values
      this.setState({ endPointinClick:{startX:this.props.x,endX:this.props.x+this.props.width}, lastAllowedXY: {x: this.props.x, y: this.props.y, width: this.props.width, height: this.props.height} }, () => {
        //console.log(this.state.lastAllowedXY);
      });
      //right adjester
      var handleResizeX = d3.drag()
        .subject(() => {
          const me = d3.select(this[("rsx_"+this.props.fidx)]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('drag', (event) => {
          // console.log(this.props.MinEndX);
          if(event.x > (this.state.lastAllowedXY.x + 10)){
            var nextBrandX=this.props.parentitem.brand[this.props.curno+1]?this.props.parentitem.brand[this.props.curno+1].x:null
            //var shelfendX=this.props.parentitem.x+this.props.parentitem.drawWidth
            //console.log(shelfendX);
            //let isallowresize = checkAllowMoveResize(event, true);
            //console.log(isallowresize);
            //if(isallowresize.isallow){
              /* const me = d3.select(this[("rsx_"+this.props.fidx)]);
              me.attr('x', event.x); */
              var cwidth=0
              var cheight=this.state.lastAllowedXY.height
              var cx=0
              var cy=this.state.lastAllowedXY.y
              let reducewidth = ((this.state.lastAllowedXY.x + this.state.lastAllowedXY.width) - event.x);
              if(this.props.shelfDwidth<event.x){
                cwidth=(this.props.shelfDwidth-this.props.x)
                cx=this.props.x
              }else
             
              if(this.props.MinEndX>event.x){
                // limitaion
                cwidth=(this.props.MinEndX - this.state.lastAllowedXY.x)
                cx=this.state.lastAllowedXY.x
               
              }else{
                // if(shelfendX<event.x){
                //   console.log("end");
                // }
                // no limitation alowing for max
                if(this.props.shelfDwidth<event.x){
                  cwidth=(this.props.shelfDwidth-this.props.x)
                  cx=this.props.x
                }
               
                if(nextBrandX!==null&&nextBrandX<event.x){
                  //block in no more than next brand
                  // console.log(this.props.x);
                  cwidth=(nextBrandX-this.props.x)
                  cx=this.props.x
                 
                  
                }else{
                    //allowing
                    cwidth=(this.state.lastAllowedXY.width - reducewidth)
                    cx=this.state.lastAllowedXY.x
                }
                
               
              }
              this.setState({ lastAllowedXY: {x:cx, y: cy, 
                width: cwidth, 
                height: cheight} });

              
            //}
          }
        })
        .on('end', (event) => {
          this.props.updateBrandProps(this.props.parentidx,this.props.curno,this.state.lastAllowedXY);
        });
      //left adjester
      handleResizeX(d3.select(this[("rsx_"+this.props.fidx)]));

      var handleResizeX2 = d3.drag()
        .subject(() => {
          const me = d3.select(this[("rsx_"+this.props.fidx+"_2")]);
          return { x: me.attr('x'), y: me.attr('y') }
        })
        .on('drag', (event) => {
          //if(event.x > (this.state.lastAllowedXY.x + 10)){
            //let isallowresize = checkAllowMoveResize(event, true);
            //console.log(isallowresize);
            //if(isallowresize.isallow){
              /* const me = d3.select(this[("rsx_"+this.props.fidx)]);
              me.attr('x', event.x); */
              // let changingx=event.x-this.state.lastAllowedXY.x
              var sotedbrandtoX=this.props.parentitem.brand.sort(this.propComparator('x'))
              var prevBrandX=sotedbrandtoX[this.props.curno-1]?sotedbrandtoX[this.props.curno-1].x+sotedbrandtoX[this.props.curno-1].drawWidth:null
              var currbrand=sotedbrandtoX[this.props.curno]
              //var nextbrand=sotedbrandtoX[this.props.curno+1]?sotedbrandtoX[this.props.curno+1]:null
              var cwidth=0
              var cheight=this.state.lastAllowedXY.height
              var cx=0
              var cy=this.state.lastAllowedXY.y
              //let reducewidth = ((this.state.lastAllowedXY.x + this.state.lastAllowedXY.width) - event.x);
              
              // if(0<event.x){
                if(this.props.prods.length===0){
                  //no prods inside
                  if(prevBrandX!==null&&prevBrandX>event.x){
                    cx=prevBrandX
                    cwidth=currbrand.drawWidth
                  }else if(prevBrandX===null&&event.x<0){
                    cwidth=currbrand.drawWidth
                    cx=0
                  }else{
                    cwidth=currbrand.drawWidth
                    cx=event.x
                  }
                 
                }else if(prevBrandX!==null&&prevBrandX>event.x){
                  // notallow
                  cwidth=(this.props.x+this.props.width)-prevBrandX
                  cx=prevBrandX
                }else if(prevBrandX===null&&event.x<0){
                  cwidth=(this.props.x+this.props.width)-prevBrandX
                  cx=0
                }
                else
                if(this.props.MinStartX<event.x){
                  //not allow min prod
                  cwidth=(this.props.x+this.props.width)-this.props.MinStartX
                  cx=this.props.MinStartX
                }else 
                if(event.x>(this.props.x+this.props.width)){
                  cx=(this.props.x+this.props.width)-10
                  cwidth=10
                }else
                {
                  //allow
                  cwidth=(this.props.x+this.props.width)-event.x
                  cx=event.x
                }
              // }
              // else{
              //   cwidth=this.props.width
              //   cx=0
              // }
              
                
                
              
              this.setState({ lastAllowedXY: {x: cx, y: cy, 
                width: cwidth, 
                height: cheight} });

        })
        .on('end', (event) => {
          this.props.updateBrandProps(this.props.parentidx,this.props.curno,this.state.lastAllowedXY);
        });
      handleResizeX2(d3.select(this[("rsx_"+this.props.fidx+"_2")]));

    }
    propComparator = (propName) =>(a, b) => a[propName] === b[propName] ? 0 : a[propName] < b[propName] ? -1 : 1
    //check if allow to resize or move rect
    checkAllowMoveResize = (event, isresize, isheight, isactionend) => {
      const checkevt = JSON.parse(JSON.stringify(event));
      let lastxdetails = this.state.lastAllowedXY;
      
      //if resize/move allowed
      let isallowchange = {isallow: false, obj: checkevt};
      //is end check and rect is not changed
      if(isactionend){
        if(lastxdetails.x === checkevt.x && lastxdetails.y === checkevt.y){
          return false;
        }
      }
      

      //let srectx1 = roundOffDecimal(checkevt.x,2);
      //let srecty1 = roundOffDecimal(checkevt.y,2);
      //let srectx2 = roundOffDecimal((checkevt.x + this.state.lastAllowedXY.width),2);
      //let srecty2 = roundOffDecimal((checkevt.y + this.state.lastAllowedXY.height),2);

      /* if(isresize){
        srectx1 = roundOffDecimal(this.state.lastAllowedXY.x,2);
        srecty1 = roundOffDecimal(this.state.lastAllowedXY.y,2);

        if(isheight){
          let reduceheight = ((this.state.lastAllowedXY.y + this.state.lastAllowedXY.height) - checkevt.y);
          let newheight = roundOffDecimal((this.state.lastAllowedXY.height - reduceheight),2);

          srectx2 = roundOffDecimal((this.state.lastAllowedXY.x + this.state.lastAllowedXY.width),2);
          srecty2 = roundOffDecimal((this.state.lastAllowedXY.y + newheight),2);
        } else{
          let reducewidth = ((this.state.lastAllowedXY.x + this.state.lastAllowedXY.width) - checkevt.x);
          let newwidth = roundOffDecimal((this.state.lastAllowedXY.width - reducewidth),2);
          
          srectx2 = roundOffDecimal((this.state.lastAllowedXY.x + newwidth),2);
          srecty2 = roundOffDecimal((this.state.lastAllowedXY.y + this.state.lastAllowedXY.height),2);
        }
      } */
      
      //console.log(isallowchange);
      return isallowchange;
    } 

    handleResizeHandlers = (ismouseup) => {
      this.setState({ isDragging: ismouseup });
    }

    render() {
      //console.log(this.props.mainitem);
      return <g>
        <rect x={this.state.lastAllowedXY.x} y={this.state.lastAllowedXY.y} width={this.state.lastAllowedXY.width} height={this.state.lastAllowedXY.height} ref={(r) => this[this.props.fidx] = r} 
        stroke={this.props.color?this.props.color:"#dc3545"} strokeWidth="2" strokeDasharray="3" fill={"none"} />
        
        {this.props.isshowcontrols?<>
          <rect x={this.state.lastAllowedXY.x} className="resize-controls-y" ref={(r) => this[("rsx_"+this.props.fidx+"_2")] = r} y={this.state.lastAllowedXY.y} width={"3"} height={this.state.lastAllowedXY.height} fill={this.props.color?this.props.color:"#dc3545"} fillOpacity={"0.9"} />
          <rect x={(this.state.lastAllowedXY.x + this.state.lastAllowedXY.width) - 3} className="resize-controls-y" ref={(r) => this[("rsx_"+this.props.fidx)] = r} y={this.state.lastAllowedXY.y} width={"3"} height={this.state.lastAllowedXY.height} fill={this.props.color?this.props.color:"#dc3545"} fillOpacity={"0.9"} />
        </>:<></>}
        
      </g>
    }
}
