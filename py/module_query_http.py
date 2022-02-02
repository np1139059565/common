import sys
import logging
import requests

_NULL="_NULL"
def f_query(_url,_qtype,_body=_NULL,_headers=_NULL):
    try:
        print("query "+_url)
        _r={"status_code":0,"msg":"not find qtype!"}
        if _qtype.upper()=="GET":
            _r=requests.get(_url,verify=False)
        elif _qtype.upper()=="POST":
            print(_body)
            _r=requests.post(_url,verify=False,data=_body)
        elif _qtype.upper()=="PUT":
            print(_headers)
            print(_body)
            _r=requests.post(_url,_body,verify=False,headers=_headers)

        return _r
    except Exception as e:
        logging.exception("qurery is err!",e)
        return {"status_code":0,"msg":"query is err!"}

if __name__=="__main__":
    _argv={}
    _k=_NULL
    for _v in sys.argv:
        if _k!=_NULL:
            _argv[_k]=_v
        elif len(_v)>1 and _v.startswith("-"):
            _k=_v

    if _argv.get("-get",_NULL)!=_NULL:
        _r=f_query(_argv.get("-get"),"GET")
        print(_r.json())
        print(_r.status_code)
    elif _argv.get("-post",_NULL)!=_NULL:
        _r=f_query(_argv.get("-post"),"POST",_argv.get("-body",_NULL))
        print(_r.json())
        print(_r.status_code)
    else:
        print("usage:python3 module_xxx.py -command value\n      -get _url\n      -post _url -body _json")

