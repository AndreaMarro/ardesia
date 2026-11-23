"""Compatibility facade for checkout, author tools and existing HTTP clients."""
from .adapters.orders import SQLiteOrders
from .application import orders
from .application.orders import public
from .domain.orders import OFFERS, cents, valid_iban


def update(db, user, data):
    return orders.update(SQLiteOrders(db), user, data)


def offers(db, course):
    return orders.offers(SQLiteOrders(db), course)


def create(db, user, rows, data):
    return orders.create(SQLiteOrders(db), user, rows, data)


def operation(db, user, key, data):
    return orders.operation(SQLiteOrders(db), user, key, data)
