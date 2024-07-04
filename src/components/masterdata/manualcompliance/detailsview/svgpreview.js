import React from "react";
import * as d3 from "d3";
import { Col } from "react-bootstrap";

import i18n from "../../../../_translations/i18n"; 

import { alertService } from "../../../../_services/alert.service";

export default class SvgPreview extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            startMoveobj:null,
            newrectstart: null,
            isviewcmenu: false, contxtmenu: {xpos:0, ypos: 0, xidx: 0},
            isshowdash: false, dashrect: { startx:0, starty: 0, x: 0, y: 0, width: 0, height: 0 }
        }
    }

    componentDidMount(){
        this._isMounted = true;

        if(this._isMounted){
            // this.props.pickRatios();
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    startNewRect = (e) => {
        //console.log(e.nativeEvent.offsetX,e.nativeEvent.offsetY);
        if(!this.props.isEdit && e.nativeEvent.which === 1){ //only left mouse click
            this.setState({
                newrectstart: {x: e.nativeEvent.offsetX, y:e.nativeEvent.offsetY},
                isshowdash: true, dashrect: { startx: e.nativeEvent.offsetX, starty: e.nativeEvent.offsetY, x: e.nativeEvent.offsetX, y:e.nativeEvent.offsetY, width: 0, height: 0 }
            });
        }
    }

    changeDashRect = (e) => {
        if (!this.props.isEdit && this.state.isshowdash) {
            var cobj = this.state.dashrect;
            
            cobj["x"] = (cobj.startx < e.nativeEvent.offsetX?cobj.x:e.nativeEvent.offsetX);
            cobj["y"] = (cobj.starty < e.nativeEvent.offsetY?cobj.y:e.nativeEvent.offsetY);
            cobj["width"] = (cobj.startx < e.nativeEvent.offsetX?Math.abs(e.nativeEvent.offsetX - cobj.startx):Math.abs(cobj.startx - e.nativeEvent.offsetX));
            cobj["height"] = (cobj.starty < e.nativeEvent.offsetY?Math.abs(e.nativeEvent.offsetY - cobj.starty):Math.abs(cobj.starty - e.nativeEvent.offsetY));

            this.setState({ dashrect: cobj });
        }
    }

    drawNewRect = (e) => {
        var creactlist = this.props.rectsets;
        //console.log(e.nativeEvent.offsetX,e.nativeEvent.offsetY);

        if(!this.props.isEdit && e.nativeEvent.which === 1){ //only left mouse click
            var newrectstart = this.state.newrectstart;
            var newrectend = {x: e.nativeEvent.offsetX, y:e.nativeEvent.offsetY};
            var rectobj = {x:0, y:0, width:0, height: 0};

            if(newrectstart && newrectstart.x !== newrectend.x && newrectstart.y !== newrectend.y){
                rectobj.color="#ff0000";
                rectobj.changeId=-1;
                rectobj.changeType=[];
                rectobj.changeDesc="";
                rectobj.productName="";
                rectobj.productId="";
                rectobj.color="";
                rectobj.ratioX=((newrectstart.x < newrectend.x?newrectstart.x:newrectend.x)-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                rectobj.ratioY=((newrectstart.y < newrectend.y?newrectstart.y:newrectend.y)-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                rectobj.x = (newrectstart.x < newrectend.x?newrectstart.x:newrectend.x);
                rectobj.y = (newrectstart.y < newrectend.y?newrectstart.y:newrectend.y);
                rectobj.ratioWidth=((newrectstart.x < newrectend.x?(newrectend.x-newrectstart.x):(newrectstart.x-newrectend.x)))/this.props.selectedAiImg.ratio;
                rectobj.ratioHeight=((newrectstart.y < newrectend.y?(newrectend.y-newrectstart.y):(newrectstart.y-newrectend.y)))/this.props.selectedAiImg.ratio;
                rectobj.width = (newrectstart.x < newrectend.x?(newrectend.x-newrectstart.x):(newrectstart.x-newrectend.x));
                rectobj.height = (newrectstart.y < newrectend.y?(newrectend.y-newrectstart.y):(newrectstart.y-newrectend.y));
                
                var xendofimage=((rectobj.x+rectobj.width)-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;

                if ((rectobj.ratioX > 0 && rectobj.ratioX < this.props.selectedAiImg.imageWidth)&&(xendofimage<this.props.selectedAiImg.imageWidth)) {
                   creactlist.push(rectobj);
                }else{
                    alertService.warn(i18n.t("DRAW_INSIDE_IMAGE"))
                }
                            
            } 

            this.setState({isshowdash: false, dashrect: { startx: 0, starty: 0, x: 0, y: 0, width: 0, height: 0 }}, () => {
                //console.log(this.state.rectsets);
                this.props.setRects(creactlist)
            });
        }
    }

    updateRectProps = (cidx,cval1,cval2,issize) => {
        if(!this.props.isEdit){
            const crectlist = this.props.rectsets;
            if(issize){
                //resize
                crectlist[cidx].width = cval1;
                crectlist[cidx].height = cval2;
                crectlist[cidx].ratioWidth=cval1/this.props.selectedAiImg.ratio;
                crectlist[cidx].ratioHeight=cval2/this.props.selectedAiImg.ratio;

            } else{
                //move
                crectlist[cidx].x = cval1;
                crectlist[cidx].y = cval2;
                crectlist[cidx].ratioX = (cval1-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                crectlist[cidx].ratioY = (cval2-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
            }
            this.props.setRects(crectlist);
        }
    }
    updateRectPropsinEnd = (cidx,cval1,cval2,issize,evx,evy) => {
            const crectlist = this.props.rectsets;
            
            if(issize){
                //resize
                crectlist[cidx].width = cval1;
                crectlist[cidx].height = cval2;
                
                    var maxX=this.props.selectedAiImg.imageWidth
                    var maxY=this.props.selectedAiImg.imageHeight
                    var chngingX=(evx-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                    var chngingY=(evy-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                    if(chngingX<maxX){
                        //inside image
                        crectlist[cidx].ratioWidth=cval1/this.props.selectedAiImg.ratio;
                    }else{
                        //go to out of image
                        //set width
                        var width=cval1/this.props.selectedAiImg.ratio
                        var needtominx=chngingX-maxX
                        var newwidth=width-needtominx
                        crectlist[cidx].ratioWidth=newwidth;
                        crectlist[cidx].width = newwidth*this.props.selectedAiImg.ratio;
                    }
                    if(chngingY<maxY){
                        //inside y
                        crectlist[cidx].ratioHeight=cval2/this.props.selectedAiImg.ratio;
                    }else{
                        //go to out of image
                        //set height
                        var height=cval2/this.props.selectedAiImg.ratio
                        var needtominy=chngingY-maxY
                        var newheight=height-needtominy
                        crectlist[cidx].ratioHeight=newheight;
                        crectlist[cidx].height = newheight*this.props.selectedAiImg.ratio;
                    }
                }else{
                    //move
                    //check x
                    var ratioX= (cval1-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                    var xendofimage=ratioX+ (crectlist[cidx].width/this.props.selectedAiImg.ratio)
                    var ratioY= (cval2-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                    var yendofimage=ratioY+ (crectlist[cidx].height/this.props.selectedAiImg.ratio)
                    // console.log(xendofimage,ratioX,this.props.selectedAiImg.imageWidth);
                    if ((ratioX > 0 && ratioX < this.props.selectedAiImg.imageWidth)&&( xendofimage< this.props.selectedAiImg.imageWidth)) {
                         //in image x axis
                        crectlist[cidx].x = cval1;
                        crectlist[cidx].ratioX = (cval1-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                    }else{
                        //not in image x axis
                        crectlist[cidx].x = this.state.startMoveobj.x;
                        crectlist[cidx].ratioX = (this.state.startMoveobj.x-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                    }
                    if ((ratioY > 0 && ratioY < this.props.selectedAiImg.imageHeight)&&( yendofimage< this.props.selectedAiImg.imageHeight)) {
                          //in image Y axis
                        crectlist[cidx].y = cval2;
                        crectlist[cidx].ratioY = (cval2-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                    }else{
                         //not in image Y axis
                        crectlist[cidx].y = this.state.startMoveobj.y;
                        crectlist[cidx].ratioY = (this.state.startMoveobj.y-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                    }
                    // crectlist[cidx].x = cval1;
                    // crectlist[cidx].y = cval2;
                    // crectlist[cidx].ratioX = (cval1-this.props.selectedAiImg.imageSize.drawX)/this.props.selectedAiImg.ratio;
                    // crectlist[cidx].ratioY = (cval2-this.props.selectedAiImg.imageSize.drawY)/this.props.selectedAiImg.ratio;
                }

            this.props.setRects(crectlist);
    
    }

    //setting state to moving start point
    setbforemove=(idx)=>{
        const crectlist = this.props.rectsets;
        // console.log(crectlist[idx]);
        this.setState({startMoveobj:{x:crectlist[idx].x,y:crectlist[idx].y}})

    }
    //toggle context menu
    handleContextMenu = (isshow, citem, cidx) => {
        if(!this.props.isEdit){
            var cobj = {xpos: (citem.x + citem.width), ypos: citem.y, xidx: cidx, citem: citem};
            this.setState({ isviewcmenu: isshow, contxtmenu: cobj });
        }
    }
    //handle delete rect
    handleDeleteRect = () => {
        var cmenu = this.state.contxtmenu;
        if(cmenu && cmenu.xidx > -1){
            var callrects = this.props.rectsets;
            callrects.splice(cmenu.xidx,1);
            this.props.setRects(callrects)
            this.setState({ isviewcmenu: false,  contxtmenu: {xpos:0, ypos: 0, xidx: 0} },()=>{
               
            });
        }
    }

  //image loading
  loadingImages=()=>{
      this.props.imageloadFalse();
    //console.log("image loaded");
  }
   //change cmenu object values
   handleChangeObj = (ckey, cval) => {
        var cmenu = this.state.contxtmenu;
        if(cmenu && cmenu.xidx > -1){
            cmenu.citem[ckey] = cval;

            var callrects = this.props.rectsets;
            callrects[cmenu.xidx] = cmenu.citem;
            
            this.props.setRects(callrects)
            this.setState({ contxtmenu: cmenu });
        }
   }

    render() {
        
        const imageSize = this.props.selectedAiImg?this.props.selectedAiImg.imageSize:{ drawWidth : 0,drawHeight : 0,drawX : 0,drawY : 0};
        
        return (<div className="mainsvg-content" onContextMenu={e => e.preventDefault()}>
        {this.state.isviewcmenu?<ContextMenu isRTL={this.props.isRTL} citem={this.state.contxtmenu.citem} handlechangeobj={this.handleChangeObj} handledelete={this.handleDeleteRect} handlclose={() => this.setState({isviewcmenu:false})} 
        xpos={this.state.isviewcmenu?this.state.contxtmenu.xpos:0} ypos={this.state.isviewcmenu?this.state.contxtmenu.ypos:0} />:<></>}

            <Col className="svgthumbcomplance">
                <ul>
                    {this.props.aiImages.length>0?this.props.aiImages.map((thumb,i)=>
                        <React.Fragment key={i}>
                            <li>
                                <Col className="thumb-preview"><img src={thumb.thumbImageUrl} className="img-resize-ver" alt="" onClick={()=>this.props.changeSvgThumb(thumb.aiImageId)}/></Col>
                            </li>
                        </React.Fragment>
                    ):<></>}
                </ul>    
            </Col>
            <Col className="preview-wrapper">
                <svg id="testbg" onMouseDown={this.startNewRect} color={(this.props.dmode?'#2CC990':'#5128a0')} onMouseMove={this.changeDashRect} onMouseUp={this.drawNewRect} width={(this.props.divWidth - 30)} height="450px" style={{border:"2px solid"}} version="1.1" xmlns="http://www.w3.org/2000/svg">
                    {this.props.selectedAiImg&&<image onMouseDown={(e)=>e.preventDefault()} onLoad={this.loadingImages} onError={this.loadingImages} pointerEvents="all" x={(imageSize?imageSize.drawX:0)} y={(imageSize?imageSize.drawY:0)} width={(imageSize?(imageSize.drawWidth+"px"):0)} height={imageSize?(imageSize.drawHeight+"px"):0} href={this.props.selectedAiImg.imageUrl} draggable={false} style={{outlineColor:"#ccc"}} />}
                    {this.props.rectsets.map((xitem,xidx) => {
                        return <g key={xidx}>
                            <Rect visibleNo={this.props.visibleNo} isEdit={this.props.isEdit} curno={xidx} fidx={"rct-"+xidx} x={xitem.x} y={xitem.y} width={xitem.width} height={xitem.height} handleContextMenu={this.handleContextMenu} mainitem={xitem} updateRectPropsinEnd={this.updateRectPropsinEnd} updateRectProps={this.updateRectProps} setbforemove={this.setbforemove} />
                        </g>
                    })}
                    {this.state.isshowdash?<rect x={this.state.dashrect.x} y={this.state.dashrect.y} 
                    width={this.state.dashrect.width} height={this.state.dashrect.height} fill="none" stroke="yellow" strokeDasharray={[2,2]} strokeWidth={2}></rect>:<></>}
                </svg>
            </Col>
        </div>);    
    }
}

function ContextMenu(props) {
    var xPos = props.xpos; //x position
    var yPos = props.ypos; //y position
    //console.log(props);
    //handle click a button. type: 1-expand, 2-delete, 3-close, 4-delete all
    const handleClick = (type,event) => {
        if(type === 1){
            props.handledelete();
        } if(type === 3){
            props.handlechangeobj("color",event.target.value);
        } else{
            props.handlclose();
        }
    }

    return (<div className="rect-context-menu" style={{ top: yPos, left: xPos, }}>
        <ul className="text-center">
            {/* <li><Form.Control type="color" value={(props.citem.color?props.citem.color:"#ff0000")} onChange={(e) => handleClick(3,e)} /></li><hr/> */}
            <li onClick={() => handleClick(1)}>{i18n.t("btnnames.delete")}</li><hr/>
            <li onClick={() => handleClick(2)}>{i18n.t("btnnames.close")}</li>
        </ul>
    </div>
    );
}

class Rect extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            rectsets: [],
            newrectstart: null,
            resize_mousedown_points: null,
        }
    }

    componentDidMount() {
        if(!this.props.isEdit){
            const handleDrag = d3.drag()
            .subject(() => {
            const me = d3.select(this[this.props.fidx]);
            return { x: me.attr('x'), y: me.attr('y') }
            })
            .on('start', (event) => {
                if(!this.props.isEdit){
                    const me = d3.select(this[this.props.fidx]);
                    me.attr('x', event.x);
                    me.attr('y', event.y);

                    this.props.setbforemove(this.props.curno);      
                }
            })
            .on('drag', (event) => {
                if(!this.props.isEdit){
                    const me = d3.select(this[this.props.fidx]);
                    me.attr('x', event.x);
                    me.attr('y', event.y);

                    this.props.updateRectProps(this.props.curno,event.x,event.y);      
                }
            })
            .on('end', (event) => {
                if(!this.props.isEdit){
                    const me = d3.select(this[this.props.fidx]);
                    me.attr('x', event.x);
                    me.attr('y', event.y);

                    this.props.updateRectPropsinEnd(this.props.curno,event.x,event.y,false);      
                }
            });
        
            handleDrag(d3.select(this[this.props.fidx]));

            var handleResize = d3.drag()
            .on('drag', (event) => {
                //var c = d3.select(this[this.props.fidx]);
                //console.log(event);
                this.props.updateRectProps(this.props.curno,(event.x - this.props.x),(event.y - this.props.y),true);
            })
            .on('end', (event) => {
                this.props.updateRectPropsinEnd(this.props.curno,(event.x - this.props.x),(event.y - this.props.y),true,event.x,event.y);
            });
            
            handleResize(d3.select(this["rs_"+this.props.fidx]));
        }
    }

    handleMouseClick = (e) => {
        if(e.nativeEvent.which === 3){ //right click
            this.props.handleContextMenu(true, this.props.mainitem, this.props.curno);
        }
    }

    render() {
      return <g>
         
        <rect x={this.props.x} y={this.props.y} width={this.props.width} height={this.props.height} ref={(r) => this[this.props.fidx] = r} onMouseDown={this.handleMouseClick} stroke="yellow" strokeWidth="2" fill={this.props.visibleNo?"#ff0000":"none"} fillOpacity="0.6" />
        <rect x={((this.props.x+this.props.width) - 20)} ref={(r) => this["rs_"+this.props.fidx] = r} y={((this.props.y+this.props.height) - 20)} width="15" height="15" fill={this.props.visibleNo?"white":"none"} fillOpacity="0.9" />
        {this.props.visibleNo&&<circle r="12" cx={(this.props.x+13)} cy={(this.props.y+13)}   width="25" height="25"  stroke="white" strokeWidth="1" fill={this.props.mainitem.color && this.props.mainitem.color!==""?this.props.mainitem.color:"#dc3545"}  />}
        {this.props.visibleNo&&<text textAnchor="middle" fill="white" x={(this.props.x+13)} y={(this.props.y+19)} fontSize="18" fontWeight={"700"} className="shadow" >{(this.props.curno+1)}</text>}
      </g>
    }
  }