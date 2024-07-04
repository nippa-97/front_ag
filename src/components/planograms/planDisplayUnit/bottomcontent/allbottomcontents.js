import React, { useState, useEffect } from "react";
import { Button, Col, Form, Row, Table } from "react-bootstrap";
import { XIcon, ArrowUpIcon, ArrowDownIcon } from '@primer/octicons-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import DatePicker from 'react-datepicker';

import { useTranslation } from "react-i18next";
import { roundOffDecimal } from '../../../../_services/common.service';

import { TooltipWrapper } from "../../../newMasterPlanogram/AddMethods";
import { InfoIcon } from "../../../../assets/icons/icons";
import BottomSnapshotContent from "./snapshotcontent";

import "./allbottomcontent.css";

import loadinggif from '../../../../assets/img/loading-sm.gif';

/**
 * #PLG-DU-PS-H05
 * shows bottom sales table
 * using this view to show sales details what are revenue and profits can gets from this product
 * only active planograms or drafts created from it shows sales details
 * sales based on active planogram old imported sales details
 * options are showing new(draft) changes done to sales, can filter only current field items, and filter product from active planogram
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function BottomSalesContent(props) {
  const [showFieldOnly, setShowFieldOnly] = useState(false);
  const [curprodlist, setCurProdList] = useState([]);
  const [bkpprodlist, setBkpProdList] = useState([]);

  const { t } = useTranslation();

  var activeviewobj = props.activeViewObj;
  var currevlist = (props.revobj?props.revobj:null);
  let overviewObj = (props.ovrobj?props.ovrobj:null);
  
  useEffect(() => {
    if(currevlist){
      let alldeptprods = (currevlist && currevlist.length > 0?currevlist:[]);
      
      for (let i = 0; i < alldeptprods.length; i++) {
        const deptobj = alldeptprods[i];
        
        for (let j = 0; j < deptobj.productSaleInformation.length; j++) {
          const prodobj = deptobj.productSaleInformation[j];
          
          let isfoundinexisting = props.exprodlist.findIndex(x => x.productInfo.id === prodobj.productId);
          prodobj.isshowitem = (isfoundinexisting > -1?true:false);
        }
      }

      setCurProdList(alldeptprods);
      // console.log(alldeptprods);

      setBkpProdList(alldeptprods);
    }
  }, [currevlist, props.exprodlist]);

  //#PLG-DU-PS-H07 toggle filter only field products list
  const handleToggleSaleList = () => {
    if(showFieldOnly){
      setShowFieldOnly(false);
      //reset filter list to show all
      setCurProdList(structuredClone(bkpprodlist));
    } else{
      setShowFieldOnly(true);
      //filter showing list to current sale list
      if(props.exprodlist && props.exprodlist.length > 0){
        let prodsalelist = structuredClone(bkpprodlist);
        
        for (let l = 0; l < prodsalelist.length; l++) {
          
          let filterlist = [];
          for (let j = 0; j < prodsalelist[l].productSaleInformation.length; j++) {
            const deptproditem = prodsalelist[l].productSaleInformation[j];
            //find prod
            let isfoundinexisting = props.exprodlist.findIndex(x => x.productInfo.id === deptproditem.productId);
  
            deptproditem["isshowitem"] = (isfoundinexisting > -1?true:false);
            filterlist.push(deptproditem);
          }
          prodsalelist[l].productSaleInformation = filterlist;

        }
        
        // console.log(prodsalelist);
        setCurProdList(prodsalelist);
      }
    }
  }

  /* const handleTableSort = (ctype, sorttype) => {
    if(currevlist && currevlist.productSaleInformation){
        var cloadeddat = currevlist;
        handleTableSort(ctype, sorttype, cloadeddat, () => {

          var curprodlist = cloadeddat.productSaleInformation.sort(props.sortRevenueList);
          cloadeddat["productSaleInformation"] = curprodlist;

          setCurProdList(cloadeddat.productSaleInformation);
          handleTableSort(ctype, sorttype, cloadeddat);
        });
    }
  } */

  let htlist = {"productName":t("product"),"revenue":t("revenue"), "profit":t("profit"), "singleSaleOfProduct":"SPF", "cycle":t("Cycle"), "profitPercentage":t("pr"), "revenuePercentage":t("revp")}; //, "fieldPercentage":t("fieldp")
  let thlist = Object.keys(htlist).map((ckey, cidx) => {
    return <th key={cidx} width={ckey==="productName"?"28%":(ckey==="revenue" || ckey==="revenuePercentage" || ckey==="revenuePerProductFace")?"9%":ckey==="profitPercentage"?"9%":"10%"}>  {/* onClick={() => handleTableSort(ckey,"DESC")} */}
      <div style={{position:"relative", color: (ckey === "profit"?"#ED327A":"#4F4F4F")}}>{htlist[ckey]}</div>
      {ckey === "productName"?<div className="sortby-txt">{props.t("SORT_BY")}</div>:<></>}
      {ckey === "cycle" ?<TooltipWrapper text={props.t("SC_FOR_CURRENT")}><div className="info-txt"><InfoIcon size={15} color={"#5128A0"}/></div></TooltipWrapper>:<></>}
    </th>;
  });

  //sale data list
  let selectedDeptObj = props.fieldDeptList[props.selectedDeptIdx];
  
  let selectedDeptSaleDetails = curprodlist.find(x => selectedDeptObj && x.departmentId === selectedDeptObj.departmentId);
  let saleprodlist = (selectedDeptSaleDetails?selectedDeptSaleDetails.productSaleInformation.filter(a => (!showFieldOnly || (showFieldOnly && a.isshowitem))):[]);
  
  let curovrobj = (overviewObj[props.selectedDeptIdx]?overviewObj[props.selectedDeptIdx]:[]);
  // console.log(saleprodlist);

  return (<><Col xs={12} className={"revenuedet-content "+(props.isRTL==="rtl"?"RTL":"")} style={{marginTop:"15px"}} dir={props.isRTL}>
        {/* #PLG-DU-OV-H02 */}
        <Row>
          <Col xs={12} lg={8}>
            <Col className="contentview-main overview-content saleprod-list">
              {props.isActiveMode?<Row style={{margin: "0px"}}>
                <Col xs={12} lg={4} className="dataperiod-content">

                  <Col className="dateperiod-wrapper">
                    <h6>{props.t("DATE_PERIOD")}</h6>
                    <ul>
                      <li><label className="form-inline"><Form.Control type="radio" name="dateperiod-txt" checked={props.datePeriodType === "VERSION"} onChange={() => props.changeDatePeriodType("VERSION")} /> {props.t("current_version")}</label></li>
                      <li><label className="form-inline"><Form.Control type="radio" name="dateperiod-txt" checked={props.datePeriodType === "DATERANGE"} onChange={() => props.changeDatePeriodType("DATERANGE")} /> {props.t("DATE_PICKER")}</label></li>
                    </ul>

                    {props.datePeriodType === "DATERANGE"?
                    <ul className="daterange-list">
                      <li>
                        <Col className="form-group">
                          <label>{props.t("CATELOGUE_FILTERS.from")}</label>
                          <DatePicker
                            dateFormat="dd/MM/yyyy"
                            placeholderText={props.t("date")}
                            popperPlacement="bottom-start"
                            showYearDropdown
                            className="datepicker-txt"
                            selected={props.datePeriodRange.fromDate}
                            onChange={(e)=>props.changeDatePeriodRange("fromDate", e)}
                            />
                        </Col>
                      </li>
                      <li>
                        <Col className="form-group">
                          <label>{props.t("CATELOGUE_FILTERS.todate")}</label>
                          <DatePicker
                            dateFormat="dd/MM/yyyy"
                            placeholderText={props.t("date")}
                            popperPlacement="bottom-start"
                            showYearDropdown
                            className="datepicker-txt"
                            selected={props.datePeriodRange.toDate}
                            onChange={(e)=>props.changeDatePeriodRange("toDate", e)}
                            />
                        </Col>
                      </li>
                    </ul>:<></>}
                  </Col>

                  <h5>{props.t("DEPT_VIEW")}</h5>

                  <Col className="filterdept-content">
                      {props.fieldDeptList.length > 0?<>
                        <Form.Control as={"select"} size="sm" onChange={(e) => props.setSelectedDeptIdx(e.target.value)}>
                            {props.fieldDeptList.map((fieldobj, fieldidx) => {
                              return <option key={fieldidx} value={fieldidx}>{fieldobj.name}</option>;
                            })}
                        </Form.Control>
                      </>:<></>}
                  </Col>

                  <Row style={{margin: "0px"}}>
                    {!props.isrpoverviewloading?<>
                      {curovrobj?<>
                      <Col className="subview-content">
                        <label>SPF</label>
                        <Col className="round-content" style={{width:"80px",height:"80px"}}>
                          <CircularProgressbar value={curovrobj.spfBranchPercentage ? 0 : 0} text={`${curovrobj.spfBranchPercentage > 0?curovrobj.spfBranchPercentage.toFixed(1):0}`} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: '#328c1e',trailColor: '#ddd'})} />
                          <Col className="small-content text-center"><small style={{color: "red"}}>{(curovrobj.spfChainPercentage > 0?curovrobj.spfChainPercentage.toFixed(1):0)}</small></Col>
                        </Col>
                      </Col>

                      <Col className="subview-content">
                        <label>{t("salepercentage")}</label>
                        <Col className="round-content" style={{width:"80px",height:"80px"}}>
                          <CircularProgressbar 
                            value={curovrobj.salesBranchPercentage} 
                            text={`${(curovrobj.salesBranchPercentage > 0?curovrobj.salesBranchPercentage.toFixed(1):0)}%`} 
                            strokeWidth={12} 
                            styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: '#328c1e',trailColor: '#ddd'})} 
                            />
                          <Col className="small-content text-center"><small style={{color: "red"}}>{(curovrobj.salesChainPercentage > 0?curovrobj.salesChainPercentage.toFixed(1):0)}%</small></Col>
                        </Col>
                      </Col></>:<></>}
                    </>:<Col className="text-center" style={{paddingTop:"50px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>}
                  </Row>
                </Col>

                <Col xs={12} lg={8} style={{position:"relative", flex: "auto"}}>
                  {bkpprodlist && bkpprodlist.length > 0?<>
                    <h5> {t("productslist")} 
                      <label className="pure-material-switch plg-check" style={{width: "170px"}}>
                          <input type="checkbox" checked={showFieldOnly} onChange={handleToggleSaleList} />
                          <span style={{color:(props.dmode?'#2CC990':'#5128a0')}}>{t("selectedfield_only")}</span>
                      </label>

                      <label className="saletotal-txt"><span>{props.t("TOTAL_ITEMS")}:</span> {(saleprodlist && saleprodlist.length > 0?saleprodlist.length:0)}</label>
                    </h5>

                    <Col className="revfilters-list">
                      {props.filterrevlist && props.filterrevlist.length > 0?<><Button variant="danger" className="clearfilters-link" onClick={() => props.handleDeleteFilteredList(1)} size="sm">{t("clearfilters")}</Button></>:<></>}

                      {props.filterrevlist && props.filterrevlist.length > 0?<>
                        {props.filterrevlist.map((fitem, fidx) => {
                            return <Col key={fidx} className="subcontent-div"><span onClick={() => props.handleDeleteFilteredList(2,fidx)}><XIcon size={12}/></span> {(fitem.productName).substring(0,20)+(fitem.productName.length>20?"..":"")}</Col>
                        })}
                      </>:<></>}
                    </Col>
                  </>:<></>}
                  
                  <Col style={{minHeight:"220px"}}>
                    {selectedDeptSaleDetails && selectedDeptSaleDetails.departmentName && selectedDeptSaleDetails.departmentName !== "" && selectedDeptSaleDetails.version && selectedDeptSaleDetails.version !== "" ? 
                      <span className={"plg-product-list-actual-dept-name-plus-ver"+(activeviewobj && activeviewobj.fieldsList && selectedDeptSaleDetails.version !== activeviewobj.fieldsList[0].floorLayoutVersion?" diffversion":"")}>
                        {`${selectedDeptSaleDetails.departmentName} ${t("version")} ${selectedDeptSaleDetails.version}`}
                      </span>
                    : <></>}
                    
                    {(!props.isrpdetailsloading)?<Col>
                      {saleprodlist && saleprodlist.length > 0?<>
                        <Table className="sumview-table" style={{marginBottom:"0px"}}>
                          <thead><tr>{thlist}{/* <th></th> */}</tr></thead>
                        </Table>
                        <Col className={"bottomsale-list-container"+(props.datePeriodType === "DATERANGE"?" scroll-height":"")} style={{maxHeight:"200px",overflowY:"auto"}}>
                          <Col className="sumview-table">
                            {saleprodlist.filter(a=>((!showFieldOnly || (showFieldOnly && a.isshowitem)) && (props.filterrevlist && (props.filterrevlist.some(b=> b.id === a.productId) || props.filterrevlist.length === 0)))).map((citem, idx) => {
                                var itmsaleinfo = citem.currentSaleInformation;
                                var itmexlinfo = citem.effectedSaleInformation;

                                //if both were equal no need to show
                                var noChanges = ((itmsaleinfo && itmsaleinfo.productQty) === (itmexlinfo && itmexlinfo.productQty));

                                var saleRevPercentage = (itmsaleinfo && itmsaleinfo.totalRevenuePercentage )?parseFloat(itmsaleinfo.totalRevenuePercentage.toFixed(2)):0
                                var expectedRevPercentage = (itmexlinfo && itmexlinfo.totalRevenuePercentage )?parseFloat(itmexlinfo.totalRevenuePercentage.toFixed(2)):0

                                var saleProfitPercentage = (itmsaleinfo && itmsaleinfo.profitPercentage )?parseFloat(itmsaleinfo.profitPercentage.toFixed(2)):0
                                var expectedProfitPercentage = (itmexlinfo && itmexlinfo.profitPercentage )?parseFloat(itmexlinfo.profitPercentage.toFixed(2)):0

                                return <React.Fragment key={idx}>{itmsaleinfo?
                                  <Col className="singlesale-row">
                                    <Row>
                                      <Col className="name-content" style={{minWidth:"32%", textAlign:(props.isRTL==="rtl"?"right":"left")}}>
                                        <CopyToClipboard text={citem.productBarcode} onCopy={() => props.copyToClipboard()}><small>{citem.productBarcode}</small></CopyToClipboard>
                                        <TooltipWrapper text={citem.productName}><span className="longname-txt">{citem.productName}</span></TooltipWrapper>
                                      </Col>
                                      <Col style={{ width:"9%" }}>{(itmsaleinfo.revenue?itmsaleinfo.revenue.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(itmsaleinfo.profit?itmsaleinfo.profit.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(itmsaleinfo.singleSaleOfProduct?itmsaleinfo.singleSaleOfProduct.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(citem.saleCycle?citem.saleCycle.toFixed(2):0)}</Col>
                                      <Col style={{ width:"9%" }}>{(itmsaleinfo.profitPercentage?roundOffDecimal(itmsaleinfo.profitPercentage,2):0)}%</Col>
                                      <Col style={{ width:"9%" }}>{(itmsaleinfo.totalRevenuePercentage?itmsaleinfo.totalRevenuePercentage.toFixed(2):0)}%</Col>
                                    </Row>
                                  </Col>:<></>}
                                  
                                  {(itmexlinfo && !noChanges && itmexlinfo.productQty > 0)?
                                  <Col className="singlesale-row ext-row">
                                    <Row>
                                      <Col className="name-content" style={{minWidth:"32%", textAlign:(props.isRTL==="rtl"?"right":"left")}}>{!itmsaleinfo?<>
                                        <CopyToClipboard text={citem.productBarcode} onCopy={() => props.copyToClipboard()}><small>{citem.productBarcode}</small></CopyToClipboard>
                                        <TooltipWrapper text={citem.productName}><span className="longname-txt">{citem.productName}</span></TooltipWrapper></>:""}</Col>
                                      <Col style={{ width:"9%" }}>{(itmexlinfo.revenue&&itmexlinfo.revenue>0?itmexlinfo.revenue.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(itmexlinfo.profit&&itmexlinfo.profit>0?itmexlinfo.profit.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(itmexlinfo.singleSaleOfProduct&&itmexlinfo.singleSaleOfProduct>0?itmexlinfo.singleSaleOfProduct.toFixed(2):0)}</Col>
                                      <Col style={{ width:"10%" }}>{(citem.saleCycle?citem.saleCycle.toFixed(2):0)}</Col>
                                      <Col style={{ width:"9%" }}><div className="iconrow">{(itmexlinfo.profitPercentage&&itmexlinfo.profitPercentage>0?roundOffDecimal(itmexlinfo.profitPercentage,2):0)}%<UpDownIconComponent initialValue={saleProfitPercentage} changedValue={expectedProfitPercentage} iconSize={15} /></div></Col>
                                      <Col style={{ width:"9%" }}><div className="iconrow">{(itmexlinfo.totalRevenuePercentage?itmexlinfo.totalRevenuePercentage.toFixed(2):0)}%<UpDownIconComponent initialValue={saleRevPercentage} changedValue={expectedRevPercentage} iconSize={15} /></div></Col>
                                    </Row>
                                  </Col>:<></>}
                                  </React.Fragment>;
                              })}
                          </Col>
                        </Col>
                      </>:<>
                          <h4 className="nosale-txt">{t("NOPROD_SALE_AVAILABLE")}</h4>
                      </>}

                    </Col>:<Col className="text-center" style={{paddingTop:(props.datePeriodType === "DATERANGE"?"140px":"95px")}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>}
                  </Col>

                </Col>

              </Row>:<>
                <Col style={{minHeight:"220px", paddingTop: "14%"}}>
                    <h4 className="nosale-txt" style={{marginTop: "0%"}}>{t("NOPROD_SALE_AVAILABLE")}</h4>
                </Col>          
              </>} 
            </Col>
          </Col>

          <BottomSnapshotContent {...props} />

        </Row>
        
    </Col></>);
}
//for indicate improvement or lost
function UpDownIconComponent({initialValue,changedValue,iconSize}){

  if(initialValue < changedValue){
    return (<ArrowUpIcon size={iconSize} fill={'#57b521'} />)
  }else if(initialValue > changedValue){
    return (<ArrowDownIcon size={iconSize} fill={'#b52225'} />)
  }else{
    return (<></>)
  }
}

UpDownIconComponent.propTypes = {
  initialValue: PropTypes.number,
  changedValue: PropTypes.number,
  iconSize : PropTypes.number
}