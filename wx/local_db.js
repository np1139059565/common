const MODULE_MLOG = require("mlog.js"),
    MODULE_MFILE = require("wx_file.js"),
    MODULE_MYUN = require("myun.js"),
    LOCAL_TABLE_FILE="/.tables"

var local_tables = {},
    db_name = null

//此时MODULE_MLOG还是空的，所以不能直接赋值，必须当做函数调用
const f_err=(...args)=>MODULE_MLOG.f_static_err(args)
const f_info=(...args)=>MODULE_MLOG.f_static_info(args)
function f_refush_local_db(callback) {
    f_info("refush local db...")
    f_query_wx_yun_db((code, r) => {
        if(code){
            //write local table
            r.map(tableInfo=>{
                const table_name=tableInfo._id
                local_tables[table_name]=table_name
                MODULE_MFILE.f_static_writefile(MODULE_MFILE.f_static_get_absolute_path(db_name + "/" + table_name), JSON.stringify(r))
            })
            MODULE_MFILE.f_static_writefile(MODULE_MFILE.f_static_get_absolute_path(db_name + LOCAL_TABLE_FILE), JSON.stringify(local_tables))

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
    return MODULE_MFILE.f_static_readfile(db_name +"/"+ tableName)
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
    database: db_name,
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

function f_check_local_tables(){
    const tables_path=MODULE_MFILE.f_static_get_absolute_path(db_name+LOCAL_TABLE_FILE)
    return MODULE_MFILE.f_static_isexist(tables_path)&&(Object.assign(local_tables,JSON.parse(MODULE_MFILE.f_static_readfile(tables_path))))
        .filter(tableName=>MODULE_MFILE.f_static_isexist(MODULE_MFILE.f_static_get_absolute_path(db_name+"/"+tableName))!=true).length==0
}

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
    f_info("init local_db...")

    if (dbName1 != null) {
        db_name = dbName1
        f_info("switch local database path", MODULE_MFILE.f_static_get_absolute_path(db_name))

        //check local db
        if (MODULE_MFILE.f_static_isdir(MODULE_MFILE.f_static_get_absolute_path(db_name))&&f_check_local_tables())
            mcallback(true)
        else {
            f_refush_local_db(mcallback)
        } 
    } else {
        mcallback(false, "database name is null!")
    }
}
module.exports.f_static_get_tables = () => {
    return local_tables
}
