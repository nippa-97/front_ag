import React, {useState} from 'react'; //, { useEffect, }

// import { submitCollection } from '../../_services/submit.service';
// import { nsyncSubmitSets } from '../UiComponents/SubmitSets';
// import {persistService} from '../../_services/persist.service';
import { useTranslation } from 'react-i18next';

//products data loading function, using pdata(persist object) data to check isalready loaded
/* function getProdInformation(pdata) {
    const sobj = {isReqPagination:false, withImageUrl: true};
    var getcurrentdata = (pdata&&pdata["prodlist"]?pdata["prodlist"]:false);

    return new Promise((resolve) => {
        if(getcurrentdata){
            resolve(getcurrentdata);
        } else{
            nsyncSubmitSets(submitCollection.searchProds,sobj,false).then((results) => {
                if(results&&results.extra){
                    persistService.persist(results.extra,false,"prodlist");
                    resolve(results.extra);
                } else{
                    resolve([]);
                }
            });
        }
    });
} */

/* function getAiProdInformation(pdata) {
    const sobj = {isReqPagination:false, withImageUrl: true};
    //var getcurrentdata = (pdata&&pdata["aiprodlist"]?pdata["aiprodlist"]:false);
    var getcurrentdata = false;

    return new Promise((resolve) => {
        if(getcurrentdata){
            resolve(getcurrentdata);
        } else{
            nsyncSubmitSets(submitCollection.getAllAvailableProducts,sobj,false).then((results) => {
                if(results&&results.extra){
                    persistService.persist(results.extra,false,"aiprodlist");
                    resolve(results.extra);
                } else{
                    resolve([]);
                }
            });
        }
    });
} */

/**
 * using to load data after user logged in
 * this is using because some data takes lots of time to load (ex- all products)
 * using props signin details to check user logged on otherwise no need to load data in signin or landing pages
 *
 * @export
 * @param {*} props
 * @return {*} 
 */
export default function LazyLoading(props) {
    const { t } = useTranslation();
    const [islazyloading, setLazyLoading] = useState(false);
    const [isprodrequested, setProdRequested] = useState(false);
    // const persistdata = persistService.loadPersist();

    if(props.signedobj && props.signedobj.signinDetails && !isprodrequested){
        setProdRequested(!isprodrequested); setLazyLoading(true);
        if(props.signedobj.signinDetails.isAiUser){
            /* getAiProdInformation(persistdata).then(data => {
                //console.log(data);
                props.setAiProdList(data);
                setLazyLoading(false);
            }); */
            setLazyLoading(false);
        } else{
            /* getProdInformation(persistdata).then(data => {
                props.setProdList(data);
                setLazyLoading(false);
            }); */
            setLazyLoading(false);
        }
        
    }
    //shows message if it takes longtime. in slow connections
    return(<>{islazyloading?
        <div className="netdown-main"><div className={"alert alert-dark netdown-warning show-warning"}>
            {t('DATA_LOADING_PLEASE_WAIT')}
        </div></div>
        :<></>}
    </>)
  }
