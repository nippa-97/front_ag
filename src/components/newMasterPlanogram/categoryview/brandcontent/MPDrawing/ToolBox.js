import React, { Component } from 'react';
import { Col } from 'react-bootstrap'; //Dropdown
import FeatherIcon from 'feather-icons-react';

import { TooltipWrapper } from '../../../AddMethods';

export default class MPToolBox extends Component {
    constructor(props){
        super(props);

        this._isMounted = false;
        
        this.state = {
            
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

    render() {

        return (<>
            <Col className="mp-toolbox">
                <Col className="sub-content">
                    <label>{this.props.t("TOOLS")}</label>
                    <ul style={{paddingRight:"0px"}}>
                        <TooltipWrapper text={"CRTL + D - "+this.props.t("rect_draw")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool aui-disable '+(this.props.activeTool==="draw"?"active":"")} onClick={() => this.props.changeDrawType("subc")}>
                                <FeatherIcon icon="layout" size="22" />
                            </li>
                        </TooltipWrapper>
                        <TooltipWrapper text={"CRTL + M - "+this.props.t("PAN")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool '+(this.props.activeTool==="pan"?"active":"")} onClick={() => this.props.changeTool("pan")}>
                                <FeatherIcon icon="move" size="22" />
                            </li>
                        </TooltipWrapper>
                        <TooltipWrapper text={"CRTL + Z - "+this.props.t("btnnames.undo")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool aui-disable '+(this.props.historyData && this.props.historyData.past.length > 0?'':'disabled')} onClick={() => this.props.handleUndoRedo("undo")}>
                                <FeatherIcon icon="corner-up-left" size="22" />
                            </li>
                        </TooltipWrapper>
                        <TooltipWrapper text={"CRTL + Y - "+this.props.t("btnnames.redo")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool aui-disable '+(this.props.historyData && this.props.historyData.future.length > 0?'':'disabled')} onClick={() => this.props.handleUndoRedo("redo")}>
                                <FeatherIcon icon="corner-up-right" size="22" />
                            </li>
                        </TooltipWrapper>
                    </ul>
                </Col>
            </Col>

            <Col className="mp-toolbox aui-toolmargin" style={{marginTop:"170px"}}>
                <Col className="sub-content">
                    <ul style={{paddingRight:"0px"}}>
                        <TooltipWrapper text={"CRTL + ] - "+this.props.t("ZOOM_IN")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool'} onClick={() => this.props.handleZoomInOut(true)}>
                                <FeatherIcon icon="plus" size="22" />
                            </li>
                        </TooltipWrapper>
                        <TooltipWrapper text={"CRTL + [ - "+this.props.t("ZOOM_OUT")} placement={this.props.isRTL?"left":"right"}>
                            <li className={'single-tool'} onClick={() => this.props.handleZoomInOut(false)}>
                                <FeatherIcon icon="minus" size="22" />
                            </li>
                        </TooltipWrapper>

                        {(this.props.zoomDrawX > 0 || this.props.activeTool === "pan")?
                        <TooltipWrapper text={this.props.t("RESET_ZOOM")} placement={this.props.isRTL?"left":"right"}>
                            <li onClick={() => this.props.handleZoomInOut(false,true)} className={'single-tool'}>
                                <FeatherIcon icon="x" size="22" />
                            </li>
                        </TooltipWrapper>:<></>}
                    </ul>
                </Col>
            </Col>
        </>);
    }
}



