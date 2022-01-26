var mlog = require("mlog.js"),mfile=null,myun=null,localDBName="local_db/",o_tables={
    KEY_LIST:"tb_key",
    COUNT_DAY:"tb_count_d"
}

module.exports.f_static_init = (m_log,m_file,m_yun=null,localDBName1="",callback) => {
    try {
        if (m_log != null) {
            mlog = m_log
        }
        f_info("init local_db...")

        if (m_file != null) {
            mfile = m_file
        }
        if (m_yun != null) {
            myun = m_yun
        }
        if(localDBName1!=""){
            localDBName=localDBName1+(localDBName1.endsWith("/")?"":"/")
        }
        f_info("local db path",mfile.f_static_getUserDir(localDBName))

        //refush local db
        if(false==mfile.f_static_isDir(mfile.f_static_getUserDir(localDBName))){
            f_info("init local db..")
            f_init_local_db(callback)
        }
        module.exports.f_query_local=f_query_local
    } catch (e) {
        f_err(e)
    }
}
module.exports.f_get_tables=()=>{
    return o_tables
}
module.exports.f_set_tables=(tables)=>{
    o_tables=tables
}


/**
 *
 * @param i1
 * @param i2
 * @param i3
 * @param i4
 */
function f_info(i1,i2,i3,i4) {
    try {
        if (mlog.f_info == null) {
            console.info("local_db",i1,i2,i3,i4)
            mlog.f_wx_static_show_toast("local_db:"+mlog.f_static_get_msg(i1,i2,i3,i4))
        } else {
            mlog.f_info("local_db", i1, i2, i3, i4)
        }
    } catch (e) {
        console.error("local_db",e)
        mlog.f_wx_static_show_modal("local_db:"+mlog.f_static_get_msg(e))
    }
}

function f_err(e1, e2, e3,e4) {
    try {
        if (mlog.f_err == null) {
            console.error("local_db",e1, e2, e3,e4)
            mlog.f_wx_static_show_modal("local_db:"+mlog.f_static_get_msg(e1, e2, e3,e4))
        } else mlog.f_err("local_db", e1,e2,e3,e4)
    } catch (e) {
        console.error("local_db",e)
        mlog.f_wx_static_show_modal("local_db:"+mlog.f_static_get_msg(e))
    }
}

function f_init_local_db(callback){
    var count=0
    Object.values(o_tables).map(tableName=>{
        count+=1//count++
        f_wx_query_yun(tableName,(code,r)=>{
            //write local table
            mfile.f_static_writeFile(localDBName+tableName,JSON.stringify(r))
            //check is end
            count-=1
            if(count<=0&&typeof callback=="function"){
                callback()
            }
        })
    })
}
function f_query_local(tableName){
    return mfile.f_static_read_file(localDBName+tableName)
}
function f_wx_query_yun(tableName,callback){
    try{
        f_info("query",tableName)
        myun.runEventSync("yun_hand_db",{
            geo:{"where":{"_id":tableName}},
            queryType:"get"},(code,r)=>{
            //database res
            if(code){
                if(null!=r.result.code&&!r.result.code){
                    code=false
                    f_err(r.result.errMsg)
                }else if(r.result.data.length==0){
                    code=false
                    f_err("not find table",tableName)
                }else{
                    r=r.result.data[0].conter
                }
            }
            callback(code,r)
        })
    }catch (e){
        f_err(e)
    }
}


