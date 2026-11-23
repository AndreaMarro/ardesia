"""Close process capabilities after loading the approved corpus for the stdio service."""
import sys


def confine_stdio():
    def audit(event, _args):
        if (event == "open" or event.startswith(("socket.", "subprocess.", "ctypes.", "shutil."))
                or event.startswith(("os.exec", "os.spawn", "os.posix_spawn", "os.fork"))
                or event in {"os.system", "os.chdir", "os.listdir", "os.scandir", "os.remove", "os.rename",
                             "os.mkdir", "os.rmdir", "os.link", "os.symlink", "os.truncate", "os.chmod"}):
            raise PermissionError("Operazione esterna alle capacità del servizio editoriale.")
    sys.addaudithook(audit)
