const MODULE_MFILE = require("wx_file.js"),
    LOG_TYPES = {
        DEBUG: "DEBUG",
        INFO: "INFO"
    },
    INFO_TYPES = {
        ERROR: "ERROR",
        INFO: "INFO"
    }

var log_type = LOG_TYPES.DEBUG


/**
 * 
 * @param  {...any} args 
 * @returns 
 */
const f_err = (...args) => f_info(args.concat(INFO_TYPES.ERROR))
/**
 * 
 * @param  {...any} args 
 */
function f_info(...args) {
    try {
        //弥补不定参数调用不定参数的缺陷
        if(args instanceof Array&&args[0] instanceof Array&&args.length==1){
            args[0].map((v,i)=>args.splice(i,i>0?0:1,v))
        }
        const info_type = INFO_TYPES[args[args.length-1]]!=null?args.pop():INFO_TYPES.INFO
        const msg = args.map(o=>f_to_str(o)).join(",").replaceAll(/,,/g,",")
        //check is log type
        if (log_type == LOG_TYPES.DEBUG) {
            //write to conctol
            console[info_type.toLowerCase()](info_type, msg)
        } else {
            f_show_toast(msg)
            //write to log file
            const time_str = new Date().toJSON()
            const log_path = MODULE_MFILE.f_static_get_absolute_path("MODULE_MLOG/" + time_str.split("T")[0] + ".MODULE_MLOG")    
            MODULE_MFILE.f_static_writefile(log_path,time_str+" "+info_type + ":\r\n" + msg + "\r\n",true,"utf8",false)
        }
    } catch (e) {
        f_show_loading(f_to_str(e))
    }
}
/**
 * 
 * @param {object} o 
 * @returns 
 */
function f_to_str(o) {
    if (o == null) {
        return ""
    } else if (o instanceof TypeError || o.stack != null) {
        return o.stack
    } else if (o instanceof Error || o.errMsg != null || o.message != null) {//yun err
        return o.errMsg || o.message
    } else {
        return o
    }
}

/**
 * 
 * @param {string} title 
 * @param {object} options 
 * 	属性	类型	默认值	必填	说明	最低版本
 *  title	string		是	提示的内容	
 *  icon	string	success	否	图标	
 *      合法值	说明
 *      success	显示成功图标，此时 title 文本最多显示 7 个汉字长度
 *      error	显示失败图标，此时 title 文本最多显示 7 个汉字长度
 *      loading	显示加载图标，此时 title 文本最多显示 7 个汉字长度
 *      none	不显示图标，此时 title 文本最多可显示两行，1.9.0及以上版本支持
 *  image	string		否	自定义图标的本地路径，image 的优先级高于 icon	1.1.0
 *  duration	number	1500	否	提示的延迟时间
 *  mask	boolean	false	否	是否显示透明蒙层，防止触摸穿透
 *  success	function		否	接口调用成功的回调函数
 *  fail	function		否	接口调用失败的回调函数
 *  complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行） 
 * @returns 
 */
const f_show_toast = (title, options = {}) => wx.showToast(Object.assign({ title: title, icon: "error" }, options))

/**
 * 
 * @param {object} options
 *  属性	类型	默认值	必填	说明	最低版本
 *  title	string		否	提示的标题	
 *  content	string		否	提示的内容	
 *  showCancel	boolean	true	否	是否显示取消按钮	
 *  cancelText	string	取消	否	取消按钮的文字，最多 4 个字符	
 *  cancelColor	string	#000000	否	取消按钮的文字颜色，必须是 16 进制格式的颜色字符串	
 *  confirmText	string	确定	否	确认按钮的文字，最多 4 个字符	
 *  confirmColor	string	#576B95	否	确认按钮的文字颜色，必须是 16 进制格式的颜色字符串	
 *  editable	boolean	false	否	是否显示输入框	2.17.1
 *  placeholderText	string		否	显示输入框时的提示文本	2.17.1
 *  success	function		否	接口调用成功的回调函数	
 *  fail	function		否	接口调用失败的回调函数	
 *  complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）	
 * @returns 
 */
const f_show_modal = (options) => wx.showModal(options)

/**
 * 
 * @param {object} options
 属性	类型	默认值	必填	说明	最低版本
alertText	string		否	警示文案	2.14.0
itemList	Array.<string>		是	按钮的文字数组，数组长度最大为 6	
itemColor	string	#000000	否	按钮的文字颜色	
success	function		否	接口调用成功的回调函数	
fail	function		否	接口调用失败的回调函数	
complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）	
 
 */
function f_show_sheet(options) {
        //check itemList.length>6
        if (options.itemList.length > MAX_LENGTH || options.itemList[MAX_LENGTH - 1] == NEXT_OPTION) {
            const MAX_LENGTH = 6
            const NEXT_OPTION = "下一页"
            //init page info
            if (options.itemListCopy == null) {
                options.itemListCopy = options.itemList
                options.page = 1
                options.success = (r) => {
                    try {
                        if (options.itemList[r.tapIndex] == NEXT_OPTION) {
                            options.page += 1
                            f_show_sheet(options)
                        } else {
                            options.successCopy(r)
                        }
                    } catch (e) {
                        f_show_loading(f_to_str(e))
                    }
                }
            }
            //add next page
            options.itemList = options.itemListCopy.filter((v, i) => i < (options.page * MAX_LENGTH))
                .map((v, i) => (i + 1 == MAX_LENGTH) ? NEXT_OPTION : v)
        }
        //show sheet
        wx.showActionSheet(options)
}

/**
 * 
 * @param {string} title 
 * @param {*} options 
 * 属性	类型	默认值	必填	说明
 * title	string		是	提示的内容
 * mask	boolean	false	否	是否显示透明蒙层，防止触摸穿透
 * success	function		否	接口调用成功的回调函数
 * fail	function		否	接口调用失败的回调函数
 * complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）
 * @returns 
 */
const f_show_loading=(title,options)=>wx.showLoading(Object.assign({title:title},options))


module.exports.f_static_init = function (s_logType = LOG_TYPES.DEBUG) {
    switch (s_logType.toUpperCase()) {
        case LOG_TYPES.DEBUG:
            log_type = LOG_TYPES.DEBUG;
            break;
        default:
            log_type = LOG_TYPES.INFO;
            break;
    }
    f_info("init module mlog...")
    f_info("switch mlog type", log_type)
}
module.exports.f_static_info = f_info
module.exports.f_static_err = f_err
module.exports.f_static_get_log_types = () => LOG_TYPES
module.exports.f_static_show_toast = f_show_toast
module.exports.f_static_show_modal = f_show_modal
module.exports.f_static_show_sheet = f_show_sheet
module.exports.f_static_show_loading=f_show_loading