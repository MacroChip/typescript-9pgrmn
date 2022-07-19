from pyteal import *
from utils import *
from parse_params import parse_params
import sys

compileParams = {
    "LAST_ROUND": 0,
    "GIVEAWAY_ASSET": 0,
    "IDENTITY_PROVIDER_PK": ""
}

def _err(id):
    return Int(77700+id)

class Errors():
    INVALID_LEASE = _err(1)
    INVALID_IDENTITY = _err(2)
    INVALID_LAST_ROUND = _err(3)

def Expect(assertion: Expr, error: Errors):
    return Assert(And(assertion, error))

def onAssetWithdraw():
    expectedIdentity = Concat(Txn.asset_receiver(), Itob(Txn.last_valid()))
    identitySignature = Txn.note()
    identityProviderPubKey = Bytes("base64", compileParams["IDENTITY_PROVIDER_PK"])

    return Seq([
        Expect(Txn.lease() == Txn.asset_receiver(), Errors.INVALID_LEASE),
        Expect(Ed25519Verify(expectedIdentity, identitySignature, identityProviderPubKey), Errors.INVALID_IDENTITY),
        Expect(Txn.last_valid() <= Int(compileParams["LAST_ROUND"]), Errors.INVALID_LAST_ROUND),
        Approve(),
    ])

def contractMain():

    alwaysExpectedConditions = [
        Txn.rekey_to() == Global.zero_address(),
        Txn.close_remainder_to() == Global.zero_address(),
        Txn.asset_close_to() == Global.zero_address(),
        Txn.type_enum() == TxnType.AssetTransfer,
        Txn.fee() == Int(0),
        Txn.xfer_asset() == Int(compileParams["GIVEAWAY_ASSET"]),
    ]

    return Seq([
        Cond(
            [Not(And(*alwaysExpectedConditions)), Reject()],
            [Txn.asset_amount() == Int(0), Approve()],          # Opt-in to giveaway asset
            [Txn.asset_amount() == Int(1), onAssetWithdraw()],  # Withdraw an asset with an identity signature
            [Int(1), Reject()],
        )
    ])

if __name__ == "__main__":
    compileParams = parse_params(sys.argv[1], compileParams)

    print(compileTeal(contractMain(), Mode.Signature, version=6))