from pyteal import *
from utils import *
from parse_params import parse_params
import sys

compileParams = {
    "ESCROW_ASSET": 0,
    "ESCROW_APP_ID": 0,
    "EVENT_END_SECS": 0,
}

faucetIdKey = Bytes('faucetId')

def _err(id):
    return Int(77800+id)

class Errors():
    MISSING_ESCROW = _err(1)
    ESCROW_TOO_SHORT = _err(2)
    ESCROW_WRONG_ASSET = _err(3)
    ESCROW_WRONG_AMOUNT = _err(4)

def Expect(assertion: Expr, error: Errors):
    return Assert(And(assertion, error))

def setFaucetId():
    existingFaucetId = App.globalGetEx(Int(0), faucetIdKey)

    return Seq([
        existingFaucetId,
        Assert(Not(existingFaucetId.hasValue())),
        Assert(Txn.sender() == Global.creator_address()),

        App.globalPut(faucetIdKey, Btoi(Txn.application_args[1])),
        Approve(),
    ])

def verifyUserHasEscrowedIdentityAsset():
    escrowAppId = Int(compileParams['ESCROW_APP_ID'])
    escrowState = App.localGetEx(Txn.sender(), escrowAppId, Bytes('zcircuit-origins'))
    escrowEnd       = Btoi(Extract(escrowState.value(), Int(8 * 0), Int(8)))
    escrowStart     = Btoi(Extract(escrowState.value(), Int(8 * 1), Int(8)))
    escrowAsset     = Btoi(Extract(escrowState.value(), Int(8 * 2), Int(8)))
    escrowAmount    = Btoi(Extract(escrowState.value(), Int(8 * 3), Int(8)))

    return Seq([
        Assert(Txn.applications[1] == escrowAppId),
        escrowState,
        Expect(escrowState.hasValue(), Errors.MISSING_ESCROW),
        Expect(escrowEnd >= Int(compileParams['EVENT_END_SECS']), Errors.ESCROW_TOO_SHORT),
        Expect(escrowAsset == Int(compileParams['ESCROW_ASSET']), Errors.ESCROW_WRONG_ASSET),
        Expect(escrowAmount == Int(1), Errors.ESCROW_WRONG_AMOUNT),
    ])

def sendInnerTxToAllowUser():
    return Seq([
        Assert(App.globalGet(faucetIdKey)),
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetField(TxnField.type_enum, TxnType.ApplicationCall),
        InnerTxnBuilder.SetField(TxnField.fee, Int(0)),
        InnerTxnBuilder.SetField(TxnField.application_id, App.globalGet(faucetIdKey)),
        InnerTxnBuilder.SetField(TxnField.application_args, [
            Bytes('allowlist'),
            Txn.sender(),
        ]),
        InnerTxnBuilder.Submit(),
    ])

def contractMain():

    expectedConditions = [
        Txn.rekey_to() == Global.zero_address(),
        Txn.close_remainder_to() == Global.zero_address(),
        Txn.asset_close_to() == Global.zero_address(),

        Txn.on_completion() == OnComplete.NoOp,
    ]

    approveUser = Seq([
        verifyUserHasEscrowedIdentityAsset(),
        sendInnerTxToAllowUser(),
        Approve(),
    ])

    return Seq([
        Assert(And(*expectedConditions)),
        Cond(
            [Txn.application_id() == Int(0), Approve()],
            [Txn.application_args[0] == Bytes("faucetId"), setFaucetId()],
            [Txn.application_args[0] == Bytes("approve"), approveUser],
        )
    ])

if __name__ == "__main__":
    compileParams = parse_params(sys.argv[1], compileParams)

    print(compileTeal(contractMain(), Mode.Application, version=6))