import React from 'react';
import { withTranslation } from 'react-i18next';
import {  withRouter } from 'react-router-dom';
import AsyncSelect  from 'react-select/async';
import { Button, Col, ListGroup, Row } from 'react-bootstrap';
import moment from 'moment';
import DatePicker from 'react-datepicker';

import { submitCollection } from '../../../_services/submit.service';
import { submitSets } from '../../UiComponents/SubmitSets';
import { XIcon } from '@primer/octicons-react';
import { kFormatter, roundOffDecimal } from '../../../_services/common.service';
import { alertService } from '../../../_services/alert.service';
import { TooltipWrapper } from '../../newMasterPlanogram/AddMethods';

// import { alertService } from '../../../_services/alert.service';
class OpenSearchMap extends React.Component {
    constructor(props) {
        super(props)
        this._isMounted = false;
        this._searchTimeout = null;

        this.state = {
            searchList: [],

            sobj: this.defaultSearchObj(),
            salesDetailsList: [],
            isDataLoading: false,

            selectedItem: null,
        }
    }

    componentDidMount(){
        this._isMounted = true;
        if(this._isMounted){
            this.findSuggestionList()
        }
    }

    componentWillUnmount(){
        this._isMounted = false;
    }

    defaultSearchObj = () => {
        let backdate = new Date();
        let newbackdate = backdate.setMonth(backdate.getMonth() - 6);

        let fromdate = new Date(newbackdate);
        let todate = new Date();

        return { startDate: fromdate, endDate: todate, filterby: [] };
    }

    filterColors = () => {
        return this.state.searchList
        // .filter((i) =>
        //   i.label.toLowerCase().includes(inputValue.toLowerCase())
        // );
    }
      
    loadOptions = async (inputValue) => {
        this.freeze = true //set mark for stop calls

        return new Promise(async (res, err) => { //return promise 
            let p = new Promise((res, err) => {
                if(this._searchTimeout) clearTimeout(this._searchTimeout) //remove prev timer 

                this._searchTimeout = setTimeout(async () => {
                    this.freeze = false
                    const r = await this.findSuggestionList(inputValue) //request
                    res(r);
                }, 1000)
            })

            p.then((x) => {
                // console.log('log-- ', x);
                res(x);
            })
        });

        /* return this.findSuggestionList(inputValue).then((res) => {
            // console.log(res);
            //res.filter((r) => r.name.toLowerCase().startsWith(inputValue)).map((t) => ({ value: t.id, label: t.name }))
            return res;
        }); */
    }

    findSuggestionList = (inputValue) => {
        var cobj={
            searchText:(inputValue?inputValue:""),
            isReqPagination: true,
            maxResult: 10,
            startIndex: 0
        }

        return submitSets(submitCollection.findSuggestionList, cobj, false).then(res => {
            if (res && res.status) {
                let allresultslist = (res.extra && res.extra.length > 0?res.extra:[]);
                for (let i = 0; i < allresultslist.length; i++) {
                    const singleresult = allresultslist[i];
                    singleresult["value"] = singleresult.id;
                    singleresult["label"] = ((singleresult.type.substring(0,1).toUpperCase())+" - "+singleresult.name);
                }

                return allresultslist;
            } else {  
                return [];
            }
        });
    }
    //add items to filters
    handleSelectSearchItem = (evt) => {
        // let filterobj = this.state.sobj;
        console.log(evt);


    }
    //handle change dates
    handleChangeFormData = (cval, ckey, isfilterremove) => {
        let filterobj = this.state.sobj;

        if(ckey === "filterby"){
            if(isfilterremove){
                filterobj.filterby.splice(cval, 1);
            } else{
                let isalreadyAdded = filterobj.filterby.findIndex(x => x.id === cval.id);

                if(isalreadyAdded === -1){
                    filterobj.filterby.push(cval);
                } else{
                    alertService.error(this.props.t("ALREADY_ADDED"));
                    return false;
                }
            }
        } else{
            filterobj[ckey] = cval;
        }
        // console.log(filterobj);
        
        this.setState({ sobj: filterobj }, () => {
            let startdate = (filterobj.startDate && filterobj.startDate !== ""?new Date(filterobj.startDate):null);
            let endate = (filterobj.endDate && filterobj.endDate !== ""?new Date(filterobj.endDate):null);

            if(filterobj.filterby && filterobj.filterby.length === 0){
                alertService.error(this.props.t("PLEASE_SELECT_ITEMS_FROM_SEARCH"));

                this.setState({ salesDetailsList: [] });
                return false;
            }

            if(!startdate || !endate || ((startdate?startdate.getTime():null) > (endate?endate.getTime():null))){
                alertService.error(this.props.t("PLEASE_SET_VALID_DATE_RANGE"));

                this.setState({ salesDetailsList: [] });
                return false;
            }
            this.loadSaleProfitDetails();
        });
    }
    //load sales profit details
    loadSaleProfitDetails = () => {
        this.setState({ isDataLoading: true, selectedItem: null }, () => {
            submitSets(submitCollection.findsalesProfit, this.state.sobj, false).then(res => {
                // console.log(res);
                if (res && res.status) {
                    let allresultslist = (res.extra && res.extra.length > 0?res.extra:[]);
                
                    this.setState({ salesDetailsList: allresultslist });
                } else {  
                    //
                }

                this.setState({ isDataLoading: false });
            });    
        });
    }
    //reset search data
    resetSearchData = () => {
        this.setState({
            sobj: this.defaultSearchObj(),
            salesDetailsList: [],
            selectedItem: null
        }, () => {
            this.props.handleClickOpenSearch(null, this.state.sobj, true);
        });
    }
    //onclick search item
    handleClickOpenSearch = (fitem, filterby) => {
        this.setState({ selectedItem: fitem }, () => {
            this.props.handleClickOpenSearch(fitem, filterby);
        });
    }

    render() {
        let { sobj, salesDetailsList, isDataLoading, selectedItem } = this.state;
        
        return (
            <Col xs={12} className='map-opensearch-content'>
                <div className='title-map-tab'>{this.props.t("OPEN_SEARCH")}
                    <Button variant='default' className='reset-link' onClick={() => this.resetSearchData()} size='sm'>{this.props.t("btnnames.reset")}</Button>
                </div>

                <Col className='search-filters'>
                    <Row>
                        <Col xs={12} className='form-content'>
                            <small>{this.props.t("FREE_SEARCH")}</small>
                            <AsyncSelect 
                                menuPlacement="auto"
                                placeholder={this.props.t("btnnames.search")}
                                className="filter-selec2" size="sm" classNamePrefix="searchselect-inner" 
                                maxMenuHeight={200}
                                debounceTimeout={1000} 
                                value={-1}
                                onChange={(e) => this.handleChangeFormData(e, "filterby")}
                                cacheOptions loadOptions={this.loadOptions} defaultOptions
                                />  

                <           Col className="mapfilter-taglist">
                                <ul className='list-inline'>
                                    {sobj.filterby.map((fitem, fidx) => {
                                        return <li key={fidx} className='list-inline-item'>
                                            <span className='remove-link' onClick={() => this.handleChangeFormData(fidx, "filterby", true)} ><XIcon size={14}/></span> 
                                            <TooltipWrapper text={fitem.name}><span>{fitem.name.substring(0, 25)+(fitem.name.length > 25?"..":"")}</span></TooltipWrapper> 
                                        </li>
                                    })}
                                </ul>
                            </Col>  
                        </Col>
                        <Col className='form-content date'>
                            <small>{this.props.t("FILTER_ITEMS.startdate")}</small>
                            <DatePicker
                                dateFormat="dd/MM/yyyy"
                                placeholderText={this.props.t("date")}
                                popperPlacement="bottom-start"
                                showYearDropdown
                                className="datepicker-txt"
                                selected={(sobj.startDate?moment(sobj.startDate).toDate():null)}
                                onChange={(e)=>this.handleChangeFormData(e, "startDate")}
                                />    
                        </Col>
                        <Col className='form-content date'>
                            <small>{this.props.t("FILTER_ITEMS.enddate")}</small>
                            <DatePicker
                                dateFormat="dd/MM/yyyy"
                                placeholderText={this.props.t("date")}
                                popperPlacement="bottom-start"
                                showYearDropdown
                                className="datepicker-txt"
                                selected={(sobj.endDate?moment(sobj.endDate).toDate():null)}
                                onChange={(e)=>this.handleChangeFormData(e, "endDate")}
                                />    
                        </Col>
                    </Row>
                </Col>
                <Col className='filters-datacontent'>
                    {!isDataLoading?<ListGroup>
                        {salesDetailsList.map((fitem, fidx) => {
                            return <ListGroup.Item key={fidx} onClick={() => this.handleClickOpenSearch(fitem, sobj)} className={selectedItem && selectedItem.id === fitem.id?'active':''} >
                                <div className='cardwarpper'>
                                    <div className='name'>
                                        {fitem.name}
                                    </div>
                                    <div>
                                        <div className='SNP'>
                                            <div>S <span>{kFormatter(roundOffDecimal(fitem.sales, 2))}</span></div>
                                            <div>P <span>{kFormatter(roundOffDecimal(fitem.profit, 2))}</span></div>
                                        </div>
                                    </div>
                                </div>
                               
                                {/* <small>{this.props.t("MAP_OPENSEARCH.SALES")+": "+numberWithCommas(roundOffDecimal(fitem.sales, 2))} | 
                                {this.props.t("profit")+": "+numberWithCommas(roundOffDecimal(fitem.profit, 2))}</small> */}
                            </ListGroup.Item>
                        })}
                    </ListGroup>
                    :<><h6 className='text-center'>{this.props.t("DATA_LOADING_PLEASE_WAIT")}</h6></>}
                </Col>
            </Col>
        )
    }
}

export default withTranslation()(withRouter(OpenSearchMap))