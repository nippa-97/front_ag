import React, { useState, useEffect } from "react";
import { Button, Col, Row, Table } from "react-bootstrap";
import { ChevronUpIcon, ChevronDownIcon, XIcon, ArrowUpIcon, ArrowDownIcon } from '@primer/octicons-react';
import Chart from "react-apexcharts";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import PropTypes from 'prop-types';
import { CopyToClipboard } from 'react-copy-to-clipboard';

import loadinggif from '../../../assets/img/loading-sm.gif';
import { useTranslation } from "react-i18next";
import { numberWithCommas, roundOffDecimal } from '../../../_services/common.service';

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
export default function ViewRevenueDetails(props) {
  const [showFieldOnly, setShowFieldOnly] = useState(false);
  const [curprodlist, setCurProdList] = useState([]);

  const { t } = useTranslation();

  var viewobj = props.viewobj;
  var activeviewobj = props.activeViewObj;
  var currevlist = props.revobj;
  // console.log(activeviewobj);
  
  var curovrobj = props.ovrobj;
  var overviewobj = {
    chainprofit: (curovrobj&&curovrobj.overviewSaleInformation&&curovrobj.overviewSaleInformation.firstChart?curovrobj.overviewSaleInformation.firstChart:0),
    storeprofit: (curovrobj&&curovrobj.overviewSaleInformation&&curovrobj.overviewSaleInformation.chartTwo?curovrobj.overviewSaleInformation.chartTwo:0),
  }

  useEffect(() => {
    if(currevlist){
        setCurProdList((currevlist&&currevlist.productSaleInformation?currevlist.productSaleInformation:[]));
    }
  }, [currevlist]);

  //chart custom options
  var options = {
      chart: {toolbar: {show: false,}},
      xaxis: { categories: [1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999],labels: {show: false,} },
      yaxis: {labels: {show: false,}},
      stroke: {curve: 'smooth',},
      grid: {show: false},
      dataLabels: {enabled: false,},
      tooltips: {enabled: false},
      colors: (props.dmode?['#2CC990']:['#5128a0']),
      fill: {type: "gradient",gradient: {shadeIntensity: 1,opacityFrom: 0.7,opacityTo: 0,stops: [0, 100]}}
  };
  //chart series data
  var series = [{name: "",data: [30, 40, 45, 50, 49, 60, 70, 91]}];

  //#PLG-DU-PS-H07 toggle filter only field products list
  const handleToggleSaleList = () => {
    if(showFieldOnly){
      setShowFieldOnly(false);
      //reset filter list to show all
      setCurProdList((currevlist&&currevlist.productSaleInformation?currevlist.productSaleInformation:[]));
    } else{
      setShowFieldOnly(true);
      //filter showing list to current sale list
      var filterlist = [];
      if(props.exprodlist && props.exprodlist.length > 0){
        var prodsalelist = (currevlist&&currevlist.productSaleInformation?currevlist.productSaleInformation:[]);
        for (let l = 0; l < prodsalelist.length; l++) {
          //find prod
          var isfoundinexisting = props.exprodlist.findIndex(x => x.productInfo.id === prodsalelist[l].productId);
          prodsalelist[l]["isshowitem"] = (isfoundinexisting > -1?true:false);
          filterlist.push(prodsalelist[l]);
        }
      }
      setCurProdList(filterlist);
    }
  }

  const handleTableSort = (ctype, sorttype) => {
    if(currevlist && currevlist.productSaleInformation){
        var cloadeddat = currevlist;
        props.handletablesort(ctype, sorttype, cloadeddat, () => {
          
          var curprodlist = cloadeddat.productSaleInformation.sort(props.sortRevenueList);
          cloadeddat["productSaleInformation"] = curprodlist;
          
          setCurProdList(cloadeddat.productSaleInformation);
          props.handletablesort(ctype, sorttype, cloadeddat);
        });
    }
  }

  var htlist = {"productName":t("product"),"revenue":t("revenue"), "revenuePercentage":t("revp"), "singleSaleOfProduct":t("revface"), "profit":t("profit"), "profitPercentage":t("pr")}; //, "fieldPercentage":t("fieldp")
  var thlist = Object.keys(htlist).map((ckey, cidx) => {
    return <th key={cidx} width={ckey==="productName"?"28%":(ckey==="revenue" || ckey==="revenuePercentage" || ckey==="revenuePerProductFace")?"12%":ckey==="profitPercentage"?"11%":"12%"}><div style={{position:"relative"}}>{htlist[ckey]}<span onClick={() => handleTableSort(ckey,"ASC")}><ChevronUpIcon className="tablesort"/></span>
    <span onClick={() => handleTableSort(ckey,"DESC")}><ChevronDownIcon className="tablesort"/></span></div></th>;
  });

  return (<><Col xs={12} className={"revenuedet-content "+(props.isRTL==="rtl"?"RTL":"")} style={{marginTop:"15px"}} dir={props.isRTL}><Row>
      <Col xs={12} lg={7}>
        <Col className="contentview-main" style={{position:"relative"}}>
          
          <div className="plg-product-list-main-wrapper">
            <div>
              <h5 style={{borderBottom: "none", margin: "0"}}> {t("productslist")} </h5>
            </div>

            {props.revobj.departmentName && props.revobj.departmentName !== "" && props.revobj.version && props.revobj.version !== "" ? 
              <div>
                <span className={"plg-product-list-actual-dept-name-plus-ver"+(activeviewobj && props.revobj.version !== activeviewobj.floorLayoutVersion?" diffversion":"")}>
                  {`${props.revobj.departmentName} ${t("version")} ${props.revobj.version}`}
                </span>
              </div>
            : <></>
            }

            <div style={{fontSize:" 18px", fontWeight: "700"}}>
                {props.filterrevlist && props.filterrevlist.length > 0?<><Button variant="danger" className="clearfilters-link" onClick={() => props.handledeletefilterlist(1)} size="sm">{t("clearfilters")}</Button></>:<></>}
                <label className="pure-material-switch plg-check" style={{ width: "110px", position: "relative", right: "0", top: "0" }}>
                    <input type="checkbox" checked={showFieldOnly} onChange={handleToggleSaleList} />
                    <span style={{color:(props.dmode?'#2CC990':'#5128a0')}}>{t("only_field")}</span>
                </label>
            </div>
          </div>

          <Col className="revfilters-list">
            {props.filterrevlist && props.filterrevlist.length > 0?<>
              {props.filterrevlist.map((fitem, fidx) => {
                  return <Col key={fidx} className="subcontent-div"><span onClick={() => props.handledeletefilterlist(2,fidx)}><XIcon size={12}/></span> {(fitem.productName).substring(0,20)+(fitem.productName.length>20?"..":"")}</Col>
              })}
            </>:<></>}
          </Col>
          <Col style={{minHeight:"220px"}}>
            {(!props.isrpdetailsloading)?<Col>
              <Table className="sumview-table" style={{marginBottom:"0px"}}>
                <thead><tr>{thlist}{/* <th></th> */}</tr></thead>
              </Table>
              <Col style={{maxHeight:"180px",overflowY:"auto"}}>
                <Table className="sumview-table">
                  <tbody>
                  {curprodlist.filter(a=>((!showFieldOnly || (showFieldOnly && a.isshowitem)) && (props.filterrevlist && (props.filterrevlist.some(b=> b.id === a.productId) || props.filterrevlist.length === 0)))).map((citem, idx) => {
                      var itmsaleinfo = citem.currentSaleInformation;
                      var itmexlinfo = citem.effectedSaleInformation;

                      //if both were equal no need to show
                      var noChanges = ((itmsaleinfo && itmsaleinfo.productQty) === (itmexlinfo && itmexlinfo.productQty));

                      var saleRevPercentage = (itmsaleinfo && itmsaleinfo.totalRevenuePercentage )?parseFloat(itmsaleinfo.totalRevenuePercentage.toFixed(2)):0
                      var expectedRevPercentage = (itmexlinfo && itmexlinfo.totalRevenuePercentage )?parseFloat(itmexlinfo.totalRevenuePercentage.toFixed(2)):0

                      var saleProfitPercentage = (itmsaleinfo && itmsaleinfo.profitPercentage )?parseFloat(itmsaleinfo.profitPercentage.toFixed(2)):0
                      var expectedProfitPercentage = (itmexlinfo && itmexlinfo.profitPercentage )?parseFloat(itmexlinfo.profitPercentage.toFixed(2)):0

                      return <React.Fragment key={idx}>{itmsaleinfo?<tr><td width="28%" style={{textAlign:(props.isRTL==="rtl"?"right":"left")}}><CopyToClipboard text={citem.productBarcode} onCopy={() => props.copyToClipboard()}><small>{citem.productBarcode}</small></CopyToClipboard>{citem.productName}</td>
                      <td width="12%">{(itmsaleinfo.revenue?numberWithCommas(itmsaleinfo.revenue.toFixed(2)):0)}</td>
                      <td width="12%">{(itmsaleinfo.totalRevenuePercentage?itmsaleinfo.totalRevenuePercentage.toFixed(2):0)}%</td>
                      <td width="12%">{(itmsaleinfo.singleSaleOfProduct?itmsaleinfo.singleSaleOfProduct.toFixed(2):0)}</td>
                      <td width="12%">{(itmsaleinfo.profit?itmsaleinfo.profit.toFixed(2):0)}</td><td width="11%">{(itmsaleinfo.profitPercentage?roundOffDecimal(itmsaleinfo.profitPercentage,2):0)}%</td>
                      </tr>:<></>}
                      
                      {(itmexlinfo && !noChanges && itmexlinfo.productQty > 0)?<tr className="ext-row"><td width="28%" style={{textAlign:(props.isRTL==="rtl"?"right":"left")}}>{!itmsaleinfo?<><CopyToClipboard text={citem.productBarcode} onCopy={() => props.copyToClipboard()}><small>{citem.productBarcode}</small></CopyToClipboard>{citem.productName}</>:""}</td>
                      <td width="12%">{(itmexlinfo.revenue&&itmexlinfo.revenue>0?numberWithCommas(itmexlinfo.revenue.toFixed(2)):0)}</td>
                      <td width="12%"><div className="iconrow">{(itmexlinfo.totalRevenuePercentage?itmexlinfo.totalRevenuePercentage.toFixed(2):0)}%<UpDownIconComponent initialValue={saleRevPercentage} changedValue={expectedRevPercentage} iconSize={15} /></div></td>
                      <td width="12%">{(itmexlinfo.singleSaleOfProduct&&itmexlinfo.singleSaleOfProduct>0?itmexlinfo.singleSaleOfProduct.toFixed(2):0)}</td>
                      <td width="12%">{(itmexlinfo.profit&&itmexlinfo.profit>0?itmexlinfo.profit.toFixed(2):0)}</td>
                      <td width="11%"><div className="iconrow">{(itmexlinfo.profitPercentage&&itmexlinfo.profitPercentage>0?roundOffDecimal(itmexlinfo.profitPercentage,2):0)}%<UpDownIconComponent initialValue={saleProfitPercentage} changedValue={expectedProfitPercentage} iconSize={15} /></div></td>
                      </tr>:<></>}
                      </React.Fragment>;
                    })}
                  </tbody>
                </Table>
              </Col>
            </Col>:<Col className="text-center" style={{paddingTop:"95px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>}
          </Col>
        </Col>
      </Col>

      {/* #PLG-DU-OV-H02 */}
      <Col xs={12} lg={5}>
        <Col className="contentview-main overview-content">
          <h5>{t("overview")} {viewobj && viewobj.department?("- "+viewobj.department.name+(" "+t("department"))):""}</h5>
          <Row>
            {(!props.isrpoverviewloading)?<>
              <Col className="subview-content">
                <Col className="square-content col-centered">{roundOffDecimal(overviewobj.chainprofit,2)}</Col>
                <label>PPF</label>
              </Col>
              <Col className="subview-content">
                <Col className="round-content" style={{width:"98px",height:"98px"}}>
                  <CircularProgressbar value={overviewobj.storeprofit} text={`${(overviewobj.storeprofit).toFixed(1)}%`} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: (props.dmode?`rgba(44, 201, 144, 1)`:`rgba(81, 40, 160, 1)`),trailColor: '#baaad9'})} />
                </Col>
                <label>{t("salepercentage")}</label>
              </Col>
              <Col className="subview-content">
                <Col className="chart-content">
                  <Chart className="mchart-view" options={options} series={series} type="area" height={82} />
                  <label>{t("convrate")}</label>
                </Col>
              </Col>
            </>:<Col className="text-center" style={{paddingTop:"50px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>}
          </Row>
        </Col>
      </Col></Row>

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
