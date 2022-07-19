from pyteal import *
from utils import *

def faucetClear():
    return Seq([
        Approve(),
    ])

if __name__ == "__main__":
    # Overwrite params if sys.argv[1] is passed
    # if(len(sys.argv) > 1):
    #     compileParams = parse_params(sys.argv[1], compileParams)

    print(compileTeal(faucetClear(), Mode.Application, version=6))