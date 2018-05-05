# CSS

You can add/modify CSS in your project, but bear in mind that CSS is using a global scope and watch out for name clashes.

One of two approaches (or a combination) are the most appropriate:

## main.css
You can import a *main.css*:

```
|____client.js
|____src
|____css
| |____main.css
| |____other.css
```

```css
/* ./css/main.css */

/* You can use @import to import css from other files */
@import './other.css';

#myDiv {
  height: 200px;
}
```

```js
// ./client.js
import './css/main.css' // That's it.
...
```

## Stage-based CSS
> Notice: Even though you can import CSS per stage it will still be valid globally. So names can clash. Perhaps prefix any stage-specific classes and ids.

You can import CSS in any of your client side `js` files. One other obvious solution is to create css alongside your stages:

```
|____src
| |____stages
| | |____stage1
| | | |____index.js
| | | |____client.js
| | | |____stage1.html
| | | |____stage1.css
```

```js
// .../stage1/index.js
import './stage1.css' // That's it.
```

The upside here is that you can colocate the css with the stage it relates to. You can also structure your files like this if you prefer and still `@import` them all in `main.css` instead of in `.../stage/index.js`.

## Combination

Most likely you will want a combination of those two approaches:

- Use `main.css` for general styling.
- Use `stage.css` for stage-specific styling (and prefix your classes and ids)
