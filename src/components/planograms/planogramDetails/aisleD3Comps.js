import React from "react";
import * as d3 from "d3";
import { checkIsInsideofBox } from "../../../_services/common.service";

export class AisleRect extends React.Component {
    constructor() {
        super();

        this.state = {
            startx: 0,
            starty: 0,

            moveXY: { x: 0, y: 0 },
        }
    }

    componentDidMount() {
        //set default x,y details
        let viewobj = this.props.aislerect;
        this.setState({
            moveXY: { x: viewobj.x, y: viewobj.y},
        });
        var dragthis = false;
        var isdrag = false;

        //init d3
        if(this.props.isDisableEdit === false){
            const handleDrag = d3.drag()
            .on('start', (event) => {
                //set start position details for reset
                this.setState({ startx: this.props.aislerect.x, starty: this.props.aislerect.y });
            })
            .on('drag', (event) => {
                if (!this.props.planoLock) {
                    
                    if ((event.dx > -3 || event.dx < 3) && (event.dy > -3 || event.dy < 3)) {
                        dragthis = true
                    }

                    if (dragthis === true) {
                        isdrag = true
                        //on drag update aisle drag location
                        let newx = event.x - (viewobj.drawWidth) / 2;
                        let newy = event.y - (viewobj.drawDepth) / 2;

                        this.setState({ moveXY: { x: newx, y: newy }});
                    }
                }
            })
            .on('end', (event) => {
                if (!this.props.planoLock) {
                    if (isdrag === true) {
                        this.props.planoChangeHappen();
                        //update aisle location details
                        //check allow to drop - overlap check
                        let allowToAdd = true;
                        for (let i = 0; i < this.props.isleRects.length; i++) {
                            const islerect = this.props.isleRects[i];
                            
                            if(islerect.f_uuid !== viewobj.f_uuid){
                                let rectAllow = this.props.checkThroughProducts((event.x - (viewobj.drawWidth) / 2), (event.y - (viewobj.drawDepth) / 2), viewobj.drawWidth, viewobj.drawDepth, islerect, viewobj.rotation);
                                if (!rectAllow) {
                                    allowToAdd = false;
                                    break;
                                }
                            }
                        }
                        //if allow to drop
                        if (allowToAdd) {
                            //check is it inside layout
                            // let isInsideofFloorSnap = checkIsInsideofBox(this.props.drawFloorWidth, this.props.drawFloorHeight, 0, 0, viewobj.drawWidth, viewobj.drawDepth, event.x, event.y, viewobj.rotation);
                            let isInsideofFloorSnap = checkIsInsideofBox(this.props.drawFloorWidth, this.props.drawFloorHeight, 0, 0, viewobj.drawWidth, viewobj.drawDepth, (event.x - (viewobj.drawWidth) / 2), (event.y-(viewobj.drawDepth) / 2), viewobj.rotation);
                            
                            
                            if(isInsideofFloorSnap){
                                //update aisle details
                                this.props.updateIsleMoveChanges(this.props.aisleidx, event, viewobj,this.state.startx,this.state.starty);
                            } else{
                                this.resetRectPostion();
                            }

                        } else {
                            this.resetRectPostion();
                        }
                    }
                }
                isdrag = false;
                dragthis = false
            });

            handleDrag(d3.select(this[this.props.aislerect.f_uuid]));
        }
    }
    //reset aisle postion to start postion
    resetRectPostion = () => {
        let newx = this.state.startx;
        let newy = this.state.starty;

        this.setState({ moveXY: { x: newx, y: newy }});
    }
    
    render() {
        let { aislerect } = this.props;
        let { moveXY } = this.state;

        return (<g className="aisle-rect">
            <rect y={moveXY.y} x={moveXY.x} height={aislerect.drawDepth} width={aislerect.drawWidth} fill="green" fillOpacity={0.6}
            transform={"rotate(" + aislerect.rotation + " " + (moveXY.x + aislerect.drawWidth / 2) + " " + (moveXY.y + aislerect.drawDepth / 2) + ") "}
            ref={(r) => this[aislerect.f_uuid] = r}
            style={{ cursor: "pointer" }} onClick={e => this.props.clickaisle(e, aislerect)}
            />

            {this.props.isDisableEdit === false?
            <circle className="aisle-circle" cx={moveXY.x} cy={moveXY.y} r="5" stroke="black" strokeWidth="1" fill="red"
                transform={"rotate(" + aislerect.rotation + " " + (moveXY.x + aislerect.drawWidth / 2) + " " + (moveXY.y + aislerect.drawDepth / 2) + ") "}
                onMouseDown={(e) =>  !this.props.planoLock&&this.props.handlerotationStart(e, true, aislerect, this[aislerect.f_uuid], aislerect.rotation)} />
            :<></>}
        </g>)
    }
}