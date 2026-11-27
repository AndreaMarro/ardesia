"""Bounded exact numeric lexemes for the independent U6 electric reviewers.

Arithmetic only: no candidate interpretation, ETL, grading or state authority.
Decimal AST nodes are decoded from source text, never from binary float values.
"""
import ast
import re
import sympy as sp


def exact_literal(raw):
    if not isinstance(raw,str) or len(raw)>60:
        raise ValueError('Bounded exact lexical expression required')
    raw=raw.replace('−','-')
    raw=re.sub(r'√([0-9]{1,4})',r'r(\1)',raw)
    raw=re.sub(r'(?<=\d)(?=r\()', '*',raw)
    if not re.fullmatch(r'[0-9r()+*/. \-]+',raw):
        raise ValueError('Unsupported exact lexical expression')
    tree=ast.parse(raw,mode='eval')
    if len(list(ast.walk(tree)))>80:raise ValueError('Arithmetic expression too complex')
    def visit(node):
        if isinstance(node,ast.Constant) and type(node.value) in (int,float):
            token=ast.get_source_segment(raw,node)
            if not token or not re.fullmatch(r'(?:\d+(?:\.\d*)?|\.\d+)',token):
                raise ValueError('Exact integer or decimal lexeme required')
            return sp.Rational(token)
        if isinstance(node,ast.UnaryOp) and isinstance(node.op,(ast.UAdd,ast.USub)):
            number=visit(node.operand)
            return number if isinstance(node.op,ast.UAdd) else -number
        if isinstance(node,ast.BinOp):
            left,right=visit(node.left),visit(node.right)
            if isinstance(node.op,ast.Add):return left+right
            if isinstance(node.op,ast.Sub):return left-right
            if isinstance(node.op,ast.Mult):return left*right
            if isinstance(node.op,ast.Div) and right!=0:return left/right
        if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='r' and len(node.args)==1 and not node.keywords:
            number=visit(node.args[0])
            if number.is_Integer and 0<=number<=10**4:return sp.sqrt(number)
        raise ValueError('Unsupported exact arithmetic node')
    result=visit(tree.body)
    if result.is_real is not True or result.is_finite is not True:
        raise ValueError('Non-real or non-finite exact value')
    return result


def numeric_lexeme(value):
    """Integer JSON payloads and original choice strings have exact text.

    A binary-float numeric payload is rejected, rather than inventing a decimal
    lexeme from str(float). A new decimal-valued numeric task requires a bound
    original JSON lexeme in its independent decoder before acceptance.
    """
    if type(value) is int:return str(value)
    if isinstance(value,str):return value
    raise ValueError('Exact integer payload or original lexical string required')
