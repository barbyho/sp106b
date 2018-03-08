var U = require('./util')
var next = U.print

// === BNF Grammar =====
// E = T [+-*/] E | T -----E先生成T之後緊接著 +-*/ 其中一個字元在遞迴性的生成E  或是生成T
// T = [0-9] | (E)    -----T可以生成0到9當中的一個數字  或是生成"("符號 再生成E 再生成")"符號

function E () {
  if (U.randInt(1, 10) <= 5) {
    T()
    next(U.randChar('+-*/'))
    E()
  } else {
    T()
  }
}

function T () {
  if (U.randInt(1, 10) < 7) {
    next(U.randChar('0123456789'))
  } else {
    next('(')
    E()
    next(')')
  }
}

for (var i = 0; i < 10; i++) {
  E()
  next('\n')
}
