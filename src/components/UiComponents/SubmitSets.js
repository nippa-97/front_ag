import axios from 'axios';
import { alertService } from '../../_services/alert.service';
import {errorHandler} from '../../_services/submit.service';
import { getCookie, setCookie } from '../../_services/common.service';
import { store } from '../../store/store';

/**
 * this is the main backcalls handler, every backcall in application goes through here
 *
 * @param {*} callstat submitcollection object for single call
 * @param {*} cobj saving object 
 * @param {*} showalerts is needed to show alert when found errors
 * @param {*} newheaders extra call headers
 * @return {*} 
 */
async function submitSets (callstat,cobj,showalerts, newheaders, showbackerrors){
    const csubObj = callstat;

    //get signin object
    var storestat = store.getState();
    var cuobj = (storestat.signState&&storestat.signState.signinDetails?storestat.signState.signinDetails:null);

    //get useruuid
    // var useruuid = (getCookie("userUUid"))
    var useruuid = (getCookie("userUUid")?getCookie("userUUid"):-1);
    if(!getCookie("userUUid") && cuobj){
        useruuid = cuobj.userUUID;
        setCookie("userUUid",cuobj.userUUID);
    }
    //get storeid if available
    var cstoreid = (getCookie("storeId")?getCookie("storeId"):0);
    if(!getCookie("storeId") && cuobj){
        cstoreid = cuobj.storeId;
        setCookie("storeId",cuobj.storeId);
    }

    //set custom headers
    var checknewheaders = (newheaders?newheaders:{});
    const coheaders = (csubObj&&csubObj.auth&&cuobj&&cuobj.token?{...checknewheaders, Authorization: 'Bearer '+cuobj.token, store_id: cstoreid,user:useruuid, 'Cache-Control': 'no-cache', 'Pragma': 'no-cache'}:{'Cache-Control': 'no-cache', 'Pragma': 'no-cache'}); // 'Cache-Control': 'no-cache', 'Pragma': 'no-cache',

    if(csubObj !== undefined && Object.keys(csubObj).length > 0){
        try {
            //axios.defaults.withCredentials = true;
            var res = await axios({method: csubObj.ptype,url: csubObj.url+(csubObj.queryparam&&cobj?cobj:""), data: (csubObj.ptype!=="GET"?cobj:""), headers:coheaders}); //withCredentials: true,
            if(res.status === 200){
                //alertService.success("Data loaded", { autoClose, keepAfterRouteChange });
                // return (res.data!==undefined?res.data:false);

                if(res.data!==undefined){
                    if(res.data.status){
                        return res.data;
                    }else{
                        if(showbackerrors){
                            errorHandler(res.data, null, true);
                        }
                        return res.data;
                    }
                } else{
                    return false;
                }
            }
        } catch (error) {
            errorHandler(error,showalerts, false);
            return false;
        }
    } else{
        if(showalerts){
            alertService.error("Cannot find requested call");
        }
        return false;
    }

}

async function nsyncSubmitSets (callstat,cobj,showalerts){
    const csubObj = callstat;

    //get signin object
    var storestat = store.getState();
    var cuobj = (storestat.signState&&storestat.signState.signinDetails?storestat.signState.signinDetails:null);

    var cstoreid = (getCookie("storeId")?getCookie("storeId"):0);
    if(!getCookie("storeId") && cuobj){
        cstoreid = cuobj.storeId;
        setCookie("storeId",cuobj.storeId);
    }

    const coheaders = (csubObj.auth&&cuobj&&cuobj.token?{Authorization: 'Bearer '+cuobj.token, store_id: cstoreid}:{});

    if(csubObj !== undefined && Object.keys(csubObj).length > 0){
        try {
            //axios.defaults.withCredentials = true;
            var res = await axios({method: csubObj.ptype,url: csubObj.url+(csubObj.queryparam&&cobj?cobj:""), data: (csubObj.ptype==="POST"?cobj:""), headers:coheaders}); //withCredentials: true,
            if(res.status === 200){
                return (res.data!==undefined?res.data:false);
            }
        } catch (error) {
            errorHandler(error,showalerts);
            return (false);
        }
    } else{
        if(showalerts){
            alertService.error("Cannot find requested call");
        }
        return (false);
    }
}

export { submitSets, nsyncSubmitSets };
