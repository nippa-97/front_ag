import React, { Component } from 'react';
import Chart from "react-apexcharts";
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import './PieChart.css'
export class PieChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        theme: {
          palette: 'palette8' // upto palette10
        },
        chart: {
          width: 380,
          type: 'pie',
        },
        labels: [this.props.t('DONE'), this.props.t('Issue'), this.props.t('IN_PROGRESS')],
        responsive: [],
        legend: {
          position: 'bottom'
        },
        tooltip: {
          custom: ({ series, seriesIndex, dataPointIndex, w }) => {
            // console.log(seriesIndex);

            var renderhtml = '<div class="arrow_box">' +
              '<span>' + (seriesIndex === 0 ? this.props.t('DONE') : seriesIndex === 1 ? this.props.t('Issue') : this.props.t('IN_PROGRESS')) + '</span><hr/>' +
              '<ul>' +
              (seriesIndex === 0 ?
                this.props.piechart.seriessublist[0].map((done) => {
                  return '<li><div class="mainp"><span class="rname">' + done.region + ' : </span><span class="rcount">' + done.dcount + '</span></div></li>'
                }).join('')
                : seriesIndex === 1 ?
                  this.props.piechart.seriessublist[1].map((issue) => {
                    return '<li><div class="mainp"><span class="rname">' + issue.region + ' : </span><span class="rcount">' + issue.dcount + '</span></div></li>'
                  }).join('')
                  :
                  this.props.piechart.seriessublist[2].map((Inprogress) => {
                    return '<li><div class="mainp"><span class="rname">' + Inprogress.region + ' : </span><span class="rcount">' + Inprogress.dcount + '</span></div></li>'
                  }).join('')
              )
              + '</ul>'
              + '</div>';
            return renderhtml;
          }
        }
      },
      noData: {
        text: 'Loading...'
      }
    }
  }
  render() {
    return (
      <div>
        <Chart options={this.state.options} series={this.props.piechart !== null ? this.props.piechart.series : []} type="pie" height={300} noData={this.state.noData} />
      </div>
    );
  }
}
export default withTranslation()(withRouter((PieChart)));