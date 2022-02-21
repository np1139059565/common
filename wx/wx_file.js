//wxfile://usr
const USER_DIR = wx.env.USER_DATA_PATH,
    FSM = wx.getFileSystemManager(),
    MODULE_MLOG = require("mlog.js"),
    f_err=MODULE_MLOG.f_static_err,
    f_info=MODULE_MLOG.f_static_info

/**
 * 
 * 类型 属性		默认值	必填	说明
 * @param {string} file_path 是	要追加内容的文件路径 (本地路径)
 * @param {string/ArrayBuffer} data 是	要追加的文本或二进制数据
 * @param {*} is_add false
 * @param {string} encoding utf8	否	指定写入文件的字符编码
 * 合法值	说明
 * ascii	
 * base64	
 * binary	
 * hex	
 * ucs2	以小端序读取
 * ucs-2	以小端序读取
 * utf16le	以小端序读取
 * utf-16le	以小端序读取
 * utf-8	
 * utf8	
 * latin1	
 * success	function		否	接口调用成功的回调函数
 * fail	function		否	接口调用失败的回调函数
 * complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
 * @returns 
 */
 const f_writefile=(file_path, data, is_add=false, encoding="utf8",is_log=false)=>{
    //check parent path
    const parent_path = log_path.substr(0, log_path.lastIndexOf("/"))
    if (f_is_dir(parent_path) || f_mkdir(parent_path)) {
        //log...
        if(!is_log){
            f_info("write file",file_path,is_add,encoding,data.length)
        }
        FSM[f_is_exist(file_path)&&is_add?"appendFileSync":"writeFileSync"](file_path,data,encoding)
    }else throw new TypeError("check parent path is err!")
}



/**
 * 
 * @param {*} path
 * @returns 
 */
const f_to_absolute_path = (path="") => (path.startsWith(USER_DIR)||path.startsWith("/") ? "" : (USER_DIR + "/")) + path
/**
 * 
 * @param {*} path 
 * @returns 
 */
const f_is_exist = (path) => {
    try{
        return FSM.accessSync(path) == null
    }catch(e){
        //垃圾api如果文件不存在则会报错，所以必须用try包着
        if (e.message.indexOf("no such file or directory")==-1) {
            f_err(e)
        }
        return false
    }
}
/**
 * 
 * @param {*} path 
 * @returns 
 */
const f_mkdir = (path) => FSM.mkdirSync(path, true) == null

/**
 * 
 * @param {*} path 
 * @returns 
 */
const f_is_dir=(path) =>{
    const file_stat=f_get_stat(path)
    return file_stat!=null&&file_stat.isDirectory()
}
/**
 *
 * @param path
 * @returns {void|*} Stats:
 * .mode:
 * .size:
 * .lastAccessedTime:
 * .lastModifiedTime:
 * .isDirectory() 判断当前文件是否一个目录
 * .isFile() 判断当前文件是否一个文件
 */
 const f_get_stat=(path)=>{
    if(f_is_exist(path)){
        return FSM.statSync(f_to_absolute_path(path), false)
    }else return null
 }





function f_unzip_sync(zipPath, dstPath, callback) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        zipPath = f_to_absolute_path(zipPath)
        //check dst path
        if (false == dstPath.endsWith("/")) {
            dstPath += "/"
        }
        // const jszip=new JSZIP()
        // const iconv=require("../dsf/iconv-lite/index")
        // jszip.loadAsync(readFile(zipPath,"binary"),{decodeFileName: (arraybuffer)=>{
        //     return String.fromCharCode.apply(null, new Uint16Array(arraybuffer));
        //     }}).then(res=>{
        //     //res:{a.txt:{dir:false}}
        //     Object.keys(res.files).map(fname=>{
        //         const dstPath1=dstPath+fname
        //         if(res.files[fname].dir==false){
        //             res.file(res.files[fname].name).async("arraybuffer").then(conter=>{
        //                 writeFile(dstPath1,conter,false,"binary")
        //             })
        //         }
        //     })
        // })

        FSM.unzip({
            zipFilePath: zipPath,
            targetPath: dstPath,
            complete(a, b) {
            },
            success(res) {
                //res:{errMsg:unzip:ok}
                mcallback(res.errMsg.endsWith(":ok"))
            }
        })
    } catch (e) {
        f_err(e)
    }
}

/**
 *
 * @param dirPath /:代码包文件 ../languageget/miniprogram
 */
function f_readdir(dirPath) {
    try {
        dirPath = f_to_absolute_path(dirPath)
        f_info("read dir", dirPath)
        return f_is_dir(dirPath) ? FSM.readdirSync(dirPath) : []//[p1,p2]
    } catch (e) {
        f_err("read dir is err", e)
        return []
    }
}

/**
 *
 * @param filePath
 * @param encoding binary
 * @returns {string|ArrayBuffer|void}
 */
function f_readfile(filePath, encoding) {
    try {
        filePath = f_to_absolute_path(filePath)
        f_info("read file", filePath)
        return FSM.readFileSync(filePath, encoding != null ? encoding : "UTF-8")
    } catch (e) {
        f_err("read file is err", e)
        return (encoding != null ? null : "")
    }
}









function f_remove_path(path) {
    try {
        path = f_to_absolute_path(path)
        const pinfo = f_get_stat(path)
        if (pinfo != null) {
            if (pinfo.isDirectory()) {
                f_info("rm dir:" + path)
                return FSM.rmdirSync(path, true) == null
            } else {
                f_info("rm file:" + path)
                return FSM.unlinkSync(path) == null
            }
        } else {
            f_info("rm is success:path is not find.")
            return true
        }
    } catch (e) {
        f_err(e)
        return false
    }
}



function copyFile(srcFPath, dstFPath) {
    try {
        srcFPath = f_to_absolute_path(srcFPath)
        const srcFileInfo = f_get_stat(srcFPath)
        //check src file is find
        if (srcFileInfo != null && srcFileInfo.isFile()) {
            if (dstFPath.endsWith("/")) {
                dstFPath = dstFPath.substr(0, dstFPath.length - 1)
            }
            //check dst path
            const dstFileInfo = f_get_stat(dstFPath)
            if (dstFileInfo != null && dstFileInfo.isDirectory()) {
                f_err("dst path is dir", dstFPath)
                return false
            }
            //copy file
            const code = FSM.copyFileSync(srcFPath, dstFPath) == null
            f_info("copy file " + srcFPath, dstFPath, code)
            if (!code) {
                f_err("copy file is fail", srcFPath, dstFPath)
            }
            return code
        } else {
            f_err("src path is not file")
            return false
        }
    } catch (e) {
        f_err(e)
        return false
    }
}

/**
 *
 * @param srcPath wxfile://usr/tmp/dgg3efh573hj73js5sc5/
 * @param dstPath wxfile://usr/languageget/
 */
function copyDir(srcPath, dstPath, upProgressEvent) {
    try {
        srcPath = f_to_absolute_path(srcPath)
        // check dst path
        if (!dstPath.endsWith("/")) {
            dstPath += "/"
        }
        //check is exist
        if (f_is_exist(srcPath)) {
            //check is dir
            if (f_is_dir(srcPath)) {
                // check src path
                if (!srcPath.endsWith("/")) {
                    srcPath += "/"
                }
                const pName = srcPath.split("/").reverse()[1]
                const cNameArr = readDir(srcPath)
                return cNameArr.map((cname, i) => {
                    //up progress
                    if (typeof upProgressEvent == "function") {
                        upProgressEvent(cNameArr.length, i)
                    }
                    return copyDir(srcPath + cname, dstPath + pName, upProgressEvent)
                }).filter(code => code).length == cNameArr.length
            } else {
                return copyFile(srcPath, dstPath + srcPath.split("/").reverse()[0])
            }
        } else {
            f_err("not find src path", srcPath)
            return false
        }
    } catch (e) {
        f_err(e)
        return false
    }
}

function downUrlFileSync(url, localPath, callback) {
    const mcallback = (code) => {
        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        f_remove_path(localPath)
        //file max 200MB
        wx.downloadFile({
            url: url,
            complete(a, b) {
                try {
                    var code = a.errMsg.endsWith(":ok")
                    if (!code) {
                        f_err(a.errMsg)
                    }
                } catch (e) {
                    f_err(e)
                }
            },
            success(res) {
                //res:{statusCode,tempFilePath}
                const code = res.statusCode === 200
                if (code) {
                    //copy cache to local
                    f_info("download url file is " + code, url, res)
                    mcallback(copyFile(res.tempFilePath, localPath))
                } else {
                    f_err("download url file to cache is err.", url)
                    mcallback(code)
                }
            }
        })
    } catch (e) {
        f_err(e)
        mcallback(false)
    }
}


module.exports.f_static_writefile = f_writefile
module.exports.f_static_mkdir = f_mkdir
module.exports.f_static_downUrlFileSync = downUrlFileSync

module.exports.f_static_rmpath = f_remove_path

module.exports.f_static_unzip_sync = f_unzip_sync
module.exports.f_static_copyFile = copyFile
module.exports.f_static_copyDir = copyDir

module.exports.f_static_get_absolute_path = f_to_absolute_path
module.exports.f_static_readdir = f_readdir
module.exports.f_static_readfile = f_readfile
module.exports.f_static_getstat = f_get_stat
module.exports.f_static_isexist = f_is_exist
module.exports.f_static_f_isdir = f_is_dir
