import { useState } from "react";
import Chart from "react-apexcharts";
import { Button, Dropdown, Form } from "react-bootstrap";

// import { submitCollection } from "../../../_services/submit.service";
// import { submitSets } from "../../UiComponents/SubmitSets";
import moment from "moment";
import { preventinputotherthannumbers } from "../../../_services/common.service";
// import { sampleNotificationChartData } from "./samplecontents";

export function SingleProdLineChart(props){
    let labels = [];
    let labeldata = [];

    /* const loadNotificationChartData = () => {
        // console.log(props.pitem);

        if(props.pitem){
            let sobj = { productId: props.pitem, type: (props.pitem.calculationType?props.pitem.calculationType:"profit") }
            submitSets(submitCollection.loadProfitAndSalesChartData, sobj).then(res => {
                console.log(res);
                if(res && res.status){
                    // let brnd = res.extra; 
                    // let tempbrands = [{value : -1, label: this.props.t("any_brand")}];
                    // for (let i = 0; i < brnd.length; i++) {
                    //     tempbrands.push({value :brnd[i].brandId, label:brnd[i].brandName, obj: brnd[i] });
                    // }

                    // this.setState({ allBrandsList: tempbrands });
                } 
            });
        }
    }
    loadNotificationChartData(); */

    const loadNotificationChartData = () => {
        // console.log(props.pitem);

        if(props.pitem){
            // let samplechartdata = sampleNotificationChartData;
            // let findchartobj = samplechartdata.find(x => x.barcode === props.pitem.barcode);

            // if(findchartobj){
            //     if(props.pitem.calculationType === "sales"){
            //         labels = findchartobj.categories;
            //         labeldata = findchartobj.salesSeries;
            //     }else{
            //         labels = findchartobj.categories;
            //         labeldata = findchartobj.series;
            //     }
               
            // } else{
            //     if(props.pitem.calculationType === "sales"){
            //         labels = samplechartdata[0].categories;
            //         labeldata = samplechartdata[0].salesSeries;
            //     }else{
            //         labels = samplechartdata[0].categories;
            //         labeldata = samplechartdata[0].series;
            //     }
            // }

            labels = props.pitem.chartData.categories;
            
            if(props.pitem.calculationType === "sales"){
                labeldata = props.pitem.chartData.salesSeries;
            }else{
                labeldata = props.pitem.chartData.series;
            }

            //translate labels
            for (let i = 0; i < labeldata.length; i++) {
                labeldata[i].name = labelsTranslateConvert(labeldata[i].name);
            }
            // console.log(labeldata);
        }
    }

    function labelsTranslateConvert(labeltxt){
        return (labeltxt === "Product"?props.t("product"):labeltxt === "Brand"?props.t("FileImportErrorLogFilterTypes.Brand"):
        labeltxt === "Sub Category"?props.t("subcategory"):labeltxt === "Category"?props.t("category"):labeltxt);
    }

    loadNotificationChartData();

    var options = {
        chart: {
            toolbar: {
                show: false,
            },
        },
        legend: {
            show: false
        },
        grid: {
            show: false,
            padding: {
                top: 0, bottom: 0, left: 3, right: 3
            }
        },
        xaxis: {
            categories: labels,
            labels: {
                show: false,
            }
        },
        yaxis: {
            axisTicks: {
                show: true,
                color: "rgb(224, 224, 224)"
            },
            axisBorder: {
                show: true,
                color: "rgb(224, 224, 224)"
            },
            labels: {
                show: true,
                style: {
                    colors: (props.dmode?"#2CC990":"#5128A0"),
                    fontWeight: "bold",
                  }
            },
        },
        stroke: {
            curve: 'smooth',
            width: 1.6,
        },
        dataLabels: {
            enabled: false,
        },
        /* tooltip: {
            enabled: false,
        }, */
        colors: ["#40128B", "#9336B4", "#DD58D6", "#5FAF4E"],
        fill: {type: "gradient",gradient: {shadeIntensity: 1, opacityFrom: 0.2, opacityTo: 0, stops: [0, 100]}},
    };
    var series = labeldata;

    return (
        <> 
            {/* {labeldata&&labeldata.length > 1? */}
                <Chart className="mchart-view" options={options} series={series} type="area" height={130} />
                <small>{props.pitem && props.pitem.testStartDate?moment(props.pitem.testStartDate).format('DD.MM.YY'):"-"}</small>
                <small className={props.isRTL === "rtl"?"float-left":"float-right"}>{props.pitem && props.pitem.testEndDate?moment(props.pitem.testEndDate).format('DD.MM.YY'):"-"}</small>
            {/* :<></>} */}
        </>
    )
}

export function ExpandDropDown(props){
    let [isShowDrop, setDropShow] = useState(false);

    return <Dropdown drop='up' show={isShowDrop} onToggle={() => setDropShow(!isShowDrop)}>
    <Dropdown.Toggle variant="primary" size='sm' className={props.pitem.suggestionMessage === "expand"?'arrow-down':''} >{props.t("days")} <b>{props.t("expand")}</b></Dropdown.Toggle>
        <Dropdown.Menu className='expanddays-view'>
            <small>{props.t("EXPAND_DAYS_COUNT")}</small>
            <Form.Group>
                <Form.Control type='number' size='sm' value={props.pitem.extendPeriod?props.pitem.extendPeriod:""} onChange={(e)=>props.handleExpandDayCount(props.idx,e.target.value)} onKeyDown={ (evt) => evt.key === "."? evt.preventDefault(): preventinputotherthannumbers(evt,props.pitem.extendPeriod?props.pitem.extendPeriod:"",(props.t('validation.NumberInputValidation'))) } placeholder={props.t("NEWPROD_CHANGES.expandCount")} />
                <Button variant='primary' size='sm' disabled={(props.pitem.extendPeriod&&props.pitem.extendPeriod>-1)?false:true} onClick={()=>props.SendExpandDaysCall(props.idx)} >{props.t("expand")}</Button>
            </Form.Group>
        </Dropdown.Menu>
    </Dropdown>;
}