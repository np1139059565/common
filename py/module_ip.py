import socket
import logging

_NULL="_NULL"

def f_get_local_ip():
    st=_NULL
    try:
        st=socket.socket(socket.AF_INET,socket.SOCK_DGRAM)
        st.connect(("8.8.8.8",53))
        return st.getsockname()[0]
    except:
        logging.exception("get local ip is err!")
        return "127.0.0.1"
    finally:
        if st!=_NULL:
            st.close()


if __name__=="__main__":
    print (f_get_local_ip())
