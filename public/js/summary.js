

var header = tools.$('.header')[0];
var weiyunContent = tools.$('.weiyun-content')[0];
var headerH = header.offsetHeight;

var uid = $.cookie("uid")

$(document).ready(function () {
    // debugger
    function changeHeight() {
        // var viewH = document.documentElement.clientHeight;
        var viewH = window.innerHeight || $(window).height();
        weiyunContent.style.height = viewH - headerH + 'px';
        $('#searchResult').css('height', viewH - headerH - 100 + 'px')
        // content ? content.style.height = viewH - headerH - 62 + 'px' : '';
        // fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : ''
    }

    // 初始化
    changeHeight();
    // 窗口改变时，重新计算可视区高度
    window.onresize = changeHeight;

    // local_api._list('document', { type: '0|1', u_path: '^' + $.cookie('tree_path') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
    //     console.log(res)
    // })

    $('.logout').on('mousedown', function (ev) {
        ev.stopPropagation()
        // console.log(1)
        location.href = '/logout'
    })

    // tools.addEvent(tools.$('#search')[0], 'focus', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     tools.addClass(searchBar, 'focus')
    // })
    // tools.addEvent(tools.$('#search')[0], 'blur', function () {
    //     var searchBar = tools.$('#_search_bar')[0];
    //     setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)

    // })

    $('#search').on('keypress', function (e) {
        if (e.keyCode == 13) {
            e.target.value.trim() != '' ? location.href = '/hightSearch?query=' + e.target.value.trim() : null
        }
    })

    var widthRightText = [];
    var maxWidthText;
    var leftVeticalTextHights;
    var heightBoxs;
    // var widthBox;
    var leftTexts;
    var rightText;
    // var flag;

    function getChildren(data, id) {
        var arr = [];
        for (var i = 0; i < data.length; i++) {
            if (data[i].pid == id) {
                data[i].children = getChildren(data, data[i].id);
                arr.push(data[i])
            }
        }
        return arr
    }


    function setCss(data, id) {
        var allwidth
        if (data.length * 252 > $('.main').width()) {
            allwidth = parseInt($('.main').width() / 252) * 252;
        } else {
            allwidth = data.length * 252;
        }
        var option = {
            'columnWidth': 'unset',
            'position': 'absolute',
            'left': '50%',
            'marginLeft': -(allwidth / 2)
        }
        $('#' + id).css(option);
        $(`#${id} li.mui-ul-li`).css("float", 'left')
    }

    function getfirstDoc() {
        local_api._list('document', { type: '0', u_path: '^' + $.cookie('tree_path') }, '', 'createdAt|pid|name', 1, -1, $.cookie('appkey'), function (res) {

            console.log(res, "first");
            var dataId = res.data.filter(function (ele) { return ele.id == $.cookie('docId') })
            var data = getChildren(res.data, dataId[0].id);
            console.log(data, "second")
            $('.main').empty()
            var width = (window.innerWidth - 170) / data.length
            if (width < 222) {
                width = "222px"
            } else {
                width += "px"
            }
            for (var i = 0; i < data.length; i++) {
                var firstD = `<div class="mui-box-${i + 1}" style="width:${width};float:left;border-right: 1px solid #0070C0;">
                                <div class="mui-title-box">
                                    <span id="title-${i + 1}" class="mui-title">${data[i].name}</span>
                                </div>
                                <div style="position: relative;">
                                    <ul id="ul-box-${i + 1}" class="">
                                    
                                    </ul>
                                </div>
                            </div>`
                $('.main').append(firstD)
            }
            if (data.length == 0) {
                var firstD = `<div class="mui-box-${1}">
                                <div class="mui-title-box" style="height:50px">
                                 </div>
                                <div style="position: relative;">
                                    <ul id="ul-box-${1}" class="mui-box-safety-supervision-ul" style="max-width:712px">
                                    
                                    </ul>
                                </div>
                            </div>`

                $('.main').append(firstD)
            }
            getAllPosition(data.length)
        })
    }


    function getAllPosition(length) {
        // getfirstDoc() 
        local_api._list('document', { type: '0|1', u_path: '^' + $.cookie('tree_path') }, '', 'createdAt|pid|name', 1, -1, $.cookie('appkey'), function (res) {
            console.log(res, "hellodata");
            var dataId = res.data.filter(function (ele) { return ele.id == $.cookie('docId') })
            var data = getChildren(res.data, dataId[0].id);

            console.log(data, res.data[0].id)
            console.log(res.data[0])
            var clA = []
            if (length >= 2) {

                for (var i = 0; i < data.length; i++) {
                    clA.push(data[i].children.length)
                }
                var maxH = (Math.max(...clA) * 52 + 50 + 47) + 'px'

                for (var i = 0; i < data.length; i++) {
                    $('.mui-box-' + (i + 1)).css("height", maxH)
                    var ulEl = $("#ul-box-" + (i + 1));
                    ulEl.empty()
                    // ulEl.parent().css("width",$('.mui-box-'+(i+1)).css("width"))
                    ulEl.css("padding-top", "50px")
                    customText2(data[i].children, ulEl)
                }

            } else {
                $('#ul-box-1').empty();
                $('.mui-box-1').css('width', '100%')
                var ulEl = $('#ul-box-1')

                customText(data, ulEl)
                // setCss(data, 'ul-box-1')
            }
            $('.main').show();
            $('.mui-box-2').css('height', $('.mui-box-1').height() + 'px')
            console.log(data)
        })
    }



    getfirstDoc()

    function customText2(data, ulEl) {

        for (var i = 0; i < data.length; i++) {
            // console.log(data)
            // var li =
            //     `<li style="text-align:center">
            //     <span class="listSpan" title="${data[i].name}" data-file_id="${data[i].id}">${data[i].name}</span>  
            // </li>`

            var li = '<li style="text-align:center"><span class="listSpan" title="' + data[i].name + '"data-file_id="' + data[i].id + '">' + data[i].name + "</span></li>"
            ulEl.append(li)

        }


    }


    function customText(data, ulEl) {
        for (var i = 0; i < data.length; i++) {
            var _index = i;
            dataJsonText(data[i], _index, ulEl)
        }
    }

    function dataJsonText(djd, _index, ulEl) {
        leftTexts = djd.name;
        textSizeSpan('16px', djd.name, function (size) {
            leftVeticalTextHights = djd.name.length * size.height + 40;
            heightBoxs = djd.children.length * 35;
            liBoxs(leftTexts, heightBoxs, djd, leftVeticalTextHights, _index, ulEl);
        });
    }

    function liBoxs(leftText, heightBox, djd, leftVeticalTextHight, _index, ulEl) {
        //列表
        // console.log(ulEl.attr('id'),'ulEl');
        console.log(djd.id, 'did')
        var ulElId = ulEl.attr('id');
        var li = document.createElement('li');
        li.className = "mui-ul-li";
        li.id = ulElId + _index;

        var rightBoxUlHeight = 'width:162px;';
        var leftVeticalBox = 'height:' + leftVeticalTextHight + 'px;';
        if (heightBox > leftVeticalTextHight) {
            // leftVeticalBox.style.top = (heightBox - leftVeticalTextHight) / 2 + 'px';
            leftVeticalBox += 'top:' + (heightBox - leftVeticalTextHight) / 2 + 'px;';
        } else {
            rightBoxUlHeight += 'margin-top:' + (leftVeticalTextHight - heightBox) / 2 + 'px';
        }
        var leftVeticalBoxText = 'height:' + leftVeticalTextHight + 'px'

        // var Li =
        //     '<div id=' + leftVeticalBox + ' class="mui-left-vetical-box">' +
        //     '<div id=' + leftVeticalBoxText + ' class="mui-left-vetical-box-text"><span>' + leftText + '</span></div>' +
        //     '<div class="mui-left-vetical-right-box-line"></div>' +
        //     '</div>' +
        //     '<ul id=' + rigthBoxUl + ' class="mui-right-box-ul">' + (childrenHtml(djd.id)) +
        //     '</ul>';

        var Li = `
            <div class="mui-left-vetical-box" style="${leftVeticalBox}"  data-file_id="${djd.id}">
                <div class="mui-left-vetical-box-text" style="${leftVeticalBoxText}" data-file_id="${djd.id}">
                    <span data-file_id="${djd.id}">${leftText}</span>
                </div>
                ${djd.children.length ? '<div class="mui-left-vetical-right-box-line"></div>' : ''}
            </div>
            <ul class="mui-right-box-ul" style="${rightBoxUlHeight}">${(childrenHtml(djd.id))}</ul>
        `
        for (var j = 0; j < djd.children.length; j++) {
            rightText = djd.children[j].name
            textSizeSpan('15px', rightText, function (size) {
                widthRightText[j] = size.width;
            });
        }
        maxWidthText = Math.max(...widthRightText);
        if (maxWidthText > 112) {
            maxWidthText = 112;
        }
        console.log(maxWidthText)
        if (heightBox > leftVeticalTextHight) {
            li.style.height = heightBox + 'px';
        } else {
            li.style.height = leftVeticalTextHight + 'px';
        }
        li.innerHTML = Li;

        $(ulEl).append(li)

        //横向的文字排版
        var textSpanLength;

        function childrenHtml(id) {
            var strHtml = '';
            if (djd.children.length == 1) {
                rightText = djd.children[0].name
                textSizeSpan('15px', rightText, function (size) {
                    textSpanLength = size.width; //横向文字的宽度
                });
                var Li2;
                var textString = '';
                if (textSpanLength > 112) {
                    textString = 'display: inline-block;width: 112px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;'
                }
                Li2 = '<li class="mui-right-box-ul-li" data-file_id=' + djd.children[0].id + '><div class="mui-right-box-line">' +
                    '<div  class="mui-right-box-left-top-line" style="border-left:none"></div>' +
                    '<div  class="mui-right-box-left-down-line"  style="border-left:none"></div>' +
                    '</div>' +
                    '<div class="mui-right-box-right-text"><div class="mui-right-span-box" data-file_id=' + djd.children[0].id + '><span style="' + textString + '" title=' + rightText + ' data-file_id=' + djd.children[0].id + '>' + rightText + '</span></div></div></li>';
                strHtml += Li2;
            } else {
                for (var j = 0; j < djd.children.length; j++) {
                    rightText = djd.children[j].name
                    textSizeSpan('15px', rightText, function (size) {
                        textSpanLength = size.width; //横向文字的宽度
                    });
                    var Li2;
                    var textString = '';
                    if (textSpanLength > 112) {
                        textString = 'display: inline-block;width: 112px;text-overflow: ellipsis;white-space: nowrap;overflow: hidden;'
                    }
                    if (j == 0) { //去除开始时的左边线
                        Li2 = '<li class="mui-right-box-ul-li" data-file_id=' + djd.children[j].id + '><div class="mui-right-box-line">' +
                            '<div  class="mui-right-box-left-top-line" style="border-left:none"></div>' +
                            '<div  class="mui-right-box-left-down-line"></div>' +
                            '</div>' +
                            '<div class="mui-right-box-right-text"><div class="mui-right-span-box" data-file_id=' + djd.children[j].id + '><span style="' + textString + '" title=' + rightText + ' data-file_id=' + djd.children[j].id + '>' + rightText + '</span></div></div></li>';
                    } else if (j == djd.children.length - 1) { //去除最后一条数据的左边线
                        Li2 = '<li class="mui-right-box-ul-li" data-file_id=' + djd.children[j].id + '><div class="mui-right-box-line">' +
                            '<div  class="mui-right-box-left-top-line" ></div>' +
                            '<div  class="mui-right-box-left-down-line"  style="border-left:none"></div>' +
                            '</div>' +
                            '<div class="mui-right-box-right-text"><div class="mui-right-span-box" data-file_id=' + djd.children[j].id + '><span style="' + textString + '" title=' + rightText + ' data-file_id=' + djd.children[j].id + '>' + rightText + '</span></div></div></li>';
                    } else {
                        Li2 = '<li class="mui-right-box-ul-li" data-file_id=' + djd.children[j].id + '><div class="mui-right-box-line">' +
                            '<div  class="mui-right-box-left-top-line" ></div>' +
                            '<div  class="mui-right-box-left-down-line"></div>' +
                            '</div>' +
                            '<div class="mui-right-box-right-text"><div class="mui-right-span-box" data-file_id=' + djd.children[j].id + '><span style="' + textString + '" title=' + rightText + ' data-file_id=' + djd.children[j].id + '>' + rightText + '</span></div></div></li>';
                    }
                    strHtml += Li2;
                }
            }

            return strHtml;
        }
    }


    $('.main').click(function (e) {
        // console.log(e.target)
        console.log(e.target.dataset.file_id);
        var fileId = e.target.dataset.file_id;
        if (fileId) {
            location.href = '/file?fileId=' + fileId
        }
    })

    tools.addEvent(tools.$('#search')[0], 'focus', function () {
        var searchBar = tools.$('#_search_bar')[0];
        tools.addClass(searchBar, 'focus')
    })
    tools.addEvent(tools.$('#search')[0], 'blur', function () {
        var searchBar = tools.$('#_search_bar')[0];
        // setTimeout(() => { tools.removeClass(searchBar, 'focus') }, 200)
        setTimeout(function () { tools.removeClass(searchBar, 'focus') }, 200)

    })
})