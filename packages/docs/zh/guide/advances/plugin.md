# 插件

`vue-styled-components` 支持自定义插件。它允许你在 CSS 生成过程中插入钩子，进行定制和扩展功能。通过提供 `beforeBuild` 和 `afterBuild` 钩子，你可以在元素被编译成 CSS 之前进行修改，或者在编译后的 CSS 中进行调整。支持单个或多个回调函数。


::: danger CAUTION
如非必要，不建议使用此功能。因为其是在运行时执行的，可能影响性能。
:::


## `register`

`register` 函数接受一个对象，其中包含 `beforeBuild` 和 `afterBuild` 钩子。

```ts
const plugin = register({
  beforeBuild: (element: Element, index: number, children: Element[]) => {},
  afterBuild: (css: string) => string | void
})
```

::: warning 注意
注册函数必须在 app.mount() 之前调用, 否则会导致 css 编译比插件注册更早发生, 从而导致插件无效。
:::

## `beforeBuild` 钩子

`beforeBuild` 钩子在任何 CSS 被编译之前调用。它提供了对参与 CSS 生成过程的元素、索引和子元素的访问。

### 函数签名

```ts
type beforeBuildCallback = (element: Element, index: number, children: Element[]) =>  void;
```

### 参数：

- **element:** 当前正在处理的元素。
- **index:** 当前元素在 CSS 生成序列中的索引。
- **children:** 与当前元素相关的子元素。

### 示例

::: warning
如果你想要更改 CSS 输出的内容，应该修改 `element.return` 的属性。否则，CSS 不会按预期生成。
:::

```ts
plugin.register({
  beforeBuild: (element: Element, index: number, children: Element[]) => {
    // 如果元素的内容包含特定的值，则更改其 CSS
    if (element.children === 'red') {
      element.return = 'color: blue';
    }
  }
});
```

## `afterBuild` 钩子

`afterBuild` 钩子在 CSS 编译完成后调用。它提供了对生成的 CSS 的访问。

### 函数签名

```ts
type afterBuildCallback = (css: string) => string ｜ void;
```

### 参数：

- **css:** 已生成的 CSS。

### 示例

```ts
plugin.register({
  afterBuild: (css: string) => {
    // 在返回之前修改编译后的 CSS
    return css.replace(/color:red/g, 'color:blue');
  }
});
```