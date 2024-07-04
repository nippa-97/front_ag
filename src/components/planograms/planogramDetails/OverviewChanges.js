import React, { useState } from "react";
import { Col, Row, Table, Button, ButtonGroup, Collapse  } from "react-bootstrap";
import { SyncIcon, ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react'; //ArrowUpIcon, ArrowDownIcon,, SearchIcon
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { useTranslation } from "react-i18next";
import FeatherIcon from 'feather-icons-react';
import DatePicker from "react-datepicker";
import { TooltipWrapper } from "../../newMasterPlanogram/AddMethods";
import "react-datepicker/dist/react-datepicker.css";

import loadinggif from '../../../assets/img/loading-sm.gif';
import { NewReplaceProductIcon } from "../../../assets/icons/icons";
import { PopoverWrapper } from "../../newMasterPlanogram/AddMethods";

function FieldSubList(props) {
  const [open, setOpen] = useState(false);
  
  return <tr key={props.idx}><td width="39%"><Col className="trrow-txt" onClick={() => setOpen(!open)}>{props.item.departmentName}
  <span className="float-right" style={{marginTop:"-3px"}}><ChevronDownIcon size={12}/></span></Col>
  <Collapse in={open} className="trrow-collapse"><Col><ul>
  {props.item.fieldChange && props.item.fieldChange.length>0?<>
  {props.item.fieldChange.map((xitem, xidx) => {
      return <React.Fragment key={xidx}><ItemSubList xidx={xidx} t={props.t} xitem={xitem} item={props.item} isshowadded={props.isshowadded}/></React.Fragment>;
  })}
  </>:<></>}
  </ul></Col></Collapse></td></tr>;
}

function ItemSubList(props) {
  const [open, setOpen] = useState(false);

  return <li key={props.xidx} className="listitem-view">
  <Col className="listitem-txt" onClick={() => setOpen(!open)}>{(props.xitem.floorFieldNumber>0?props.xitem.floorFieldNumber:props.xitem.fieldUUID?props.xitem.fieldUUID:"-")}
  <span className="float-right"><ChevronDownIcon size={12}/></span></Col>
  <Collapse in={open}><Col><ul>
  {props.xitem.planogramShelfChangesDto && props.xitem.planogramShelfChangesDto.length?props.xitem.planogramShelfChangesDto.map((zitem, zidx) => {
    return <React.Fragment key={zidx}>{( props.isshowadded && zitem.isadd ) || ( !props.isshowadded && zitem.isremove ) ? 
            <li>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div>
                        <div>
                            {zitem.productBarcode ? zitem.productBarcode : "" }
                        </div>

                        <div>
                            {zitem.productName?zitem.productName:"-"}
                        </div>
                    </div>    
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div style={{ margin: "0px 10px" }}>
                            {zitem.isTestingNewProduct ? <NewReplaceProductIcon className={"btn-with-icon "} size="sm" /> : <></>}
                        </div>
                
                        <div>
                            {zitem.floorShelfChangeType === "qty_add" 
                                ? 
                                <span className="add-qty-in-plg" style={{backgroundColor: "rgb(40, 167, 69)"} }>
                                    {props.t(zitem.floorShelfChangeType)}
                                </span> 
                                    :
                                <span className="add-qty-in-plg" style={{backgroundColor: "rgb(220, 53, 69)"} }>
                                    {props.t(zitem.floorShelfChangeType)}
                                </span> 
                            }
                        </div>
                    </div>
                </div>       
            </li> 
            : <></>}
            </React.Fragment>
   
  }):<></>}
  </ul></Col></Collapse></li>;
}

export default function OverviewChanges(props) {
    const { t } = useTranslation();

    const [cursorttype, setsorttype] = useState("revenue");
    const [cursortview, setsortview] = useState("DESC");
    const [isshowadded, setShowAdded] = useState(true);

    var mainheaderlist = {"sale":t('sale'),"salePercentage":t('saleper'),"salePerMeter":t('SALE_PER_METER'),"profit":t('profit'),"profitPercentage":t('profitper')}; //,"profitPerSqFt":t('psqft')

    var deptheaders = Object.keys(mainheaderlist).map((xidx) => {
        return <th key={xidx} width={(xidx==="sale"||xidx==="profit")?"19%":(xidx==="profitPercentage"||xidx==="salePercentage")?"13%":"14%"} className="highlight"><div style={{position:"relative"}}>{mainheaderlist[xidx]}
        <span onClick={() => handleSortTable("DEPARTMENT",xidx,"ASC")}><ChevronUpIcon className="tablesort" size={12}/></span>
        <span onClick={() => handleSortTable("DEPARTMENT",xidx,"DESC")}><ChevronDownIcon className="tablesort" size={12}/></span></div> </th>;
    });

    //handle sort
    const handleSortTable = (maintype,coltype,sortype) => {
        //console.log(maintype,coltype,sortype);
        if(maintype === "DEPARTMENT"){
            if(props.departmentprodchanges && props.departmentprodchanges.length > 0){
                setsorttype(coltype); setsortview(sortype);
                var cloadeddat = props.departmentprodchanges;
                var cursortlist = cloadeddat.sort(sortTableList);
                props.changeDepProdList(cursortlist);
            }
        }
    }
    //#PLG-LAY-DS-H03 sort table list
    const sortTableList = ( a, b ) => {
        var ainfo = a[cursorttype];
        var binfo = b[cursorttype];
        if(cursortview === "DESC"){
            if ( ainfo > binfo ){ return -1; }
            if ( ainfo < binfo ){ return 1; }
        } else{
            if ( ainfo < binfo ){ return -1; }
            if ( ainfo > binfo ){ return 1; }
        }
        return 0;
    }
    //add commas to number
    const numberWithCommas = (x) => {
        var xtxt = parseFloat(x); //to number if string
        if(xtxt % 1 === 0){ //check x have decimals
            return xtxt.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        } else{
            return xtxt.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
    };
    //change filter dates
    const updateSearchFilters = (type,value) => {
      //console.log(type,value);
      props.changeFilterdate(type,value);
    } 

    return <>{props.fieldchangeslist && props.fieldchangeslist.length>0?<><Col className={"contentview-main overview-content " + (props.planogramDetails != null ? "" : "d-none")} style={{marginBottom:"10px",background:"#fff",borderRadius:"8px",padding:"8px 15px",boxShadow:"none",position:"relative"}}>
            <h5 style={{marginBottom:"0px",border:"none"}}>{t("changes")}
            {props.fcallcount && props.fcallcount > 5?<Button variant="danger" size="sm" title="Load more" onClick={() => props.handleloadmorefc(props.fieldchangeslist.length)} style={{position:"absolute",right:"5px",top:"5px",padding:"2px 5px"}}><SyncIcon size={14} /></Button>:<></>}
            </h5>
            <ButtonGroup className={"fieldchanges-togglebtns "+(props.fcallcount && props.fcallcount > 5?"":"no-reload")}>
                <Button variant="default" className={isshowadded?"active":""} onClick={() => setShowAdded(true) }><FeatherIcon icon="plus" size={18}/></Button>
                <Button variant="default" className={!isshowadded?"active":""} onClick={() => setShowAdded(false) }><FeatherIcon icon="minus" size={18}/></Button>
            </ButtonGroup>

            <Col style={{maxHeight:"280px",overflowY:"auto",marginTop:"10px"}}>
                <Table className="sumview-table changesview-table" style={{marginBottom:"8px"}}>
                    <tbody>
                        {props.fieldchangeslist.map((item,idx) => {
                            return <React.Fragment key={idx}>{(isshowadded && item.isadd) || (!isshowadded && item.isremove)?<FieldSubList item={item} idx={idx} t={t} isshowadded={isshowadded}/>:<></>}</React.Fragment>;
                        })}
                    </tbody>
                </Table>
            </Col>
        </Col></>:<></>}

        {/* #PLG-LAY-DS-H02 */}
        <Col className={"contentview-main overview-content deptchanges"} style={{marginBottom:"10px",background:"#fff",borderRadius:"8px",padding:"8px 15px",boxShadow:"none"}}>
            <h5 style={{marginBottom:"0px",border:"none",textTransform:"uppercase"}}>{t("department")}</h5>
            
            <ul className="list-inline dchanges-filters">
                <li className="list-inline-item">
                    <small style={ props.isRTL==="rtl"? {fontSize: "12px", fontWeight: "700", color: props.dmode ? "#2CC990" : "#5128a0", padding:"5px", marginLeft:"75px"} : {fontSize: "12px", fontWeight: "700", color: props.dmode ? "#2CC990" : "#5128a0", padding:"5px", marginRight:"55px"}}>{t("CATELOGUE_FILTERS.from")}</small>
                </li>
                <li className="list-inline-item">
                    <small style={{ fontSize: "12px", fontWeight: "700", color: props.dmode ? "#2CC990" : "#5128a0", padding:"5px" }}>{t("CATELOGUE_FILTERS.todate")}</small>
                </li>
            </ul>

            <ul className="list-inline dchanges-filters">
                <li className="list-inline-item"><DatePicker dateFormat="dd/MM/yyyy" selected={props.fcfromdate} popperPlacement="bottom-start" showYearDropdown
                onChange={(e) => updateSearchFilters("fcfromdate",e)} className="datepicker-txt"
                popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} /></li>
                <li className="list-inline-item"><DatePicker dateFormat="dd/MM/yyyy" selected={props.fctodate}  popperPlacement="bottom-start" showYearDropdown
                onChange={(e) => updateSearchFilters("fctodate",e)} className="datepicker-txt"
                popperModifiers={{ flip: { behavior: ['bottom'] }, preventOverflow: { enabled: false }, hide: { enabled: false } }} /></li>
                <li className="list-inline-item"><Button variant="outline-secondary" size="sm" onClick={props.resetFilterdate}>{t("btnnames.reset")}</Button></li>
                <li className="list-inline-item">
                    <label className='planogram-info-icon'>
                        <PopoverWrapper cusid="planogram-pop" trigger={["hover","focus"]} 
                            text={
                                <div>
                                      <h6>{t("SPM_MESSAGE")}</h6>
                                </div>
                            } placement="top">
                            <FeatherIcon icon="info" size={16}/>
                        </PopoverWrapper>
                    </label>
                </li>
            </ul>

            {props.departmentprodchanges && props.departmentprodchanges.length > 0?<>
                <Table size="sm">
                    <thead>
                        <tr>
                            <th width="26%"></th>
                            {deptheaders}
                        </tr>
                    </thead>
                </Table>
            </>: !props.issaledataloading? <> <small style={{ fontSize: "14px", fontWeight: "700", color: props.dmode ? "#2CC990" : "#5128a0" }}>{t("NO_RESULTS")}</small> </> : <></> }
              {!props.issaledataloading?<>
                {props.departmentprodchanges && props.departmentprodchanges.length > 0?<>
                  <Col style={(props.isRTL==="rtl"?{maxHeight:"180px",overflowY:"scroll",marginLeft:"-10px"}:{maxHeight:"180px",overflowY:"scroll",marginRight:"-10px",marginBottom:"20px",textAlign:(props.isRTL==="rtl"?"left":"right")})}><Table size="sm" striped>
                      <tbody>
                          {props.departmentprodchanges?.map((dept, index) => (
                              <tr key={index}>
                                  <td width="26%" className="highlight" style={{color:(dept.topbottom === 1?"#5128a0":"#dc3545"),textAlign:(props.isRTL==="rtl"?"right":"left")}}>{dept.departmentName}</td>
                                  <td width="19%">{numberWithCommas(dept.sale.toFixed(2))}</td>
                                  <td width="13%">{dept.salePercentage.toFixed(2)}% </td>
                                  {/* <td width="14%">{numberWithCommas(dept.revenuePerFacingQty?(dept.revenuePerFacingQty.toFixed(2)):0)}</td> */}
                                  
                                  {dept.basedVersion && dept.basedVersion !== "-" ?
                                    
                                    <TooltipWrapper text={dept.basedVersion? dept.basedVersion === "-" ? "-" :  t("BASED_VERSION")+" : " + dept.basedVersion : "-"} placement={props.isRTL?"left":"right"}>
                                        <td style={{cursor:"pointer"}} width="14%">{dept.salePerMeter? dept.salePerMeter === -1 ? "-" : numberWithCommas((dept.salePerMeter.toFixed(2))):0}</td>
                                    </TooltipWrapper>
                                    :
                                    <td width="14%">{dept.salePerMeter? dept.salePerMeter === -1 ? "-" : numberWithCommas((dept.salePerMeter.toFixed(2))):0}</td>
                                  }
                                  <td width="19%">{numberWithCommas(dept.profit.toFixed(2))}</td>
                                  <td width="13%">{dept.profitPercentage.toFixed(2)}% </td>
                                  {/* <td width="11%">{numberWithCommas(dept.profitPerSqFt.toFixed(2))}</td> */}
                              </tr>
                          ))}
                      </tbody>
                  </Table></Col>
                </>:<></>}
              </>:<Col className="text-center" style={{paddingTop:"20px",paddingBottom:"20px"}}><img src={loadinggif} style={{height:"20px"}} alt="loading animation"/></Col>}
        </Col>

        <Col className={"contentview-main overview-content d-none"} style={{marginBottom:"10px",background:"#fff",borderRadius:"8px",padding:"8px 15px",boxShadow:"none"}}>
            <h5 style={{marginBottom:"0px",border:"none"}}>{t("generaldata")}</h5>
            <Row style={{margin:"25px 0px",marginBottom:"5px"}}>
                <Col className="subview-content">
                    <Col className="round-content" style={{width:"75px",height:"75px"}}>
                    <CircularProgressbar value={12} text={`12%`} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '22px',strokeLinecap: 'butt',pathColor: (props.dmode?`rgba(44, 201, 144, 1)`:`rgba(81, 40, 160, 1)`)})} />
                    </Col>
                    <label style={{fontSize:"12px"}}>{t("netaverage")}</label>
                </Col>
                <Col className="subview-content">
                    <Col className="round-content" style={{width:"75px",height:"75px"}}>
                    <CircularProgressbar value={12} text={`12%`} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '22px',strokeLinecap: 'butt',pathColor: (props.dmode?`rgba(44, 201, 144, 1)`:`rgba(81, 40, 160, 1)`)})} />
                    </Col>
                    <label style={{fontSize:"12px"}}>{t("leadingsales")}</label>
                </Col>
                <Col className="subview-content">
                    <Col className="round-content" style={{width:"75px",height:"75px"}}>
                    <CircularProgressbar value={12} text={`12%`} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '22px',strokeLinecap: 'butt',pathColor: (props.dmode?`rgba(44, 201, 144, 1)`:`rgba(81, 40, 160, 1)`)})} />
                    </Col>
                    <label style={{fontSize:"12px"}}>{t("convdept")}</label>
                </Col>
            </Row>
        </Col></>;
}
