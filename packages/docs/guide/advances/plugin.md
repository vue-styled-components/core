# Plugin <Badge type="tip" text="^1.9.0" />

`vue-styled-components` supports custom plugins. It allows you to hook into the CSS generation process, enabling customization and extending functionality. By providing `beforeBuild` and `afterBuild` hooks, you can modify elements before they are compiled into CSS and adjust the compiled CSS afterward. This system is flexible and supports both single and multiple callbacks.

::: danger CAUTION
If unnessary, it is not recommended to use this feature. Because it is executed in runtime, which may affect performance.
:::

## `register`

`register` accepts a plugin object with `beforeBuild` and `afterBuild` hooks.

```ts
const plugin = register({
  beforeBuild: (element: Element, index: number, children: Element[]) => {},
  afterBuild: (css: string) => string | void
})
```

::: warning NOTES
`register` method must be called before `app.mount()`. Otherwise, the plugin will not be registered and the hooks will not be called.
:::

## `beforeBuild` Hook

The beforeBuild hook is called before any CSS is compiled. It provides access to the element, index, and children involved in the CSS generation process.

### Signature

```ts
type beforeBuildCallback = (element: Element, index: number, children: Element[]) => void
```

### Parameters:

- **element:** The current element that is being processed.
- **index:** The index of the current element in the CSS generation sequence.
- **children:** The children elements associated with the current element.

### Example

::: warning
If you want to change the output of the CSS, you should change propert of `element.return`. Otherwise, the CSS will not be generated as you expect.
:::

```ts
plugin.register({
  beforeBuild: (element: Element, index: number, children: Element[]) => {
    // Change the element's CSS if it contains a specific value
    if (element.children === 'red') {
      element.return = 'color: blue'
    }
  }
})
```

## `afterBuild` Hook

The afterBuild hook is called after CSS has been compiled. It provides access to the CSS.

### Signature

```ts
type afterBuildCallback = (css: string) => string ｜ void;
```

### Parameters:

- **css:** The CSS that has been generated.

### Example

```ts
plugin.register({
  afterBuild: (css: string) => {
    // Modify the compiled CSS before returning
    return css.replace(/color:red/g, 'color:blue')
  }
})
```
