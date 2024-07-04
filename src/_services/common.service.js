import { store } from '../store/store'; //get redux persist store
import i18n from "../_translations/i18n";
//import cookies 
import Cookies from 'universal-cookie';
import { TaskStatusENUM } from '../enums/taskfeedEnums';
import moment from 'moment'
import { isRectCollide } from '../components/planograms/planogramDetails/PDcollide';
import { alertService } from './alert.service';
const cookies = new Cookies();

//get backend base path from .env file
const basePath = process.env.REACT_APP_BASEPATH;

const cversion = "0.2.0"; //current application version
const langList = [{ code: "en", text: "English (US)" }, { code: "he", text: "Hebrew (עִברִית)" }]; //language list
const uomList = { "meters": "Meters", "cm": "Centimeters", "inches": "Inches", "feet": "Feet" }; //uom list
const pageLength = 10; //pagination items limitation - mostly tables
const alertTimeout = 2500; //alert closing timeout
const btnPressedKeyCode = 13; //enter trigger code
const persistRootName = "pgo"; //persist unique keyname
const monthsList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//taskapp search types
const TaskFeedSearchType = { "All": "All", "Now": "Now", "Late": "Late", "To_Approve": "Approve", "Done": "Done" };
//rotate states
const rotateStatus = { FN: "front", FNR: "front_rotate", SD: "side", SDR: "side_rotate", TP: "top", TPR: "top_rotate", DFL: "default" };
//user types
const usrRoles = { CM: "CEO", CO: "COO", PA: "Planner", RM: "Region_Manager", SM: "Store_Manager", DH: "Department_Head", WK: "Worker", NA: "None" }; //user roles list
const usrLevels = {
    ST: "Store", RG: "Region", CN: "Chain",
    // DP:"Department"
};
//common user roles
const commonPageRoles = [usrRoles.CM, usrRoles.CO]; //commonly allowed user roles
//date ranges
const dateRangeList = {1: { en: "Last 2 weeks", he: "שבועיים אחרונים" },2: { en: "Last month", he: "חודש שעבר" },3: { en: "Last 3 months", he: "3 חודשים אחרונים" },4: { en: "Last 6 months", he: "6 חודשים אחרונים" },5: { en: "Last year", he: "שנה שעברה" },};
//max num of decimals limitation
export const numOfDecimalsLimit = 3;

//set new cookie
function setCookie(name, txt, maxage) {
    cookies.set(name, txt, { path: '/', maxAge: (maxage ? maxage : (24 * 60 * 60 * 365)) });
}
//get cookie Details
function getCookie(name) {
    return cookies.get(name);
}
//remove cookie
function removeCookie(name) {
    cookies.set(name, '', { path: '/', expires: (new Date(Date.now())) });
}
//pagination
function getPager(totalItems, currentPage, pageSize) {
    //console.log(totalItems, currentPage, pageSize);
    // calculate total pages
    var totalPages = Math.ceil(totalItems / pageSize);

    // ensure current page isn't out of range
    if (currentPage < 1) {
        currentPage = 1;
    } else if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    var startPage, endPage;
    if (totalPages <= 10) {
        // less than 10 total pages so show all
        startPage = 1;
        endPage = totalPages;
    } else {
        // more than 10 total pages so calculate start and end pages
        if (currentPage <= 6) {
            startPage = 1;
            endPage = 10;
        } else if (currentPage + 4 >= totalPages) {
            startPage = totalPages - 9;
            endPage = totalPages;
        } else {
            startPage = currentPage - 5;
            endPage = currentPage + 4;
        }
    }

    // calculate start and end item indexes
    var startIndex = (currentPage - 1) * pageSize;
    var endIndex = Math.min(startIndex + pageSize - 1, totalItems - 1);

    // create an array of pages to ng-repeat in the pager control
    var pages = Array.from(Array((endPage + 1) - startPage).keys()).map(i => startPage + i);

    // return object with all pager properties required by the view
    return {
        totalItems: totalItems,
        currentPage: currentPage,
        pageSize: pageSize,
        totalPages: totalPages,
        startPage: startPage,
        endPage: endPage,
        startIndex: startIndex,
        endIndex: endIndex,
        pages: pages
    };
}
//convert date object to datetime string - format YYYY/MM/DD H:M:S or DD/MM/YYYY h:m
function convertDateTime(MyDate_String_Value, type) {
    var value = new Date(MyDate_String_Value);
    var rvalue=moment(value).format('DD-MM-YYYY HH:mm:ss')
    return rvalue
}
//convert date object to date string - format YYYY/MM/DD
function convertDate(MyDate_String_Value) {
    var value = new Date(MyDate_String_Value);
    var dat = value.getFullYear() + "-" + ('0' + (value.getMonth() + 1)).slice(-2) + "-" + ('0' + (value.getDate())).slice(-2);
    return dat;
}
//convert date object to time string - format - h:m AM/PM
function convertTime(MyDate_String_Value) {
    var value = new Date(MyDate_String_Value);
    var hours = value.getHours(); var minutes = value.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12; hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes + ' ' + ampm;
}
//convert date object to time string - format - 24hours
function convertDatetoTimeHM24(MyDate_String_Value) {
    var value = new Date(MyDate_String_Value);
    var rvalue=moment(value).format('HH:mm')
    return rvalue
}
//convert date object to time string - format - h:m
function convertTimeHM(MyDate_String_Value) {
    var value = new Date(MyDate_String_Value);
    // value.toLocaleString('en-US', { timeZone: 'Asia/Colombo' });
    var hours = value.getHours(); var minutes = value.getMinutes();
    hours = hours % 12; hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return hours + ':' + minutes
}
//format time
function timetotimeHM(String_Value) {
    var arry = String_Value.split(":", 2)
    var hours = arry[0]
    var minutes = arry[1]
    return hours + ':' + minutes
}


//capital first letters of string - ex: "my string value" to "My String Value"
function camelizeTxt(str) {
    if (str != null) {
        return str.split(' ').map(function (word, index) {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
    } else {
        return '';
    }
}
//converts object to query parameters string ex - {id:123, name:"john"} to "?id=123&&name='john'"
function objToQueryParam(obj) {
    var cstr = '?';
    var idx = 0;
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            cstr += key + "=" + obj[key] + (idx > 0 ? "&&" : "");
        }
        idx++;
    }
    return cstr;
}
function aspectRatio (width, height, drawingBoardWidth, drawingBoardHeight){
    var rate = 0;
    rate = Math.min(drawingBoardWidth / width, drawingBoardHeight / height);
    return rate;
}
//convert sending sending width/height to drawing width/height and returns ratio to convert sub values to that ratio
function AspectRatioDrawBox(width, height, cdisplaywidth, cdisplayheight) {
    var rate = 0;
    if (height > 0 && width > 0) {
        if (height < width) {
            rate = (cdisplaywidth - 100) / width;
        } else {
            rate = cdisplayheight / height;
        }
    }
    return rate;
}
//floor - 
function floorAspectRatioDrawBox(width, height, cdisplaywidth, cdisplayheight, cUOM) {
    var dimension = { dheight: 0, dwidth: 0 }
    var convwidth = width;
    var convheight = height;

    if (height > 0 && width > 0) {

        if (height < width) {
            var rate = cdisplaywidth / convwidth;
            dimension.dheight = convheight * rate;
            dimension.dwidth = convwidth * rate;

        } else {
            var rate2 = cdisplayheight / convheight;
            dimension.dheight = convheight * rate2;
            dimension.dwidth = convwidth * rate2;
        }
    }
    return dimension;
}
function floorAspectRatioDrawBoxbaseonwidth(width, height, cdisplaywidth, cdisplayheight, cUOM) {
    var dimension = { dheight: 0, dwidth: 0 }
    var convwidth = width;
    var convheight = height;

    if (height > 0 && width > 0) {

        // if (height < width) {
            var rate = cdisplaywidth / convwidth;
            dimension.dheight = convheight * rate;
            dimension.dwidth = convwidth * rate;

        // } else {
        //     var rate2 = cdisplayheight / convheight;
        //     dimension.dheight = convheight * rate2;
        //     dimension.dwidth = convwidth * rate2;
        // }
    }
    return dimension;
}

function CalculateM2P(width, height, cdisplaywidth, coldwidth) {
    var cheight = (cdisplaywidth / coldwidth) * height;
    var cwidth = (cdisplaywidth / coldwidth) * width;
    var dimension = { height: cheight, width: cwidth }
    return dimension;
}

function CalculateRatio(oldWidth, newWidth) {
    var floordrawratio = newWidth / oldWidth;
    return floordrawratio;
}
//convert sending value uom to converting uom
function measureConverter(curuom, convuom, txt) {
    var rtxt = txt;
    if (curuom === "feet") {
        if (convuom === "meters") {
            rtxt = (txt / 3.2808);
        } else if (convuom === "inches") {
            rtxt = (txt * 12);
        } else if (convuom === "cm") {
            rtxt = (txt / 0.032808);
        }
    } else if (curuom === "meters") {
        if (convuom === "feet") {
            rtxt = (txt * 3.2808);
        } else if (convuom === "inches") {
            rtxt = (txt * 39.370);
        } else if (convuom === "cm") {
            rtxt = (txt / 0.01);
        }
    } else if (curuom === "inches") {
        if (convuom === "feet") {
            rtxt = (txt * 0.083333);
        } else if (convuom === "meters") {
            rtxt = (txt / 39.370);
        } else if (convuom === "cm") {
            rtxt = (txt / 0.39370);
        }
    } else if (curuom === "cm") {
        if (convuom === "feet") {
            rtxt = (txt * 0.032808);
        } else if (convuom === "meters") {
            rtxt = (txt / 100);
        } else if (convuom === "inches") {
            rtxt = (txt * 0.39370);
        }
    } else {
        //
    }
    return rtxt;
}
//convert uom to symbols
function convertUomtoSym(type) {
    return (type === "meters" ? "m" : type === "cm" ? "cm" : type === "inches" ? "in" : type === "feet" ? "ft" : "");
}
//check access for user roles
const grantPermission = (requestedPage) => {
    //get current logged in users userroles details
    var newState = store.getState();
    var curuserobj = (newState.signState && newState.signState.signinDetails ? newState.signState.signinDetails : null);
    const permittedRolePages = (curuserobj && curuserobj.userRolls ? curuserobj.userRolls.userAccessService : []);

    //check in requested page avialble in user role pages list
    var checkfltrlist = (permittedRolePages ? permittedRolePages.filter(x => (x.serviceName === requestedPage)) : null);
    //check is ai user
    var isaiuser = (requestedPage === "manualcomp" && curuserobj && curuserobj.isAiUser?true:false);
    //if request roles available and length more than zero allowed to access
    return (requestedPage ? (isaiuser || (checkfltrlist && checkfltrlist.length > 0) ? true : false) : true);
};

//nearest roundOff
function roundOffDecimal(number, decimalPoints) {
    /* let allpoints = '';
    for (let i = 0; i < decimalPoints; i++) {
        allpoints += (''+0);
    } */

    // let tolerance = parseFloat("0."+allpoints+"1");

    let decimalConverted = 0;
    if (number) {
        decimalConverted = number.toFixed(decimalPoints)
    } else {
        decimalConverted = 0
    }

    /* if (Math.abs(number - Math.round(number)) < tolerance) {
        number = Math.round(number);
    } */
    
    return parseFloat(decimalConverted);
}

//function - equality check
function isEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length !== bProps.length) {
        return false;
    }

    for (var i = 0; i < aProps.length; i++) {
        var propName = aProps[i];

        // If values of same property are not equal,
        // objects are not equivalent
        if (a[propName] !== b[propName]) {
            return false;
        }
    }

    // If we made it this far, objects
    // are considered equivalent
    return true;
}
//unique key generator
function makeUniqueID(keylength) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < keylength; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
//colors add for status
function SummerystatusColors  (type, status)  {
    if (type === "dot") {
        return { background: (status ===TaskStatusENUM.Done || status ===TaskStatusENUM.approve ? "#77DB61" : status === TaskStatusENUM.NotDone ? "red" : status ===TaskStatusENUM.Late ? "#C72C2C" : status === TaskStatusENUM.Pending ? "#815e16" :status === TaskStatusENUM.InProgress ? "#FBE057":status === TaskStatusENUM.ICanNotDo ? "red": "black") };
    }
    else {
        return { fontWeight: "bold",color: (status === TaskStatusENUM.Done || status === TaskStatusENUM.approve ? "#57b521" : status === TaskStatusENUM.NotDone ? "#red" : status === TaskStatusENUM.Late ? "#F92121" : status === TaskStatusENUM.Pending ?status === TaskStatusENUM.InProgress ? "#FBE057": "#815e16" :status === TaskStatusENUM.ICanNotDo ? "red": "#f7e4a9") };
    }

}
//status name add for status
function SummeryStatusName  ( status)  {
        var dstatus =(status ===TaskStatusENUM.Done ?i18n.t("DONE") :status ===TaskStatusENUM.approve ?i18n.t("APPROVE") : status === TaskStatusENUM.NotDone ? i18n.t("NOTDONE") : status ===TaskStatusENUM.Late ?  i18n.t("LATE") : status === TaskStatusENUM.Pending ?  i18n.t("PENDING") :status === TaskStatusENUM.InProgress ?  i18n.t("IN_PROGRESS"):status === TaskStatusENUM.ICanNotDo ?   i18n.t("Issue"): "")
        return dstatus
    }

//convert hex colors rgba colors
function hexToRGB(hex, alpha) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
        return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
    } else {
        return "rgb(" + r + ", " + g + ", " + b + ")";
    }
}
//find hex colors dark or light
function checkColorIsLight(color) {
    const hex = color.replace('#', '');

    const c_r = parseInt(hex.substr(0, 2), 16);
    const c_g = parseInt(hex.substr(2, 2), 16);
    const c_b = parseInt(hex.substr(4, 2), 16);

    const brightness = ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;

    return brightness > 135;
}
//find browser type
function findBrowserType() { 
    let browsertype = 'unknown';
    if((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) !== -1 ) {
        browsertype = "opera";
    }
    else if(navigator.userAgent.indexOf("Edg") !== -1 ){
        browsertype = "edge";
    }
    else if(navigator.userAgent.indexOf("Chrome") !== -1 ){
        browsertype = "chrome";
    }
    else if(navigator.userAgent.indexOf("Safari") !== -1){
        browsertype = "safari";
    }
    else if(navigator.userAgent.indexOf("Firefox") !== -1 ){
        browsertype = "firefox";
    }
    else if((navigator.userAgent.indexOf("MSIE") !== -1 ) || (!!document.documentMode === true )){
        browsertype = "ie"; 
    }

    return browsertype;
}
function stringtrim(text,strLength){
    var stringName = text;
    stringName = (stringName && stringName.length > 0 && stringName.length > strLength) ?(((stringName).substring(0, strLength - 3)) + '...') : stringName

    return stringName;
}

//find max result
function FindMaxResult(divHeight,oneresultHeight,allocatedspace){
    var result={}
    var maxresult=1
    maxresult=(divHeight-allocatedspace)/oneresultHeight
    result={
        maxresultCount:parseInt(maxresult.toFixed(0))
    }
    return result
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function kFormatter(num) {
    return Math.abs(num) > 999 ? Math.sign(num)*((Math.abs(num)/1000).toFixed(1)) + 'K' : Math.sign(num)*Math.abs(num)
}

/* function detectLanguage(dettext) {  
    let text = dettext.replace(/[^a-zA-Z ]/g, "");
    // split into words  
    const langs = text.trim().split(/\s+/).map(word => { return detectRTLLang(word)  });  
    // pick the lang with the most occurances  
    return (langs || []).reduce( ( acc, el ) => {    
        acc.k[el] = (acc.k[el] ? acc.k[el] + 1 : 1);    
        acc.max = (acc.max ? acc.max < acc.k[el] ? el : acc.max : el);    
        return acc;    
    }, { k:{} }).max;  
}

function detectRTLLang(text) {    
    const scores = {}        
    const regexes = {      
        'en': /[\\u0000-\\u007F]/gi,      
        'zh': /[\\u3000\\u3400-\\u4DBF\\u4E00-\\u9FFF]/gi,      
        'hi': /[\\u0900-\\u097F]/gi,      
        'ar': /[\\u0621-\\u064A\\u0660-\\u0669]/gi,      
        'bn': /[\\u0995-\\u09B9\\u09CE\\u09DC-\\u09DF\\u0985-\\u0994\\u09BE-\\u09CC\\u09D7\\u09BC]/gi,      
        'he': /[\\u0590-\\u05FF]/gi,    
    }    
    
    for (const [lang, regex] of Object.entries(regexes)) {      
        // detect occurances of lang in a word      
        let matches = (text.match(regex) || []);      
        let score = (matches.length / text.length);      
        
        if (score) {        
            // high percentage, return result        
            if (score > 0.85) {          
                return lang;        
            }        
            
            scores[lang] = score;      
        }    
    }    
    
    // not detected    
    if (Object.keys(scores).length === 0){      
        return null; 
    }   
    
    // pick lang with highest percentage    
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);  
} */

function reverseString(str) {
    //Use the split() method to return a new array
    let splitString = str.split("");
    //Use the reverse() method to reverse the new created array
    let reverseArray = splitString.reverse();
    //Use the join() method to join all elements of the array into a string
    let joinArray = reverseArray.join("");

    //Return the reversed string
    return joinArray;
}

function replaceSpecialChars(str){
    return str.replace(/[&\\/\\#,+()$~%.'":*?<>{}]/g, '_');
}
function checkIsInsideofBox(boxWidth,boxHeight,boxX,BoxY,MoveBoxWidth,MoveBoxHeight, MoveBoxX, MoveBoxY,smallboxRotation){
    var allow=true
    var Bx=boxX
    var By=BoxY
    var topBox= { x: (Bx-500), y: (By-500), drawWidth: (Bx+boxWidth+500+500), drawDepth: (By+500), rotation: 0 }
    var rightBox= { x: (Bx+boxWidth), y: By, drawWidth: Bx+500, drawDepth: (By+boxHeight), rotation: 0 }
    var bottomBox= { x: (Bx-500), y: (By+boxHeight), drawWidth: (Bx+boxWidth+500+500), drawDepth: (By+boxHeight+500), rotation: 0 }
    var leftBox= { x: (Bx-500), y: By, drawWidth: (Bx+500), drawDepth: (By+boxHeight), rotation: 0 }
    var array=[topBox,rightBox,bottomBox,leftBox]
    for (let i = 0; i < array.length; i++) {
        const prod = array[i];
        var x1 = prod.x + (prod.drawWidth / 2)
        var y1 = prod.y + (prod.drawDepth / 2)
        var xA = MoveBoxX + (MoveBoxWidth / 2)
        var yA = MoveBoxY+ (MoveBoxHeight / 2)

        var rectBdash = { x: xA, y: yA, w: (MoveBoxWidth), h: MoveBoxHeight, angle: smallboxRotation }
        var rectA = { x: x1, y: y1, w: prod.drawWidth, h: prod.drawDepth, angle: prod.rotation }
        var colliderect = isRectCollide(rectA, rectBdash);
        // console.log(colliderect);
        if(colliderect){
            allow=false
            break
        }
        
    }
    
    return allow
}

export function planigoDiableRoles(userobj){
    let usersystemrule = (userobj && userobj.userRolls?userobj.userRolls.systemMainRoleType:null);

    return (usersystemrule && (usersystemrule === usrRoles.SM || usersystemrule === usrRoles.DH || usersystemrule === usrRoles.WK || usersystemrule === usrRoles.NA)?true:false);
}

export function  restrictDecimalPoint(value,decimalLimit){
    let result = true;
    const regex = new RegExp(`^\\d*\\.?\\d{0,${decimalLimit}}$`);
    if (regex.test(value) || value === '') {
        result = false;
    }
    return result
}

export function countTextCharacter(text){
    let count = 0;
    if(text !== ""){
        count = String(text).length;
    }
    return count;
}



export const maxInputLength=255 //255 limit
export const maxInputLengthforNumber=15//255 limit
export const maxInputLengthforEmail = 320
export const maxInputLengthforphone = 255

export function  preventinputotherthannumbers(evt,mres,text, maxInputLength){
    let isPrevent = true ;
    let string = String(mres);
    if(evt && evt.key){
        if(evt.key === "*" || evt.key === "/" || evt.key === "+" || evt.key === "-" || evt.keyCode === 32){
            isPrevent = false
            evt.preventDefault()
        }
    }

    if(mres && evt && evt.key && evt.target){
       if((!((/[0-9.]/.test(evt.key)) ||(evt.ctrlKey && (evt.key === 'v' || evt.key === 'V')) || (evt.keyCode === 9 ||evt.keyCode===8 ||evt.keyCode===37||evt.keyCode===39))) ||(string.includes('.') && evt.key === '.')){
            isPrevent = false
            evt.preventDefault();
       }
    }

    if(string.length > (maxInputLength? maxInputLength: maxInputLengthforNumber) ){
        if(!(evt.keyCode === 8 ||evt.keyCode === 37||evt.keyCode === 39)){
            isPrevent = false
            evt.preventDefault();
            alertService.error(text);
        }
    }
    return isPrevent 
}
export function preventinputToString (evt,mres,text){
    let string = String(mres);
    let isPrevent = true;
    if(string.length > maxInputLength){
        if(!(evt.keyCode === 8 ||evt.keyCode === 37||evt.keyCode === 39 || evt.keyCode === 9 )){
            isPrevent = false;
            evt.preventDefault();
            alertService.error(text);
        }
    }
    return isPrevent
}


export function preventinputToEmail (evt,mres,text){
    if(evt === undefined){
        return
    }
    let string = String(mres);
    if(string.length > maxInputLengthforEmail){
        if(!(evt.keyCode === 8 ||evt.keyCode === 37||evt.keyCode === 39)){
            evt.preventDefault();
            alertService.error(text);
        }
    }
}

export function preventNumberInput(value,text){
    if( value && (parseInt(value) >= 2147483648)){
        alertService.error(text);
        return true;
    }
}

export function preventinputminusnumbersalowdot(evt,mres){
    if(mres){
        return (evt.key === 'e'||evt.key === '-'||(mres.length >= maxInputLengthforNumber&&!(evt.keyCode===8||evt.keyCode===37||evt.keyCode===46))) && evt.preventDefault()
    }else{
        return (evt.key === 'e'||evt.key === '-') && evt.preventDefault()
    }
   
}
export function preventinputophone(evt,mres,text){
    let string = String(mres);
    if(mres){
        if((!((/[0-9/)+(-]/.test(evt.key)) || (evt.keyCode===8 ||evt.keyCode===37||evt.keyCode===39))) ||(string.includes('+') && evt.key === '+')){
           evt.preventDefault();
        }
     }
     if(mres.length >= maxInputLengthforphone){
         if(!(evt.keyCode === 8 ||evt.keyCode === 37||evt.keyCode === 39)){
             evt.preventDefault();
             alertService.error(text);
         }
 
     }
}
export { pageLength, numberWithCommas, SummerystatusColors, reverseString, replaceSpecialChars, findBrowserType, SummeryStatusName, getPager, setCookie, getCookie, convertTimeHM, removeCookie, convertDateTime, convertDate, convertDatetoTimeHM24, convertTime, timetotimeHM, camelizeTxt, grantPermission, dateRangeList, usrRoles, usrLevels, rotateStatus, alertTimeout, basePath, cversion, objToQueryParam, btnPressedKeyCode, langList, uomList, AspectRatioDrawBox, CalculateRatio, persistRootName, CalculateM2P, measureConverter, convertUomtoSym, floorAspectRatioDrawBox, roundOffDecimal, makeUniqueID, isEquivalent, TaskFeedSearchType, monthsList, commonPageRoles, hexToRGB,aspectRatio, checkColorIsLight,stringtrim,FindMaxResult,floorAspectRatioDrawBoxbaseonwidth,checkIsInsideofBox
    ,kFormatter};
