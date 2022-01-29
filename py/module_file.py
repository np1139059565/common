import os
import sys
import logging

_NULL="_NULL"

def f_read(_file_path):
    _file=_NULL
    try:
        if os.path.isfile(_file_path):
            #使用encoding=utf8会报错
            _file=open(_file_path)
            return _file.read()
        else:
            raise Exception("is not file!")
    except Exception as e:
        logging.exception("read file is err!",e)
        return _NULL
    finally:
        if _file!=_NULL:
            _file.close()

def f_write(_file_path,_str):
    _file=_NULL
    try:
        _file=open(_file_path,"w")
        return _file.write(_str)
    except Exception as e:
        logging.exception("write file is err!",e)
        return _NULL
    finally:
        if _file!=_NULL:
            _file.close()

if __name__=="__main__":
    print(f_read(sys.argv[1]))
