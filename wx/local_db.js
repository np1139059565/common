const MODULE_MLOG = require("mlog.js"),
    MODULE_MFILE = require("wx_file.js"),
    MODULE_MYUN = require("myun.js"),
    LOCAL_TABLES = {}

var dbName = null


/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
const f_info = (i1, i2, i3, i4) => MODULE_MLOG.f_static_info(i1, i2, i3, i4)

/**
 * 
 * @param {*} e1 
 * @param {*} e2 
 * @param {*} e3 
 * @param {*} e4 
 * @returns 
 */
const f_err = (e1, e2, e3, e4) => MODULE_MLOG.f_static_err(e1, e2, e3, e4)

function f_init_local_db(callback) {
    f_query_wx_yun_db((code, r) => {
        if(code){
            r.map(tableInfo=>{
                console.info(tableInfo,"111111111111")
                // LOCAL_TABLES[]
                //write local table
                // MODULE_MFILE.f_static_write_file(dbName + "/" + tableName, JSON.stringify(r))
            })
        }
        if(typeof callback=="function"){
            callback(code)
        }
    })
}

/**
 * 
 * @param {*} tableName 
 * @returns 
 */
function f_query_local_table(tableName) {
    return MODULE_MFILE.f_static_readfile(dbName +"/"+ tableName)
}

/**
 * 
 * @param {*} tableName 
 * @param {*} callback 
 * @returns 
 */
const f_query_wx_yun_table=(tableName,callback)=>f_query_wx_yun_db((code,rdata)=>{
        if (rdata.length == 0) {
            code = false
            f_err("not find table", tableName)
        }
        if(typeof callback=="function"){
            callback(code,code?rdata[0].conter:null)
        }
    },{geo:{"where": { "_id": tableName }}})

/**
 *
 * @param {*} callback  
 * @param {*} params:
 *              database,
 *              querytype:
 *                  get
 *                  updatetable
 *                  update
 *              geo:
 *                  where :{_id}
 *                  limit :number
 *                  orderBy
 *                  skip
 *                  field
 *                  doc
 * @returns code,arr
 */
const f_query_wx_yun_db=(callback,params=null) =>MODULE_MYUN.f_run_wx_yun_event("wx_yun_db", Object.assign({
    database: dbName,
    querytype: "get",
    geo: {}//空geo代表查询所有表格的数据
},params), (code, rdata) => {
    //database res
    if (code) {
        if (null != rdata.result.code && !rdata.result.code) {
            code = false
            f_err(rdata.result.errMsg)
        } else {
            rdata = rdata.result.data
        }
    }
    if(typeof callback=="function"){
        callback(code, rdata)
    }
})


module.exports.f_static_init = (dbName1, callback) => {
    const mcallback = (code) => {
        //init methods
        if (code) {
            module.exports.f_query_local_table = f_query_local_table
        }

        if (typeof callback == "function") {
            callback(code)
        }
    }
    try {
        f_info("init local_db...")

        if (dbName1 != null) {
            dbName = dbName1
            f_info("switch local database path", MODULE_MFILE.f_static_get_absolute_path(dbName))

            //refush local db
            if (false == MODULE_MFILE.f_static_f_isdir(MODULE_MFILE.f_static_get_absolute_path(dbName))) {
                f_info("init local db..")
                f_init_local_db(mcallback)
            } else mcallback(true)
        } else {
            mcallback(false, "database name is null!")
        }
    } catch (e) {
        f_err(e)
        mcallback(0, MODULE_MLOG.f_static_get_msg(e))
    }
}
module.exports.f_static_get_tables = () => {
    return LOCAL_TABLES
}
