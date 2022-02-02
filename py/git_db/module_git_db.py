import sys
import logging
import os
import time

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

def f_pull(_url):
    try:
        _dbname=_url[_url.rindex("/")+1:99].split(".")[0]
        print("db name is",_dbname)
        if False==os.path.isdir(_dbname):
            print("clone...")
            return f_exec_shell("git clone "+_url)
        else:
            print("pull...")
            return f_exec_shell("git -C "+_dbname+" pull")
    except Exception as e:
        logging.exception("pull is err",e)
        return False

def f_start(_url,_time=1000):
    if _time<1000:
        _time=1000
    f_exec_shell("touch ./_START")
    print("start is "+str(os.path.exists("./_START")))

    while(os.path.exists("./_START")):
        f_push(_url)
        time.sleep(_time/1000)
    print("stop...")

def f_stop():
    f_exec_shell("rm -rf ./_START")

def f_push(_url):
    try:
        #pull...
        f_pull(_url)
        _dbname=_url[_url.rindex("/")+1:99].split(".")[0]
        #check .gitignore
        if False==os.path.isfile("./.gitignore"):
            print("add .gitignore file "+f_exec_shell("echo '*.swp'>"+_dbname+"/.gitignore"))
        if "0"!=f_exec_shell("git -C "+_dbname+" status|grep 'git add'|wc -l"):
            _common_log="auto push"+str(time.time())
            _ar=f_exec_shell("git -C "+_dbname+" add .")
            print(_ar) 
            _cr=f_exec_shell("git -C "+_dbname+" commit -m '"+_common_log+"'")
            print(_cr)
            _pr=f_exec_shell("git -C "+_dbname+" push origin master")
            print(_pr)
            return (_ar+_cr+_pr).find(_common_log)>=0
        else:
            print("is clean...")
            return True
    except Exception as e:
        logging.exception("push is err",e)
        return False

if __name__=="__main__":
    _argv={}
    _k=_NULL
    for _v in sys.argv:
        if _k!=_NULL:
            _argv[_k]=_v
        elif len(_v)>1 and _v.startswith("-"):
            _k=_v

    if _argv.get("-e",_NULL)!=_NULL:
        print(f_exec_shell(_argv.get("-e")))
    elif _argv.get("-pull",_NULL)!=_NULL:
        print(f_pull(_argv.get("-pull")))
    elif _argv.get("-push",_NULL)!=_NULL:
        print(f_push(_argv.get("-push")))
    elif _argv.get("-start",_NULL)!=_NULL:
        print(f_start(_argv.get("-start")))
    elif _argv.get("-stop",_NULL)!=_NULL:
        print(f_stop())
    else:
        print(_argv)
