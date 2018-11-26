
var textSizeSpan = function(fontSize, text, callback) {
    var span = document.createElement("span");
    var result = {};
    span.style.fontSize = fontSize
    result.width = span.offsetWidth;
    result.height = span.offsetWidth; 
    span.style.visibility = "hidden";
    document.body.appendChild(span);
    if (typeof span.textContent != "undefined")
        span.textContent = text;
    else span.innerText = text;
    result.width = span.offsetWidth - result.width;
    result.height = span.offsetHeight - result.height;
    span.parentNode.removeChild(span);
    return callback(result);
}

var textSizeP = function(fontSize, text, callback) {
    var p = document.createElement("p");
    var result = {};
    result.width = p.offsetWidth;
    result.height = p.offsetWidth; 
    p.style.visibility = "hidden";
    document.body.appendChild(p);
    if (typeof p.textContent != "undefined")
        p.textContent = text;
    else p.innerText = text;
    result.width = p.offsetWidth - result.width;
    result.height = p.offsetHeight - result.height;
    p.parentNode.removeChild(p);
    return callback(result);
}
window.textSizeSpan = textSizeSpan
window.textSizeP = textSizeP