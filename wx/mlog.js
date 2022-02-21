const MODULE_MFILE = require("wx_file.js"),
      LOG_TYPES={
        DEBUG:"DEBUG",
        INFO:"INFO"
      },
      INFO_TYPES={
          ERROR:"ERROR",
          INFO:"INFO"
      }

var logType=LOG_TYPES.DEBUG


/**
 * 
 * @param {*} title 
 * @param {*} e2 
 * @param {*} e3 
 * @param {*} e4 
 * @param {*} e5 
 * @returns 
 */
 const f_err=(e2, e3, e4, e5) =>f_info(e2,e3,e4,e5,INFO_TYPES.ERROR)
 /**
 * 
 * @param {*} info_type 
 * @param {*} i2 
 * @param {*} i3 
 * @param {*} i4 
 * @param {*} i5 
 */
function f_info(i2, i3, i4, i5,info_type=INFO_TYPES.INFO) {
    try{
        const msg=f_get_msg(i2, i3, i4, i5)
        
        console.info(info_type, msg)
        MODULE_MFILE.f_static_write_log(info_type + ":\r\n" + msg + "\r\n")
        if(logType==LOG_TYPES.DEBUG||info_type==INFO_TYPES.ERROR){
            f_show_toast(info_type+msg)
        }
    }catch(e){
        f_err(e)
    }
}
/**
 * 
 * @param {*} e1 
 * @param {*} e2 
 * @param {*} e3 
 * @param {*} e4 
 * @param {*} e5 
 * @returns 
 */
 const f_get_msg=(e1, e2, e3, e4, e5) =>(f_err_to_str(e1) + "," + f_err_to_str(e2) + "," + f_err_to_str(e3) 
 + "," + f_err_to_str(e4) + "," + f_err_to_str(e5)).replaceAll(/,,/g, ",")
/**
 * 
 * @param {*} e 
 * @returns 
 */
 function f_err_to_str(e) {
    try {
        if (e == null) {
            return ""
        } else if (e instanceof TypeError || e.stack != null) {
            return e.stack
        } else if (e instanceof Error || e.errMsg != null || e.message != null) {//yun err
            return e.errMsg || e.message
        } else {
            return e
        }
    } catch (e1) {
        f_err(e1)
    }
}


/**
 * 
 * @param {*} options 
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
const f_show_toast=(title,options={})=>wx.showToast(Object.assign({title:title,icon:"error"},options))

/**
 * 
 * @param {*} options
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
const f_show_modal=(options)=>wx.showModal(options)

/**
 * 
 * @param {*} options
 属性	类型	默认值	必填	说明	最低版本
alertText	string		否	警示文案	2.14.0
itemList	Array.<string>		是	按钮的文字数组，数组长度最大为 6	
itemColor	string	#000000	否	按钮的文字颜色	
success	function		否	接口调用成功的回调函数	
fail	function		否	接口调用失败的回调函数	
complete	function		否	接口调用结束的回调函数（调用成功、失败都会执行）	
 
 */
function f_show_sheet(options) {
    try{
        const MAX_LENGTH=6
        const LAST_PAGE="下一页"

        if(options.itemList.length>MAX_LENGTH||options.itemList[MAX_LENGTH-1]==LAST_PAGE){
            if(options.itemListBak==null){
                options.itemListBak=options.itemList
                options.itemPage=1
                options.success=(r)=>{
                    try{
                        if(options.itemList[r.tapIndex]==LAST_PAGE){
                            options.itemPage+=1
                            f_show_sheet(options)
                        }else{
                            options.successBak(r)
                        }
                    }catch(e){
                        f_err(e)
                    }
                }
            }
            options.itemList=options.itemListBak.filter((v,i)=>i<(options.itemPage*MAX_LENGTH))
            .map((v,i)=>(i+1==MAX_LENGTH)?LAST_PAGE:v)
        }

        wx.showActionSheet(options)
    }catch(e){
        f_err(e)
    }
}



module.exports.f_static_init = function (s_logType=LOG_TYPES.DEBUG) {
    try {
        switch (s_logType.toUpperCase()){
            case LOG_TYPES.DEBUG:
                logType=LOG_TYPES.DEBUG;
                break;
            default:
                logType=LOG_TYPES.INFO;
                break;
        }
        f_info("init module mlog...")
        f_info("switch mlog type",logType)
    } catch (e) {
        f_err(e)
    }
}
module.exports.f_static_info = f_info
module.exports.f_static_err = f_err
module.exports.f_static_get_msg=f_get_msg
module.exports.f_static_get_types=()=> LOG_TYPES
module.exports.f_static_show_toast=f_show_toast
module.exports.f_static_show_modal=f_show_modal
module.exports.f_static_show_sheet=f_show_sheet