const YUN_ID="yfwq1-4nvjm"
const YUN_FILE_ID="cloud://"+YUN_ID+".7966-yfwq1-4nvjm-1302064482/"
var mfile= require("wx/wx_file.js")

var mlog = require("mlog.js")

/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
function info(i1,i2,i3,i4) {
    try {
        if (mlog.info == null) {
            console.info("myun",i1,i2,i3,i4)
            mlog.f_wx_static_show_toast("myun:"+mlog.f_static_get_msg(i1,i2,i3,i4))
        } else {
            mlog.info("myun", i1, i2, i3, i4)
        }
    } catch (e) {
        console.error("myun",e)
        mlog.f_wx_static_show_modal("myun:"+mlog.f_static_get_msg(e))
    }
}

function err(e1, e2, e3,e4) {
    try {
        if (mlog.err == null) {
            console.error("myun",e1, e2, e3,e4)
            mlog.f_wx_static_show_modal("myun:"+mlog.f_static_get_msg(e1, e2, e3,e4))
        } else mlog.err("myun", e1,e2,e3,e4)
    } catch (e) {
        console.error("myun",e)
        mlog.f_wx_static_show_modal("myun:"+mlog.f_static_get_msg(e))
    }
}

module.exports.static_init = (c_mlog,c_mfile) => {
    try {
        if (c_mlog != null) {
            mlog = c_mlog
        }
        info("init myun...")

        if (c_mfile != null) {
            mfile = c_mfile
        }
        if (!wx.cloud) {
            err("请使用 2.2.3 或以上的基础库以使用云能力")
        } else {
            //init yun
            wx.cloud.init({
                // env 参数说明：
                //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
                //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
                //   如不填则使用默认环境（第一个创建的环境）
                env: YUN_ID,
                traceUser: true,//将访问用户记录到云控制台的用户访问中
            })
            module.exports.runEventSync = runEvent
            module.exports.downloadFileSync=downloadFile
            module.exports.uploadFileSync=uploadFile
            module.exports.delFileSync=delFile
        }
    } catch (e) {
        err(e)
    }
}
/**
 *
 * @param eventName 云函数名 对应 ../appname/cloudfunctions/*
 * @param data 合并入云函数的event
 * @param callback
 */
function runEvent(eventName, data, callback) {
    const mcallback = (code1,data1) => {
        if (typeof callback == "function") {
            callback(code1,data1)
        }
    }
    try {
        info("runEvent",eventName,JSON.stringify(data))
        wx.cloud.callFunction({
            name: eventName,//云函数名 对应 ../appname/cloudfunctions/*
            data: data,//合并入云函数的event 如果包含大数据字段（建议临界值 256KB）建议使用 wx.cloud.CDN 标记大数据字段
            complete: (r) => {
                //errMsg: "cloud.callFunction:ok"
                // requestID: "a8c535b2-6b46-11eb-8a7e-525400549ebe"
                // result:
                //  data: [{…}]
                //  errMsg: "collection.get:ok"
                try {
                    var code = r.errMsg.endsWith(":ok")
                    if (!code) {
                        err(r.errMsg)
                    }
                    mcallback(code, r)
                } catch (e) {
                    err(e)
                    mcallback(false)
                }
            }
        })
    } catch (e) {
        err(e)
        mcallback(false)
    }
}

/**
 *
 * @param yunPath image/...
 * @param localPath wxfile://usr/...
 * @param callback
 */
function downloadFile(yunPath,localPath,callback){
    const mcallback = (code1) => {
        if (typeof callback == "function") {
            callback(code1)
        }
    }
    try{
        wx.cloud.downloadFile({
            fileID:YUN_FILE_ID+ yunPath,
            complete: (res) => {
                try {
                    const code = res.errMsg.endsWith(":ok")
                    if (code) {
                        info("down yun file",res.tempFilePath)
                        //copy cache to local
                        const parentPath = localPath.substr(0, localPath.lastIndexOf("/"))
                        if (mfile.f_static_isDir(parentPath)== false){
                            mfile.f_static_mkDir(parentPath)
                        }
                        const ccode = mfile.f_static_copyFile(res.tempFilePath, localPath)
                        mcallback(ccode)
                    }else{
                        err("download yun file to cache is err.",yunPath)
                        mcallback(false)
                    }
                } catch (e) {
                    err(e,yunPath)
                    mcallback(false)
                }
            }
        })
    }catch (e){
        err(e)
        mcallback(false)
    }
}
function uploadFile(localPath,yunPath,callback){
    const mcallback = (code1) => {
        if (typeof callback == "function") {
            callback(code1)
        }
    }
    try{
        wx.cloud.uploadFile({
            filePath:localPath,
            cloudPath: yunPath,
            complete: (res) => {
                try {
                    const code = res.errMsg.endsWith(":ok")
                    if (code) {
                        info("up file to yun",res)
                    }else{
                        err("up file to yun is err.",yunPath)
                    }
                    mcallback(code)
                } catch (e) {
                    err(e,yunPath)
                    mcallback(false)
                }
            }
        })
    }catch (e){
        err(e)
        mcallback(false)
    }
}
function delFile(yunPathArr,callback){
    const mcallback = (code1) => {
        if (typeof callback == "function") {
            callback(code1)
        }
    }
    try{
        wx.cloud.deleteFile({
            fileList:yunPathArr.map(ypath=>YUN_FILE_ID+ypath),
            complete: (res) => {
                try {
                    const code = res.errMsg.endsWith(":ok")&&res.fileList.filter(fsta=>fsta.status==0).length==res.fileList.length
                    if (code) {
                        info("del yun file",res)
                    }else{
                        err("del yun file is err.",res)
                    }
                    mcallback(code)
                } catch (e) {
                    err(e,yunPathArr)
                    mcallback(false)
                }
            }
        })
    }catch (e){
        err(e)
        mcallback(false)
    }
}

