import React from 'react';
import FeatherIcon from 'feather-icons-react';
import { CopyToClipboard } from 'react-copy-to-clipboard'; //copy text to clipboard

import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';
import { ExpandDropDown, SingleProdLineChart } from './additionalcontents';
import { PopoverWrapper, TooltipWrapper } from '../AddMethods';
import { ArigoRobotIcon } from '../../../assets/icons/icons';
import { numberWithCommas, roundOffDecimal } from '../../../_services/common.service';

import storeicon from '../../../assets/img/icons/store.png';
import loaderanime from '../../../assets/img/loading-sm.gif';
import { alertService } from '../../../_services/alert.service';
// import { newProductSuggestionMap, mapViewTypes } from '../../../enums/aristoMapDataEnums';

/**
 *
 *
 * @export
 * @class SingleNotificationComponent
 * @extends {React.Component}
 */
export default class SingleNotificationComponent extends React.Component{
    constructor(props){
        super(props);

        this._ismounted = false;
        
        this.state = {
            currencyType: "₪",
        }
    }
      
    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }

    getSinglePSS = (cobj, ctype) => {
        let pervalue = 0;
        if(cobj.categoryPSSPercentage && cobj.subCategoryPSSPercentage && cobj.brandPSSPercentage){
            if(ctype === "profit"){
                pervalue = (cobj.pssType === "category"?cobj.categoryPSSPercentage.profitPercentage:cobj.pssType === "subcategory"?cobj.subCategoryPSSPercentage.profitPercentage:cobj.brandPSSPercentage.profitPercentage);
            
            } else if(ctype === "share"){
                pervalue = (cobj.pssType === "category"?cobj.categoryPSSPercentage.sharePercentage:cobj.pssType === "subcategory"?cobj.subCategoryPSSPercentage.sharePercentage:cobj.brandPSSPercentage.sharePercentage);
            
            } else if(ctype === "sales"){
                pervalue = (cobj.pssType === "category"?cobj.categoryPSSPercentage.salesPercentage:cobj.pssType === "subcategory"?cobj.subCategoryPSSPercentage.salesPercentage:cobj.brandPSSPercentage.salesPercentage);
            }
        }

        return pervalue;
    }

    getProfitSaleValue = (cobj, ctype) => {
        let pervalue = 0;
        if(cobj.sales && cobj.profit){
            if(cobj.calculationType === "sales"){
                pervalue = (ctype === "dept"?cobj.sales.departmentPercentage:ctype === "cat"?cobj.sales.categoryPercentage:ctype === "scat"?cobj.sales.subCategoryPercentage:cobj.sales.brandPercentage);
            
            } else{
                pervalue = (ctype === "dept"?cobj.profit.departmentPercentage:ctype === "cat"?cobj.profit.categoryPercentage:ctype === "scat"?cobj.profit.subCategoryPercentage:cobj.profit.brandPercentage);
            }    
        }
        

        if(pervalue > 0){
            pervalue = ('+'+pervalue);
        } else if(pervalue === null){
            pervalue = 0;
        }

        return pervalue;
    }

    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }
    /* suggestMessage=(value)=>{
        var message= this.props.t("AMG.");

        message=(value === mapViewTypes.test)?this.props.t("Expand_Message"):
        (value === newProductSuggestionMap.keep)?this.props.t("Keep_Message"):
        (value === newProductSuggestionMap.remove)?this.props.t("Remove_Message"):message
        
        return message
    } */

    getFontSizeFromTextLength = (text) => {
        let exportsize = (document.body.clientWidth > 1920?16:12);
        let paddingtop = (document.body.clientWidth > 1920?17:16);

        let reducesize = (text.length > 7?(text.length - 7):0);
        
        let newfontsize = (exportsize - reducesize);
        let newpaddingtop = (paddingtop + reducesize);
        

        return { fontSize: newfontsize, paddingTop: newpaddingtop };
    }

    render(){
        let { pitem, pidx } = this.props;
        return (<>
            <Col xs={12} className="single-notification"><Row>
                {pitem.isTestPeriodOver?
                    <Col xs={12} className={'topview-txt '+pitem.testPeriodStatus}>{pitem.testPeriodStatus?this.props.t("NEWPROD_NOTTYPES."+pitem.testPeriodStatus):this.props.t("NEWPROD_NOTTYPES.TestPeriodOver")} <label className='daterange-txt'>{(pitem.testStartDate && pitem.testStartDate !== ""?(pitem.testStartDate+" - "+pitem.testEndDate):"-")}</label></Col>
                :<>
                    <Col xs={12} className={'topview-txt '+(pitem.isOngoing?"Ongoing":"Pending")}>{this.props.t((pitem.isOngoing?"TESTTYPES.ONGOING":"PENDING"))}<label className='daterange-txt'>{(pitem.testStartDate && pitem.testStartDate !== ""?(pitem.testStartDate+" - "+pitem.testEndDate):"-")}</label></Col>
                </>}
                
                <Col xs={12} className={'per-circle '+(pitem.growthPercentage === 0 ?'DeadWalker':pitem.growthPercentage > 0 ?'NewStarIsBorn':'')}>{pitem.growthPercentage?((pitem.growthPercentage > 0?'+':'')+roundOffDecimal(pitem.growthPercentage,2)):0}%</Col>
                <Col xs={pitem.isTestPeriodOver? 8 : 12}>
                    <Row>
                        <Col xs={4}>
                            <Row>
                                <Col xs={4} className='image-view' onClick={() => this.props.handleImagePreviewModal(pitem,true)}>
                                    <TooltipWrapper text={this.props.t("TEST_START_OPTION")+" "+pitem.testStartOption}><label className='teststart-txt'>{pitem.testStartOption}</label></TooltipWrapper>
                                    <img src={pitem.imgUrl} className={"img-resize-ver"} alt="" />
                                </Col>
                                <Col xs={8}>
                                    <h5>
                                        <CopyToClipboard text={pitem.barcode} onCopy={() => this.copyToClipboard()}><small className='barcode-txt'>{pitem.barcode}</small></CopyToClipboard>
                                        <TooltipWrapper text={pitem.productName}>
                                        <span>{pitem.productName.substring(0, 20)+(pitem.productName.length > 20?"..":"")}</span>
                                        </TooltipWrapper> 

                                        <small><TooltipWrapper text={pitem.brandName?pitem.brandName:"-"}><span>{pitem.brandName?(pitem.brandName.substring(0,15)+(pitem.brandName.length > 15?"..":"")):"-"}</span></TooltipWrapper> | 
                                        <TooltipWrapper text={pitem.supplierName?pitem.supplierName:"-"}><span>{pitem.supplierName?(pitem.supplierName.substring(0,15)+(pitem.supplierName.length > 15?"..":"")):"-"}</span></TooltipWrapper></small>

                                        {/* <span className='create-date'>{pitem.createdDate}</span> */}
                                        
                                        <label className='storecount-txt'>
                                            <img src={storeicon} alt='store icon'/>
                                            {(pitem.storeCount?pitem.storeCount.coveredStoreCount:0)}/{(pitem.storeCount?pitem.storeCount.totalStoreCount:0)+" "}
                                            {this.props.t("stores")}
                                           
                                            {pitem.isNotFromFirstRoundImplementation? <TooltipWrapper text={this.props.t("TESTEDSCOUNT_HASBEECHANGED_AFTERTHE_TEST_PERIOD")} ><span className='asterisk-icon'>*</span></TooltipWrapper>:<></>}
                                        </label>
                                    </h5>
                                </Col>
                                <Col xs={12}>
                                    
                                </Col>
                            </Row>

                            {!pitem.isTestPeriodOver && !pitem.isOngoing?<div onClick={() => this.props.handleTestStartToggle(false, pidx)} className='teststart-content testperiod-start pending active'>
                                {this.props.t("LETS_START_TESTPERIOD")} 
                                <label><FeatherIcon icon="play-circle" size={22} /></label>
                            </div>:<></>}

                            {!pitem.isTestPeriodOver && pitem.isOngoing?<div className='teststart-content testperiod-start ongoing active'>
                                <div className='percentage-wrapper' style={{width: (this.props.testCompleteDatesCount(pitem,true)+"%")}}></div>
                                <div className='text-content'><b>{this.props.testCompleteDatesCount(pitem)}</b> {this.props.t("TEST_PERIOD_COMPLETED")} 
                                {/* <label onClick={() => this.props.handleTestStartToggle(true, pidx)}><FeatherIcon icon="x-circle" size={22} /></label> */}</div>
                            </div>:<></>}
                        </Col>
                        <Col xs={2} className='per-wrapper'>
                            {this.getSinglePSS(pitem, "profit") !== null?<Col xs={12} className='per-content'>
                                <div className='per-viewer'><div className='perno' style={{width: this.getSinglePSS(pitem, "profit")+"%"}}></div><b>{this.getSinglePSS(pitem, "profit")}%</b></div>
                                <label>{this.props.t("profit")} </label>
                            </Col>:<></>}

                            {pitem.replaceImpact !== null?<Col xs={12} className={'per-content'}>
                                <div className={'per-viewer'+(pitem.replaceImpact<0?' danger':'')}><b>{pitem.replaceImpact?(this.state.currencyType+numberWithCommas(pitem.replaceImpact)):"N/A"}</b></div>
                                <label>{this.props.t("REPLACE_IMPACT")}</label>
                            </Col>:<></>}
                        </Col>
                        <Col xs={2} className='per-wrapper'>
                            <Col xs={12}>
                                <ul className='list-inline'>
                                    <li className={'list-inline-item'+(pitem.pssType === "category"?" active":"")} onClick={() => this.props.changeSinglePerView(pidx, "category")}>
                                        <TooltipWrapper text={this.props.t("CatelogImportLogTypes.Category")}>
                                            <span>{this.props.t("CatelogImportLogTypes.Category")}</span>
                                        </TooltipWrapper>
                                    </li>
                                    <li className={'list-inline-item'+(pitem.pssType === "subcategory"?" active":"")} onClick={() => this.props.changeSinglePerView(pidx, "subcategory")}>
                                        <TooltipWrapper text={this.props.t("CatelogImportLogTypes.SubCategory")}>
                                            <span>{this.props.t("CatelogImportLogTypes.SubCategory")}</span>
                                        </TooltipWrapper>
                                    </li>
                                    <li className={'list-inline-item'+((!pitem.pssType || pitem.pssType === "brand")?" active":"")} onClick={() => this.props.changeSinglePerView(pidx, "brand")}>
                                        <TooltipWrapper text={this.props.t("CatelogImportLogTypes.Brand")}>
                                            <span>{this.props.t("CatelogImportLogTypes.Brand")}</span>
                                        </TooltipWrapper>
                                    </li>
                                </ul>
                            </Col>
                            <Col className='saleshare-wrapper'>
                                <Row>
                                    <Col xs={6}>
                                        <TooltipWrapper text={(this.getSinglePSS(pitem, "share")+"%")}>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getSinglePSS(pitem, "share")+"%"))}>{this.getSinglePSS(pitem, "share")}%</div>
                                        </TooltipWrapper>
                                        <small className='viewper-txt'>{this.props.t("btnnames.share")}</small>
                                    </Col>
                                    <Col xs={6}>
                                        <TooltipWrapper text={(this.getSinglePSS(pitem, "sales")+"%")}>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getSinglePSS(pitem, "sales")+"%"))}>{this.getSinglePSS(pitem, "sales")}%</div>
                                        </TooltipWrapper>
                                        <small className='viewper-txt'>{this.props.t("SALES")}</small>
                                    </Col>    
                                </Row>    
                            </Col>
                        </Col>
                        <Col xs={4} className='per-wrapper chartview-wrapper'>
                            <Col xs={12} className="pertoggle-group togglenots-list">
                                <ButtonGroup size='sm' className='singleprod-toggle'>
                                    <Button variant='outline-secondary' onClick={() => this.props.handleChangeItem(pidx, "calculationType", "profit")} active={(!pitem.calculationType || pitem.calculationType === "profit")}>{this.props.t("MP_CHART_TITLES.profit")}</Button>
                                    <Button variant='outline-secondary' onClick={() => this.props.handleChangeItem(pidx, "calculationType", "sales")} active={pitem.calculationType === "sales"}>{this.props.t("MP_CHART_TITLES.sales")}</Button>
                                </ButtonGroup>

                                <label className={'singlechart-toggle'+(pitem.isShowChart?" active":"")} onClick={() => this.props.handleChangeItem(pidx, "isShowChart", (pitem.isShowChart?false:true))}><FeatherIcon icon="bar-chart-2" size={18} /></label>
                            </Col>

                            {pitem.isShowChart?
                                    pitem.chartLoading ? 
                                        <img className={ pitem.isTestPeriodOver ? 'loading-chart' : 'loading-chart-ongoing'} src={loaderanime} alt="loading anime" />
                                    :
                                    <SingleProdLineChart t={this.props.t} isRTL={this.props.isRTL} dmode={this.props.dmode} pitem={pitem} />
                            :<>
                                {/* <Col xs={12} className='per-content'>
                                    <div className='per-viewer' style={{width: "0%"}}></div>
                                    <label>{this.props.t("brand")} <b>{this.getProfitSaleValue(pitem, "brand")}%</b></label>
                                </Col> */}
                                <Row>
                                    <Col xs={3}>
                                        <TooltipWrapper text={(this.props.t("CatelogImportLogTypes.Brand")+" "+this.getProfitSaleValue(pitem, "brand")+"%")}><div>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getProfitSaleValue(pitem, "brand")+"%"))}>
                                                {this.getProfitSaleValue(pitem, "brand")}%
                                            </div>
                                            <small className='viewper-txt'>{this.props.t("CatelogImportLogTypes.Brand")}</small>
                                        </div></TooltipWrapper>
                                    </Col>
                                    <Col xs={3}>
                                        <TooltipWrapper text={(this.props.t("CatelogImportLogTypes.SubCategory")+" "+this.getProfitSaleValue(pitem, "scat")+"%")}><div>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getProfitSaleValue(pitem, "scat")+"%"))}>
                                                {this.getProfitSaleValue(pitem, "scat")}%
                                            </div>
                                            <small className='viewper-txt'>{this.props.t("CatelogImportLogTypes.SubCategory")}</small>
                                        </div></TooltipWrapper>
                                    </Col>
                                    <Col xs={3}>
                                        <TooltipWrapper text={(this.props.t("CatelogImportLogTypes.Category")+" "+this.getProfitSaleValue(pitem, "cat")+"%")}><div>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getProfitSaleValue(pitem, "cat")+"%"))}>
                                                {this.getProfitSaleValue(pitem, "cat")}%
                                            </div>
                                            <small className='viewper-txt'>{this.props.t("CatelogImportLogTypes.Category")}</small>
                                        </div></TooltipWrapper>
                                    </Col>
                                    <Col xs={3} className='v'>
                                        <TooltipWrapper text={(this.props.t("CatelogImportLogTypes.Department")+" "+this.getProfitSaleValue(pitem, "dept")+"%")}><div>
                                            <div className='view-per' style={this.getFontSizeFromTextLength((this.getProfitSaleValue(pitem, "dept")+"%"))}>
                                                {this.getProfitSaleValue(pitem, "dept")}%
                                            </div>
                                            <small className='viewper-txt'>{this.props.t("CatelogImportLogTypes.Department")}</small>
                                        </div></TooltipWrapper>
                                    </Col>
                                </Row>
                            </>}
                        </Col>
                    </Row>
                </Col>
                <Col xs={4}className="robotcontent-wrapper">
                    
                    {/* {pitem.testPeriodStatus === "TestPeriodOver"?<div className='teststart-content active'>
                        <div className='percentage-wrapper' style={{width: (this.props.testCompleteDatesCount(pitem,true)+"%")}}></div>
                        <div className='text-content'><b>{this.props.testCompleteDatesCount(pitem)}</b> {this.props.t("TEST_PERIOD_COMPLETED")} 
                        <label onClick={() => this.props.handleTestStartToggle(true, pidx)}><FeatherIcon icon="x-circle" size={22} /></label></div>
                    </div>:<></>} */}
                    
                    {pitem.isTestPeriodOver && pitem.replaceImpact !== null?<>
                        <div className='robot-content'>
                            <PopoverWrapper cusid="prod-notification-pop" trigger={["hover","focus"]} text={<div>
                                <div className='robot-icon'><ArigoRobotIcon size={50} /></div>
                                {/* <h6>{this.props.t("LETS_TRYIT_COUPLEMORE_DAYS")}</h6> */}
                                <h6>{pitem.testPeriodStatus ? this.props.t("AMG_MORE."+pitem.testPeriodStatus):this.props.t("LETS_TRYIT_COUPLEMORE_DAYS")}</h6>
                            </div>} placement="top">
                                <label className='info-icon'><FeatherIcon icon="help-circle" size={24}/></label>
                            </PopoverWrapper>
                            <div className='robot-icon'><ArigoRobotIcon size={50} /></div>
                            {/* <h6>{this.props.t("GIVE_IT")}<br/>{this.props.t("MORE_TIME")}</h6> */}
                            {/* <h6>{pitem.suggestionMessage && pitem.suggestionMessage !== ""?pitem.suggestionMessage:<>{this.props.t("GIVE_IT")}<br/>{this.props.t("MORE_TIME")}</>}</h6> */}
                            {/* <h6>{pitem.suggestionMessage && pitem.suggestionMessage !== "none"?this.props.t("AMG."+pitem.testPeriodStatus):<>{this.props.t("GIVE_IT")}<br/>{this.props.t("MORE_TIME")}</>}</h6> */}
                            <h6>{pitem.testPeriodStatus ? this.props.t("AMG."+pitem.testPeriodStatus) : <>{this.props.t("GIVE_IT")}<br/>{this.props.t("MORE_TIME")}</>}</h6>
                        </div>
                        <ul className='list-inline robot-actions'>
                            <li className='list-inline-item'><Button variant='outline-success' onClick={() => this.props.handleNewProdState("KEEP", pidx)} className={pitem.suggestionMessage === "keep"?'arrow-down':''} size='sm'>{this.props.t("KEEP")}</Button></li>
                            <li className='list-inline-item'><Button variant='outline-danger' onClick={() => this.props.handleNewProdState("REMOVE", pidx)} className={(!pitem.suggestionMessage || pitem.suggestionMessage === "none" || pitem.suggestionMessage === "remove")?'arrow-down':''} size='sm'>{this.props.t("REMOVE")}</Button></li>
                            <li className='list-inline-item'>
                                {/* <Button variant='primary' onClick={() => this.handleNewProdState("EXPAND", pidx)} size='sm'>{this.props.t("days")} <b>{this.props.t("expand")}</b></Button> */}
                                <ExpandDropDown t={this.props.t} dmode={this.props.dmode} 
                                    idx={pidx} pitem={pitem} 
                                    handleExpandDayCount={this.props.handleExpandDayCount} 
                                    SendExpandDaysCall={this.props.SendExpandDaysCall} 
                                    />
                            </li>
                        </ul>
                    </>:<></>}
                </Col>
            </Row></Col>
        </>);
    }
}
