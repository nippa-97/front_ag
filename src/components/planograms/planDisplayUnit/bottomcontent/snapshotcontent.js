import React, { useState } from "react";
import { Button, ButtonGroup, Col, Form, Row, Table } from "react-bootstrap";
import { XIcon, BookmarkFillIcon } from '@primer/octicons-react';
import FeatherIcon from 'feather-icons-react';

import { useTranslation } from "react-i18next";
import { checkColorIsLight } from '../../../../_services/common.service';
import CustomProgressBar from '../../../common_layouts/customProgressBar';
import { BottomSnapshotPieChart } from "../additionalcontents";

import loadinggif from '../../../../assets/img/loading-sm.gif';

/**
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function BottomSnapshotContent(props) {
  const [showSnapChart, setShowSnapChart] = useState(false);

  const { t } = useTranslation();

  return (<>
    <Col xs={12} lg={4} style={{paddingLeft: "0px"}}>
        <Col className="contentview-main bottommark-content">
        {!props.issnapshotloading?<>
            {props.showingSnapshotList && props.showingSnapshotList.length > 0?<Row>
            <Col xs={12}>
                <ul className="list-inline snapshotfilter-list">
                    <li className="list-inline-item formcontent-wrapper">
                        <label>{t("DEPARTMENT_LEVEL")}</label>
                        <Form.Control as="select" size="sm" value={props.addedFilters.departmentId} onChange={e => props.updateFiltersList("departmentId", e.target.value)}>
                        {props.snapshotFilters.departments.map((deptitem, deptidx) => {
                            return <option key={deptidx} value={deptitem.departmentId}>{deptitem.departmentName}</option>
                        })}
                        </Form.Control>
                    </li>
                    <li className="list-inline-item formcontent-wrapper">
                        <label>{t("CATEGORY_LEVEL")}</label>
                        <Form.Control as="select" size="sm" value={props.addedFilters.categoryId} onChange={e => props.updateFiltersList("categoryId", e.target.value)}>
                        <option value="0">{t("any_category")}</option>
                        {props.snapshotFilters.categories.map((catitem, catidx) => {
                            return <option key={catidx} className={catitem.isRule?"rule-option":""} value={catitem.categoryId}>
                                {catitem.isRule?(props.isRTL === "rtl"?(catitem.ruleType+" - "+catitem.categoryName):(catitem.categoryName+" - "+catitem.ruleType)):catitem.categoryName}
                            </option>
                        })}
                        </Form.Control>
                    </li>
                    <li className="list-inline-item formcontent-wrapper">
                        <label>{t("SUBCAT_LEVEL")}</label>
                        <Form.Control as="select" size="sm" value={props.addedFilters.subcategoryId} onChange={e => props.updateFiltersList("subcategoryId", e.target.value)}>
                        <option value="0">{t("any_subcategory")}</option>
                        {props.snapshotFilters.subcategories.map((scatitem, scatidx) => {
                            return <option key={scatidx} className={scatitem.isRule?"rule-option":""} value={scatitem.subcategoryId}>
                                {scatitem.isRule?(props.isRTL === "rtl"?(scatitem.ruleType+" - "+scatitem.subcategoryName):(scatitem.subcategoryName+" - "+scatitem.ruleType)):scatitem.subcategoryName}
                            </option>
                        })}
                        </Form.Control>
                    </li>

                    {props.addedFilters && (props.addedFilters.categoryId > 0 || props.addedFilters.subcategoryId > 0)?
                        <li className="list-inline-item">
                            <Button variant="secondary" className="reset-link" size="sm" onClick={() => props.updateFiltersList("departmentId", 0, true)}><XIcon size={14} /></Button>
                        </li>
                    :<></>}
                </ul>
            </Col>
            <Col xs={12} className="snapshotdetails-view">
                <label className="pure-material-switch snapshot-check plg-check" style={{width: "160px"}}>
                    <input type="checkbox" checked={props.snapshotShowFieldOnly} onChange={() => props.toggleSnapshotShowFieldOnly(!props.snapshotShowFieldOnly)} />
                    <span style={{color:(props.dmode?'#2CC990':'#5128a0')}}>{t("selectedfield_only")}</span>
                </label>

                <ButtonGroup className="chartfilter-toggle">
                    <Button variant="outline-primary" className={!showSnapChart?'active':''} onClick={() => setShowSnapChart(false)} size="sm"><FeatherIcon icon="list" size={16}/></Button>
                    <Button variant="outline-primary" className={showSnapChart?'active':''} size="sm" onClick={() => setShowSnapChart(true)}><FeatherIcon icon="pie-chart" size={16}/></Button>
                </ButtonGroup>

                {showSnapChart?<>
                    <BottomSnapshotPieChart t={t} isRTL={props.isRTL}
                        filterLevel={props.filterLevel}
                        showingSnapshotList={props.showingSnapshotList}
                        snapshotShowFieldOnly={props.snapshotShowFieldOnly}
                        />
                </>:<>
                    <Col className="snapshottable-view">
                        <Table className="sumview-table" style={{marginBottom:"0px"}}>
                        <thead><tr>
                            <th width="10%">{props.t("SNAPTABLE_LABELS.MARK")}</th>
                            <th>{props.t("SNAPTABLE_LABELS.PORTION")}</th>
                            <th width="10%">{props.t("MP_CHART_TITLES.space")}</th>
                            <th width="10%">{props.t("SNAPTABLE_LABELS.SIMSPACE")}</th>
                            <th width="10%">{props.t("REC")}</th>
                            <th width="10%">{props.t("MP_CHART_TITLES.sales")}</th>
                            <th width="10%">{props.t("SNAPTABLE_LABELS.AVG")}</th>
                        </tr></thead>

                        <tbody>
                            {props.showingSnapshotList.map((pitem, pidx) => {
                            let nametxt = (props.filterLevel === "CAT"?pitem.categoryName:props.filterLevel === "SCAT"?pitem.subcategoryName:pitem.brandName);
                            
                            let highlightobj = props.hightlightSnapShotList;
                            
                            let isHighlightSelect = (
                                props.filterLevel === "CAT"?highlightobj.categories.find(x => 
                                    (x.categoryId === pitem.categoryId && ((!x.isRule && !pitem.isRule) || (x.isRule && pitem.isRule && x.ruleType === pitem.ruleType)))
                                ):
                                props.filterLevel === "SCAT"?highlightobj.subcategories.find(x => 
                                    (x.categoryId === pitem.categoryId && ((!x.isCatRule && !pitem.isCatRule) || (x.isCatRule && pitem.isCatRule && x.catRuleType === pitem.catRuleType))) && 
                                    (x.subcategoryId === pitem.subcategoryId && ((!x.isScatRule && !pitem.isScatRule) || (x.isScatRule && pitem.isScatRule && x.scatRuleType === pitem.scatRuleType)))
                                ):
                                highlightobj.brands.find(x => 
                                    (x.categoryId === pitem.categoryId && ((!x.isCatRule && !pitem.isCatRule) || (x.isCatRule && pitem.isCatRule && x.catRuleType === pitem.catRuleType))) && 
                                    (x.subcategoryId === pitem.subcategoryId && ((!x.isScatRule && !pitem.isScatRule) || (x.isScatRule && pitem.isScatRule && x.scatRuleType === pitem.scatRuleType))) && 
                                    (x.brandId === pitem.brandId)
                                )
                            );
                            
                            return <React.Fragment key={pidx}>
                                {(!props.snapshotShowFieldOnly || (props.snapshotShowFieldOnly && pitem.isshowitem)) && pitem.space > 0?<tr>
                                <td>
                                    <label className="pure-material-switch">
                                        <input type="checkbox" checked={(isHighlightSelect?true:false)} onChange={() => props.toggleHightlightList(pitem)} />
                                        <span style={{color:(props.dmode?'#2CC990':'#5128a0'),margin:"0px"}}></span>
                                    </label>
                                </td>
                                <td className="pertd-col">
                                    {pitem.isRule?<span className="rule-flag" style={{color: "red"}}><BookmarkFillIcon size={14} /></span>:<></>}
                                    <CustomProgressBar 
                                    showtooltip={true} 
                                    fulltext={nametxt} 
                                    text={nametxt} 
                                    isborder={pitem.isRule} mainbarcolor={(pitem.color?pitem.color:"red")} 
                                    mainbarpercentage={pitem.space} 
                                    textcolor={pitem.isRule?(pitem.color?pitem.color:"red"):(checkColorIsLight((pitem.color?pitem.color:"red"))?"#5128A0":"white")} showsubbar="true" 
                                    subbarpercentage={pitem.recommendedSpace} 
                                    />
                                </td>
                                <td><div className={"per-wrapper"+(pitem.space < pitem.recommendedSpace?" red":"")}>{pitem.space}%</div></td>
                                <td><div className="per-wrapper border">{pitem.simulatedSpace}%</div></td>
                                <td><div className="per-wrapper border">{pitem.recommendedSpace}%</div></td>
                                <td><div className={"per-wrapper"+(pitem.salesSpace < pitem.averageSpace?" red":"")}>{pitem.salesSpace}%</div></td>
                                <td><div className="per-wrapper border">{pitem.averageSpace}%</div></td>
                                </tr>:<></>}
                            </React.Fragment>
                            })}
                        </tbody>
                        </Table>
                    </Col>
                </>}
            </Col>
            </Row>:<>
            <h4 className="nocontent-txt text-center">{props.t("NO_CONTENT_FOUND")}</h4>    
            </>}
        </>:<>
            <Col className="text-center" style={{paddingTop:"120px"}}><img src={loadinggif} alt="loading animation" style={{height:"20px"}}/></Col>
        </>}
        </Col>
    </Col></>);
}
