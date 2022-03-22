import os
import sys

def command(_str):
    # _rstr=os.popen("adb connect "+request.args.get("ip",_NULL)+":"+request.args.get("port",_NULL)).read()
    # 解决中文返回导致的报错(注意_stream和_rstr不能连成一句,否则会报错)
    _stream=os.popen(_str)
    return _stream._stream.buffer.read().decode().strip()

if __name__=="__main__":
    print(command(sys.argv[1]))