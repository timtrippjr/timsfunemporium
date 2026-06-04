// makes things cleaner.
function newElem(elemName, parent){
    const elem = document.createElement(elemName);
    parent.appendChild(elem);
    return elem;
}