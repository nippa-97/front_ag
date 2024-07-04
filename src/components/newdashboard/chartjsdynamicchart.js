import React from 'react';
import { Line, defaults } from 'react-chartjs-2';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

import { roundOffDecimal, numberWithCommas } from '../../_services/common.service';

//chart configs
defaults.font.family = "'Assistant', sans-serif";
Chart.register(annotationPlugin);

/**
 * using to show dashboard chart in a line chart
 * it draws first line for chain data and other lines for stores
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default React.memo(function ChartjsDynamicChart(props) {
    //custom chart options
      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: { boxWidth: 10, boxHeight: 8, font: { size: 12, weight: 700, family: "'Assistant', sans-serif" }, color: (props.dmode?"#2CC990":"#5128a0") },
            },
            title: {
                display: false,
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem, data) => {
                        //console.log(tooltipItem);
                        return [(tooltipItem.dataset.label+": "+numberWithCommas(roundOffDecimal(tooltipItem.raw,2))), 
                        (props.loadedChartData && props.oridLineData[tooltipItem.datasetIndex].data[tooltipItem.dataIndex].version?(props.t("version")+": "+props.oridLineData[tooltipItem.datasetIndex].data[tooltipItem.dataIndex].version):"")];
                    }
                }
            },
            annotation: {
                annotations: (props.oridLineData && props.oridLineData.length > 0?props.annotationsList:{}),
            }
        },
        scales: {
            x: {
                ticks: {
                    minRotation: 25,
                    font: { size: 13, weight: 700 },
                    color: (props.dmode?"#2CC990":"#5128a0"),
                }
            },
            y: {
                ticks: {
                    font: { size: 13, weight: 700 },
                    color: (props.dmode?"#2CC990":"#5128a0"),
                    beginAtZero: true,
                }
            }
        },
        onClick: (e, element) => {
            if (element.length > 0) {
                var firstitem = element[0];
                markersClickHandle(firstitem);
            }
        },
      };
    //chart series data
    var data = {
        labels: (props.loadedChartData?props.loadedChartData.categories:[]),
        datasets: (props.loadedChartData?props.loadedChartData.series:[]),
    };

    //chart plugins
    var chartpluinsset = [
        {
            afterDraw: (chart) => {
            //console.log('After draw: ', chart);
            if (!chart.data.datasets || chart.data.datasets.length === 0 || chart.data.datasets[0].label === undefined) {
                // No data is present
                var ctx = chart.ctx;
                var width = chart.width;
                var height = chart.height;
                chart.clear();

                ctx.save();
                ctx.fillStyle = (props.dmode?"#2CC990":"#5128a0");
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = "700 22px 'Assistant', 'SimplerPro', sans-serif";
                // chart.options.title.text <=== gets title from chart 
                // width / 2 <=== centers title on canvas 
                // 18 <=== aligns text 18 pixels from top, just like Chart.js 
                ctx.fillText('', width / 2, 18); // <====   ADDS TITLE
                ctx.fillText(props.t("NOCHARTDATAAVAILABLE"), width / 2, height / 2);
                
                ctx.restore();
            }
        }
        }
    ];

    const markersClickHandle = (firstitem) => {
        var cselectobj = props.oridLineData[firstitem.datasetIndex].data[firstitem.index];
        if(cselectobj.layoutId && cselectobj.layoutId > 0){
            cselectobj["series"] = props.oridLineData[firstitem.datasetIndex].name;
            props.handleViewChanges(cselectobj);
        }
    }

    return (
        <div dir="ltr">
            <Line data={data} options={options} height={340} plugins={chartpluinsset} />
        </div>
    )


});
