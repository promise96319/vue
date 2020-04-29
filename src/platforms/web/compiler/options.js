/* @flow */

import {
  isPreTag,
  mustUseProp,
  isReservedTag,
  getTagNamespace
} from '../util/index'

import modules from './modules/index'
import directives from './directives/index'
import { genStaticKeys } from 'shared/util'
import { isUnaryTag, canBeLeftOpenTag } from './util'

export const baseOptions: CompilerOptions = {
  expectHTML: true,
  modules,
  directives,
  // 是否是 pre 标签
  isPreTag,
  // 一元标签： 'area,base,br,col,embed,frame,hr,img,input等
  isUnaryTag,
  // 检测一个属性在标签中是否要使用 props 进行绑定。
  mustUseProp,
  // 检测一个标签是否是那些虽然不是一元标签，但却可以自己补全并闭合的标签。比如 p 标签是一个双标签
  canBeLeftOpenTag,
  // 是否是保留标签
  isReservedTag,
  // 获取元素(标签)的命名空间。
  getTagNamespace,
  // 编译器选项的 modules 选项生成一个静态键字符串。
  staticKeys: genStaticKeys(modules)
}
