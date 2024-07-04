import React, { PureComponent } from 'react';
import { Button } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

import './tabsMap.css'
import NewProductstaMap from './newProductstab_map'
import VersionAnalysisMap from './versionAnalysis_map'
import { withTranslation } from 'react-i18next'
import {  withRouter } from 'react-router-dom';
import { mapViewTypes } from '../../../enums/aristoMapDataEnums'
import ProductLifeCycleMap from './productLifeCycle_map'
import OpenSearchMap from './openSearch_map'
import TrendsDiscoverMap from './trendsDiscoverMap'
import { ChartMapIcon } from '../../../assets/icons/icons';

class TabsMap extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            
        }
    }

    render() {
        let { tabViewType,setSelectedCard } = this.props; //,setSelectedPLCCard

        return (
            <div>
                <div className='tabs-Map'>
                    <div><Button title='Product Life Cycle' active={tabViewType === mapViewTypes.productLifeCycle} onClick={()=>this.props.handleTabChange(mapViewTypes.productLifeCycle)}><FeatherIcon icon="refresh-cw" size={14} /></Button></div>
                    <div><Button title='Trends Discover' className='mapicon-top' active={tabViewType === mapViewTypes.trendsDiscover} onClick={()=>this.props.handleTabChange(mapViewTypes.trendsDiscover)}><ChartMapIcon color="white" size={14} /></Button></div>
                    <div><Button title='Version Analysis' active={tabViewType === mapViewTypes.versionAnalysis} onClick={()=>this.props.handleTabChange(mapViewTypes.versionAnalysis)}><FeatherIcon icon="bar-chart-2" size={14} /></Button></div>
                    <div><Button title='New Products' active={tabViewType === mapViewTypes.newProduct} onClick={()=>this.props.handleTabChange(mapViewTypes.newProduct)}><FeatherIcon icon="plus" size={14} /></Button></div>
                    <div><Button title='Open Search' active={tabViewType === mapViewTypes.openSearch} onClick={()=>this.props.handleTabChange(mapViewTypes.openSearch)}><FeatherIcon icon="search" size={14} /></Button></div>
                </div>
                {tabViewType !== mapViewTypes.none?<div className='tabs-details-Map' style={{height:this.props.newprodselectedobj!==null?(this.props.viewheight-220):(this.props.viewheight-100)}}>
                    {tabViewType === mapViewTypes.newProduct?<NewProductstaMap viewheight={this.props.viewheight} 
                        sobj={this.props.sobj}  graphcard={this.props.graphcard} newprodselectedobj={this.props.newprodselectedobj}
                        setSelectedCard={setSelectedCard} 
                        />
                    :<></>}
                    {tabViewType === mapViewTypes.versionAnalysis?<VersionAnalysisMap viewheight={this.props.viewheight} 
                        handleClickVersion={this.props.handleClickVersion}
                        />
                    :<></>}
                    {tabViewType === mapViewTypes.productLifeCycle?<ProductLifeCycleMap viewheight={this.props.viewheight}
                        sobj={this.props.sobj} 
                        prodLifeCircleSelectedCard={this.props.prodLifeCircleSelectedCard} handleClickProdLCycle={this.props.handleClickProdLCycle}
                        />
                    :<></>}
                    {tabViewType === mapViewTypes.openSearch?<OpenSearchMap viewheight={this.props.viewheight} 
                        handleClickOpenSearch={this.props.handleClickOpenSearch}
                        />
                    :<></>}
                    {tabViewType === mapViewTypes.trendsDiscover?<TrendsDiscoverMap viewheight={this.props.viewheight} 
                        isShowTrendCard={this.props.isShowTrendCard}
                        trendDisSelectedCard={this.props.trendDisSelectedCard}
                        handleClickTrendsDiscover={this.props.handleClickTrendsDiscover}
                        removeTrendsDiscover={this.props.removeTrendsDiscover}
                        />
                    :<></>}
                </div>:<></>}
                
            </div>
        )
    }
}

export default withTranslation()(withRouter(TabsMap))