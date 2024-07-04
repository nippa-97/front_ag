
import i18n from "../../_translations/i18n";

// var emailregex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
// var passregex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
// var dateregex = /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/;
// var numregex = /^(?!-0?(\.0+)?$)-?(0|[1-9]\d*)?(\.\d+)?(?<=\d)$/;
// var telregex = /^[0].*(?:(11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|912)(0|1|2|3|4|5|6|7|8|9)|7(0|1|2|5|6|7|8)\d)\d{6}$/;

//var isSafari = navigator.vendor && navigator.vendor.indexOf('Apple') > -1 && navigator.userAgent && navigator.userAgent.indexOf('CriOS') == -1 && navigator.userAgent.indexOf('FxiOS') == -1;

export function emailvalidator(emailString) {
    // const regex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
    const regex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;

    if(!emailString || regex.test(emailString) === false){
        return false;
    }
    return true;
} 

function numbervalidator(gth) {
    return !isNaN(parseFloat(gth)) && isFinite(gth);
}

export function validateSets (vname,valarr,ctxt){
    //var cdate = new Date(ctxt);
    valarr = (valarr?valarr:"");
    if(valarr !== undefined){
        //var fdate = (valarr.includes("DATE")?(cdate.getFullYear()+"-"+('0'+(cdate.getMonth()+1)).slice(-2)+"-"+('0'+(cdate.getDate())).slice(-2)):valarr.includes("TIME")?(('0'+cdate.getHours()).slice(-2) + ":" + ('0'+cdate.getMinutes()).slice(-2) + ":" + ('0'+cdate.getSeconds()).slice(-2)):"");
        
        if(valarr.includes("EMPTY") && (ctxt === null || ctxt === "" || ctxt === "-1")){
            return {validatestate:"val-warning",validatemsg: i18n.t("REQUIRED_TO_FILL")+" "+(vname?i18n.t(vname):""),cval:ctxt}//vname.toLowerCase()
        } else if(valarr.includes("EMAIL") && !emailvalidator(String(ctxt).toLowerCase())){
            return {validatestate:"val-danger",validatemsg: i18n.t("entervalidemail"),cval:ctxt}
        } else if(valarr.includes("NUMBER") && !numbervalidator(ctxt)){ 
            return {validatestate:"val-danger",validatemsg: i18n.t("REQUIRED_NUMBERS_ONLY"),cval:ctxt}
        } else{
            return {validatestate:null,validatemsg: "",cval:ctxt}
        }

        /* else if(valarr.includes("PASS") && !passregex.test(ctxt)){ 
            return {validatestate:"val-danger",validatemsg: "Required at least 6 characters, 1 number, 1 upper & 1 lowercase",cval:ctxt}
        } else if(valarr.includes("DATE") && !dateregex.test(fdate)){ 
            return {validatestate:"val-danger",validatemsg: "Required date format yyyy-mm-dd",cval:ctxt}
        } else if(valarr.includes("TELEPHONE") && !telregex.test(ctxt)){ 
            return {validatestate:"val-danger",validatemsg: "Required valid tel.number",cval:ctxt}
        } */
    }

    return {validatestate:null,validatemsg: "",cval:ctxt};
}
