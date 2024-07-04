import React from 'react';
import { withRouter } from 'react-router-dom';
import { Col} from 'react-bootstrap';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { alertService } from '../../_services/alert.service';
import PreviewImage from '../common_layouts/image_preview/imagePreview';
import { AcViewModal } from '../UiComponents/AcImports';
import { submitSets } from '../UiComponents/SubmitSets';
import { submitCollection } from '../../_services/submit.service';
import { mapViewTypes } from '../../enums/aristoMapDataEnums';

import MainAristoMapContent from './mapcontents/mapcontents';

import './aristomaps.css';
import SearchbarMap from './searchbar-map/searchbarMap';
import TabsMap from './tabs-map/tabsMap';
// import { arisonotficationextra } from './samplemapdata';
import SingleNotificationComponent from '../newMasterPlanogram/notifications/singlenotification';
import { selectedMasterPlanSetAction } from '../../actions/masterPlanogram/masterplanogram_action';
import { roundOffDecimal } from '../../_services/common.service';
// import { sampleTrendStores } from './samplemapdata';
// import LifecyclePopup from './tabs-map/popups/lifecyclePopup';


// import { addressPoints } from './samplemapdata';



/**
 *
 *
 * @class AristoMapComponent
 * @extends {React.Component}
 */
class AristoMapComponent extends React.Component{
    constructor(props){
        super(props);

        this._ismounted = false;
        this.whitecontainer = React.createRef();

        this.state = {
            sobj: this.defaultSearchObj(true),
            isShowLoadingModal: false,
            showPreviewImageModal: false, productId: 0,
            
            //map contents
            isShowMap: true, mapViewHeight: 0, 
            centerPoints: { lat: 31.046100, lng: 34.851600 },
            mapFilters: this.defaultMapFilters(), zoomLevel: 3,
            mapAllMarkersList: [], bkpAllMarkersList: [],

            //filter data
            tabViewType: mapViewTypes.productLifeCycle,
            oriCountryList: [], allCountryList: [], 
            oriRegionList: [], allRegionsList: [], 
            oriCityList: [], allCityList: [], 
            oriStoresList: [], allStoresList: [],
            graphcard:null,
            selectedCard:null,
            selectedMarkerobj:null,
            selectedVersion: null,

            prodLifeCircleSelectedCard:null,
            trendDisSelectedCard: null, isShowTrendCard: false,

        }
    }
      
    componentDidMount() {
        this._ismounted = true;

        if(this._ismounted){
            let curdivheight = (this.whitecontainer.current?(this.whitecontainer.current.offsetHeight - 60):0);
            this.setState({
                mapViewHeight: curdivheight,
                // centerPoints: this.getLatLngCenter(addressPoints)
            });

            //filter master data load
            this.loadCountryList();
            this.loadRegionsList();
            this.loadCityList();
            this.loadStoresList();

            //filter data
            // this.commonSearchData(this.state.sobj);
        }
    }
    
    componentWillUnmount() {
        this._ismounted = false;
    }
    //common search filters
    defaultSearchObj = (isonload) => {
        return { 
            mapViewMode: (isonload?mapViewTypes.versionAnalysis:this.state.tabViewType),
            storeUUIds: [],
            mpId: -1,
            searchDate: null,
            endDate: null,
            filters: [],
            productId: 0,
            trend: { id: -1, trend: null, type: null, trendType: null }
        };
    }
    //default map filter
    defaultMapFilters = () => {
        return { country: -1, countryName: "", region: -1, regionName: "", city: -1, cityName: "", store: -1, storeName: "" };
    }
    //common search call for map dat
    commonSearchData = (sobj) => {
        submitSets(submitCollection.loadMapView, sobj, true).then(resp => {
            // console.log(resp);
            if(resp && resp.status){
                let storelist = (resp && resp.extra && resp.extra.length > 0?resp.extra:[]);
                // let storelist = JSON.parse(JSON.stringify(addressPoints));
                // console.log(storelist);
                
                if(storelist && storelist.length > 0){
                    let nogpsavailable = false;

                    for (let i = 0; i < storelist.length; i++) {
                        const storeitem = storelist[i];
                        
                        if(!storeitem.latitude || !storeitem.longtitue){
                            nogpsavailable = true;
                        }

                        storeitem["lat"] = parseFloat(storeitem.latitude);
                        storeitem["lng"] = parseFloat(storeitem.longtitue);
                    }   
                    
                    if(this.state.tabViewType === mapViewTypes.openSearch && sobj.filters.length > 0 && sobj.filters.length === 1 && sobj.filters[0].id === 1204){
                        storelist = storelist.sort((a, b) => a.openSearch.sales - b.openSearch.sales);
                        
                        for (let l = 0; l < storelist.length; l++) {
                            if(l < 3){
                                storelist[l]["isRedStore"] = true;
                            }
                        }
                    }

                    if(nogpsavailable){
                        alertService.warn(this.props.t("SOME_GPS_NOTAVAILABLE"));
                    }
                }

                let centerpoints = (storelist && storelist.length?this.getLatLngCenter(storelist):this.state.centerPoints);
                this.setState({ 
                    mapAllMarkersList: storelist, 
                    bkpAllMarkersList: JSON.parse(JSON.stringify(storelist)), 
                    centerPoints: centerpoints,
                    zoomLevel: 3
                });
            } else{
                this.setState({ mapAllMarkersList: [], bkpAllMarkersList: [] });
            }
        });
    }

    //load all counties master data
    loadCountryList = () => {
        submitSets(submitCollection.loadCountryList).then(resp => {
            if(resp && resp.status){
                let arr = [{value:-1, label: this.props.t("MAP_FILTERS.ENTIRE_WORLD")}];
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value: resp.extra[i].name, 
                        label: resp.extra[i].name,
                        obj: resp.extra[i]
                    });
                }
                this.setState({ allCountryList: arr, oriCountryList: JSON.parse(JSON.stringify(arr)) });
            } 
        });
    }

    //load all regions master data
    loadRegionsList = () => {
        submitSets(submitCollection.loadRegionsList).then(resp => {
            if(resp && resp.status){
                let arr = [{value:-1, label: this.props.t("MAP_FILTERS.All_REGIONS")}];
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value: resp.extra[i].name, 
                        label: resp.extra[i].name,
                        obj: resp.extra[i],
                        countryId: (resp.extra[i].country?resp.extra[i].country.name:-1)
                    });
                }
                this.setState({ allRegionsList: arr, oriRegionList: JSON.parse(JSON.stringify(arr)) });
            } 
        });
    }

    //load all city master data
    loadCityList = () => {
        submitSets(submitCollection.loadCityList).then(resp => {
            if(resp && resp.status){
                let arr = [{value:-1, label: this.props.t("MAP_FILTERS.ALL_CITIES")}];
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value: resp.extra[i].name, 
                        label: resp.extra[i].name,
                        obj: resp.extra[i],
                        countryId: (resp.extra[i].country?resp.extra[i].country.name:-1),
                        regionId: (resp.extra[i].region?resp.extra[i].region.name:-1)
                    });
                }
                this.setState({ allCityList: arr, oriCityList: JSON.parse(JSON.stringify(arr)) });
            } 
        });
    }

    //load all stores master data
    loadStoresList = () => {
        submitSets(submitCollection.loadStoresList).then(resp => {
            if(resp && resp.status){
                let arr = [{value:-1, label: this.props.t("MAP_FILTERS.ALL_STORES")}];
                for (let i = 0; i < resp.extra.length; i++) {
                    arr.push({
                        value: resp.extra[i].name, 
                        label: resp.extra[i].name,
                        obj: resp.extra[i],
                        countryId: (resp.extra[i].country?resp.extra[i].country.name:-1),
                        regionId: (resp.extra[i].region?resp.extra[i].region.name:-1),
                        storeId: (resp.extra[i].store?resp.extra[i].store.name:-1)
                    });
                }
                this.setState({ allStoresList: arr, oriStoresList: JSON.parse(JSON.stringify(arr)) });
            } 
        });
    }

    copyToClipboard = (ctxt) => {
        alertService.info(this.props.t("COPIED_TO_CLIP_BOARD"));
    }

    handleImagePreviewModal = (obj,type) =>{
        this.setState({
            // productId:(obj?obj.id:0),
            showPreviewImageModal:type});
    }
    //toggle loading modal
    toggleLoadingModal = (isshow, _callback) => {
        this.setState({ isShowLoadingModal: isshow }, () => {
            if(_callback){
                _callback();
            }
        });
    }
    //set zoom level
    setMapZoom = (zoomlevel) => {
        this.setState({ zoomLevel: zoomlevel }, () => { //, isShowMap: false
            // this.setState({ isShowMap: true });
        });
    }
    //set map filters
    handleChangeFilters = (isreset, ckey, cvalue) => {
        let filterobj = JSON.parse(JSON.stringify(this.state.mapFilters));
        let zoomlevel = 3;
        let centerpoints = this.state.centerPoints;

        //if reset filters
        if(isreset){
            filterobj = this.defaultMapFilters();

            let allmarkers = this.state.bkpAllMarkersList;
            centerpoints = (allmarkers && allmarkers.length > 0?this.getLatLngCenter(this.state.bkpAllMarkersList):this.state.centerPoints);
        } else{
            filterobj[ckey] = cvalue;
            
            if(cvalue !== -1){
                if(ckey === "country"){
                    //find center points
                    let countryobj = this.state.allCountryList.find(x => x.value === cvalue);
                    if(countryobj && countryobj.obj && countryobj.obj.latitude && countryobj.obj.longtitue){
                        centerpoints = { lat: parseFloat(countryobj.obj.latitude), lng: parseFloat(countryobj.obj.longtitue) };
                    }

                    filterobj.countryName = countryobj.obj.name;

                    //reset below sections
                    filterobj.region = -1;
                    filterobj.regionName = "";

                    filterobj.city = -1;
                    filterobj.cityName = "";

                    filterobj.store = -1;
                    filterobj.storeName = "";

                    zoomlevel = 4;
                } else if(ckey === "region"){
                    //find center points
                    let regionobj = this.state.allRegionsList.find(x => x.value === cvalue);
                    if(regionobj && regionobj.obj && regionobj.obj.latitude && regionobj.obj.longtitue){
                        centerpoints = { lat: parseFloat(regionobj.obj.latitude), lng: parseFloat(regionobj.obj.longtitue) };
                    }

                    filterobj.regionName = regionobj.obj.name;

                    //load parent data
                    filterobj.country = (regionobj.obj.country?regionobj.obj.country.name:filterobj.country);
                    filterobj.countryName = (filterobj.country !== -1?filterobj.country:"");
                    
                    //reset below sections
                    filterobj.city = -1;
                    filterobj.cityName = "";

                    filterobj.store = -1;
                    filterobj.storeName = "";

                    zoomlevel = 6;
                } else if(ckey === "city"){
                    //find center points
                    let cityobj = this.state.allCityList.find(x => x.value === cvalue);
                    if(cityobj && cityobj.obj && cityobj.obj.latitude && cityobj.obj.longtitue){
                        centerpoints = { lat: parseFloat(cityobj.obj.latitude), lng: parseFloat(cityobj.obj.longtitue) };
                    }

                    filterobj.cityName = cityobj.obj.name;

                    //load parent data
                    filterobj.country = (cityobj.obj.country?cityobj.obj.country.name:filterobj.country);
                    filterobj.countryName = (filterobj.country !== -1?filterobj.country:"");

                    filterobj.region = (cityobj.obj.region?cityobj.obj.region.name:filterobj.region);
                    filterobj.regionName = (filterobj.region !== -1?filterobj.region:"");

                    //reset below sections
                    filterobj.store = -1;
                    filterobj.storeName = "";

                    zoomlevel = 8;
                } else{
                    //find center points
                    let storeobj = this.state.allStoresList.find(x => x.value === cvalue);
                    if(storeobj && storeobj.obj && storeobj.obj.latitude && storeobj.obj.longtitue){
                        centerpoints = { lat: parseFloat(storeobj.obj.latitude), lng: parseFloat(storeobj.obj.longtitue) };
                    }
                    
                    filterobj.storeName = storeobj.obj.name;

                    //load parent data
                    filterobj.country = (storeobj.obj.country?storeobj.obj.country.name:filterobj.country);
                    filterobj.countryName = (filterobj.country !== -1?filterobj.country:"");

                    filterobj.region = (storeobj.obj.region?storeobj.obj.region.name:filterobj.region);
                    filterobj.regionName = (filterobj.region !== -1?filterobj.region:"");

                    filterobj.city = (storeobj.obj.city?storeobj.obj.city.name:filterobj.city);
                    filterobj.cityName = (filterobj.city !== -1?filterobj.city:"");

                    zoomlevel = 10;
                }
            } else{
                if(ckey === "country"){
                    //reset below sections
                    filterobj.region = -1;
                    filterobj.regionName = "";

                    filterobj.city = -1;
                    filterobj.cityName = "";

                    filterobj.store = -1;
                    filterobj.storeName = "";

                } else if(ckey === "region"){
                    //reset below sections
                    filterobj.city = -1;
                    filterobj.cityName = "";

                    filterobj.store = -1;
                    filterobj.storeName = "";

                } else if(ckey === "city"){
                    //reset below sections
                    filterobj.store = -1;
                    filterobj.storeName = "";

                }
            }
            
        }
        // console.log(JSON.parse(JSON.stringify(filterobj)));
        this.setState({ mapFilters: filterobj, centerPoints: centerpoints }, () => {
            this.shortListFilters(isreset, ckey);
            this.setMapZoom(zoomlevel);
            // this.filterShowingMarkers(zoomlevel);
        });
    }
    //short list filters
    shortListFilters = (isreset, ckey) => {
        let filterobj = this.state.mapFilters;
        
        if(isreset || ckey === "country"){
            let allregionslist = JSON.parse(JSON.stringify(this.state.oriRegionList));
            
            let newregionslist = []; //{value:-1, label: this.props.t("MAP_FILTERS.All_REGIONS")}
            for (let i = 0; i < allregionslist.length; i++) {
                const regionobj = allregionslist[i];
                if(regionobj.value === -1 || filterobj.country === -1 || (filterobj.country !== -1 && filterobj.country === regionobj.countryId)){
                    newregionslist.push(regionobj);
                }
            }

            if(newregionslist.length === 0){
                newregionslist = [{value:-1, label: this.props.t("MAP_FILTERS.All_REGIONS")}];
            }

            this.setState({ allRegionsList: newregionslist });

        } 
        
        if(isreset || ckey === "country" || ckey === "region"){
            let allcitylist = JSON.parse(JSON.stringify(this.state.oriCityList));

            let newcitylist = []; //{value:-1, label: this.props.t("MAP_FILTERS.ALL_CITIES")}
            for (let i = 0; i < allcitylist.length; i++) {
                const cityobj = allcitylist[i];
                if(
                    cityobj.value === -1 || 
                    ((filterobj.country === -1 || (filterobj.country !== -1 && filterobj.country === cityobj.countryId)) &&
                    (filterobj.region === -1 || (filterobj.region !== -1 && filterobj.region === cityobj.regionId)))
                ){
                    newcitylist.push(cityobj);
                }
            }
            
            if(newcitylist.length === 0){
                newcitylist = [{value:-1, label: this.props.t("MAP_FILTERS.ALL_CITIES")}];
            }

            this.setState({ allCityList: newcitylist });

        } 
        
        if(isreset || ckey === "country" || ckey === "region" || ckey === "city"){
            let allstorelist = JSON.parse(JSON.stringify(this.state.oriStoresList));
            
            let newstorelist = []; //{value:-1, label: this.props.t("MAP_FILTERS.ALL_STORES")}
            for (let i = 0; i < allstorelist.length; i++) {
                const storeobj = allstorelist[i];
                if(
                    storeobj.value === -1 ||
                    ((filterobj.country === -1 || (filterobj.country !== -1 && filterobj.country === storeobj.countryId)) &&
                    (filterobj.region === -1 || (filterobj.region !== -1 && filterobj.region === storeobj.regionId)) &&
                    (filterobj.city === -1 || (filterobj.city !== -1 && filterobj.city === storeobj.cityId)))
                ){
                    storeobj["lat"] = parseFloat(storeobj.latitude);
                    storeobj["lng"] = parseFloat(storeobj.longtitue);

                    newstorelist.push(storeobj);
                }
            }

            if(newstorelist.length === 0){
                newstorelist = [{value:-1, label: this.props.t("MAP_FILTERS.ALL_STORES")}];
            }
            // console.log(newstorelist);

            this.setState({ allStoresList: newstorelist });
        }
    }
    //filter showing markers list
    filterShowingMarkers = (zoomlevel) => {
        let allmarkers = JSON.parse(JSON.stringify(this.state.bkpAllMarkersList));
        let filterobj = this.state.mapFilters;
        // console.log(allmarkers);

        let newmarkerslist = [];
        for (let i = 0; i < allmarkers.length; i++) {
            const markeritem = allmarkers[i];
            if(
                (filterobj.country === -1 || (filterobj.country !== -1 && filterobj.country === markeritem.countryId)) && 
                (filterobj.region === -1 || (filterobj.region !== -1 && filterobj.region === markeritem.regionId)) && 
                (filterobj.city === -1 || (filterobj.city !== -1 && filterobj.city === markeritem.cityId)) &&
                (filterobj.store === -1 || (filterobj.store !== -1 && filterobj.store === markeritem.value))
            ){
                newmarkerslist.push(markeritem);
            }
        }

        this.setState({ mapAllMarkersList: newmarkerslist }, () => {
            this.setMapZoom(zoomlevel);
        });
    }
    //find center from GPS lat long list
    rad2degr = (rad) => { return rad * 180 / Math.PI; }
    degr2rad = (degr) => { return degr * Math.PI / 180; }

    getLatLngCenter = (latLngInDegr) => {
        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;
    
        for (let i=0; i<latLngInDegr.length; i++) {
            if(latLngInDegr[i].lat && latLngInDegr[i].lng){
                let lat = this.degr2rad(latLngInDegr[i].lat);
                let lng = this.degr2rad(latLngInDegr[i].lng);
                // sum of cartesian coordinates
                sumX += Math.cos(lat) * Math.cos(lng);
                sumY += Math.cos(lat) * Math.sin(lng);
                sumZ += Math.sin(lat);    
            }
        }
    
        let avgX = sumX / latLngInDegr.length;
        let avgY = sumY / latLngInDegr.length;
        let avgZ = sumZ / latLngInDegr.length;
    
        // convert average x, y, z coordinate to latitude and longtitude
        let lng = Math.atan2(avgY, avgX);
        let hyp = Math.sqrt(avgX * avgX + avgY * avgY);
        let lat = Math.atan2(avgZ, hyp);
    
        return {lat: this.rad2degr(lat), lng: this.rad2degr(lng)};
    }

    handleTabChange = (type) => {
        let searchobj = this.defaultSearchObj();
        let newtype = mapViewTypes.none;
        if(type !== this.state.tabViewType){
            newtype = type;

            searchobj.mapViewMode = type;
        }

        this.resetMapData();

        this.setState({ 
            tabViewType: newtype, 
            sobj: searchobj,
        }, () => {
            this.shortListFilters(true);
            
            /* if(this.state.tabViewType !== mapViewTypes.newProduct){
                this.commonSearchData(this.state.sobj);
            } */
        });
    }

    resetMapData = () => {
        this.setState({
            mapAllMarkersList: [], bkpAllMarkersList: [],
            mapFilters: this.defaultMapFilters(),
            // when tab change rest data
            graphcard:null,
            selectedCard:null,
            selectedMarkerobj:null,
            prodLifeCircleSelectedCard: null,
            trendDisSelectedCard: null, isShowTrendCard: false,
        });
    }

    //handle click on single marker
    handleMarkerClick = (locobj) => {
        var selectedmarker={
            id:locobj.id,name:locobj.name,
            uuid:locobj.uuid
        }
        this.setState({selectedMarkerobj:selectedmarker},()=>{
            if(this.state.tabViewType===mapViewTypes.newProduct){
                this.findAristoNotificationProducts()
            }
            //if version redirect to aui
            if(this.state.tabViewType === mapViewTypes.versionAnalysis){
                this.props.setMasterPlanAction(this.state.selectedVersion);
                
                window.open(window.location.origin);

                setTimeout(() => {
                    this.props.setMasterPlanAction(null);
                }, 2000);
            }
            //if trend discovered
            if(this.state.tabViewType === mapViewTypes.trendsDiscover){
                const trenditem = locobj.trendsDiscover;

                let resttotal = (trenditem.rest?trenditem.rest.trend:0);
                trenditem["restTotal"] = roundOffDecimal(resttotal, 1);

                this.setState({ trendDisSelectedCard: trenditem, isShowTrendCard: false }, () => {
                    this.setState({ isShowTrendCard: true });
                });
            }
        })
        // console.log(locobj);
        // console.log(this.state.tabViewType);
    }

    //handle click on cluster
    handleClusterClick = (loclist) => {
        // console.log(loclist);
    }
    testPeriodStatusStatus=(value)=>{
        var highlightFlag=""
        if(value==="NewStarIsBorn"){
            highlightFlag="success"
        }
        return highlightFlag
    }
    findAristoNotificationProducts=()=>{
        // console.log(this.state.selectedMarkerobj);
        var prodId=this.state.selectedCard!==null?this.state.selectedCard.productId:-1
        var StoreUUId=this.state.selectedMarkerobj!==null?this.state.selectedMarkerobj.uuid:""
        // console.log(prodId,StoreId);
        var sobj={
                searchBy: "",
                filterBy: {
                    departmentId: -1,
                    categoryId: -1,
                    subcategoryId: -1,
                    brandId: -1,
                    creationFromDate: "",
                    creationToDate: "",
                    calculationBy: "profit",
                    calculationType: false,
                    prodTestType: "NONE"
                },
                sortBy: {
                    category: false,
                    subCategory: false,
                    brand: false,
                    creationDate: false,
                    orderType: "NONE"
                },
                isSort: false,
                isReqPagination: true,
                maxResult: 10,
                startIndex: 0,
                moreFiltersAvl: false,
                moreSortAvl: false,
                productId: prodId ,
                storeUUId: StoreUUId,
                
        }
        submitSets(submitCollection.findAristoNotificationProducts, sobj, true).then(resp => {
            // console.log(resp);
            if(resp && resp.status){
                var result=resp.extra.length>0?resp.extra[0]:null
                result.CtitlehighlightFlag=this.testPeriodStatusStatus(result.testPeriodStatus)
                // var result=arisonotficationextra[0]
                this.setState({ graphcard: result });
            } else{
                alertService.error(this.props.t("erroroccurred"))
            }
        });
    }
    setSelectedCard=(value)=>{
        this.setState({selectedCard:value},()=>{
            if(this.state.tabViewType === mapViewTypes.newProduct){
                let searchobj = this.state.sobj;
                searchobj.productId = value.productId;

                let oristorelist = JSON.parse(JSON.stringify(this.state.oriStoresList));
                let storeidslist = oristorelist.filter(z => z.value !== -1).map(x => { return x.obj.storeUuid; });
                searchobj.storeUUIds = storeidslist;

                this.setState({ sobj: searchobj }, () => {
                    this.findAristoNotificationProducts();
                    this.commonSearchData(this.state.sobj);
                });
            }
        })
    }

    handleImagePreviewModal = (obj,type) =>{
        this.setState({productId:(obj?obj.id:0), showPreviewImageModal:type});
    }
    handleChangeItem = (cidx, ckey, cvalue) => {
        let allprodlist = this.state.graphcard;
        
        let selproditem = allprodlist;
        selproditem[ckey] = cvalue;

        this.setState({ notificationsList: allprodlist });
    }
    handleNewProdState = (prodstate, prodidx) => {
        console.log(prodstate);
    }
    //handle click on single version
    handleClickVersion = (verobj, deptobj) => {
        // console.log(verobj);
        let searchobj = this.defaultSearchObj();
        searchobj.mpId = verobj.mpId;

        let mpobj = {
            mp_id: verobj.mpId, 
            isLatestAvailable: true,
            is_new: true, 
            is_delete: false, 
            department: { department_id: deptobj.value, department_name: deptobj.label }, 
            categories: [],
            directType: "AUI",
            isredirect: true
        };

        this.resetMapData();
        this.setState({ sobj: searchobj, selectedVersion: mpobj }, () => {
            this.commonSearchData(this.state.sobj);
        });
    }
    //handle click open search item
    handleClickOpenSearch = (oitem, filters, isreset) => {
        // console.log(oitem, filters);

        let searchobj = this.defaultSearchObj();
        searchobj.searchDate = filters.startDate;
        searchobj.endDate = filters.endDate;
        searchobj.filters = (!isreset?[oitem]:[]);
        
        this.resetMapData();
        this.setState({ sobj: searchobj }, () => {
            if(!isreset){
                this.commonSearchData(this.state.sobj);
            }
        });
    }
    //handle click new product item
    handleClickProdLCycle = (pitem,isReset) => {
        
        if(isReset){
            this.setState({ prodLifeCircleSelectedCard:null })
        }else{
            let searchobj = this.defaultSearchObj();
            searchobj.productId = isReset?0:pitem.productId;
            this.resetMapData();
            this.setState({ sobj: searchobj,prodLifeCircleSelectedCard:pitem }, () => {
                this.commonSearchData(this.state.sobj);
                this.findReplceProduct();
            });
        }
        
        
        
        
    }
    findReplceProduct=()=>{
        /* var sobj={
            productId:this.state.sobj.productId
        }
        // call need to add
        this.setState({
            
        }) */
    }
    //handle click trends discover
    handleClickTrendsDiscover = (trendobj) => {
        let searchobj = this.defaultSearchObj();
        searchobj.trend = {
            id: trendobj.id,
            trend: trendobj.trend,
            type: trendobj.type,
            trendType: trendobj.trendType
        };
        
        this.resetMapData();
        this.setState({ sobj: searchobj, trendDisSelectedCard: trendobj, isShowTrendCard: false }, () => {
            //temp - sample points load
            /* let storelist = JSON.parse(JSON.stringify(sampleTrendStores));
            for (let i = 0; i < storelist.length; i++) {
                const storeitem = storelist[i];
                
                storeitem["lat"] = parseFloat(storeitem.latitude);
                storeitem["lng"] = parseFloat(storeitem.longtitue);
            }
            
            let centerpoints = (storelist && storelist.length?this.getLatLngCenter(storelist):this.state.centerPoints);
            
            this.setState({ 
                mapAllMarkersList: storelist, 
                bkpAllMarkersList: JSON.parse(JSON.stringify(storelist)), 
                centerPoints: centerpoints,
                zoomLevel: 3
            }); */
            
            this.commonSearchData(this.state.sobj);
        });
    }
    //remove trends discover card
    removeTrendsDiscover = () => {
        this.setState({ isShowTrendCard: false });
    }

    render(){
        let { 
            isShowMap, mapViewHeight, mapAllMarkersList, tabViewType, 
            allCountryList, allRegionsList, allCityList, allStoresList, centerPoints, zoomLevel, mapFilters,
            graphcard ,prodLifeCircleSelectedCard, sobj, trendDisSelectedCard, isShowTrendCard
        } = this.state;

        return (<>
            <Col xs={12} className="main-content aristomap-wrapper" ref={this.whitecontainer}>
                <Col xs={12} className="aristomap-filter-content">
                    <SearchbarMap t={this.props.t} dmode={this.props.dmode} 
                        mapFilters={mapFilters}
                        allCountryList={allCountryList}
                        allRegionsList={allRegionsList}
                        allCityList={allCityList}
                        allStoresList={allStoresList}
                        handleChangeFilters={this.handleChangeFilters}
                        />
                </Col>

                <TabsMap isRTL={this.props.isRTL} 
                    sobj={sobj}
                    graphcard={graphcard}
                    viewheight={mapViewHeight}
                    tabViewType={tabViewType} 
                    prodLifeCircleSelectedCard={prodLifeCircleSelectedCard}
                    findAristoNotificationProducts={this.findAristoNotificationProducts}
                    isShowTrendCard={isShowTrendCard}
                    newprodselectedobj={this.state.selectedCard}
                    handleTabChange={this.handleTabChange}
                    handleClickVersion={this.handleClickVersion}
                    handleClickOpenSearch={this.handleClickOpenSearch}
                    handleClickProdLCycle={this.handleClickProdLCycle}
                    handleClickTrendsDiscover={this.handleClickTrendsDiscover}
                    removeTrendsDiscover={this.removeTrendsDiscover}
                    setSelectedCard={this.setSelectedCard}
                    setSelectedPLCCard={this.setSelectedPLCCard}
                    trendDisSelectedCard={trendDisSelectedCard}
                    />
                {graphcard!==null?<div className=''>
                    <div className='notification-content graphcard-map'>
                        <SingleNotificationComponent t={this.props.t} dmode={this.props.dmode} 
                            pidx={0} pitem={graphcard}
                            copyToClipboard={this.copyToClipboard}
                            handleChangeItem={this.handleChangeItem}
                            handleNewProdState={this.handleNewProdState}
                            handleImagePreviewModal={this.handleImagePreviewModal}
                            />
                    </div>
                </div>:<></>}
                {/* {prodLifeCircleSelectedCard!==null?<LifecyclePopup />:<></>} */}

                {isShowMap && centerPoints && mapViewHeight > 0?
                    <MainAristoMapContent t={this.props.t} dmode={this.props.dmode} 
                        viewheight={mapViewHeight}
                        centerPoints={centerPoints}
                        mapAllMarkersList={mapAllMarkersList}
                        tabViewType={tabViewType} 
                        trendDisSelectedCard={trendDisSelectedCard}
                        zoomLevel={zoomLevel}
                        handleClusterClick={this.handleClusterClick}
                        handleMarkerClick={this.handleMarkerClick}
                        setMapZoom={this.setMapZoom}
                        />
                :<></>}
                
                
                   
            </Col>

            <AcViewModal showmodal={this.state.isShowLoadingModal} />

            {this.state.showPreviewImageModal? 
            <PreviewImage 
                productid={this.state.productId ? this.state.productId : null} 
                loadfromback={true} 
                imgurl={""} 
                isshow={this.state.showPreviewImageModal} 
                isRTL={this.props.isRTL} 
                handlePreviewModal={this.handleImagePreviewModal}
                hideheaderlables={false}
                />
            :<></>
            }
        </>);
    }
}

const mapDispatchToProps = dispatch => ({
    setMasterPlanAction: (payload) => dispatch(selectedMasterPlanSetAction(payload)),
});

export default withTranslation()(withRouter(connect(null,mapDispatchToProps)(AristoMapComponent)));