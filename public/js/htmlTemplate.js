

// 单个文件的html结构
function fileConstruct(fileData) {
    var fileTypeClass = 'folder', fileClass, isImg = false;
    var fileType = ['jpg', 'jpeg', 'gif', 'png', 'bmp'];
    var _path = '';
    var autoId = fileData.autoId;
    if (fileData.type == 3) {
        fileTypeClass = fileData.filetype;
        // var _ftype = fileData.name.slice(fileData.name.lastIndexOf('.'),fileData.name.length)
        if(/\.(?:xls|xlsx)$/.test(fileData.name)){
            fileTypeClass = 'xls'
        }
        if(/\.(?:doc|docx)$/.test(fileData.name)){
            fileTypeClass = 'doc'
        }
        isImg = fileType.indexOf(fileData.filetype) > -1 ? true : false
        _path = '/upload/' + doc_path(fileData.tree_path) + fileData.name;
    }
    if (fileData.type == 2) {
        fileTypeClass += ' ffile'
    }
    if (fileData.type == 4) {
        fileTypeClass += ' zfile'
    }
    var size = fileSize(fileData.size)
    var name  = ''
    if (tree_path.indexOf(',3,1,2,185') > -1) { //企业档案隐藏档案号
        var names = fileData.name.split('-');
        name = names[names.length - 1];
    }else {
        name =  fileData.name
    }

    var lockClass = fileData.islock == 2 ? 'icon-lock' : 'icon-unlock'
    // var fileTypeClass
    var str = `
               <div class="item" data-file-id="${fileData.id}" data-type=${fileData.type} data-tree_path=${fileData.tree_path} data-u_path=${fileData.u_path}  data-filepath="${!isImg ? _path || '' : ''}">
                    <lable class="checkbox"></lable>
                    <div class="file-img">
                        ${
        isImg ?

            `<a data-magnify="gallery" data-caption="" href="${_path}">
                                    <img width="200"  src="${_path}" alt="">
                                </a>`
            :
            `<i data-filepath="${_path || ''}" data-file-id="${fileData.id}" class='${fileTypeClass}'></i>`
        }
                                        
                    </div>
                    ${autoId?`<div style="float: left;padding: 5px;"><span style="padding-top: 17px;display: block;">${autoId}</span></div>`:''}
                    <div class="file-title-box">
                    ${
        isImg ?
            ` <span data-magnify="gallery" data-caption="" href="${_path}" class="file-title" title="${fileData.name}">${fileData.name}</span>`
            :
            `<span class="file-title" data-filepath="${!isImg ? _path || '' : ''}" data-file-id="${fileData.id}" title="${fileData.name}">${name}</span>`
        }
                       
        </div>
        <ul class="ff_detail">
            <li>${size || '-'}${fileData.type == 3 ? `<i class=${lockClass}></i>` : ''}</li>
            <li>
                ${fileData.type != 2 ?
            new Date(fileData.createdAt).format('yyyy-MM-dd hh:mm:ss') || new Date().format('yyyy-MM-dd hh:mm:ss')
            :
            `   ${roleArr.indexOf('设置属性') > -1 ? `<button type="button" class="btn btn-primary docProo" id="${'docPro_' + fileData.id}">属性</button>` : ''}
                ${roleArr.indexOf('调用密集柜') > -1 ? `<button type="button" class="btn btn-primary openProo" id="${'openProo_' + fileData.id}">打开密集柜</button>` : ''}
               
                
            `}
                                
                        </li>
                    </ul>
               </div>
               `;
    return str;
}


// ${fileData.did ?
//     ` <a data-magnify="gallery" data-caption="" href="${`http://h5.bibibaba.cn/pay/wicare/wxpayv3/qrcode.php?data=${fileData.did}`}">
//         <img width="30"  src="${`http://h5.bibibaba.cn/pay/wicare/wxpayv3/qrcode.php?data=${fileData.did}`}" alt="">
//     </a>`
//     :
//     ''}

// 检索单个文件的html结构
function fileConstructs(fileData) {
    var fileTypeClass = 'folder', fileClass, isImg = false;
    var fileType = ['jpg', 'jpeg', 'gif', 'png', 'bmp'];
    var autoId = fileData.autoId
    if (fileData.type == 3) {
        fileTypeClass = fileData.filetype;
        isImg = fileType.indexOf(fileData.filetype) > -1 ? true : false
        if(/\.(?:xls|xlsx)$/.test(fileData.name)){
            fileTypeClass = 'xls'
        }
        if(/\.(?:doc|docx)$/.test(fileData.name)){
            fileTypeClass = 'doc'
        }

        // _path = '/upload/' + doc_path(fileData.tree_path) + fileData.name;
    }
    if (fileData.type == 2) {
        fileTypeClass += ' ffile'
    }
    var size = fileSize(fileData.size)
    // var fileTypeClass
    var str = `
        <div class="item" data-file-id="${fileData.id}" data-file-pid="${fileData.pid}" data-type=${fileData.type} data-tree_path=${fileData.tree_path} data-u_path=${fileData.u_path}  data-filepath="${!isImg ? fileData.path || '' : ''}">
                <div class="file-img">
                    ${
        isImg ?
            `<a data-magnify="gallery" data-caption="" href="${fileData.path}">
                                                    <img width="200"  src="${fileData.path}" alt="">
                                                </a>`
            :
            `<i data-filepath="${fileData.path || ''}" class='${fileTypeClass}'></i>`

        }
                    
                </div>
                ${autoId?`<div style="float: left;padding: 5px;"><span style="padding-top: 17px;display: block;">${autoId}</span></div>`:''}
                <div class="file-title-box">
                        ${
        isImg ?
            ` <span data-magnify="gallery" data-caption="" href="${fileData.path}" class="file-title" title="${fileData.name}">${fileData.name}</span>`
            :
            `<span class="file-title" data-filepath="${!isImg ? fileData.path || '' : ''}" title="${fileData.name}">${fileData.name}</span>`
        }
                
                </div>
                
                <ul class="ff_detail">
                    <li>${fileData._postion || '-'}</li>
                    <li>${new Date(fileData.createdAt).format('yyyy-MM-dd hh:mm:ss') || new Date().format('yyyy-MM-dd hh:mm:ss')}
                        ${roleArr.indexOf('调用密集柜') > -1 ? `<button class="btn btn-primary" style="font-size: 12px;margin-left: 5px;padding: 5px;" data-docPrpId=${fileData.id}>打开密集柜</button>` : ''}
                    </li>
                </ul>
                <div class="file-title-addr ellipsis" title="${fileData.tree_addr.str1 || ''}">
                    ${fileData.tree_addr.str || ''}
                </div>
        </div>
        `;
    //    <span class="file-edtor">
    //                 <input type="text" value="${fileData.name}" class="edtor">
    //             </span>
    return str;
}

// 文件展示区html结构模板
function getFileHtml(fileData) {
    // var dataType = fileData.type
    var fileHtml = `
                    <div class="file-item">
                        ${fileConstruct(fileData)}
                    </div>
                    `;
    return fileHtml;
}

// 文件展示区html结构模板
function getFileHtmls(fileData) {
    // var dataType = fileData.type
    var fileHtml = `
                    <div class="file-item">
                        ${fileConstructs(fileData)}
                    </div>
                    `;
    return fileHtml;
}

// 创建文件展示区文件的元素对象，而不是字符串
function createFileElement(fileData) {
    var newDiv = document.createElement('div');
    newDiv.className = 'file-item';
    newDiv.innerHTML = fileConstruct(fileData);
    return newDiv;
}


// 创建文件展示区的html结构
function createFilesHtml(fileData, renderId) {
    // 获取所有子数据
    var childData = dataControl.getChildById(fileData, renderId);
    var fileHtml = '';
    // 渲染每个子数据的html结构
    childData.forEach(function (item) {
        fileHtml += getFileHtml(item);
    });
    return fileHtml;
}

function createFilesHtmls(fileData) {
    var childData = fileData;
    var fileHtml = '';
    // 渲染每个子数据的html结构
    childData.forEach(function (item) {
        fileHtml += getFileHtmls(item);
    });
    return fileHtml;
}

// 创建树形导航区的html结构
var isshowlevel = 0;
function createTreeHtml(fileData, treeId, _level) {
    var _level = _level || 0 || 1
    // console.log(dataControl.getLeveById(fileData, treeId),'ddd')
    var fileLevel = dataControl.getLeveById(fileData, treeId);
    // if()
    var children = dataControl.getChildById(fileData, treeId);
    if (fileLevel > _level) {
        var html = '<ul style="display:none">';
    } else {
        var html = '<ul style="display:block">';
    }
    // var html = '<ul style="display:block">';
    children.forEach(function (item) {
        // 获取当前数据的层级 每深入一层，padding-left加14px
        var level = dataControl.getLeveById(fileData, item.id);
        // console.log(level,'level')
        // 判断当前数据是否有子数据，如果没有显示没有文件的样式
        var hasChild = dataControl.hasChrildren(fileData, item.id);
        // 如果没有子数据, 添加没有小图标的样式；有子数据，添加箭头朝下的样式
        var className = hasChild ? 'tree-contro' : 'tree-contro-none';

        if (item.type == 1 || item.type == 2) {
            html += `
                <li>
                    <div class="tree-title ${className}" data-file-id="${item.id}"  data-tree_path="${item.tree_path}" data-u_path=${item.u_path} style="padding-left:${level * 14}px;">
                        <span>
                            <strong class="ellipsis ${item.type == 2 ? 'ffile' : ''}" title="${item.name}">${item.name}</strong>
                            <i class="ico act"></i>
                        </span>
                    </div>
                    ${createTreeHtml(fileData, item.id)}
                </li>
                `;
        }
        // var fileTypeClass = item.type == 'folder' ? 'folder' : item.fileType;
        // 根据子数据的个数循环生成多个li，每个li再递归调用createTreeHtml()

    })
    html += '</ul>';
    // console.log(html)
    return html;
}

// 创建树形导航的li元素对象
function createTreeElement(options) {
    var newLi = document.createElement('li');
    newLi.innerHTML = `
                    <div class="tree-title tree-contro-none" data-file-id="${options.id}" style="padding-left:${options.level * 14}px;">
                        <span>
                            <strong class="ellipsis" title="${options.name}">${options.name}</strong>
                            <i class="ico"></i>
                        </span>
                    </div>
                    <ul></ul>
                        `;
    return newLi;
}


// 创建文件路径导航区html结构
function createPathNavHtml(fileData, fileId) {
    // 通过id获取所有父级，并反向排列
    var parents = dataControl.getParents(fileData, fileId).reverse();
    console.log(parents)
    // 文件路径的层级数
    var lv = parents.length;
    // 文件路径的html结构
    var pathNavHtml = '';
    var names, name;
    // 渲染每个文件的路径结构
    parents.forEach(function (item, index) {
        // 如果是当前文件路径的最后一个就返回，不拼接

        if (item.type == 2) {
            // names = item.name.split('-');
            // name = names[names.length - 1]
            name = item.name
        } else {
            name = item.name
        }
        if (index === parents.length - 1) return;
        pathNavHtml += `
                        <a href="javascript:void(0)" title="${item.name}" style="z-index: ${lv--};" data-file-id="${item.id}">
                            ${name}
                        </a>
                      `;
    });
    // 渲染当前文件路径的最后一个
    if (parents[parents.length - 1]) {
        if (parents[parents.length - 1].type == 2) {
            // names = parents[parents.length - 1].name.split('-');
            // name = names[names.length - 1]
            name = parents[parents.length - 1].name
        } else {
            name = parents[parents.length - 1].name
        }
        pathNavHtml += `
                    <span class="current-path" style="z-index: ${lv--};" title=" ${parents[parents.length - 1].name}">
                        ${name}
                    </span>
                    `;
    }
    
    return pathNavHtml;
}

//上传文件状态
function uploadHtml(type, file, index) {
    var typeClass = '';
    typeClass = type == 0 ? 'waiting' : (type == 1 ? 'succ' : (type == 2 ? 'fail' : (type == 3 ? 'cancel' : '')))
    var newLi = document.createElement('li');
    newLi.className = `tasks-item ${typeClass}`;
    newLi.dataset.file_id = index;
    var liinner = `
        <div class="item-inner clearfix">
            <div class="item-tit">
                <div class="thumb">
                    <i class="icon icon-m icon-pic-m"></i>
                </div>
                <div class="info">
                    <p class="tit">
                        <span class="tit-inner" title="${file.name}">${file.name}</span>
                    </p>
                    <span class="txt txt-sub">${fileSize(file.size)}</span>
                    <span class="txt txt-sub">上传</span>
                </div>
            </div>
            <div class="task-info">
                <p class="task-txt-status txt txt-sub"></p>
                <div class="task-progress-status">
                    <div class="progress-wrapper">
                        <b class="progress"></b>
                        <button class="btn btn-icon"></button>
                    </div>
                    ${type == 3 ? '<p class="task-txt-status txt txt-sub">已取消</p>' : ''}
                </div>
            </div>
        </div>`
    newLi.innerHTML = liinner;
    return newLi;
    // ${type == 3 ? '<p class="task-txt-status txt txt-sub">已取消</p>' : ''}
}



function _confirm(msg) {
    var html = `
        <div id="dvMsgBox" style="width: 300px; display: block; top: 240px; left: 481px;">
            <div class="top">
                <div class="right">
                    <div class="title" id="dvMsgTitle">提示
                    </div>
                </div>
            </div>
            <div class="body">
                <div class="right">
                    <div class="ct" id="dvMsgCT">您确定删除这条记录吗？
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
            <div class="bottom" id="dvMsgBottom" style="height: 45px;">
                <div class="right">
                    <div class="btn" id="dvMsgBtns">
                        <div class="height"></div>
                        <input type="button" class="btn" value="确认">
                        <input type="button" class="btn" value="取消">
                    </div>
                </div>
            </div>
        </div>
        <div id="ShowBolightBox" style="display: block;width: 1263px;height: 1200px;"></div>`
    // document.body.appendChild()
    $('body').append(html)
}

window.uploadHtml = uploadHtml
window._confirm = _confirm
window.createPathNavHtml = createPathNavHtml
window.createTreeElement = createTreeElement
window.createTreeHtml = createTreeHtml
window.createFilesHtmls = createFilesHtmls
window.createFilesHtml = createFilesHtml
window.createFileElement = createFileElement
window.getFileHtmls = getFileHtmls
window.getFileHtml = getFileHtml
window.fileConstructs = fileConstructs
window.fileConstruct = fileConstruct










