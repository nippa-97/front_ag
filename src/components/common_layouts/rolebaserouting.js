import { Suspense } from 'react';
import { Route } from 'react-router-dom';
import { grantPermission } from '../../_services/common.service';
import UnauthorizedComponent from '../common_layouts/unauthorized';
import { AcViewModal } from '../UiComponents/AcImports';
/**
 * block routing by user roles
 * using UnauthorizedComponent to show not permitted roles
 *
 * @export
 * @param {*} {component: Component, roles, ...rest}
 * @return {*} 
 */
export default function RoleBasedRouting({component: Component, reqpage, ...rest}) {
    return (<>
        { grantPermission(reqpage) && (
            <Suspense fallback={<AcViewModal showmodal={true} />}><Route {...rest} /></Suspense>
        )}
        { !grantPermission(reqpage) && (
            <Route><UnauthorizedComponent /></Route>
        )}
      </>
    );
}