import React, { Component } from 'react'
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { Button, Dropdown } from 'react-bootstrap';
import { ExcelPrintFieldWiseIcon, ExcelPrintIcon, PDFFieldPrintIcon, PDFPrintIcon, StackableALLI, StackableI } from '../../../../../../assets/icons/icons';
import { XIcon } from '@primer/octicons-react';
import { TooltipWrapper } from '../../../../AddMethods';

class SimEditToolBox extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        return (
            <div className={"toolbox"+(this.props.contxtmenu&&this.props.contxtmenu.isexpand?" expand":"")}>
                <ul className={"svg-toolkit newpgtop-btnlist list-inline"} style={{marginTop:"-2px", paddingRight:"0px"}}>
                    <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}}><h4>{this.props.t("TOOLS")}</h4></li>
                    <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}} title={this.props.t("resetZoom")}><Button variant="outline-dark"  disabled={this.props.zoomXRatio > 0?false:true} onClick={() => this.props.handleZoomInOut(false,true)} className={"btn-with-icon "} size="sm" ><FeatherIcon icon={"rotate-ccw"} size={14} /></Button></li>
                    {/* {this.props.zoomXRatio > 0? */}
                        <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}} title={this.props.t("PAN")}><Button disabled={this.props.zoomXRatio > 0?false:true} variant="outline-dark" active={this.props.activeTool === "pan"}  onClick={() => this.props.toggleZoompan()} className={"btn-with-icon "} size="sm" ><FeatherIcon icon={"move"} size={14} /></Button></li>
                    {/* :<></>} */}
                    <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}} title={this.props.t("mark_stackable")}><Button variant="outline-dark" active={this.props.markablestackable}  onClick={()=>this.props.StackablemarkableToggle()} disabled={(this.props.loadingstackablecall||((this.props.isDisableEDitingwithfullscreen||this.props.isDisableEdits)))} className={"btn-with-icon "} size="sm" ><StackableI   /></Button></li>
                    <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}} title={this.props.t("mark_stackable_all")}><Button variant="outline-dark"  onClick={()=>this.props.StackablemarkableAllToggle()} disabled={(this.props.loadingstackablecall||this.props.markablestackable)||((this.props.isDisableEDitingwithfullscreen||this.props.isDisableEdits))}   className={"btn-with-icon "} size="sm" ><StackableALLI   /></Button></li>
                    {/* <li className={"list-inline-item tool-controls-list"} style={{marginRight:"5px"}}>
                        {this.props.IsShowStackables?<Button variant="outline-dark"   className={"btn-with-icon "} size="sm" onClick={()=>this.props.ToggleshowhideStack()} title={this.props.t("HideStackable")}><FeatherIcon icon="eye-off"   size={16} /></Button>:
                        <Button variant="outline-dark"   className={"btn-with-icon "} size="sm" onClick={()=>this.props.ToggleshowhideStack()} title={this.props.t("ShowStackable")}><FeatherIcon icon="eye"   size={16} /></Button>}
                    </li> */}

                    <li className={"list-inline-item tool-controls-list d-none"+(this.props.isshowedit?" fieldeditdisable":"")} style={{marginRight:"15px"}}><Button variant="outline-dark" onClick={() => this.props.handleToolControls('simulation-mainsvg-view',"drawBlock")} className={"btn-with-icon "+(this.props.activeTool === "drawBlock"?"active":"")} size="sm" title= {this.props.t('DRAW_BLOCK')}><FeatherIcon icon="maximize" size={14}/></Button></li>
                    <li className={"list-inline-item "+(this.props.isRTL === "rtl"?"float-left ":"float-right ")+(this.props.contxtmenu&&this.props.contxtmenu.isexpand?"":"d-none")}><Button variant="outline-warning" className="btn-with-icon" size="sm" onClick={this.props.removeExpandOpts} style={{marginRight:"5px"}}><XIcon size={14}/> {this.props.t('expand')}</Button></li>
                    <li className={'list-inline-item history-icons '+(this.props.isRTL === "rtl"?"float-left ":"float-right ")} title={this.props.t("btnnames.redo")}>
                        <Button variant="outline-dark" disabled={(this.props.historyData && this.props.historyData.future.length > 0?false:true)} 
                        className={"btn-with-icon"} onClick={() => this.props.fieldHistoryRedo()} size="sm" title={this.props.t("btnnames.redo")}><FeatherIcon icon="corner-up-right" size={14} /></Button>
                    </li>
                    <li className={'list-inline-item history-icons '+(this.props.isRTL === "rtl"?"float-left ":"float-right ")} title={this.props.t("btnnames.undo")}>
                        <Button variant="outline-dark" disabled={(this.props.historyData && this.props.historyData.past.length > 0?false:true)} 
                        className={"btn-with-icon"} onClick={() => this.props.fieldHistoryUndo()} size="sm" title={this.props.t("btnnames.undo")}><FeatherIcon icon="corner-up-left" size={14} /></Button>
                    </li>
                    <li className={'list-inline-item history-icons '+(this.props.isRTL === "rtl"?"float-left ":"float-right ")}>
                        {/* <Button variant="outline-dark" disabled={(this.props.mapproductList&&this.props.mapproductList.length>0)?false:true}  className={"btn-with-icon printicon"} onClick={() => this.props.print()} size="sm" title={this.props.t("PRINT_SIMULATION")}><FeatherIcon icon="printer" size={14} /></Button> */}
                        <Dropdown drop='up' className='printdrop-down upview editview'>
                            <Dropdown.Toggle variant="success" disabled={(this.props.mapproductList && this.props.mapproductList.length>0)?false:true}>
                                <FeatherIcon icon="printer"  size={14} />
                            </Dropdown.Toggle>

                            <Dropdown.Menu style={{paddingTop: "18px"}}>
                                <ul className='list-inline'>
                                    <li className='list-inline-item' onClick={() => this.props.printInit(false, false, false)}><TooltipWrapper text={this.props.t("SIM_PRINT_PDF")}><span><PDFPrintIcon size={26} /></span></TooltipWrapper></li>
                                    <li className='list-inline-item simfield-print' onClick={() => this.props.printInit(false, false, true)}><TooltipWrapper text={this.props.t("SIM_PRINT_PDF_FIELDWISE")}><span><PDFFieldPrintIcon size={26} /></span></TooltipWrapper></li>
                                    <li className='list-inline-item' onClick={() => this.props.printInit(true, false, false)}><TooltipWrapper text={this.props.t("SIM_PRINT_EXCEL")}><span><ExcelPrintIcon size={26} /></span></TooltipWrapper></li>
                                    <li className='list-inline-item simfield-print' onClick={() => this.props.printInit(true, false, true)}><TooltipWrapper text={this.props.t("SIM_PRINT_EXCEL_FIELDWISE")}><span><ExcelPrintFieldWiseIcon size={26} /></span></TooltipWrapper></li>
                                </ul>
                            </Dropdown.Menu>
                        </Dropdown>
                    </li>
                </ul>
            </div>
        )
    }
}
export default withTranslation()(withRouter(SimEditToolBox));
