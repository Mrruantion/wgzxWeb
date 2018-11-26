

// "use strict";
var uploadLiArr = [];
var uploadFileArr = [];
var failUpload = 0;
var taskUl = $('.task-list-cont');
var cancalIndexArr = [];
var _g = getSearch();
var tree_path = '';
window.tree_path = tree_path
var u_path = $.cookie('tree_path');
var scrollTop;
var pid = 0;
var contentfileId = $.cookie('contentId');
var moveItem = [];
var movetoTarget = null;
var docDatas = [];
var sortString = '-type|name|id';
sortString = localStorage.getItem('sort') || '-type|name|id'
var allColumns = [];
// $('#divDocSort').hide()
// $('#divCombind').hide()
_readyFun();
function _readyFun() {
  getAllColumns()//获取所有属性
  u_path = $.cookie('tree_path');
  var header = tools.$('.header')[0];
  var weiyunContent = tools.$('.weiyun-content')[0];
  var headerH = header.offsetHeight;
  var content = tools.$('.content')[0];
  var fileList = tools.$('.file-list')[0];
  var docProId;
  var datas,
    childrenDatas;
  // console.log(data);
  var treeMenu = tools.$('.tree-menu')[0];
  var pathNav = tools.$('.path-nav')[0];
  var empty = tools.$('.g-empty')[0];
  var uid = $.cookie('uid');
  function changeHeight() {
    var viewH = window.innerHeight || document.documentElement.clientHeight;
    weiyunContent.style.height = viewH - headerH + 'px';
    content ? content.style.height = viewH - headerH - 62 + 'px' : '';
    fileList ? fileList.style.height = viewH - headerH - 93 + 'px' : '';
  }
  changeHeight();
  window.onresize = changeHeight;
  function setOption() {
    var positionNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    ;
    var str = '';
    positionNumber.forEach(function (ele) {
      str += ("<option value=\"" + ele + "\">" + ele + "</option>");
    });
    return str;
  }
  $('#qnum').empty().append(setOption());
  $('#lnum').empty().append(setOption());
  $('#jnum').empty().append(setOption());
  $('#cnum').empty().append(setOption());
  var customArr = [];
  var fixPropArr = ['id', 'fid', 'u_path', 'did', 'name', 'saveExpireIn', 'createdAt', 'num', 'page', "qnum", "lnum", "jnum", "cnum", "ce", "bnum", "pname", "lname", "onum", "tree_path"];
  $('#divDocPro').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    buttons: {
      "保存": function () {
        if (isbatch) {
          saveBatchProp();
        } else {
          saveDocPro();
        }
      },
      "取消": function () {
        $('#divDocPro').dialog("close");
      }
    }
  });
  $('#selectProp').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '选择自定义属性',
    buttons: {
      "确定": function () {
        $('#selectProp').dialog("close");
      }
    }
  });
  $('#newCustomProp').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '添加新属性',
    buttons: {
      "确定": function () {
        saveNewPro();
      },
      "取消": function () {
        $('#newCustomProp').dialog("close");
      }
    }
  });
  $('#someProp').on('change', function (e) {
    console.log(this.value);
    if (this.value != 0) {
      if (customArr.indexOf(this.value) == -1) {
        customArr.push(this.value);
        appendUlLI(this.value);
      } else {
        showTips('err', "该属性已存在");
      }
    }
  });
  $('#newProp').click(function () {
    $('#newCustomProp').dialog('open');
  });
  $('#addCustom').click(function () {
    $('#selectProp').dialog("open");
  });
  function saveNewPro() {
    var name = $('#newPropname').val();
    var size = 50;
    local_api._createColumn('docProp', {
      name: name,
      size: size
    }, '', function (res) {
      createOperate('添加自定义属性');
      if (res.err) {
        showTips('err', "添加属性失败");
        return;
      }

      getAllColumns()
      appendUlLI(name);
      customArr.push(name);
      $('#someProp').append(("<option value=\"" + name + "\">" + name + "</option>"));
      $('#newCustomProp').dialog('close');
    });
  }
  function appendUlLI(name) {
    var li = document.createElement('li');
    li.style.marginTop = '10px';
    li.dataset = name;
    var lis = (" \n            <label class=\"ellipsis\" title=\"" + name + "\">" + name + "</label>\n            <input value=\"\" class=\"form-control\" style=\"width:50%\"/>\n            <button class=\"btn btn-primary newBtn\" style=\"\">删除</button>\n        ");
    li.innerHTML = lis;
    $('#newPropLi').append(li);
    console.log($(li));
    $('button', li).on('click', function (e) {
      console.log(name);
      customArr.splice(customArr.indexOf(name), 1);
      $(e.target).parent().remove();
    });
  }

  //批量设置属性
  var isbatch = false;
  var fileidArr = [];
  var fileTree = [];
  var fileTitleArr = [];
  var fileDocProId = [];
  $('#someProo').on('click', function () {
    isbatch = true;
    fileidArr = [];
    fileTree = [];
    fileTitleArr = [];
    fileDocProId = [];
    console.log(getCheckedFile());
    if (!getCheckedFile().length) {
      showTips('err', '请选择文件！');
    } else {
      getCheckedFile().forEach(function (ele) {
        if ($('.item', ele).data().type != 3) {
          fileidArr.push($('.item', ele).data().fileId);
          fileTree.push('^' + $('.item', ele).data().tree_path);
          fileTitleArr.push($('.item .file-title', ele).text());
        }
      });
      console.log(fileidArr, fileTree, fileTitleArr);
      batchSetPro();
    }
  });
  function batchSetPro() {
    local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
      if (!colum.err) {
        customArr = [];
        $('#someProp').empty();
        $('#newPropLi').empty();
        $('#someProp').append(("<option value=\"" + 0 + "\">" + '可选属性' + "</option>"));
        colum.row.forEach(function (ele) {
          if (fixPropArr.indexOf(ele.Field) == -1)
            $('#someProp').append(("<option value=\"" + ele.Field + "\">" + ele.Field + "</option>"));
        });
      }
      local_api._list('document', {
        tree_path: fileTree.join('|'),
        type: 2
      }, '', '', 1, -1, $.cookie('appkey'), function (res) {
        $('#name').val('');
        $('#saveExpireIn').val('');
        $('#createdAt').val('');
        $('#num').val('');
        $('#page').val('');
        $('#did').val('');
        $('#qnum').val(1);
        $('#lnum').val(1);
        $('#jnum').val(1);
        $('#cnum').val(1);
        $('#ce').val(0);
        $('#divDocPro').dialog("option", 'title', '批量设置属性');
        $('#divDocPro').dialog("open");
        res.data.forEach(function (ele) {
          fileDocProId.push(ele.id);
        });
      });
    });
  }
  function saveBatchProp() {
    console.log(fileDocProId);
    if (!fileDocProId.length) {
      showTips('err', '该档案下没有案卷可设置');
      return;
    }
    var createBatch = [];
    var create_json = {
      u_path: u_path,
      name: $('#name').val(),
      saveExpireIn: $('#saveExpireIn').val(),
      createdAt: $('#createdAt').val(),
      did: $('#did').val(),
      num: $('#num').val(),
      page: $('#page').val(),
      qnum: $('#qnum').val(),
      lnum: $('#lnum').val(),
      jnum: $('#jnum').val(),
      cnum: $('#cnum').val(),
      ce: $('#ce').val()
    };
    var liArr = $('#newPropLi li');
    var customJson = {};
    for (var i = 0; i < liArr.length; i++) {
      var li = liArr[i];
      customJson[$('label', li).text()] = $('input', li).val();
    }
    fileDocProId.forEach(function (ele) {
      var newObj = Object.assign({}, create_json, customJson);
      newObj.fid = ele;
      createBatch.push(newObj);
    });
    if (confirm('批量设置属性会覆盖案卷原有属性，是否批量设置属性')) {
      local_api._delete('docProp', { fid: fileDocProId.join('|') }, $.cookie('appkey'), function (del) {
        console.log(del);
        local_api._createBatch('docProp', { data: JSON.stringify({ data: createBatch }) }, $.cookie('appkey'), function (res) {
          createOperate('批量设置案卷属性');
          $('#divDocPro').dialog("option", 'title', '属性');
          $('#divDocPro').dialog("close");
        });
      });
    }
    console.log(createBatch);
  }


  var isNewProp = false;
  var oldDid = 0;
  function setDocPro(ev) {
    isbatch = false;
    docProId = ev.id.slice('docPro_'.length, ev.id.length);
    console.log(docProId);
    local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
      if (!colum.err) {
        customArr = [];
        $('#someProp').empty();
        $('#newPropLi').empty();
        $('#someProp').append(("<option value=\"" + 0 + "\">" + '可选属性' + "</option>"));
        colum.row.forEach(function (ele) {
          if (fixPropArr.indexOf(ele.Field) == -1)
            $('#someProp').append(("<option value=\"" + ele.Field + "\">" + ele.Field + "</option>"));
        });
      }
      local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
        console.log(res);
        if (res.status == 0) {
          if (res.data) {
            isNewProp = false;
            $('#name').val(res.data.name);
            $('#saveExpireIn').val(res.data.saveExpireIn);
            $('#createdAt').val(res.data.createdAt);
            $('#num').val(res.data.num);
            $('#page').val(res.data.page);
            $('#did').val(res.data.did);
            oldDid = res.data.did
            $('#qnum').val(res.data.qnum);
            $('#lnum').val(res.data.lnum);
            // $('#jnum').val(res.data.jnum);
            // $('#cnum').val(res.data.cnum);
            $('#ce').val(res.data.ce);
            $('#onum').val(res.data.onum);
            $('#newPropLi').empty();
            for (var i in res.data) {
              if (fixPropArr.indexOf(i) == -1) {
                if (res.data[i]) {
                  var li = document.createElement('li');
                  li.style.marginTop = '10px';
                  li.dataset = i;
                  var lis = (" \n<label class=\"ellipsis\" title=\"" + i + "\">" + i + "</label>\n                                        <input value=\"" + res.data[i] + "\" class=\"form-control\" style=\"width:60%\"/>\n                                    ");
                  li.innerHTML = lis;
                  $('#newPropLi').append(li);
                }
              }
            }
          } else {
            isNewProp = true;
            $('#name').val('');
            $('#saveExpireIn').val('');
            $('#createdAt').val('');
            $('#num').val('');
            $('#page').val('');
            $('#did').val('');
            $('#qnum').val(1);
            $('#lnum').val(1);
            // $('#jnum').val(1);
            $('#onum').val('l');
            $('#ce').val(0);
          }
          $('#divDocPro').dialog("open");
        }
      });
    });
  }
  function saveDocPro() {
    createOperate('单个设置属性');
    if (isNewProp) {
      var create_json = {
        name: $('#name').val() || '',
        fid: docProId,
        u_path: u_path,
        tree_path: tree_path + ',' + docProId,
        // saveExpireIn: $('#saveExpireIn').val(),
        // createdAt: $('#createdAt').val(),
        // num: $('#num').val(),
        did: $('#did').val(),
        // page: $('#page').val(),
        // qnum: $('#qnum').val(),
        lnum: $('#lnum').val(),
        // jnum: $('#jnum').val(),
        onum: $('#onum').val(),
        ce: $('#ce').val()
      };
      var liArr = $('#newPropLi li');
      var customJson = {};
      for (var i = 0; i < liArr.length; i++) {
        var li = liArr[i];
        customJson[$('label', li).text()] = $('input', li).val();
      }
      Object.assign(create_json, customJson);
      console.log(create_json);
      local_api._create('docProp', create_json, $.cookie('appkey'), function (res) {
        local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {
          $('#divDocPro').dialog("close");
          if (oldDid != $('#did').val()) { //did改变要改变文件夹名称
            local_api._get('document', { id: docProId }, 'tree_path,name,did', $.cookie('appkey'), function (hd) {
              var oldPath = getDIDName(hd.data, oldDid)
              var newPath = getDIDName(hd.data, $('#did').val())

              var handle_json = {
                type: 1,
                oldPath: oldPath,
                newPath: newPath
              };
              local_api._rename(handle_json, $.cookie('appkey'), function (han) {
                console.log(han);
                $('#divDocPro').dialog("close");
              })
            })
          } else {
            $('#divDocPro').dialog("close");
          }
        });
      });
    } else {
      var update_json = {
        name: $('#name').val() || '',
        // saveExpireIn: $('#saveExpireIn').val(),
        // createdAt: $('#createdAt').val(),
        // num: $('#num').val(),
        did: $('#did').val(),
        // page: $('#page').val(),
        // qnum: $('#qnum').val(),
        lnum: $('#lnum').val(),
        // jnum: $('#jnum').val(),
        // cnum: $('#cnum').val(),
        onum: $('#onum').val(),
        ce: $('#ce').val()
      };
      var query_json = { fid: docProId };
      var liArr = $('#newPropLi li');
      var customJson = {};
      for (var i = 0; i < liArr.length; i++) {
        var li = liArr[i];
        customJson[$('label', li).text()] = $('input', li).val();
      }
      Object.assign(update_json, customJson);
      console.log(update_json);
      local_api._update('docProp', query_json, update_json, $.cookie('appkey'), function (res) {
        local_api._update('document', { id: docProId }, { did: $('#did').val() }, $.cookie('appkey'), function (usu) {

          if (oldDid != $('#did').val()) { //did改变要改变文件夹名称
            local_api._get('document', { id: docProId }, 'tree_path,name,did', $.cookie('appkey'), function (hd) {

              var oldPath = getDIDName(hd.data, oldDid)
              var newPath = getDIDName(hd.data, $('#did').val())

              var handle_json = {
                type: 1,
                oldPath: oldPath,
                newPath: newPath
              };
              console.log(handle_json)
              local_api._rename(handle_json, $.cookie('appkey'), function (han) {
                console.log(han);
                $('#divDocPro').dialog("close");
              })
            })
          } else {
            $('#divDocPro').dialog("close");
          }
        });
      });
    }
  }

  function getDIDName(data, did) {
    var path = doc_path(data.tree_path)
    path = path.split('/')
    path[path.length - 2] = did + data.name;
    path.length = path.length - 1
    path = path.join('/')
    return path
  }


  $('#divDocAudit').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '文档审核',
    buttons: {
      "确定": function () {
        saveAudits();
      },
      "取消": function () {
        $('#divDocAudit').dialog("close");
      }
    }
  });


  $('#passDoc').on('click', function () {
    fileDocProId = [];
    fileTree = [];
    if (!getCheckedFile().length) {
      showTips('err', '请选择文件！');
    } else {
      getCheckedFile().forEach(function (ele) {
        fileidArr.push($('.item', ele).data().fileId);
        fileTree.push('^' + $('.item', ele).data().tree_path);
      });
      console.log(fileidArr, fileTree);
      $('#divDocAudit').dialog('open');
    }
  });
  function saveAudits() {
    createOperate('文档审核');
    var upobj = { ispass: $('#divDocAudit input[name]:checked').val() };
    var obj = { tree_path: fileTree.join('|') };
    local_api._update('document', obj, upobj, $.cookie('appkey'), function (res) {
      console.log(res);
      showTips('ok', '审核成功！');
      $('#divDocAudit').dialog('close');
    });
  }
  $('#divDocLock').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '文档加锁',
    buttons: {
      "确定": function () {
        saveLock();
      },
      "取消": function () {
        $('#divDocLock').dialog("close");
      }
    }
  });
  $('#lockDoc').on('click', function () {
    fileDocProId = [];
    fileTree = [];
    if (!getCheckedFile().length) {
      showTips('err', '请选择文档！');
    } else {
      getCheckedFile().forEach(function (ele) {
        fileidArr.push($('.item', ele).data().fileId);
        fileTree.push('^' + $('.item', ele).data().tree_path);
      });
      console.log(fileidArr, fileTree);
      $('#divDocLock').dialog('open');
    }
  });
  function saveLock() {
    var upobj = { islock: parseInt($('#divDocLock input[name]:checked').val()) };
    var obj = { tree_path: fileTree.join('|') };
    local_api._update('document', obj, upobj, $.cookie('appkey'), function (res) {
      if (res.status == 0) {
        showTips('ok', '加锁成功！');
        $('#divDocLock').dialog('close');
        renderFilesPathTree(contentfileId);
      } else {
        showTips('err', '加锁失败！');
      }
    });
  }


  // $('#printCode').on('click', function (ev) {
  //   ev.stopPropagation();
  //   createOperate('打印二维码');
  //   fileDocProId = [];
  //   fileTree = [];
  //   fileTitleArr = [];
  //   if (!getCheckedFile().length) {
  //     showTips('err', '请选择文件！');
  //     return;
  //   }
  //   getCheckedFile().forEach(function (ele) {
  //     fileidArr.push($('.item', ele).data().fileId);
  //     fileTree.push('^' + $('.item', ele).data().tree_path);
  //   });
  //   console.log(fileidArr, fileTree);
  //   // Qrcode(fileTree);
  // });
  function Qrcode(fileTree) {
    var query_json = {
      tree_path: fileTree.join('|'),
      type: 2,
      did: '>0'
    };
    local_api._list('document', query_json, 'did,name', 'did', 1, -1, $.cookie('appkey'), function (res) {
      var data = res.data;
      var div = $('#qrcodePrint')[0] || document.createElement('div');
      div.id = 'qrcodePrint';
      var ul = "<ul class=\"qrcodePrint\">";
      data.forEach(function (ele) {
        ul += ("<li><img src=\"http://h5.bibibaba.cn/pay/wicare/wxpayv3/qrcode.php?data=" + ele.did + "\"><span>" + ele.did + "</span></li>");
      });
      ul += "</ul>";
      div.innerHTML = ul;
      if (!$('#qrcodePrint')[0]) {
        $('body').append(div);
      } else {
        $(div).empty();
        $(div).append(ul);
      }
      var bdhtml = window.document.body.innerHTML;
      var prnhtml = $('#qrcodePrint').html();
      window.document.body.innerHTML = prnhtml;
      _print(bdhtml);
    });
  }
  function _print(bdhtml) {
    var t_img;
    var isLoad = true;
    isImgLoad(function () {
      window.print();
      window.document.body.innerHTML = bdhtml;
      _readyFun();
    });
    function isImgLoad(callback) {
      $('.qrcodePrint img').each(function () {
        console.log(this.height);
        if (this.height === 0) {
          isLoad = false;
          return false;
        }
      });
      if (isLoad) {
        clearTimeout(t_img);
        callback();
      } else {
        isLoad = true;
        t_img = setTimeout(function () {
          isImgLoad(callback);
        }, 500);
      }
    }
  }
  $('#divDocumentAssign').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    buttons: {
      "确定": function () {
        movesubmit();
      },
      "取消": function () {
        $('#divDocumentAssign').dialog("close");
      }
    }
  });
  $('.move').on('click', function (ev) {
    if (getCheckedFile().length) {
      console.log(getMovetree_path());
      $('#divDocumentAssign').dialog('option', 'title', '移动');
      $('#divDocumentAssign').dialog('open');
    } else {
      showTips('err', '请选择需要移动的案卷或分类');
    }
  });
  function getMovetree_path() {
    var data = getCheckedFile();
    var obj;
    var obj = {
      tree_path: [],
      id: []
    };
    for (var i = 0; i < data.length; i++) {
      obj.tree_path.push('^' + $('.item', data[i]).data().tree_path);
      obj.id.push($('.item', data[i]).data().fileId);
    }
    return obj;
  }
  function movesubmit() {
    createOperate('移动');
    var _tree_path = getMovetree_path().tree_path;
    var idArr = getMovetree_path().id;
    console.log(assignFid, assignTreePath, assignU_path);
    var updateArr = [];
    local_api._list('document', { tree_path: _tree_path.join('|') }, '', '', 1, -1, $.cookie('appkey'), function (res) {
      res.data.forEach(function (ele) {
        var obj = {};
        obj[ele.id] = {};
        if (idArr.indexOf(ele.id) > -1) {
          var childData = function (id, _tree_path) {
            var data = dataControl.getChildById(res.data, id);
            if (data.length) {
              data.forEach(function (e) {
                var obj1 = {};
                obj1[e.id] = {};
                obj1[e.id].pid = id;
                obj1[e.id].oldtree_path = e.tree_path;
                var _tree_path1 = _tree_path + ',' + e.id;
                obj1[e.id].tree_path = _tree_path1;
                obj1[e.id].olePath = doc_path(e.tree_path);
                obj1[e.id].newPath = doc_path(_tree_path1);
                obj1[e.id].u_path = assignU_path;
                obj1[e.id].name = e.name;
                obj1[e.id].type = e.type;
                updateArr.push(obj1);
                childData(e.id, _tree_path1);
              });
            }
          };
          obj[ele.id].pid = assignFid;
          var startIndex = ele.tree_path.indexOf(ele.id);
          var endIndex = ele.tree_path.length;
          var _tree_path = assignTreePath + ',' + ele.tree_path.slice(startIndex, endIndex);
          obj[ele.id].oldtree_path = ele.tree_path;
          obj[ele.id].tree_path = _tree_path;
          obj[ele.id].olePath = doc_path(ele.tree_path);
          obj[ele.id].newPath = doc_path(_tree_path);
          obj[ele.id].u_path = assignU_path;
          obj[ele.id].name = ele.name;
          obj[ele.id].type = ele.type;
          updateArr.push(obj);
          childData(ele.id, _tree_path);
        }
      });
      console.log(updateArr);
      var i = 0;
      $('#divDocumentAssign').dialog('close');
      movoFile(updateArr, i);
    });
  }
  function movoFile(updateArr, i) {
    console.log(updateArr[i]);
    var obj = updateArr[i];
    for (var o in obj) {
      if (obj[o].type == 3) {
        var handle_json = {
          oldPath: obj[o].olePath,
          newPath: obj[o].newPath,
          name: obj[o].name,
          type: 2
        };
        local_api._rename(handle_json, $.cookie('appkey'), function (res) {
          if (res.status == 0) {
            var update_json = {
              path: '/upload/' + obj[o].newPath + res.name,
              tree_path: obj[o].tree_path,
              pid: obj[o].pid,
              u_path: obj[o].u_path,
              name: res.name
            };
            var query_json = { id: o };
            local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
              i++;
              showTips('ok', ("正在移动目录和文件" + i + "/" + updateArr.length));
              if (updateArr[i]) {
                movoFile(updateArr, i);
              }
              if (i == updateArr.length) {
                treeData(pid);
              }
            });
          } else {
            i++;
            showTips('ok', ("正在移动目录和文件" + i + "/" + updateArr.length));
            if (updateArr[i]) {
              movoFile(updateArr, i);
            }
            if (i == updateArr.length) {
              treeData(pid);
            }
          }
        });
      } else {
        var update_json = {
          path: '/upload/' + obj[o].newPath,
          tree_path: obj[o].tree_path,
          pid: obj[o].pid,
          u_path: obj[o].u_path
        };
        var query_json = { id: o };
        local_api._update('document', query_json, update_json, $.cookie('appkey'), function (up) {
          i++;
          showTips('ok', ("正在移动目录和文件" + i + "/" + updateArr.length));
          if (i == updateArr.length) {
            treeData(pid);
          }
          if (updateArr[i]) {
            movoFile(updateArr, i);
          }
        });
      }
    }
  }

  var appInterval;
  function openPro(ev) {
    createOperate('打开密集柜');
    var docProId = ev.id.slice('openProo_'.length, ev.id.length);
    local_api._get('docProp', { fid: docProId }, '', $.cookie('appkey'), function (res) {
      if (res.data) {
        // var qu = parseInt(res.data.qnum || 0);
        var lie = parseInt(res.data.lnum || 0);
        // var jie = parseInt(res.data.jnum || 0);
        // var ceng = parseInt(res.data.cnum || 0);
        var ce = res.data.ce
        // var bh = parseInt(res.data.bnum || 1);
        if (lie > 0 && ce) {
          if (ce == 'l') {
            lie += 1;
          }
          $.ajax({
            url: '/openApi?lie=' + lie,
            type: 'get',
            dataType: 'json',
            success: function (oS) {
              console.log(oS)
              if (oS.status == '"0"') {
                showTips('ok', '密集柜已打开！');
              } else {
                showTips('err', '密集柜打开失败！');
              }
            }
          })
        } else {
          showTips('err', '无位置信息，无法打开密集柜！');
        }
      } else {
        showTips('err', '无位置信息，无法打开密集柜！');
      }
    });
    console.log(docProId);
  }
  function parentAllData(callback) {
    local_api._list('document', { type: '0|1|2|4' }, '', 'did|id', 1, -1, $.cookie('appkey'), function (res) {
      docDatas = res.data;
      callback ? callback() : null;
    });
  }
  function treeData(pid) {
    parentAllData();
    local_api._list('document', {
      type: '0|1|2|4',
      u_path: $.cookie('tree_path') + '|' + '^' + $.cookie('tree_path') + ','
    }, '', 'createdAt', 1, -1, $.cookie('appkey'), function (res) {
      if (res.status == 0) {
        if (res.total) {
          datas = res.data;
          pid = pid || res.data[0].pid;
          contentfileId = _g.fileId || contentfileId || res.data[0].id;
          tree_path = tree_path || res.data[0].tree_path;
          u_path = u_path || res.data[0].u_path;
          if (_g.fileId) {
            local_api._get('document', { id: _g.fileId }, '', $.cookie('appkey'), function (ts) {
              if (ts.data) {
                tree_path = ts.data.tree_path;
                u_path = ts.data.u_path;
              }
            });
          }
          _g.fileId = null;
          getDocumentPlay(pid);
        }
      }
    });
  }
  treeData(pid);
  var fileLIstFun = function (ev) {
    console.log(ev.currentTarget, 'filelist');
    if (isrename) {
      return;
    }
    var target = tools.getTarget(ev);
    if (target.className.indexOf('docProo') > -1) {
      setDocPro(ev.target);
    }
    if (target.className.indexOf('openProo') > -1) {
      openPro(ev.target);
    }
    if (target.className.indexOf('folder') > -1 || getCurrentClick(ev)) {
      scrollTop = $('.file-list').scrollTop();
      if (tools.parents(target, '.item')) {
        target = tools.parents(target, '.item');
        var fileId = target.dataset.fileId;
        contentfileId = fileId;
        $.cookie('contentId', contentfileId);
        var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
        var node = treeObj.getNodeByParam("id", contentfileId, null);
        if (node) {
          tree_path = node.treePath;
          u_path = node.u_path;
          treeObj.selectNode(node);
        }
        renderFilesPathTree(fileId);
      }
    } else {
      console.log($('.item', ev.currentTarget).data());
      var dataset = $('.item', ev.currentTarget).data();
      // var path = ("/js/pdf/generic/web/viewer.html?file=" + target.dataset.filepath);
      var string = dataset.filepath
      var ftype = string.slice(string.lastIndexOf('.'), string.length)
      if (dataset.type == 3 && ftype == '.pdf') {
        path = '/pdfView?fileid=' + dataset.fileId;
        window.open(path, '_blank');
      }

      if (dataset.type == 3 && /\.(?:xls|xlsx|doc|docx)$/.test(ftype)) {
        console.log(dataset)
        // var path = location.host + '/upload/' + doc_path(dataset.tree_path) + $('.item .file-title', ev.currentTarget).text()
        // path = '/officeView?fileid=' + dataset.fileId;
        var path = '/upload/' + doc_path(dataset.tree_path) + $('.item .file-title', ev.currentTarget).text()
        window.open(path, '_self');
      }
    }
  };
  var pathNavFun = function (ev) {
    var target = tools.getTarget(ev);
    if (tools.parents(target, 'a')) {
      var fileId = target.dataset.fileId;
      contentfileId = fileId;
      $.cookie('contentId', contentfileId);
      var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
      var node = treeObj.getNodeByParam("id", contentfileId, null);
      if (node) {
        tree_path = node.treePath;
        u_path = node.u_path;
        treeObj.selectNode(node);
      }
      renderFilesPathTree(fileId);
    }
  };
  var removeClicks = function () {
    $(document).off('click', ".file-list .file-item", fileLIstFun);
    tools.removeEvent(pathNav, 'click', pathNavFun);
  };
  function getDocumentPlay(pid) {
    $('.file-list').empty();
    $('#tree-menu').empty();
    removeClicks();
    fileList.innerHTML = createFilesHtml(datas, contentfileId);
    $(document).on('click', ".file-list .file-item", fileLIstFun);
    showTree(datas);
    pathNav.innerHTML = createPathNavHtml(datas, contentfileId);
    renderFilesPathTree(contentfileId);
    tools.addEvent(pathNav, 'click', pathNavFun);
  }
  var icons = {
    0: './img/icon-file-s.svg',
    1: './img/icon-file-s.svg',
    2: './img/icon-file-s1.svg',
    4: './img/icon-file-s2.svg'
  };
  function showTree(data) {
    var names = [];
    customers = data;
    for (var i = 0; i < data.length; i++) {
      names.push(data[i].name);
    }
    var onCustomerSelectClick = function (event, treeId, treeNode) {
      if (parseInt(treeNode.id) > -1) {
        contentfileId = treeNode.id;
        $.cookie('contentId', contentfileId);
        tree_path = treeNode.treePath;
        u_path = treeNode.u_path;
        renderFilesPathTree(contentfileId);
      }
    };
    var onCustomerAssignClick = function (event, treeId, treeNode) {
      if (parseInt(treeNode.id) > -1) {
        assignFid = treeNode.id;
        assignTreePath = treeNode.treePath;
        assignU_path = treeNode.u_path;
        assignPath = treeNode.path;
      }
    };
    var setting = {
      view: { showIcon: true },
      check: {
        enable: false,
        chkStyle: "checkbox"
      },
      data: { simpleData: { enable: true } },
      callback: { onClick: onCustomerSelectClick }
    };
    var settingAssign = {
      view: { showIcon: true },
      check: {
        enable: false,
        chkStyle: "checkbox"
      },
      data: { simpleData: { enable: true } },
      callback: { onClick: onCustomerAssignClick }
    };
    var fileArray = [];
    var selectArray = [];
    for (var i = 0; i < data.length; i++) {
      fileArray.push({
        open: false,
        id: data[i]['id'],
        treePath: data[i]['tree_path'],
        pId: data[i]['pid'],
        name: data[i]['name'],
        u_path: data[i]['u_path'],
        icon: icons[data[i]['type']],
        path: data[i]['path']
      });
      selectArray.push({
        open: false,
        id: data[i]['id'],
        treePath: data[i]['tree_path'],
        pId: data[i]['pid'],
        name: data[i]['name'],
        u_path: data[i]['u_path'],
        icon: icons[data[i]['type']],
        path: data[i]['path']
      });
    }
    $.fn.zTree.init($("#tree-menu"), setting, fileArray);
    $.fn.zTree.init($("#documentTreeAssign"), settingAssign, selectArray);
    if (contentfileId >= 0) {
      var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
      var node = treeObj.getNodeByParam("id", contentfileId, null);
      if (node) {
        tree_path = node.treePath;
        u_path = node.u_path;
        treeObj.selectNode(node);
      }
    }
  }
  function getCurrentClick(ev) {
    var type = parseInt(ev.target.dataset.type);
    if ([0, 1, 2, 4].indexOf(type) > -1) {
      return true;
    }
    if (ev.target.className == 'file-title') {
      var ptype = parseInt(ev.target.parentNode.parentNode.dataset.type);
      if ([0, 1, 2, 4].indexOf(ptype) > -1) {
        return true;
      }
    }
    if (ev.target.className == 'file-title-box') {
      var ptype = parseInt(ev.target.parentNode.dataset.type);
      if ([0, 1, 2, 4].indexOf(ptype) > -1) {
        return true;
      }
    }
    return false;
  }
  function positionTreeById(fileId) {
    var ele = document.querySelector('.tree-title[data-file-id="' + fileId + '"]');
    tools.addClass(ele, 'tree-nav');
  }
  function renderFilesPathTree(fileId) {
    if (scrollTop) {
      setTimeout(function () {
        $(".file-list")[0].scrollTop = scrollTop;
      }, 1000);
    }
    childrenDatas = [];
    datas.forEach(function (ele) {
      if (ele.id == fileId) {
        if (ele.type == 1 || ele.type == 0) {
          $('#folder1').show();
          $('#folder2').show();
          $('#folder3').hide();
        } else {
          $('#folder1').hide();
          $('#folder2').hide();
          $('#folder3').show();
        }
        childrenDatas.push(ele);
      }
    });
    var json = {
      pid: fileId,
      u_path: '^' + u_path
    };
    if (roleArr.indexOf('访问加锁文档') == -1) {
      json['islock'] = '<>2';
    }
    local_api._list('document', json, '', sortString, 1, -1, $.cookie('appkey'), function (res) {
      $('.file-list').empty();
      var hasChild = res.total ? true : false;
      childrenDatas = childrenDatas.concat(res.data);
      console.log(hasChild);
      if (hasChild) {
        empty.style.display = 'none';
        fileList.innerHTML = createFilesHtml(childrenDatas, fileId);
      } else {
        empty.style.display = 'block';
        fileList.innerHTML = '';
      }
      pathNav.innerHTML = createPathNavHtml(datas, fileId);
      fileItem = tools.$('.file-item', fileList);
      tools.each(fileItem, function (item, index) {
        fileHandle(item);
      });
      tools.removeClass(checkedAll, 'checked');
      contentfileId = fileId;
      $.cookie('contentId', contentfileId);
    });
  }
  tools.addEvent(tools.$('.mod-action-wrap')[1], 'mouseover', function (ev) {
    if (ev.target.className == "action-item") {
      return;
    }
    if (ev.target.className == "action-item-con") {
      btnConBack();
      ev.target.style.background = '#f5f6f9';
      ev.target.children[1].style.display = 'inline-block';
      tools.addEvent(document, 'mouseover', btnChange);
      return;
    }
  });
  var btnChange = function (evt) {
    if (evt.target.className != 'action-item-con') {
      if (evt.target.className.indexOf('icon-') > -1) {
        return;
      }
      btnConBack();
      tools.removeEvent(document, 'mouseover', btnChange);
    }
  };
  function btnConBack() {
    tools.$('#btn-change .action-item-con').forEach(function (ele) {
      ele.style.background = '#fff';
    });
    tools.$('#btn-change .act-txt').forEach(function (ele) {
      ele.style.display = 'none';
    });
  }
  for (var i = 0; i < tools.$('.mod-action-wrap')[1].children.length; i++) {
    tools.addEvent(tools.$('.mod-action-wrap')[1].children[i], 'click', function (ev) {
      console.log(tools.hasClass(this, 'act'));
      if (this == tools.$('.mod-action-wrap')[1].children[0]) {
        if (!tools.hasClass(this, 'act')) {
          this.className = this.className + ' act';
          tools.$('.mod-action-wrap')[1].children[1].className = 'action-item';
          tools.addClass(tools.$('.file-list')[0], 'f_detail');
        }
      } else {
        if (!tools.hasClass(this, 'act')) {
          this.className = this.className + ' act';
          tools.$('.mod-action-wrap')[1].children[0].className = 'action-item';
          tools.removeClass(tools.$('.file-list')[0], 'f_detail');
        }
      }
    });
  }
  var fileItem = tools.$('.file-item', fileList);
  var checkedAll = tools.$('.cheched-all')[0];
  var allCheckbox = tools.$('.checkbox', fileList);
  tools.each(fileItem, function (item, index) {
    fileHandle(item);
  });
  console.log($('.file-list .checkbox'));
  tools.addEvent(checkedAll, 'click', function (ev) {
    fileItem = tools.$('.file-item', fileList);
    allCheckbox = tools.$('.checkbox', fileList);
    var isAddClass = tools.toggleClass(this, 'checked');
    if (isAddClass) {
      tools.each(fileItem, function (item, index) {
        tools.addClass(item, 'file-checked');
        tools.addClass(allCheckbox[index], 'checked');
      });
    } else {
      tools.each(fileItem, function (item, index) {
        tools.removeClass(item, 'file-checked');
        tools.removeClass(allCheckbox[index], 'checked');
      });
    }
  });
  function fileHandle(item) {
    var checkbox = tools.$('.checkbox', item)[0];
    tools.addEvent(item, 'mouseenter', function () {
      tools.addClass(this, 'file-checked');
    });
    tools.addEvent(item, 'mouseleave', function () {
      if (!tools.hasClass(checkbox, 'checked')) {
        tools.removeClass(this, 'file-checked');
      }
    });
    tools.addEvent(checkbox, 'click', function (ev) {
      console.log(ev, 'thischeck');
      allCheckbox = tools.$('.checkbox', fileList);
      var isAddClass = tools.toggleClass(this, 'checked');
      if (isAddClass) {
        if (getCheckedFile().length == allCheckbox.length) {
          tools.addClass(checkedAll, 'checked');
        }
      } else {
        tools.removeClass(checkedAll, 'checked');
      }
      tools.stopPropagation(ev);
    });
  }
  function getCheckedFile() {
    var arr = [];
    tools.each(allCheckbox, function (checkbox, index) {
      if (tools.hasClass(checkbox, 'checked')) {
        arr.push(fileItem[index]);
      }
    });
    return arr;
  }
  tools.addEvent(tools.$('.mod-action-wrap')[0], 'mouseover', function (ev) {
    if (ev.target.className == "action-item") {
      return;
    }
    if (ev.target.className == "action-item-con") {
      itemConBack();
      ev.target.style.background = '#f5f6f9';
      ev.target.children[1].style.display = 'inline-block';
      tools.addEvent(document, 'mouseover', itemDocument);
      return;
    }
  });
  var itemDocument = function (evt) {
    if (evt.target.className != 'action-item-con') {
      if (evt.target.className.indexOf('icon-') > -1) {
        return;
      }
      itemConBack();
      tools.removeEvent(document, 'mouseover', itemDocument);
    }
  };
  function itemConBack() {
    tools.$('.mod-nav .action-item-con').forEach(function (ele) {
      ele.style.background = '#fff';
    });
    tools.$('.mod-nav .act-txt').forEach(function (ele) {
      ele.style.display = 'none';
    });
  }
  var newDiv = null;
  var newDiv2 = null;
  var disX = 0,
    disX = 0;
  tools.addEvent(tools.$('.main')[0], 'mousedown', function (ev) {
    var target = tools.getTarget(ev);
    if (tools.parents(target, '.nav-a'))
      return;
    disX = ev.clientX;
    disY = ev.clientY;
    tools.addEvent(document, 'mousemove', mouseMove);
    tools.addEvent(document, 'mouseup', mouseUp);
    ev.preventDefault();
  });
  var issecondmove = false;
  var newDiv2;
  function moveItemFun(ev) {
    console.log(ev.target);
    movetoTarget = ev.target;
    if (!newDiv2) {
      newDiv2 = document.createElement('div');
      document.body.appendChild(newDiv2);
      var cssobj = {
        position: 'fixed',
        width: '150px',
        height: '40px'
      };
      $(newDiv2).css(cssobj);
      var newDiv2Content = ("<div class=\"selectboxMoveone\">\n                        <div>\n                            <span></span>\n                            <span class=\"ellipsis\">" + $('.file-title', getCheckedFile()[0]).text() + "</span>\n                        </div>\n                        <span class=\"moveleng\">" + getCheckedFile().length + "</span>\n                    </div>\n                    " + (getCheckedFile().length > 1 ? "<div class=\"selectboxMovemore\"></div>" : '') + "\n                    ");
      $(newDiv2).append(newDiv2Content);
    }
    $(newDiv2).css({
      top: ev.clientY + 2,
      left: ev.clientX + 2
    });
  }
  function mouseMove(ev) {
    if (newDiv2) {
      moveItemFun(ev);
      return;
    }
    if (issecondmove) {
      if (getCheckedFile().indexOf(ev.target.parentNode) > -1) {
        moveItemFun(ev);
      } else {
        _targetNode(ev.target, 'file-item', function (ele) {
          console.log(ele, 'paen');
          if (ele) {
            if (getCheckedFile().indexOf(ele) > -1) {
              moveItemFun(ev);
            } else {
              issecondmove = false;
              moveSelect();
            }
          } else {
            issecondmove = false;
            moveSelect();
          }
        });
      }
    } else {
      moveSelect();
    }
    fileItem = tools.$('.file-item', fileList);
    allCheckbox = tools.$('.checkbox', fileList);
    function moveSelect() {
      if (Math.abs(ev.clientX - disX) > 20 || Math.abs(ev.clientY - disY) > 20) {
        if (!newDiv) {
          newDiv = document.createElement('div');
          document.body.appendChild(newDiv);
          newDiv.className = 'select-box';
        }
        console.log(newDiv, 'hi');
        newDiv.style.display = 'block';
        newDiv.style.width = Math.abs(ev.clientX - disX) + 'px';
        newDiv.style.height = Math.abs(ev.clientY - disY) + 'px';
        newDiv.style.left = Math.min(ev.clientX + 2, disX - 2) + 'px';
        newDiv.style.top = Math.min(ev.clientY + 2, disY - 2) + 'px';
        tools.each(fileItem, function (item, index) {
          if (tools.collisionRect(newDiv, item)) {
            tools.addClass(item, 'file-checked');
            tools.addClass(allCheckbox[index], 'checked');
          } else {
            tools.removeClass(item, 'file-checked');
            tools.removeClass(allCheckbox[index], 'checked');
          }
        });
        if (getCheckedFile().length == allCheckbox.length) {
          tools.addClass(checkedAll, 'checked');
        } else {
          tools.removeClass(checkedAll, 'checked');
        }
      } else {
        if (newDiv) {
          newDiv.style.display = 'none';
        }
      }
    }
  }
  function mouseUp(ev) {
    tools.removeEvent(document, 'mousemove', mouseMove);
    tools.removeEvent(document, 'mouseup', mouseUp);
    if (newDiv) {
      newDiv.style.display = 'none';
    }
    issecondmove = !issecondmove;
    if (newDiv2) {
      issecondmove = true;
      $(newDiv2).remove();
      newDiv2 = null;
      finallyMove(ev);
    } else {
      console.log(moveItem);
      if (!newDiv) {
        var pClassName = ev.target.parentNode.className;
        if (pClassName == 'nav' || pClassName == 'file-show' || pClassName == 'content clearfix') {
          tools.each(fileItem, function (item, index) {
            tools.removeClass(item, 'file-checked');
            tools.removeClass(allCheckbox[index], 'checked');
          });
          tools.removeClass(checkedAll, 'checked');
          issecondmove = false;
        }
      } else {
        $(newDiv).remove();
        newDiv = null;
      }
    }
  }
  function finallyMove(ev) {
    if (ev.target.id.indexOf('tree-menu') > -1) {
      var idArr = ev.target.id.split('_');
      var idStr = idArr[0] + '_' + idArr[1];
      var treeObj = $.fn.zTree.getZTreeObj("tree-menu");
      var treeNode = treeObj.getNodeByParam('tId', idStr, null);
      if (treeNode) {
        assignFid = treeNode.id;
        assignTreePath = treeNode.treePath;
        assignU_path = treeNode.u_path;
        assignPath = treeNode.path;
        movesubmit();
      }
    }
  }
  function _targetNode(target, name, callback) {
    var callback = callback;
    var eleName = $(target).parent()[0];
    if (eleName.nodeName == 'BODY') {
      callback(false);
    } else if (eleName.className.indexOf(name) > -1) {
      callback(eleName);
    } else {
      _targetNode(eleName, name, callback);
    }
  }
  var create = tools.$('.create')[0];
  $('.create').on('click', function () {
    $('.create_file').toggleClass('act');
  });
  $(document).on('mousedown', function () {
    if ($('.create_file').hasClass('act')) {
      $('.create_file').toggleClass('act');
    }
  });
  var fileType;
  $('#folder1').on('mousedown', function (ev) {
    ev.stopPropagation();
    $('.create_file').toggleClass('act');
    fileType = 1;
    createDoc(1);
  });
  $('#folder2').on('mousedown', function (ev) {
    ev.stopPropagation();
    $('.create_file').toggleClass('act');
    fileType = 2;
    createDoc(2);
  });
  $('#folder3').on('mousedown', function (ev) {
    ev.stopPropagation();
    $('.create_file').toggleClass('act');
    fileType = 4;
    createDoc(4);
  });
  function createDoc(type) {
    empty.style.display = 'none';
    var firstElement = fileList.firstElementChild;
    var newElement = createFileElement({
      title: '',
      id: new Date().getTime(),
      type: type,
      name: ''
    });
    fileList.insertBefore(newElement, firstElement);
    var fileTitle = $('.file-title', newElement);
    var ftext = '';
    var fileEditorHtml = ("<span class=\"file-edtor\"> <input type=\"text\" value=\"" + ftext + "\" class=\"edtor\" autofocus=\"autofocus\"></span>");
    fileTitle.css('display', 'none');
    fileTitle.parent().append(fileEditorHtml);
    var editor = $('.edtor', newElement);
    editor.focus();
    $('.file-edtor', newElement).on('mousedown', function (ev) {
      ev.stopPropagation();
    });
    $(editor).on('keyup', function (e) {
      if (e.keyCode == 13) {
        createFile();
      }
    });
    create.isCreateFile = true;
    tools.addEvent(document, 'mousedown', createFile);
  }
  function createFile(ev) {
    createOperate('新建');
    if (create.isCreateFile) {
      var firstElement = fileList.firstElementChild;
      var edtor = tools.$('.edtor', firstElement)[0];
      var value = edtor.value.trim();
      if (value === '') {
        fileList.removeChild(firstElement);
        if (fileList.innerHTML === '') {
          empty.style.display = 'block';
        }
      } else {
        var fileTitle = tools.$('.file-title', firstElement)[0];
        var fileEdtor = $('.file-edtor', firstElement);
        console.log(firstElement);
        fileTitle.style.display = 'block';
        fileTitle.innerHTML = value;
        fileEdtor.remove();
        var create_json = {
          createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
          pid: contentfileId,
          name: value,
          type: fileType,
          u_path: u_path
        };
        local_api._create('document', create_json, $.cookie('appkey'), function (res) {
          var _tree_path = tree_path + ',' + res.id;
          local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (res) {
            treeData(pid);
            if (fileType == 2) {
              showTips('ok', '新建案卷成功!');
            } else if (fileType == 1) {
              showTips('ok', '新建分类成功!');
            } else if (fileType == 4) {
              showTips('ok', '新建组成功!');
            }
          });
        });
      }
      create.isCreateFile = false;
      tools.removeEvent(document, 'mousedown', createFile);
    }
  }
  var rename = tools.$('.rename')[0];
  var isrename = false;
  tools.addEvent(rename, 'mouseup', function () {
    fileItem = tools.$('.file-item', fileList);
    allCheckbox = tools.$('.checkbox', fileList);
    createOperate('重命名');
    if (!getCheckedFile().length) {
      showTips('err', '请选择文件！');
      return;
    } else if (getCheckedFile().length > 1) {
      showTips('err', '只能对单个文件重命名！');
      return;
    } else {
      var changeFun = function (ev) {

        if (ev) {
          ev.stopPropagation();
          ev.preventDefault();
          if (ev.target.parentNode == fileEdtor) {
            return;
          }
        }
        var value = editor.val().trim();
        if (value == '') {
          showTips('err', '请输入文件名！');
        } else {
          var path = doc_path(uptree_path);
          var oldPath,
            newPath;
          if (uptype == 3) {
            oldPath = path + text;
            newPath = path + value;
          } else {
            oldPath = path;
            newPath = path.slice(0, path.lastIndexOf(text)) + value;
          }
          console.log(path);
          var handle_json = {
            type: 1,
            oldPath: oldPath,
            newPath: newPath
          };
          local_api._rename(handle_json, $.cookie('appkey'), function (han) {
            console.log(han);
            setTimeout(function () {
              return isrename = false;
            }, 2000);
            if (han.status == 0) {
              local_api._update('document', { id: upId }, { name: value }, $.cookie('appkey'), function (res) {
                if (res.status == 0) {
                  showTips('ok', '重命名成功');
                  treeData(pid);
                }
              });
            } else {
              showTips('err', han.message);
              treeData(pid);
            }
          });
        }
        tools.removeEvent(document, 'mousedown', changeFun);
      };
      var fileTitle = $('.file-checked .file-title');
      var upId = $('.file-checked .item').data().fileId;
      var uptree_path = $('.file-checked .item').data().tree_path;
      var uptype = $('.file-checked .item').data().type;
      console.log($('.file-checked .item').data());
      if ($('.file-checked .item').data().type == 0) {
        showTips('err', '无法对客户文件夹进行重命名!');
        return;
      }
      isrename = true;
      var text = fileTitle.attr('title');
      var fileEditorHtml = ("<span class=\"file-edtor\"> <input type=\"text\" value=\"" + text + "\" class=\"edtor\"></span>");
      fileTitle.css('display', 'none');
      fileTitle.parent().append(fileEditorHtml);
      var editor = $('.file-checked .edtor');
      var fileEdtor = $('.file-checked .file-edtor')[0];
      editor.select();
      $('.file-checked .file-edtor').on('mousedown', function (ev) {
        ev.stopPropagation();
      });
      editor.on('keypress', function (e) {
        if (e.keyCode == 13) {
          changeFun();
        }
      });
      tools.addEvent(document, 'mousedown', changeFun);
    }
  });
  tools.addEvent(tools.$('.nav-box')[0], 'click', function (ev) {
    console.log(tools.getTarget(ev));
    console.log(tools.getTarget(ev).parentNode);
    if (tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list')) {
      tools.each(tools.$('.nav-list.nav-current'), function (ele) {
        console.log(ele.className);
        tools.removeClass(ele, 'nav-current');
      });
      tools.addClass(tools.getTarget(ev).parentNode, 'nav-current');
    }
    console.log(tools.hasClass(tools.getTarget(ev).parentNode, 'nav-list'));
  });
  tools.addEvent(tools.$('#search')[0], 'focus', function () {
    var searchBar = tools.$('#_search_bar')[0];
    tools.addClass(searchBar, 'focus');
  });
  tools.addEvent(tools.$('#search')[0], 'blur', function () {
    var searchBar = tools.$('#_search_bar')[0];
    setTimeout(function () {
      tools.removeClass(searchBar, 'focus');
    }, 200);
  });
  $('#search').on('keypress', function (e) {
    createOperate('文件检索');
    if (e.keyCode == 13) {
      e.target.value.trim() != '' ? location.href = '/hightSearch?query=' + e.target.value.trim() : null;
    }
  });
  var isupload = false;
  $('.upload').on('click', function (ev) {
    ev.stopPropagation();
    uploadFiles();
  });
  $('.upload-file').on('click', function (ev) {
    ev.stopPropagation();
    var pNode = ev.target.parentNode;
    var ppNode = ev.target.parentNode.parentNode;
    var cNode = $('.upload-file').children().children();
    if (pNode == cNode[0] || ppNode == cNode[0]) {
      uploadFiles();
    }
  });
  var tree_address = '';
  var wlb = {
    '01': '01_履历材料',
    '02': '02_自传材料',
    '03': '03_鉴定、考核、考察、审计材料',
    '04': '04_学历、学位、专业技术和培训等材料',
    '05': '05_政审材料',
    '06': '06_参加党团的材料',
    '07': '07_表彰奖励材料',
    '08': '08_涉纪涉法处分材料',
    '09': '09_工资、任免、出国、代表大会等材料',
    '10': '10_其他供参考材料'
  }
  function uploadFiles() {
    createOperate('文件上传');
    var input = document.createElement('input');
    input.type = 'file';
    input.multiple = "multiple";
    $(input).change(function (ev) {
      console.log(this.files);
      var fileList = this.files;
      var fileIndex = uploadFileArr.length + 0;
      $('.mod-tasks .tasks-header').removeClass('result-succt').addClass('tasking-nor');
      var tArr = tree_path.split(',');
      var uploadPathArr = dataControl.getParents(docDatas, tArr[tArr.length - 1]).reverse();
      var uploadPath = '';
      uploadPathArr.forEach(function (ele) {
        uploadPath += ele.name + '/';
      });
      tree_address = uploadPath;
      Array.prototype.forEach.call(fileList, function (file, index) {
        console.log(file);
        $('.mod-tasks').show();
        var newLi = uploadHtml(0, file, fileIndex + index);
        liClick(newLi); //列表点击事件
        uploadLiArr.push(newLi); //上传文件列表
        uploadFileArr.push(file); //上传文件
        taskUl.append(newLi);
      });

      function liClick(li) {
        $(li).on('click', function (e) {
          console.log(e);
          var _thisIndex = e.currentTarget.dataset.file_id;
          console.log(_thisIndex);
          if ($(e.currentTarget).hasClass('waiting')) {
            if ($(e.target).hasClass('btn-icon')) {
              cancalIndexArr.push(parseInt(_thisIndex));
              replaceLiHtml(3, _thisIndex);
            }
          }
          if ($(e.currentTarget).hasClass('cancel')) {
            if ($(e.target).hasClass('btn-icon')) { }
          }
        });
      }

      function replaceLiHtml(type, index) {
        var file = uploadFileArr[index];
        var replaceLi = uploadHtml(type, file, index); //上传文件状态（0等待1成功2错误3取消）
        liClick(replaceLi);
        $(uploadLiArr[index], taskUl).replaceWith(replaceLi); //替换模板
        uploadLiArr.splice(index, 1, replaceLi); //数组替换新元素
      }

      function isFileExist() {
        var file = uploadFileArr[fileIndex];
        if (cancalIndexArr.indexOf(fileIndex) > -1) { //取消上传
          fileIndex++;
          isFileExist();
          return;
        }

        if (uploadFileArr.length == fileIndex) {
          $('.mod-tasks .tasks-header').removeClass('tasking-nor').addClass('result-succ');
          $('.mod-tasks .summary-wrapper .txt').text("任务已完成  " + failUpload + "项任务失败");
          $('.title-wrapper h2.title').text("任务已完成  " + failUpload + "项任务失败");
        } else {
          var scaleXVal = (fileIndex / uploadFileArr.length).toFixed(1);
          $('.mod-tasks .summary-wrapper .before').css('transform', ("scaleX(" + scaleXVal + ")"));
          $('.mod-tasks .summary-wrapper .txt').text((fileIndex + "/" + uploadFileArr.length + "项任务进行中  " + failUpload + "项任务失败"));
          $('.title-wrapper h2.title').text((fileIndex + "/" + uploadFileArr.length + "项任务进行中  " + failUpload + "项任务失败"));
        }

        if (file) { //文件开始上传
          start(file, fileIndex, function (res) {
            // console.log($(uploadLiArr[fileIndex], taskUl), fileIndex, '22');
            if (res.id) {
              replaceLiHtml(1, fileIndex); //成功
              $('.task-txt-status', uploadLiArr[fileIndex]).text('100%')
            } else {
              failUpload++
              replaceLiHtml(2, fileIndex); //失败
            }
            fileIndex++;
            if (!res.name) {
              treeData(pid);
            }
            isFileExist();
          });
        }
      }
      isFileExist();

      function start(file, index, callback) {
        get_filemd5sum(file, function (res) {
          var filename = file.name;
          function createDocAndZu(filename, callback) {
            // var first_i = filename.indexOf('【');
            // var last_i = filename.indexOf('】');
            // if (first_i > -1 && last_i > 0) {
            //   var first_name = filename.slice(first_i + 1, last_i).trim();
            //   var last_name = filename.slice(last_i + 1, filename.length).trim();
            //   var first_name_arr = first_name.split('_');
            //   first_name_arr = first_name_arr.map(function (e) { return e.trim() })

            //   var truePid = tree_path.split(',')[tree_path.split(',').length - 1]
            //   if (truePid == contentfileId) {
            //     truePid = contentfileId
            //   }
            //   var searchObj = {
            //     did: first_name_arr[0],
            //     name: first_name_arr[0] + first_name_arr[1],
            //     tree_path: '^' + tree_path,
            //     pid: truePid
            //   };
            //   local_api._get('document', searchObj, '', $.cookie('appkey'), function (existobj) {
            //     if (existobj.status == 0 && existobj.data) {  //存在
            //       if (first_name_arr[2]) {
            //         var searchObj = {
            //           name: first_name_arr[2],
            //           tree_path: '^' + existobj.data.tree_path,
            //           pid: existobj.data.id
            //         };
            //         local_api._get('document', searchObj, '', $.cookie('appkey'), function (zobj) {
            //           if (zobj.status == 0 && zobj.data) { //存在组
            //             callback(Object.assign(zobj.data, { last_name: last_name }));
            //           } else {//不存在创建组
            //             if (zobj.status == 0) {
            //               var create_json = {
            //                 name: first_name_arr[2],
            //                 type: 4,
            //                 createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
            //                 pid: existobj.data.id,
            //                 u_path: u_path
            //               };
            //               local_api._create('document', create_json, $.cookie('appkey'), function (res) {
            //                 var _tree_path = existobj.data.tree_path + ',' + res.id;
            //                 var cres = {
            //                   id: res.id,
            //                   tree_path: _tree_path,
            //                   last_name: last_name
            //                 };
            //                 local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
            //                   callback(cres);
            //                 });
            //               });
            //             } else {
            //               callback({ status: -1 })
            //             }
            //           }
            //         });
            //       } else {
            //         callback(Object.assign(existobj.data, { last_name: last_name }));
            //       }
            //     } else { //不存在不上传
            //       if (first_name_arr.length == 1) {

            //         var create_json = {
            //           name: first_name_arr[0],
            //           did: first_name_arr[0],
            //           type: 2,
            //           createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
            //           pid: truePid,
            //           u_path: u_path
            //         };
            //         local_api._create('document', create_json, $.cookie('appkey'), function (res) {
            //           var _tree_path = tree_path + ',' + res.id;
            //           var dcres = {
            //             id: res.id,
            //             tree_path: _tree_path,
            //             last_name: last_name
            //           };
            //           local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
            //             var aPro = {
            //               fid: res.id,
            //               name: first_name_arr[0],
            //               did: first_name_arr[0],
            //               u_path: u_path
            //             }
            //             local_api._create('docProp', aPro, $.cookie('appkey'), function (aproR) {
            //               callback(dcres);
            //             })
            //           });
            //         });
            //       } else {
            //         callback({ status: -1 })
            //       }

            //     }
            //   });
            // } else {

            var filenameArr = filename.split('_');
            if (filenameArr.length > 1) {
              var filterData
              if (filenameArr[0] == 'sr') {
                filterData = docDatas.filter(function (ele) {
                  return ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1 && ele.name == '私人';
                });
              } else if (filenameArr[0] == 'jt') {
                filterData = docDatas.filter(function (ele) {
                  return ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1 && ele.name == '集体';
                });
              }
              if (!filterData.length) {
                callback({ status: -1 })
                return
              }

              var docFileArr = docDatas.filter(function (ele) { return ele.did == filenameArr[1] && ele.pid == filterData[0].id })
              if (docFileArr.length) {

                var cres = {
                  id: docFileArr[0].id,
                  tree_path: docFileArr[0].tree_path,
                  last_name: filenameArr[2]
                };
                callback(cres);

              } else {
                callback({ status: -1 })
              }
            } else {
              var cres = {
                id: contentfileId,
                tree_path: tree_path,
                last_name: filename
              };
              callback(cres);
            }


            // }
          }
          createDocAndZu(filename, function (creaobj) {
            if (creaobj.status == -1) { //命名不规范上传失败或其他原因导致上传失败
              callback({})
              return;
            }
            parentAllData(function () {
              var firstname = '',
                lastname = creaobj.last_name,
                finame = '';
              var i = 0;
              if (lastname.lastIndexOf('.') > -1) {
                firstname = lastname.slice(0, lastname.lastIndexOf('.'));
                finame = lastname.slice(lastname.lastIndexOf('.'));
              } else {
                firstname = lastname;
                finame = '';
              }
              var fmd5 = res;
              if (fmd5 != -1) {
                var loadGet = function () {
                  i++;
                  var query_json = {
                    name: lastname,
                    tree_path: '^' + creaobj.tree_path,
                    type: 3
                  };
                  local_api._get('document', query_json, '', $.cookie('appkey'), function (getr) {
                    if (getr.status == 0 && getr.data) { //上传文件已存在
                      if (getr.data.f_md5 == fmd5) { //相同文件
                        callback(getr.data);
                      } else { //同名内容不同
                        lastname = firstname + i + finame;
                        loadGet();
                        if (finame == '.pdf') {
                          var oldPath = doc_path(getr.data.tree_path) + getr.data.name
                          var newPath = doc_path(getr.data.tree_path) + firstname + '99' + finame
                          var newPath2 = doc_path(getr.data.tree_path) + lastname
                          creaobj['hb'] = {
                            rename: { type: 1, oldPath: oldPath, newPath: newPath },
                            combind: { input: { 0: newPath, 1: newPath2 }, output: oldPath },
                            id: getr.data.id,
                            tree_path: getr.data.tree_path,
                            name: getr.data.name,
                            newname: firstname + '99' + finame,
                            size: getr.data.size
                          }
                        }
                      }
                    } else if (getr.status == 0 && !getr.data) { //上传文件不存在
                      creaobj.last_name = lastname;
                      renameSucc(creaobj, fmd5, file, callback);
                    }
                  });
                };
                loadGet();
              }
            });
          });
        });
      }


      function renameSucc(creaobj, fmd5, file, callback) {
        var formData = new FormData();
        formData.append(creaobj.last_name, file);
        // formData.append('path',encodeURI(doc_path(creaobj.tree_path)))
        var url = '/upload?path=' + encodeURI(doc_path(creaobj.tree_path));
        // var url = '/upload'
        var xhr = http({
          type: 'POST',
          url: url,
          // headers:{"Content-Type":"application/x-www-form-urlencoded"},
          data: formData,
          onProgress: function (event) {
            console.log(event.percent);
            $('.task-txt-status', uploadLiArr[fileIndex]).text(event.percent.toFixed(2) + '%')
            // console.log($('.task-txt-status',uploadLiArr[fileIndex]).text(event.percent+'%'), fileIndex, '23');
          },
          onSuccess: function (data) {
            console.log(data);
            data.fmd5 = fmd5;
            if (data.status == 0) {
              uploadSuccess(data, creaobj, function (res) {
                callback(res);
              });
            } else {
              callback(data);
            }
          },
          onError: function (err) {
            callback(res);
          }
        });
      }

      function uploadSuccess(data, creaobj, callback) {
        var query_json = {
          pid: creaobj.id,
          size: data.file.size,
          type: 3,
          name: data.file.filename
        };
        if (creaobj.hb) { //自动合并
          console.log(creaobj.hb)
          local_api._rename(creaobj.hb.rename, $.cookie('appkey'), function (res) {
            if (res.status == 0) {//重命名成功
              local_api._fsCombind(creaobj.hb.combind, $.cookie('appkey'), function (ress) {
                if (ress.status == 0) {//合并成功
                  var cres = {
                    id: creaobj.hb.id,
                    tree_path: creaobj.hb.tree_path
                  };
                  var _size = parseInt(creaobj.hb.size) + parseInt(data.file.size)
                  local_api._update('document', { id: creaobj.hb.id }, { size: _size }, $.cookie('appkey'), function (resss) {
                    callback(cres);
                  })

                } else {
                  local_api._update('document', { id: creaobj.hb.id }, { name: creaobj.hb.newname }, $.cookie('appkey'), function (resss) {
                    callback({})
                  })
                }
              })
            } else {
              callback({})
            }

          })

        } else {
          local_api._get('document', query_json, '', $.cookie('appkey'), function (getres) {
            if (getres.status == 0 && !getres.data) {
              var filetype = data.file.mimetype.indexOf('image') > -1 ? 'png' : 'txt';
              var truePid = creaobj.tree_path.split(',')[creaobj.tree_path.split(',').length - 1]
              if (truePid == creaobj.id) {
                truePid = creaobj.id
              }
              var create_json = {
                size: data.file.size,
                createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
                pid: truePid,
                type: 3,
                filetype: filetype,
                name: data.file.filename,
                path: '/upload/' + doc_path(creaobj.tree_path) + data.file.filename,
                f_md5: data.fmd5,
                u_path: u_path,
                ispass: 1,
                islock: 1
              };
              local_api._create('document', create_json, $.cookie('appkey'), function (res) {
                var _tree_path = creaobj.tree_path + ',' + res.id;
                var cres = {
                  id: res.id,
                  tree_path: _tree_path
                };
                local_api._update('document', { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                  callback(cres);
                });
              });
            } else if (getres.status == 0 && getres.data) {
              var cres = {
                id: getres.data.id,
                tree_path: getres.data.tree_path
              };
              callback(cres);
            }
          });
        }

      }
    });
    input.click();
  }
  $('.delete').on('click', function (ev) {
    console.log(getCheckedFile());
    var selectData = getCheckedFile();
    if (!getCheckedFile().length) {
      showTips('err', '请选择文件或档案！');
      return;
    }
    var treeArr = [];
    var nodelete = [];
    var typeobj = {};
    var typeArr = [];
    var deleteObj = [];
    selectData.forEach(function (ele) {
      var type = $('.item', ele).data().type;
      var dobj = {};
      if (type != 0) {
        treeArr.push('^' + $('.item', ele).data().tree_path);
        if (type == 3) {
          dobj.tree_path = '^' + $('.item', ele).data().tree_path;
          dobj.path = doc_path($('.item', ele).data().tree_path) + $('.item .file-title', ele).text();
        } else {
          dobj.tree_path = '^' + $('.item', ele).data().tree_path;
          dobj.path = doc_path($('.item', ele).data().tree_path);
        }
        deleteObj.push(dobj);
      } else {
        nodelete.push('^' + $('.item', ele).data().tree_path);
      }
      if (!typeobj[type]) {
        typeobj[type] = 1;
        var typeStr = type == 1 ? '分类' : type == 2 ? '案卷' : type == 3 ? '文件' : '';
        typeArr.push(typeStr);
      }
    });
    // debugger;
    createOperate('文件删除');
    console.log(deleteObj);
    if (nodelete.length > 0) {
      showTips('err', '无法对客户文件夹进行删除操作');
    }
    var confirmStr = ("确定要删除" + (selectData.length > 1 ? '这些' : '这个') + typeArr.join('/') + "？");
    if (treeArr.length) {
      if (confirm(confirmStr)) {
        deleteObj.forEach(function (ele, i) {
          local_api._fsDelete({ curPath: ele.path }, $.cookie('appkey'), function (res) {
            if (res.status == 0) {
              local_api._delete('document', { tree_path: ele.tree_path }, $.cookie('appkey'), function (dres) {
                local_api._delete('docProp', { tree_path: ele.tree_path }, $.cookie('appkey'), function (dpres) {
                  if (i == deleteObj.length - 1) {
                    treeData(pid);
                    showTips('ok', ("删除" + typeArr.join('/') + "成功!"));
                  }
                })
              });
            }
          });
        });
      }
    }
  });
  $('.logout').on('mousedown', function (ev) {
    ev.stopPropagation();
    location.href = '/logout';
  });
  $('#showList').click(function () {
    $('.mod-tasks').toggleClass('expand');
  });
  $('#hideList').click(function () {
    $('.mod-tasks').hide();
    uploadLiArr = [];
    uploadFileArr = [];
    failUpload = 0
    taskUl.empty();
    fileIndex = 0;
  });
  $('#divCombind').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    buttons: {
      "确定": function () {
        combindSubmit();
      },
      "取消": function () {
        $('#divCombind').dialog("close");
      }
    }
  });
  $('#combind').on('click', function () {
    $('#divCombind').dialog("open");
  });
  function combindSubmit() {
    var obj = {
      handle_json: {
        input: {},
        output: ''
      },
      update: {
        path: '',
        name: '',
        size: ''
      },
      query: { id: '' },
      delete_j: { id: '' }
    };
    var objData = [];
    var pdfData = getCheckedFile();
    if (pdfData.length) {
      pdfData.forEach(function (ele) {
        var dataSet = $('.item', ele).data();
        dataSet.name = $('.item .file-title', ele).text();
        dataSet.size = backFileSize($('.item ul>li:nth-child(1)', ele).text());
        objData.push(dataSet);
      });
    } else {
      showTips('err', '请选择pdf文件进行合并！');
    }
    if (!objData.length) {
      showTips('err', '请选择pdf文件进行合并！');
      return;
    }
    var _size = 0;
    var deleteArrId = [];
    objData.forEach(function (ele, i) {
      _size += ele.size;
      obj.handle_json.input[i] = doc_path(ele.tree_path) + ele.name;
      if (i == 0) {
        obj.query['id'] = ele.fileId;
        obj.update['name'] = $('#renameCombind').val().trim() + '.pdf';
        obj.update['path'] = '/upload/' + doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf';
        obj.handle_json.output = doc_path(ele.tree_path) + $('#renameCombind').val().trim() + '.pdf';
      } else {
        deleteArrId.push(ele.fileId);
      }
    });
    obj.delete_j['id'] = deleteArrId.join('|');
    obj.update['size'] = _size;
    createOperate('合并文件');
    if (confirm('确定合并已选择的文件')) {
      local_api._fsCombind(obj.handle_json, $.cookie('appkey'), function (res) {
        if (res.status == 0) {
          local_api._update('document', obj.query, obj.update, $.cookie('appkey'), function (res) {
            local_api._delete('document', obj.delete_j, $.cookie('appkey'), function (res) {
              showTips('ok', '合并成功!');
              $('#divCombind').dialog("close");
              renderFilesPathTree(contentfileId);
            });
          });
        } else {
          showTips('err', '合并失败!');
          $('#divCombind').dialog("close");
        }
      });
    } else {
      $('#divCombind').dialog("close");
    }
  }
  $('#divDocSort').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    buttons: {
      "确定": function () {
        sortSubmit();
      },
      "取消": function () {
        $('#divDocSort').dialog("close");
      }
    }
  });
  $('#sort').on('click', function () {
    changeSort();
    $('#divDocSort').dialog("open");
  });
  function sortSubmit() {
    treeData(pid);
    $('#divDocSort').dialog("close");
  }
  function changeSort() {
    var sortArr = sortString.split('|');
    sortArr.forEach(function (ele) {
      var _ele = ele;
      if (ele.indexOf('-') > -1) {
        _ele = ele.slice(1, ele.length);
      }
      var id = '__' + _ele;
      $(("#" + id)).prop('checked', true);
      var text;
      if (ele.indexOf('-') > -1) {
        text = $('label', $(("#" + id)).parent()).attr('value') + '↑';
      } else {
        text = $('label', $(("#" + id)).parent()).attr('value') + '↓';
      }
      $('label', $(("#" + id)).parent()).text(text);
    });
    var nocheck = $("#divDocSort input:not(:checked) ").not('input[name="sort"]');
    var sortValue = $("#divDocSort input:radio:checked").val();
    nocheck.each(function (i, ele) {
      var text;
      if (sortValue == 2) {
        text = $('label', $(ele).parent()).attr('value') + '↓';
      } else if (sortValue == 1) {
        text = $('label', $(ele).parent()).attr('value') + '↑';
      }
      $('label', $(ele).parent()).text(text);
    });
  }
  $('#divDocSort input').change(function () {
    var sortArr = sortString.split('|');
    var sortValue = $("#divDocSort input:radio:checked").val();
    if ($(this).attr('name') !== 'sort') {
      if ($(this).attr('checked')) {
        if (sortValue == 2) {
          sortArr.push($(this).val());
        } else if (sortValue == 1) {
          sortArr.push('-' + $(this).val());
        }
      } else {
        var index = sortArr.indexOf($(this).val()) > -1 ? sortArr.indexOf($(this).val()) : sortArr.indexOf('-' + $(this).val());
        console.log(index);
        sortArr.splice(index, 1);
      }
    }
    sortString = sortArr.join('|');
    localStorage.setItem('sort', sortString)
    console.log(sortArr, sortString, 'dd');
    changeSort();
  });

  $('#divDocImport').dialog({
    width: 400,
    maxHeight: 400,
    autoOpen: false,
    title: '选择分类',
    buttons: {
      "确定": function () {
        console.log($('#DocImport').val())
        var importVal = $('#DocImport').val();

        var input = document.createElement('input');
        input.type = 'file';
        $(input).change(function (e) {
          var files = $(this)[0].files;
          if (importVal == 1) {
            oneExc(files);
          } else if (importVal == 2) {
            twoExc(files)
          }
          $('#divDocImport').dialog("close");
        });
        input.click();

      },
      "取消": function () {
        $('#divDocImport').dialog("close");
      }
    }
  });
  //导入台账
  $('#export').click(function () {
    $('#divDocImport').dialog("open");

  });
  //导入属性
  $('#exportPorp').click(function () {
    var input = document.createElement('input');
    input.type = 'file';
    $(input).change(function (e) {
      var files = $(this)[0].files;
    });
    input.click();
  });

  //登记备案合同
  var oneExc = function (files) {
    // createOperate('导入台账');
    var reader = new FileReader();
    console.log(files[0].name, 'filesname')

    reader.readAsBinaryString(files[0]);
    reader.onload = function (evt) {
      var data = evt.target.result;
      var wb = XLSX.read(data, { type: 'binary' });
      var SheetNamesArr = wb['SheetNames'];
      var importobj = {};
      var filterData = docDatas.filter(function (ele) {
        return ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1;
      });
      SheetNamesArr.forEach(function (ele, i) {
        filterData.forEach(function (fil) {
          if (ele.trim() == fil.name) {
            console.log(fil);
            importobj[ele] = {
              // 'tree_path': fil.tree_path,
              // 'id': fil.id,
              createArr: [],
              createDoc: []
            };
            if (files[0].name.indexOf('私人') > -1) {
              // console.log()
              var srA = filterData.filter(function (se) { return se.pid == fil.id && se.name == '私人' })
              importobj[ele]['id'] = srA[0].id
              importobj[ele]['tree_path'] = srA[0].tree_path
            } else if (files[0].name.indexOf('集体') > -1) {
              var jtR = filterData.filter(function (je) { return je.pid == fil.id && je.name == '集体' })
              console.log(jtR, 'jtr')
              importobj[ele]['id'] = jtR[0].id
              importobj[ele]['tree_path'] = jtR[0].tree_path
            }
          }
        });
      });
      for (var o in importobj) {
        getimportData(o, importobj[o].id, importobj[o].tree_path)
      }
      console.log(importobj, '');

      function getimportData(name, id, i_tree_path) {
        var xlsData = wb.Sheets[name];
        var xlsDataLength = getIndex(xlsData['!ref']);
        var letter = [];
        for (var x in xlsData) {
          var _x = x.split('');
          var strArr = [];
          _x.forEach(function (ele) {
            /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
          });
          if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
            letter.push(strArr.join(''));
        }
        var createArr = [];
        var createDoc = [];
        // var colums = ['createdAt', 'saveExpireIn', 'page', 'num', 'did', 'name', '具体地址', '位置', '社区单位编号', '是否建档', '经营状态'];
        for (var i = 3; i <= xlsDataLength; i++) {
          var obj = { u_path: u_path }; //新建案卷属性
          var create_json = { //新建案卷
            createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
            pid: id,
            type: 2,
            u_path: u_path
          };
          letter.forEach(function (ele) {
            if (xlsData[ele + i]) {
              var propName = xlsData[ele + 2] ? xlsData[ele + 2].v : xlsData[ele + 3] ? xlsData[ele + 3].v : '';
              // console.log(xlsData[ele + i].v)
              switch (propName) {
                case '归档号':
                  propName = 'did';
                  break;
              }
              if (propName == '出租方') {
                create_json.name = xlsData[ele + i].v;
              }
              if (propName == 'did') {
                create_json.did = xlsData[ele + i].v;
              }
              if (allColumns.indexOf(propName) > -1) {
                if (propName == '位置') {
                  var pStr = xlsData[ele + i].v;
                  var pStrArr = pStr.split('_');
                  if (pStrArr.length == 3) {
                    obj['qnum'] = 1;
                    obj['lnum'] = pStrArr[0];
                    obj['ce'] = pStrArr[1];
                    obj['onum'] = pStrArr[2];
                    // obj['cnum'] = pStrArr[4];
                    // obj['bnum'] = pStrArr[5];
                  }
                } else {
                  obj[propName] = xlsData[ele + i].v;
                }
              }
            }
          });
          create_json.name ? createDoc.push(create_json) : '';
          create_json.name ? createArr.push(obj) : '';
        }

        console.log(createDoc, createArr);

        var startI = 0;
        var start = function () {
          var d = createDoc[startI]
          var p = createArr[startI]
          startI++;
          if (d) {
            // start()
            var cd = Object.assign({}, d)
            delete cd.createdAt
            delete cd.tree_path
            // cd.name = cd.name
            local_api._get('document', cd, "", $.cookie("appkey"), function (res) {
              console.log(cd, res.data, res.data ? true : false)
              if (res.status == 0 && !res.data) {
                // d.name = d.name
                d.ispass = 1
                d.islock = 1
                // console.log(d, p, 'ddf______________')
                // start()
                local_api._create('document', d, $.cookie('appkey'), function (res) {
                  var _tree_path = i_tree_path + ',' + res.id;
                  var fid = res.id;
                  local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                    var docJson = p;
                    docJson.fid = fid;
                    docJson.tree_path = _tree_path;
                    local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
                      start()
                    });
                  });
                });
              } else {
                start()
              }
            })
          } else {
            treeData(pid);
            showTips('ok', '导入' + name + '成功');
          }
        }
        start()


        return {
          createDoc: createDoc,
          createArr: createArr
        };
      }
    };
  };

  //编码卡资料
  var twoExc = function (files) {
    // createOperate('导入台账');
    var reader = new FileReader();
    reader.readAsBinaryString(files[0]);
    reader.onload = function (evt) {
      var data = evt.target.result;
      var wb = XLSX.read(data, { type: 'binary' });
      var SheetNamesArr = wb['SheetNames'];
      var importobj = {};
      var filterData = docDatas.filter(function (ele) {
        return ele.type == 1 && ele.tree_path.indexOf(tree_path) > -1;
      });
      console.log(filterData, 'fileData')
      SheetNamesArr.forEach(function (ele, i) {
        importobj[ele] = {
          // 'tree_path': fil.tree_path,
          // 'id': fil.id,
          createArr: [],
          createDoc: []
        };

        if (files[0].name.indexOf('私人') > -1) {
          var srA = filterData.filter(function (se) { return se.name == '私人' })
          importobj[ele]['id'] = srA[0].id
          importobj[ele]['tree_path'] = srA[0].tree_path
        } else if (files[0].name.indexOf('集体') > -1) {
          var jtR = filterData.filter(function (je) { return je.name == '集体' })
          // console.log(jtR, 'jtr')
          importobj[ele]['id'] = jtR[0].id
          importobj[ele]['tree_path'] = jtR[0].tree_path
        }
      });
      for (var o in importobj) {
        getimportData(o, importobj[o].id, importobj[o].tree_path)
      }
      console.log(importobj, '');

      function getimportData(name, id, i_tree_path) {
        var xlsData = wb.Sheets[name];
        var xlsDataLength = getIndex(xlsData['!ref']);
        var letter = [];
        for (var x in xlsData) {
          var _x = x.split('');
          var strArr = [];
          _x.forEach(function (ele) {
            /^[A-Z]+$/.test(ele) ? strArr.push(ele) : null;
          });
          if (strArr.join('') && letter.indexOf(strArr.join('')) == -1)
            letter.push(strArr.join(''));
        }
        var createArr = [];
        var createDoc = [];
        // var colums = ['createdAt', 'saveExpireIn', 'page', 'num', 'did', 'name', '具体地址', '位置', '社区单位编号', '是否建档', '经营状态'];
        for (var i = 4; i <= xlsDataLength; i++) {
          var obj = { u_path: u_path }; //新建案卷属性
          var create_json = { //新建案卷
            createdAt: new Date().format('yyyy-MM-dd hh:mm:ss'),
            pid: id,
            type: 2,
            u_path: u_path
          };
          letter.forEach(function (ele) {
            if (xlsData[ele + i]) {
              var propName = xlsData[ele + 2] ? xlsData[ele + 2].v : xlsData[ele + 3] ? xlsData[ele + 3].v : '';
              // console.log(xlsData[ele + i].v)
              switch (propName) {
                case '编码卡号':
                  propName = 'did';
                  break;
                case '卡号':
                  propName = 'did';
                  break;
              }
              if (propName == '产权人名称') {
                create_json.name = xlsData[ele + i].v;
              }
              if (propName == 'did') {
                create_json.did = xlsData[ele + i].v;
              }
              if (allColumns.indexOf(propName) > -1) {
                if (propName == '位置') {
                  var pStr = xlsData[ele + i].v;
                  var pStrArr = pStr.split('_');
                  if (pStrArr.length == 3) {
                    obj['qnum'] = 1;
                    obj['lnum'] = pStrArr[0];
                    obj['ce'] = pStrArr[1];
                    obj['onum'] = pStrArr[2];
                    // obj['cnum'] = pStrArr[4];
                    // obj['bnum'] = pStrArr[5];
                  }
                } else {
                  obj[propName] = xlsData[ele + i].v;
                }
              }
            }
          });
          create_json.name ? createDoc.push(create_json) : '';
          create_json.name ? createArr.push(obj) : '';
        }

        console.log(createDoc, createArr);

        var startI = 0;
        var start = function () {
          var d = createDoc[startI]
          var p = createArr[startI]
          startI++;
          if (d) {
            // start()
            var cd = Object.assign({}, d)
            delete cd.createdAt
            delete cd.tree_path
            // cd.name = cd.name
            local_api._get('document', cd, "", $.cookie("appkey"), function (res) {
              console.log(cd, res.data, res.data ? true : false)
              if (res.status == 0 && !res.data) {
                // d.name = d.name
                d.ispass = 1
                d.islock = 1
                // console.log(d, p, 'ddf______________')
                // start()
                local_api._create('document', d, $.cookie('appkey'), function (res) {
                  var _tree_path = i_tree_path + ',' + res.id;
                  var fid = res.id;
                  local_api._update("document", { id: res.id }, { tree_path: _tree_path }, $.cookie('appkey'), function (up) {
                    var docJson = p;
                    docJson.fid = fid;
                    docJson.tree_path = _tree_path;
                    local_api._create('docProp', docJson, $.cookie('appkey'), function (docP) {
                      start()
                    });
                  });
                });
              } else {
                start()
              }
            })
          } else {
            treeData(pid);
            showTips('ok', '导入' + name + '成功');
          }
        }
        start()

      }
    };
  }
}
;
function doc_path(doc_paths) {
  var tArr = doc_paths.split(',').filter(function (e) {
    return e != '';
  });
  var uploadPath = '';
  tArr.forEach(function (ele) {
    docDatas.forEach(function (e) {
      if (ele == e.id) {
        if (e.type == 2) {
          uploadPath += (e.did || '') + e.name + '/';
        } else {
          uploadPath += e.name + '/';
        }

      }
    });
  });
  if (uploadPath == '') { //防止删除整个目录
    uploadPath = 'nodelete/'
  }
  return uploadPath;
}
window.doc_path = doc_path
function getIndex(refs) {
  var refArr = refs.split('');
  var _i = 0;
  var _index = '';
  for (var i = refArr.length - 1; i > 0; i--) {
    if (/^[A-Z]+$/.test(refArr[i])) {
      _i = i + 1;
      break;
    }
  }
  for (var i = _i; i < refArr.length; i++) {
    _index += refArr[i];
  }
  return parseInt(_index);
}

function getAllColumns() {
  allColumns = ['位置','产权人名称']
  local_api.getTableColumns('docProp', $.cookie('appkey'), function (colum) {
    if (!colum.err) {
      console.log(colum)
      colum.row.forEach(function (ele) {
        if (ele.file_id != 'tree_path') {
          allColumns.push(ele.Field)
        }

      })
    }
  })
}