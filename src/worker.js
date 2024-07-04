import { v4 as uuidv4 } from 'uuid';

export const generateExcel = (data, convertor) => {
  while(true)  {
    var primes = '';

    var wb = convertor.read(data, { type: 'binary' });
    var worksheet = wb.Sheets[wb.SheetNames[0]];
    primes = convertor.utils.sheet_to_html(worksheet);
    postMessage(primes);
  }
}

export function checkblockdivider(addedprodloc,spdobj,draggingProduct,shelfObj) {
  var settedbrkx =  (addedprodloc.x + (addedprodloc.width / 2));
  var settedwx = (addedprodloc.x);
  var settedwy = (addedprodloc.y + addedprodloc.height);
  var settedwx2 = (settedwx + addedprodloc.width);
  var settedwy2 = (settedwy + addedprodloc.width);

  var newblckavailable = false;
    for (var m = 0; m < spdobj.planogramShelfDto.length; m++) {
        const mshelveitem = spdobj.planogramShelfDto[m];
        if(!mshelveitem.isDelete && shelfObj.id == mshelveitem.id){
            for (var n = 0; n < mshelveitem.planogramProduct.length; n++) {
                const nproditem = mshelveitem.planogramProduct[n];
                if(!nproditem.isDelete && nproditem.productInfo.id !== draggingProduct.id){
                    //var nwblockobj = null;
                    for (var b = 0; b < nproditem.productBlock.length; b++) {
                        const bprodblock = nproditem.productBlock[b];
                        if(!bprodblock.isDelete){
                            
                            var isfoundleft = false; var isfoundright = false;
                            for (var v = 0; v < bprodblock.productLocations.length; v++) {
                                const vprodloc = bprodblock.productLocations[v];
                                if(!vprodloc.isDelete){
                                    var clx1 = vprodloc.x - (((bprodblock.drawWidth) / 4) * 3);
                                    var cly1 = ((vprodloc.y + bprodblock.drawHeight) - clx1);
                                    var clx2 = ((vprodloc.x + bprodblock.drawWidth) + (((bprodblock.drawWidth) / 4) * 3));
                                    var cly2 = ((vprodloc.y + bprodblock.drawHeight) + clx2);
                                    
                                    if((clx2 > settedwx) && (cly2 > settedwy)){
                                        isfoundleft = true;
                                    } else if((clx1 < settedwx2) && (cly1 < settedwy2)){
                                        isfoundright = true;
                                    }
                                }
                            }
                            //console.log(isfoundleft, isfoundright);
                            //if found left/right overlapping items with safty margin
                            if(isfoundleft && isfoundright){
                                newblckavailable = true;
                                var blckgroup1 = []; var blckgroup2 = [];
                                for (var f = 0; f < bprodblock.productLocations.length; f++) {
                                    const flocitem = bprodblock.productLocations[f];
                                    
                                    if(!flocitem.isDelete && flocitem.x > settedbrkx){ //if it's x greater than current location x push to group 2
                                        if(flocitem.id > 0){ //if saved item
                                            flocitem.isDelete = true;
                                            blckgroup1.push(flocitem);
                                        }
                                        var nlocobj = JSON.parse(JSON.stringify(flocitem));
                                        nlocobj.id = -1;
                                        nlocobj.isNew = true; nlocobj.isDelete = false;
                                        blckgroup2.push(nlocobj);
                                    } else {
                                        blckgroup1.push(flocitem);
                                    }
                                }
                                //console.log(blckgroup1,blckgroup2);
                                //set block details
                                bprodblock.productLocations = blckgroup1;
                                if(blckgroup2.length > 0){
                                    var newblkobj = {
                                        id: uuidv4(), f_uuid: uuidv4(), isDelete: false, isNew: true,
                                        x: bprodblock.x, y: bprodblock.y, uom: bprodblock.uom, width: bprodblock.width, height: bprodblock.height, drawWidth: bprodblock.drawWidth, drawHeight: bprodblock.drawHeight,
                                        productLocations: blckgroup2
                                    };
                                    nproditem.productBlock.push(newblkobj);
                                }
                            }

                        }
                    }
                }
            }
        }
    }
  return {spdobj, newblckavailable: newblckavailable};
}