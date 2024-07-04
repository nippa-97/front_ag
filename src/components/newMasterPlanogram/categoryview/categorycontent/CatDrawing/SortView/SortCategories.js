import React, { useState, useCallback, useEffect } from "react";
import { Col } from 'react-bootstrap';
import { SortableContainer, SortableElement } from "react-sortable-hoc";

import CategoryField from './draggableRow';
import arrayMove from "./arrayMove";

const SortableCont = SortableContainer(({ children }) => {
    return <ul className="list-inline single-cat">{children}</ul>;
});
  
const SortableItem = SortableElement(props => <CategoryField {...props} />);

const CategorySortView = (props) => {
  const [items, setItems] = useState([]);
  
  useEffect(() => {
    if(props.rectsets){ //gets current field details
      setItems(JSON.parse(JSON.stringify(props.rectsets?props.rectsets:[])));
    }
  }, [props.rectsets, props.isMounted]);
  //#MP-CAT-07
  const onSortEnd = useCallback(({ oldIndex, newIndex }) => {
    //only if indexes are not matching
    if(oldIndex !== newIndex){
      var oldItems = arrayMove(items, oldIndex, newIndex);
      
      setItems(oldItems);
      props.updateFromChild(oldItems);
    }
  }, [items, props]);

  return (<Col>
      <SortableCont onSortEnd={onSortEnd} axis="x" lockAxis="x" lockToContainerEdges={true} lockOffset={["30%", "50%"]} helperClass="helperContainerClass" useDragHandle={true} >
          {items.map((value, index) => {
              return <React.Fragment key={index}>{!value.isDelete && (value.is_unallocated_view || value.field_obj)?<>
                <SortableItem key={`item-${index}`} index={index} isRTL={props.isRTL} t={props.t} 
                  defSaveObj={props.defSaveObj} 
                  rectsets={props.rectsets} 
                  resizeChange={props.resizeChange} 
                  isAUIDisabled={props.isAUIDisabled}
                  isDrawEnabled={props.isDrawEnabled} 
                  perContentWidth={props.perContentWidth}
                  selectedDrawCategory={props.selectedDrawCategory} 
                  updateDrawSelectShelves={props.updateDrawSelectShelves} 
                  obj={value} rownumber={index} 
                  checkResizeStart={props.checkResizeStart} 
                  changeCatProps={props.changeCatProps} 
                  redirectToCategory={props.redirectToCategory} 
                  />
              </>:<></>}</React.Fragment>
          })}
      </SortableCont>

  </Col>);
};

export default CategorySortView;
