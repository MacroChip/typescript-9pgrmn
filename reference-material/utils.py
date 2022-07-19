from pyteal import *


def plusPlus(globalField):
    return App.globalPut(globalField, App.globalGet(globalField) + Int(1))

def minusMinus(globalField):
    return App.globalPut(globalField, App.globalGet(globalField) - Int(1))

def min(left, right):
    return If(left < right).Then(left).Else(right)
