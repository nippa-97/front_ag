import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerClusterer } from '@react-google-maps/api';
import { v4 as uuidv4 } from 'uuid';
import FeatherIcon from 'feather-icons-react';

import '../aristomaps.css';
import { geoMapStyles, markerClusterStyles } from './geomapstyles';

// import { addressPoints } from '../samplemapdata';

import { CustomLocationMarker } from './additionalcomponents'; //, customClusterIcon
import { Button, Col } from 'react-bootstrap';
import { mapViewTypes } from '../../../enums/aristoMapDataEnums';
import { numberWithCommas, roundOffDecimal } from '../../../_services/common.service';

/**
 *
 *
 * @export
 */
export default function MainAristoMapContent(props){
    const { isLoaded } = useJsApiLoader({
        id: 'gketest-ait',
        googleMapsApiKey: "AIzaSyBzcZOldWgfXvkiKv4_Ayr3aibbTISKlo8"
      })
    
    const [map, setMap] = React.useState(null);
    const [markersList, setMarkersList] = React.useState([]);
    // const [centerPoints, setCenterPoints] = React.useState({ lat: 31.046100, lng: 34.851600 });
    // const [zoomLevel, setZoomLevel] = React.useState(3);
    // const [clusterInfo, setClusterInfo] = React.useState(null);
    
    React.useEffect(() => {
        if(isLoaded && map){
            if(props.centerPoints){
                let mapobj = map;
                mapobj.setCenter(props.centerPoints?props.centerPoints:{ lat: 31.046100, lng: 34.851600 });

                setMap(mapobj);
            }
            
            if(props.zoomLevel){
                let mapobj = map;
                mapobj.setZoom(props.zoomLevel?props.zoomLevel:3);

                setMap(mapobj);
            }

            if(props.mapAllMarkersList){
                let mapobj = map;
                setMarkersList(props.mapAllMarkersList);

                setMap(mapobj);
            }
        }
    },[props.centerPoints, props.zoomLevel, props.mapAllMarkersList, isLoaded, map]);

    const onLoad = React.useCallback(function callback(map) {
        // const bounds = new window.google.maps.LatLngBounds(props.centerPoints);
        map.setZoom(props.zoomLevel);
        
        setMap(map);
    }, [props.zoomLevel]);

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, []);

    const containerStyle = {
        width: '100%',
        height: props.viewheight
    };

    const clusterBeginHandle = (clusterer) => {
        // let markers = clusterer.getMarkers();
    }

    const clusterEndHandle = (clusterer) => {
        let markersCounts = [];
        // let heightList = [40, 60, 80, 100, 120];

        for (let i = 0; i < clusterer.clusters.length; i++) {
            const cluster = clusterer.clusters[i];

           let markers = cluster.getMarkers();
           markersCounts.push(markers.length);
            /* let salescount = 0;

            for (let i in markers) {
                let titleid = markers[i].title;
                
                let findoriginloc = markersList.find(x => x.uuid === titleid);
                if(findoriginloc){
                    //console.log(findoriginloc);
                    let loctabobj = findoriginloc[props.tabViewType];
                    
                    if(loctabobj){
                        if(props.tabViewType === mapViewTypes.versionAnalysis || props.tabViewType === mapViewTypes.productLifeCycle){
                            salescount = (salescount + (loctabobj.spfpd > 0?parseFloat(loctabobj.spfpd):0));
                            
                        } else if(props.tabViewType === mapViewTypes.openSearch || props.tabViewType === mapViewTypes.newProduct){
                            salescount = (salescount + (loctabobj.sales > 0?parseFloat(loctabobj.sales):0));

                        }
                    }
                }
            } */
            // console.log(cluster);
            
            // cluster.clusterIcon.styles = makeDynamicClusterIcon(cluster.clusterIcon.styles, salescount);
        }
        // console.log(markersCounts);
        
        //get min max counts
        let minVal = Math.min(...markersCounts);
        let maxVal = Math.max(...markersCounts);
        let gapBetweenMinMax = (maxVal - minVal);
        let oneInThird = (gapBetweenMinMax / 3);

        //get quater values
        let firstInThird = (minVal + oneInThird);
        let secondInThird = (minVal + (oneInThird * 2));

        for (let i = 0; i < clusterer.clusters.length; i++) {
            const cluster = clusterer.clusters[i];

            let markers = cluster.getMarkers();
            let markerheight = 50;
            if(markers.length <= maxVal && markers.length >= secondInThird){
                markerheight = 90;
            } else if(markers.length <= secondInThird && markers.length >= firstInThird){
                markerheight = 70;
            }

            cluster.clusterIcon.styles = makeDynamicClusterIcon(cluster.clusterIcon.styles, markerheight);
        }
    }

    
    const handleOpenInfoWindow = (cluster) => {
        
        // if(props.tabViewType !== mapViewTypes.productLifeCycle){
            let markerslist = getLocationsFromCluster(cluster);
        
            let contentString = "";

            let spfpd = 0;
            let spmpd = 0;

            let salescount = 0;
            let profit = 0;
            let share = 0;
            let qty = 10;

            let trendobj = null;
            let trendcount = 0;
            let trendrestcount = 0;

            for (let i = 0; i < markerslist.length; i++) {
                const markeritem = markerslist[i];
                
                let loctabobj = markeritem[props.tabViewType];
                if(props.tabViewType === mapViewTypes.versionAnalysis || props.tabViewType === mapViewTypes.productLifeCycle){
                    spfpd = (spfpd + (loctabobj.spfpd > 0?parseFloat(loctabobj.spfpd):0));

                    if(props.tabViewType === mapViewTypes.versionAnalysis){
                        spmpd = (spmpd + (loctabobj.spmpd > 0?loctabobj.spmpd:0));
                    }
                    
                } else if(props.tabViewType === mapViewTypes.openSearch || props.tabViewType === mapViewTypes.newProduct){
                    salescount = (salescount + (loctabobj.sales > 0?parseFloat(loctabobj.sales):0));
                    
                    if(props.tabViewType === mapViewTypes.openSearch){
                        profit = (profit + (loctabobj.profit?loctabobj.profit:0));
                        share = (share + (loctabobj.share?loctabobj.share:0));
                        qty = (qty + (loctabobj.qty?loctabobj.qty:0));
                    }
                } else if(props.tabViewType === mapViewTypes.trendsDiscover){
                    if(i === 0){
                        trendobj = loctabobj;
                    }

                    trendcount = (trendcount + loctabobj.trend);
                    trendrestcount = (trendrestcount + (loctabobj.rest && loctabobj.rest.trend?loctabobj.rest.trend:0));
                }
            }

            contentString = "<div class='mapcluster-tooltipcard card'><div class='card-body'><ul class='tooltip-list'>";
            
            if(props.tabViewType === mapViewTypes.versionAnalysis || props.tabViewType === mapViewTypes.productLifeCycle){
                contentString += "<li><label class='badge "+(spfpd > 0?"badge-success":"badge-danger")+"'>"+numberWithCommas(roundOffDecimal(spfpd,2))+"</label> <span class='greytxt'>"+props.t("per_day")+"</span></li>"+
                (props.tabViewType === mapViewTypes.versionAnalysis?"<li><label class='badge "+(spmpd > 0?"badge-success":"badge-danger")+"'>"+(spmpd?numberWithCommas(roundOffDecimal(spmpd, 2)):0)+"</label> <span class='greytxt'>"+props.t("SALES_PER_METER")+"</span></li>":"");
            }

            if(props.tabViewType === mapViewTypes.openSearch || props.tabViewType === mapViewTypes.newProduct){
                contentString += "<div class='row morewidth'><div class='col-xs-6'><label class='badge "+(salescount > 0?"badge-success":"badge-danger")+"'>"+(salescount?numberWithCommas(roundOffDecimal(salescount, 2)):0)+"</label> <span class='greytxt'>"+props.t("MAP_OPENSEARCH.SALES")+"</span></div>";
                
                if(props.tabViewType === mapViewTypes.openSearch){
                    contentString += "<div class='col-xs-6'><label class='badge "+(profit > 0?"badge-success":"badge-danger")+"'>"+(profit?numberWithCommas(roundOffDecimal(profit, 2)):0)+"</label> <span class='greytxt'>"+props.t("profit")+"</span></div>"+
                    "<div class='col-xs-6'><label class='badge "+(share > 0?"badge-success":"badge-danger")+"'>"+(share?share:0)+"</label> <span class='greytxt'>"+props.t("SHARE")+"</span></div>"+
                    "<div class='col-xs-6'><label class='badge "+(qty > 0?"badge-success":"badge-danger")+"'>"+qty+"</label> <span class='greytxt'>"+props.t("QUANTITY")+"</span></div>";
                }
                
                contentString += "</div>";
            }

            if(props.tabViewType === mapViewTypes.trendsDiscover && trendobj){
                // let selectedtrend = props.trendDisSelectedCard;
                let averagecount = (trendcount > 0?(trendcount / markerslist.length):0);
                let averagetrend = (trendrestcount > 0?(trendrestcount / markerslist.length):0);

                contentString += "<li><label class='badge "+(trendobj.trendType === "Good"?"badge-success":"badge-danger")+"'>"+(((trendobj.trendType === "Good"?"+":"-")+" "+roundOffDecimal(averagecount,2)))+"%</label> <span class='greytxt'>"+trendobj.name+"</span></li>"+
                "<li><label class='badge "+(trendobj.trendType === "Good"?"badge-danger":"badge-success")+"'>"+(((trendobj.trendType === "Good"?"-":"+")+" "+roundOffDecimal(averagetrend,2)))+"%</label> <span class='greytxt'>Rest</span></li>";
            }
            
            contentString += "</ul></div></div>";

            let infoWindowNode = document.createElement('div');
            infoWindowNode.innerHTML = contentString;

            const infoWindow = new window.google.maps.InfoWindow();
            infoWindow.setContent(infoWindowNode);
            infoWindow.setPosition(cluster.getCenter());
            infoWindow.setOptions(contentString);
            infoWindow.open(cluster.map);
            
            setTimeout(() => {
                infoWindow.close(cluster.map);
            }, 1500);
        // }
    }

    const handleCloseInfoWindow = (cluster) => {
        //
    }

    const handleClusterClick = (cluster) => {
        let markerslocs = getLocationsFromCluster(cluster);
        // console.log(markerslocs);
        props.handleClusterClick(markerslocs);
    }

    const getLocationsFromCluster = (cluster) => {
        let markers = cluster.getMarkers();
        
        let markersLocations = [];
        for (let i in markers) {
            let titleid = markers[i].title;
            
            let findoriginloc = markersList.find(x => x.uuid === titleid);
            if(findoriginloc){
                markersLocations.push(findoriginloc);
            }
        }

        // console.log(markersLocations);
        return markersLocations;
    }

    const makeDynamicClusterIcon = (styleslist, size) => {
        // console.log(markers);
        for (let i = 0; i < styleslist.length; i++) {
            const singlestyle = styleslist[i];
            // singlestyle.url = (salescount > 0?customClusterIcon("green"):customClusterIcon("red"));
            singlestyle.width = size;
            singlestyle.height = size;
        }

        return styleslist;
    }

    const clusterCalculateHandle = (gMarkers, numStyles) => {
        // console.log(gMarkers);
        let index = 1;
        // const count = gMarkers.length;
        let count = 0;

        for (let i = 0; i < gMarkers.length; i++) {
            let titleid = gMarkers[i].title;
            
            let findoriginloc = markersList.find(x => x.uuid === titleid);
            if(findoriginloc && findoriginloc[props.tabViewType]){
                let loctabobj = findoriginloc[props.tabViewType];

                if(props.tabViewType === mapViewTypes.versionAnalysis || props.tabViewType === mapViewTypes.productLifeCycle){
                    count = (count + (loctabobj.spfpd > 0?parseFloat(loctabobj.spfpd):0));

                } else if(props.tabViewType === mapViewTypes.openSearch || props.tabViewType === mapViewTypes.newProduct){
                    count = (count + (loctabobj.sales > 0?parseFloat(loctabobj.sales):0));

                }
            }
        }

        /* let dv = count;
        while (dv !== 0) {
          dv = parseInt(dv / 10, 10);
          index += 1;
        } */
        
        // index = Math.min(index, numStyles);
        index = (count === 0?2:1);
        // console.log(index);
        
        return {
          text: `${roundOffDecimal(count,2)}`,
          index
        };
    }

    //reset zoom level
    const resetZoom = (zoomlevel) => {
        if(isLoaded && map){
            map.setZoom(zoomlevel);
        
            setMap(map);
        }
    }

    return isLoaded? (<>
        <GoogleMap
            mapContainerStyle={containerStyle}
            center={props.centerPoints}
            options={{
                styles: geoMapStyles,
                fullscreenControl: false,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
            }}
            zoom={props.zoomLevel}
            onLoad={onLoad}
            onUnmount={onUnmount}
            >
            {markersList && markersList.length > 0?<MarkerClusterer
                averageCenter={true} 
                gridSize={150}
                calculator={clusterCalculateHandle}
                /* imageSizes={[50,100,150,200,250]} */
                onClick={handleClusterClick}
                onMouseOver={(cluster) => handleOpenInfoWindow(cluster)} 
                onMouseOut={(cluster) => handleCloseInfoWindow(cluster)}
                onClusteringBegin={clusterBeginHandle} 
                onClusteringEnd={clusterEndHandle}
                styles={markerClusterStyles}
                >
                {(clusterer) => markersList.map((loc) => (<React.Fragment key={uuidv4()}>
                    {/* <Marker position={loc} clusterer={clusterer} icon={locationIcon} onClick={() => markerClickHandle(loc.lat)}/> */}
                    <CustomLocationMarker t={props.t} loc={loc} clusterer={clusterer} 
                        tabViewType={props.tabViewType}
                        trendDisSelectedCard={props.trendDisSelectedCard}
                        handleMarkerClick={props.handleMarkerClick}
                        />
                </React.Fragment>))}
            </MarkerClusterer>:<></>}

            {/* <InfoWindow >
                <div>
                <div>nhà trọ cho thuê</div>
                <div >1.500.000đ</div>
                </div>
            </InfoWindow> */}
        </GoogleMap>

        {props.clusterPopupValue?<Col className="cluster-tooltip">
            <div>Test map</div>
            <div >12323</div>
        </Col>:<></>}

        <Button variant='default' className='resetmap-link' onClick={() => resetZoom(3)} size='sm'><FeatherIcon icon="maximize" size={22} /></Button>
    </>) : <></>
}
