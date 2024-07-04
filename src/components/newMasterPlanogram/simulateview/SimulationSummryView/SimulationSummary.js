import { ArrowRightIcon } from '@primer/octicons-react';
import React, { Component } from 'react'
import { Badge, Breadcrumb, Col, Row } from 'react-bootstrap';
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { catRectEnums } from '../../../../enums/masterPlanogramEnums';
import { getNameorIdorColorofBox } from '../../MPSimulationCommenMethods';


class SimulationSummary extends Component {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        return (
            <Col className='log' style={{height:this.props.divHeight}}>
                <Breadcrumb className="log-header" dir="ltr">
                    {this.props.isRTL === "rtl"?<>
                        {this.props.logViewType === "scat"?<>
                            {(this.props.selectedCat?<>
                                <Breadcrumb.Item active>{this.props.t("sub_categories")}</Breadcrumb.Item>
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("category", null)}>{getNameorIdorColorofBox(this.props.selectedCat,"name")}</Breadcrumb.Item> 
                            </>:"-")}
                        </>:this.props.logViewType === "brand"?<>
                            {(this.props.selectedScat?<>
                                <Breadcrumb.Item active>{this.props.t("brands")}</Breadcrumb.Item>
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("scat", null)}>{getNameorIdorColorofBox(this.props.selectedScat,"name")} </Breadcrumb.Item> 
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("category", null)}>{getNameorIdorColorofBox(this.props.selectedCat,"name")} </Breadcrumb.Item>
                            </>:"-")}
                        </>:<Breadcrumb.Item active>{this.props.t("all_categories")}</Breadcrumb.Item>}
                    </>:<>
                        {this.props.logViewType === "scat"?<>
                            {(this.props.selectedCat?<>
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("category", null)}>{getNameorIdorColorofBox(this.props.selectedCat,"name")}</Breadcrumb.Item> 
                                <Breadcrumb.Item active>{this.props.t("sub_categories")}</Breadcrumb.Item>
                            </>:"-")}
                        </>:this.props.logViewType === "brand"?<>
                            {(this.props.selectedScat?<>
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("category", null)}>{getNameorIdorColorofBox(this.props.selectedCat,"name")} </Breadcrumb.Item>
                                <Breadcrumb.Item href="#" onClick={() => this.props.handleCategoryView("scat", null)}>{getNameorIdorColorofBox(this.props.selectedScat,"name")} </Breadcrumb.Item> 
                                <Breadcrumb.Item active>{this.props.t("brands")}</Breadcrumb.Item>
                            </>:"-")}
                        </>:<Breadcrumb.Item active>{this.props.t("all_categories")}</Breadcrumb.Item>}
                    </>}
                    
                </Breadcrumb>

                <Row>
                    {this.props.logViewType === "category" && this.props.summaryViewObj?<>
                        {this.props.summaryViewObj.length > 0?<>
                            {this.props.summaryViewObj.map((citem, cidx) => {
                                let catcolor = (getNameorIdorColorofBox(citem,"color")?getNameorIdorColorofBox(citem,"color"):"red");
                                let catdrawcolor = ((citem.percentage?citem.percentage:0) > (citem.requiredPercentage?citem.requiredPercentage:0)?"#EB5757":"#48a633"); 
                                // var cviewwidth = (window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth);
                                return <Col key={cidx} xs={12} lg={(this.props.simType === "AUI"?4:3)} className="single-log-content">
                                <Col className="inner-content" onClick={() => this.props.handleCategoryView("scat", citem)} style={{borderColor: catcolor}}>
                                        <h6>{getNameorIdorColorofBox(citem,"name")?getNameorIdorColorofBox(citem,"name").substring(0,15):""} 
                                            {citem.type === catRectEnums.rule?<Badge bg="danger" className='rule-badge'>R - {citem.rule.level.substring(0,3)}</Badge>:<></>} 
                                            <span><ArrowRightIcon size={18}/></span>
                                        </h6>
                                        <Row>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar value={citem.requiredPercentage} text={((citem.requiredPercentage?citem.requiredPercentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: "#48a633", trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("REQUIRED")}</label>
                                            </Col>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar  value={citem.percentage} text={((citem.percentage?citem.percentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: catdrawcolor, trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("DRAWED")}</label>
                                            </Col>
                                        </Row>    
                                    </Col>
                                </Col>
                            })}
                        </>
                        :<><h5 className='text-center no-content'>{this.props.t("NO_CONTENT_FOUND")}</h5></>}
                    </>
                    :this.props.logViewType === "scat" && this.props.selectedCat?<>
                        {this.props.selectedCat.sub_categories && this.props.selectedCat.sub_categories.length > 0?<>
                            {this.props.selectedCat.sub_categories.map((citem, cidx) => {
                                let catcolor = (getNameorIdorColorofBox(citem,"color")?getNameorIdorColorofBox(citem,"color"):"red");
                                let catdrawcolor = ((citem.percentage?citem.percentage:0) > (citem.requiredPercentage?citem.requiredPercentage:0)?"#EB5757":"#48a633"); 

                                return <Col key={cidx} xs={12} lg={(this.props.simType === "AUI"?4:3)} className="single-log-content">
                                <Col className="inner-content" onClick={() => this.props.handleCategoryView("brand", citem)} style={{borderColor: catcolor}}>
                                        <h6>{getNameorIdorColorofBox(citem,"name")?getNameorIdorColorofBox(citem,"name").substring(0,15):""} 
                                            {citem.type === catRectEnums.rule?<Badge bg="danger" className='rule-badge'>R - {citem.rule.level.substring(0,3)}</Badge>:<></>} 
                                            <span><ArrowRightIcon size={18}/></span>
                                        </h6>
                                        <Row>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar value={citem.requiredPercentage} text={((citem.requiredPercentage?citem.requiredPercentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: "#48a633",trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("REQUIRED")}</label>
                                            </Col>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar  value={citem.percentage} text={((citem.percentage?citem.percentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: catdrawcolor, trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("DRAWED")}</label>
                                            </Col>
                                        </Row>    
                                    </Col>
                                </Col>
                            })}
                        </>
                        :<><h5 className='text-center no-content'>{this.props.t("NO_CONTENT_FOUND")}</h5></>}
                    </>
                    :this.props.logViewType === "brand" && this.props.selectedScat?<>
                        {this.props.selectedScat.brands && this.props.selectedScat.brands.length > 0?<>
                            {this.props.selectedScat.brands.map((citem, cidx) => {
                                let catcolor = (getNameorIdorColorofBox(citem,"color")?getNameorIdorColorofBox(citem,"color"):"red");
                                let catdrawcolor = ((citem.percentage?citem.percentage:0) > (citem.requiredPercentage?citem.requiredPercentage:0)?"#EB5757":"#48a633"); 

                                return <Col key={cidx} xs={12} lg={(this.props.simType === "AUI"?4:3)} className="single-log-content">
                                <Col className="inner-content" style={{borderColor: catcolor}}>
                                        <h6>{getNameorIdorColorofBox(citem,"name")?getNameorIdorColorofBox(citem,"name").substring(0,15):""} </h6>
                                        <Row>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar value={citem.requiredPercentage} text={((citem.requiredPercentage?citem.requiredPercentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: "#48a633",trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("REQUIRED")}</label>
                                            </Col>
                                            <Col>
                                                <Col className="round-content">
                                                    <CircularProgressbar  value={citem.percentage} text={((citem.percentage?citem.percentage.toFixed(2):0)+"%")} strokeWidth={12} styles={buildStyles({textColor: '#5128a0',textSize: '20px',strokeLinecap: 'butt',pathColor: catdrawcolor, trailColor: '#baaad9'})} />
                                                </Col>
                                                <label>{this.props.t("DRAWED")}</label>
                                            </Col>
                                        </Row>    
                                    </Col>
                                </Col>
                            })}
                        </>
                        :<><h5 className='text-center no-content'>{this.props.t("NO_CONTENT_FOUND")}</h5></>}
                    </>:<></>}
                </Row>
            </Col>
        )
    }
}

export default withTranslation()(withRouter(SimulationSummary));