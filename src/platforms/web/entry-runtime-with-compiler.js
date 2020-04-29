/* @flow */

import config from 'core/config'
import { warn, cached } from 'core/util/index'
import { mark, measure } from 'core/util/perf'

import Vue from './runtime/index'
import { query } from './util/index'
import { compileToFunctions } from './compiler/index'
import { shouldDecodeNewlines, shouldDecodeNewlinesForHref } from './util/compat'

/**
 * 通过 id 找到模板
 */
const idToTemplate = cached(id => {
  const el = query(id)
  return el && el.innerHTML
})

/**
 * 缓存 mount
 */ 
const mount = Vue.prototype.$mount
/**
 * 重设 mount
 * 1. 判断 el
 * 2. 如果 render 函数存在 -> 直接返回mount
 * 3. 如果 render 不存在
 *    - 如果有 template 存在，获取 template，编译成 render 函数
 *    - 如果有 template 不存在 -> 警告
 */
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && query(el)

  /* istanbul ignore if */
  if (el === document.body || el === document.documentElement) {
    process.env.NODE_ENV !== 'production' && warn(
      `Do not mount Vue to <html> or <body> - mount to normal elements instead.`
    )
    return this
  }

  const options = this.$options
  // resolve template/el and convert to render function
  if (!options.render) {
    let template = options.template
    if (template) {
      if (typeof template === 'string') {
        if (template.charAt(0) === '#') {
          template = idToTemplate(template)
          /* istanbul ignore if */
          if (process.env.NODE_ENV !== 'production' && !template) {
            warn(
              `Template element not found or is empty: ${options.template}`,
              this
            )
          }
        }
      } else if (template.nodeType) {
        template = template.innerHTML
      } else {
        if (process.env.NODE_ENV !== 'production') {
          warn('invalid template option:' + template, this)
        }
        return this
      }
    } else if (el) {
      template = getOuterHTML(el)
    }
    if (template) {
      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile')
      }

      // 第一层 baseCompile -> 解析AST 生成 不同平台代码
      // 第二层 compile -> 合并 baseOptions + 此处option -> baseCompile
      // 第三层 compile 转换成 函数(并具有缓存编译结果和错误处理)
      // 有模板时 编译模板 => 返回 render 函数
      const { render, staticRenderFns } = compileToFunctions(template, {
        outputSourceRange: process.env.NODE_ENV !== 'production',
        // 目的是对浏览器的怪癖做兼容
        shouldDecodeNewlines,
        // 目的是对浏览器的怪癖做兼容
        shouldDecodeNewlinesForHref,
        // 改变纯文本插入分隔符。
        delimiters: options.delimiters,
        // 当设为 true 时，将会保留且渲染模板中的 HTML 注释。默认行为是舍弃它们。
        comments: options.comments
      }, this)
      options.render = render
      options.staticRenderFns = staticRenderFns

      /* istanbul ignore if */
      if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
        mark('compile end')
        measure(`vue ${this._name} compile`, 'compile', 'compile end')
      }
    }
  }
  return mount.call(this, el, hydrating)
}

/**
 * Get outerHTML of elements, taking care
 * of SVG elements in IE as well.
 */
function getOuterHTML (el: Element): string {
  if (el.outerHTML) {
    return el.outerHTML
  } else {
    const container = document.createElement('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

Vue.compile = compileToFunctions

export default Vue
