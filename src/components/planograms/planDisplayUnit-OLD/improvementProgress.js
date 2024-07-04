import React from "react";
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import PropTypes from 'prop-types';
/**
 * #PLG-DU-IM-H02
 * shows improvement donut chart
 *
 * @export
 * @param {*} { value- current prop value, dmode- is dark mode }
 * @return {*} 
 */
export default function ImprovementProgress({ value, dmode }) {
    //default values
    var percentage = (value?value:0);
    var showPercentage = "";
    var pathColor = "rgba(81, 40, 160, 1)";
    var trailColor = "#baaad9";

    //sets color of chart according to imporovement value
    if(percentage && percentage > 0){ //if its greater than zero - green
        showPercentage = percentage

        if(dmode){
            pathColor = "rgba(44, 201, 144, 1)"
            trailColor = "#9feace"
        }

    }else if(percentage && percentage < 0){ //lower than zero(minus values) - red
        showPercentage = percentage
        percentage = percentage * -1
        pathColor = "rgba(220, 53, 69, 1)"
        trailColor = "#f3babf"
    }else{
        showPercentage = "0"
        percentage = 0
    }

    return (<><CircularProgressbar
        value={percentage}
        text={`${showPercentage}%`}
        strokeWidth={9}
        styles={buildStyles({ textColor: pathColor, textSize: '20px', strokeLinecap: 'butt', pathColor: pathColor, trailColor: trailColor })}
    /><input type="hidden" id="improveview-percnt" value={showPercentage} /></>)
}
//suggestions
ImprovementProgress.propTypes = {
    value: PropTypes.number,
    dmode : PropTypes.bool
}