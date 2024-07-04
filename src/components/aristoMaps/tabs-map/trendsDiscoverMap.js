import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import {  withRouter } from 'react-router-dom';
import { Badge, Col, Row } from 'react-bootstrap';

import {  InfoIconsizecolor } from '../../../assets/icons/icons';

import { trendsSampleData } from '../samplemapdata';
import { roundOffDecimal } from '../../../_services/common.service';
import { PopoverWrapper, TooltipWrapper } from '../../newMasterPlanogram/AddMethods';
import TrendsDiscoverPopup from './popups/trenddisPopup';
import { submitSets } from '../../UiComponents/SubmitSets';
import { submitCollection } from '../../../_services/submit.service';
import { alertService } from '../../../_services/alert.service';

class TrendsDiscoverMap extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            trendDataList: [],
            selectedItem: null,
            isLoadingData: false
        }
    }
    
    componentDidMount(){
        // this.initData();
        this.loadTrendsList();
    }

    loadTrendsList = () => {
        this.setState({isLoadingData: true}, () => {
            submitSets(submitCollection.loadTrends,null,null,null,true).then(res => {
                if (res && res.status) {
                    let trendslist = (res.extra && res.extra.length > 0?res.extra:[]);

                    for (let i = 0; i < trendslist.length; i++) {
                        const trenditem = trendslist[i];
            
                        let resttotal = 0;
                        for (let j = 0; j < trenditem.rest.length; j++) {
                            const restitem = trenditem.rest[j];
                            resttotal = (resttotal + restitem.trend);
                        }
                        trenditem["restTotal"] = roundOffDecimal(resttotal, 1);
                    }
                    // console.log(trendslist);

                    this.setState({trendDataList: trendslist});
                }else{
                    // alertService.error(res.extra!==""?res.extra:this.props.t("erroroccurred"))
                }

                this.setState({isLoadingData: false});
            });
        });
    }

    initData = () => {
        let sampleitems = [1,2,3];
        let resultscount = (Math.floor(Math.random() * sampleitems.length) + 1);
        
        let trendslist = this.getMultipleRandom(JSON.parse(JSON.stringify(trendsSampleData)), resultscount);
        // console.log(trendslist,resultscount);

        for (let i = 0; i < trendslist.length; i++) {
            const trenditem = trendslist[i];

            let resttotal = 0;
            for (let j = 0; j < trenditem.rest.length; j++) {
                const restitem = trenditem.rest[j];
                resttotal = (resttotal + restitem.trend);
            }
            trenditem["restTotal"] = roundOffDecimal(resttotal, 1);
        }
        // console.log(trendslist);
        
        this.setState({ trendDataList: trendslist });
    }

    getMultipleRandom = (arr, num) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    }

    handleClickTrendsDiscover = (titem) => {
        this.setState({ selectedItem: titem }, () => {
            this.props.handleClickTrendsDiscover(titem);
        });
    }
    
    render() {
        return (
            <div className='trends-Map'>
                <div className='title-map-tab'>{this.props.t("TRENDSDDISCOVERED")}</div>
                <div className="maplistdiv-map" style={{maxHeight:this.props.viewheight-180}}>
                    {!this.state.isLoadingData?this.state.trendDataList.map((titem, tidx) => {
                        return <Col key={tidx} onClick={() => this.handleClickTrendsDiscover(titem)} className={"dropdown-single-item"+(this.state.selectedItem && this.state.selectedItem.id === titem.id?" active":"")}>
                            <Col className="details">
                                <Row>
                                    <Col xs={7} className='trend'>
                                        <TooltipWrapper text={titem.name}><h6>{titem.name.substring(0, 15)+(titem.name.length > 15?"..":"")}</h6></TooltipWrapper>
                                        <h4 className={titem.trendType === "Good"?"success":"danger"}>{(titem.trendType === "Good"?"+":"-")+" "+titem.trend}%</h4>
                                    </Col>
                                    <Col xs={5} className='rest'>
                                        <h6>Rest</h6>
                                        <h4 className={titem.trendType === "Good"?"danger":"success"}>{(titem.trendType === "Good"?"-":"+")+" "+titem.restTotal}%</h4>
                                    </Col>    
                                </Row>
                                <PopoverWrapper text={<Col className="trend-popovercontent">
                                    <ul>
                                        {titem.rest.map((ritem,ridx) => {
                                            return <li key={ridx}><label className='trendname'>{ritem.name}</label> <Badge bg={ritem.trendType === "Good"?"danger":"success"}>{(ritem.trendType === "Good"?"-":"+")+" "+ritem.trend}%</Badge></li>;
                                        })}
                                    </ul>
                                </Col>} placement="top" trigger={["hover", "focus"]} showdelay={2000}>
                                    <div className='infoi'>
                                        <InfoIconsizecolor size={20} color={"#F39C12"}  />                        
                                    </div>    
                                </PopoverWrapper>
                            </Col>
                        </Col>;
                    }):<>
                        <h6 className='text-center' style={{fontWeight: "400"}}>{this.props.t("DATA_LOADING_PLEASE_WAIT")}</h6>
                    </>}
                </div>

                {this.props.isShowTrendCard && this.props.trendDisSelectedCard?
                    <TrendsDiscoverPopup 
                        trendDisSelectedCard={this.props.trendDisSelectedCard} 
                        removeTrendsDiscover={this.props.removeTrendsDiscover}
                        />
                :<></>}
            </div>
        )
    }
}

export default withTranslation()(withRouter(TrendsDiscoverMap))