
export function ghostOnDrag (evt,obj,orixy) {
    //evt.preventDefault();

    if(orixy && orixy.isfirefox){
        evt.clientX = orixy.x;
        evt.clientY = orixy.y;
    }
    // const parentElement = document.querySelector('.draggable-ghost-wrapper');
    const nodes  = document.querySelectorAll('.draggable-ghost-wrapper');
    //get last element
    const parentElement = nodes[nodes.length- 1];
    if(parentElement){
        parentElement.style.position = "fixed";
        parentElement.style.left = (evt.clientX  + 1) + "px";
        parentElement.style.top = (evt.clientY + 4) + "px";
        parentElement.style.opacity = 0.8;
        parentElement.style.width = obj.drawWidth + "px" ;
        parentElement.style.height = obj.drawHeight + "px";
        parentElement.style.border = "1px solid green !important";
        //console.log(parentElement);

        setTimeout(() => {
            parentElement.style.display = "block";
        }, 50);
    }
}

export function removeGhostImage () {
    // const parentElement = document.querySelector('.draggable-ghost-wrapper');
    const nodes  = document.querySelectorAll('.draggable-ghost-wrapper');
    //get last element
    const parentElement = nodes[nodes.length- 1];
    if(parentElement){
        parentElement.style.opacity = 0;
        setTimeout(() => {
            parentElement.style.display = "none";
        }, 100);
    }
}