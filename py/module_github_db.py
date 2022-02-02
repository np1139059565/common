import sys
import logging
import base64
import time
import json
import os

import module_query_http as br

_NULL="_NULL"

def f_exec_shell(_shell_str):
    _sstream=_NULL
    try:
        _sstream=os.popen(_shell_str)
        return _sstream.read()
    except Exception as e:
        logging.exception("run shell is err",e)
        return _NULL
    finally:
        if _sstream!=_NULL:
            _sstream.close()

def f_list(_url,_user,_repo):
    if _url.startswith("."):
        _url=_url[1:len(_url)]
    if False==_url.endswith("/"):
        _url="/"+_url
    return br.f_query("https://api.github.com/repos/"+_user+"/"+_repo+"/contents"+_url,"GET")

def f_read(_url,_user,_repo,_branch):
    if _url.startswith("."):
        _url=_url[1:len(_url)]
    if False==_url.endswith("/"):
        _url="/"+_url

    _r= br.f_query("https://api.github.com/repos/"+_user+"/"+_repo+"/contents"+_url+"?ref="+_branch,"GET")
    _debs64= base64.b64decode(_r.json().get("content"))
    return _debs64.decode("utf-8")

def f_push(_url,_user,_repo,_token,_branch,_content,_msg):
    try:
        #check param
        if _url.startswith("."):
            _url=_url[1:len(_url)]
        if False==_url.endswith("/"):
            _url="/"+_url
        if _msg==_NULL:
            _msg="auto push "+str(time.time())

        #init body
        _cont64=_content.encode("utf-8")
        _body={"message":_msg,"content":base64.b64encode(_cont64).decode()}
        #check sha
        _finfo=br.f_query("https://api.github.com/repos/"+_user+"/"+_repo+"/contents"+_url+"?ref="+_branch,"GET").json()
        if _finfo.get("sha",_NULL)!=_NULL:
            _body["sha"]=_finfo.get("sha")
    
        #通过requests死活发送不出去
        #_r=br.f_query("https://api.github.com/repos/"+_user+"/"+_repo+"/contents"+_url,"PUT",json.dumps(_body),_headers={"Authorization":"token "+_token})
        _curl="curl -XPUT -v -H 'Authorization:token "+_token+"' 'https://api.github.com/repos/"+_user+"/"+_repo+"/contents"+_url+"' --data '"+json.dumps(_body)+"'"
        _r=json.loads(f_exec_shell(_curl))
        #print(_curl)
        return _r
    except Exception as e:
        logging.exception("push is err!",e)
        return False

if __name__=="__main__":
    _argv={}
    _k=_NULL
    for _v in sys.argv:
        if _k!=_NULL and False==_v.startswith("-"):
            _argv[_k]=_v
            _k=_NULL
        elif len(_v)>=0 and _v.startswith("-"):
            _k=_v
    #parse argv
    _usage="usage:python3 [module_xx.py -key] value\n      -list [_url] -user [string] -repo [string]\n      -read [_url] -user [string] -repo [string] -branch [string]\n      -push [string] -user [string] -repo [string] -token [string] -branch [string] -content [string] -msg [string]"
    if _argv.get("-user",_NULL)!=_NULL and _argv.get("-repo",_NULL)!=_NULL:
        if _argv.get("-list",_NULL)!=_NULL:
            _r=f_list(_argv.get("-user"),_argv.get("-repo"),_argv.get("-list"))
            if _r.status_code==200:
                _json=_r.json()
                for _v in _json:
                    print("name:"+_v.get("name")+"\n size:"+str(_v.get("size"))+"\n sha:"+_v.get("sha")+"\n")
            else:
                print(_r)
        elif _argv.get("-read",_NULL)!=_NULL and _argv.get("-branch",_NULL)!=_NULL:
            print(f_read(_argv.get("-read"),_argv.get("-user"),_argv.get("-repo"),_argv.get("-branch")))
        elif _argv.get("-push",_NULL)!=_NULL and _argv.get("-branch",_NULL)!=_NULL and _argv.get("-token",_NULL)!=_NULL and _argv.get("-content",_NULL)!=_NULL:
            print(f_push(_argv.get("-push"),_argv.get("-user"),_argv.get("-repo"),_argv.get("-token"),_argv.get("-branch"),_argv.get("-content"),_argv.get("-msg","auto push "+str(time.time()))))
        else:
            print(_usage)
    else:
        print(_usage)
