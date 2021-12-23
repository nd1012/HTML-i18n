# HTML i18n

A JavaScript tool for browser extensions that want to use the i18n API with HTML.

## Usage

To load this tool in your HTML page:

```html
...
<head>
	<script src="/path/to/html-i18n.min.js"></script>
	<!-- Or via CDN:
	<script src="https://cdn.jsdelivr.net/gh/nd1012/HTML-i18n/src/html-i18n.min.js"></script>-->
</head>
...
```

Please read the [Mozilla i18n reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n) and be sure to understand which folders and files, and which modifications in the manifest file of your browser extension are required in order to use the i18n API. You'll see that you can do many things already - but there's no support for HTML. This is where this JavaScript library comes into play.

A simple sample HTML:

```html
<p data-i18ntext="sample1" title="This title will be translated">This is text to be translated</p>
<p data-i18nhtml="sample2">This is <strong>HTML</strong> to be translated</p>
```

The required `messages.json`:

```json
{
	"sample1": {
		"message": "This is text to be translated",
		"description": "The inner text of the HTML node"
	},
	"sample1Title": {
		"message": "This title will be translated",
		"description": "The title of the HTML node"
	},
	"sample2": {
		"message": "This is <strong>HTML</strong> to be translated",
		"description": "The inner HTML of the HTML node"
	}
}
```

To apply a translation to the current DOM:

```js
i18n_translate();
```

To get a warning in the JavaScript console on missing translations:

```js
i18n_translate(false,false,true);
```

**NOTE**: In case the i18n API returned an empty string, the current text will stay unchanged.

### Attribute to translate the inner text

Use the `data-i18ntext` attribute to specify the i18n ID of the message that's going to be set to the `innerText` property of the HTML element.

### Attribute to translate the inner HTML

Use the `data-i18nhtml` attribute to specify the i18n ID of the message that's going to be set to the `innerHTML` property of the HTML element. The `message` in the `messages.json` should contain valid HTML in this case.

### Translating title, alternative text and value

If a HTML element has the `data-i18n*` attribute, and it has `title`, `alt` or `value` attributes, too, the `i18n_translate` function will translate their contents, if the `messages.js` contains a message ID having the ID from the `data-i18n*` attribute as prefix, and the capitalized attribute name (`Title`, `Alt` or `Value`) as postfix.

In case you want to translate the attribute values only, simply omit the message for the ID defined in the `data-i18n*` attribute.

## Get the translation for a message ID

```js
const translated = i18n_translate('messageId');
```

Or with warning and stack trace on missing translation:

```js
const translated = i18n_translate('messageId',true);
```

## Get the translations for a list of message IDs


```js
const translated = i18n_translate(['messageId',...]);
```

Or with warning and stack trace on missing translations:

```js
const translated = i18n_translate(['messageId',...],true);
```

## Translate a single HTML element

```js
i18n_translate(document.querySelector('#element'));
```

Or with warning on missing translations:

```js
i18n_translate(document.querySelector('#element'),true);
```

## Translation information

When translating the DOM or a single HTML element, the `i18n_translate` function returns an object with the collected translation information, which may look like this:

```json
{
	"messageId": {
		"message": "<strong>Message</strong> to translate",
		"description": null,
		"html": true,
		"attr": null,
		"missing": false
	},
	"messageIdTitle": {
		"message": "Title to translate",
		"description": null,
		"html": false,
		"attr": "title",
		"missing": true
	},
	...
}
```

This object would be generated from this HTML element:

```html
<p data-i18nhtml="messageId" title="Title to translate"><strong>Message</strong> to translate</p>
```

If you want to get this object only (without applying the translation), use the `i18n_translate` function like this:

```js
const translationMessages = i18n_translate(true);// Only FIND translations
```

If you want to include only missing translations in the returned object:

```js
const missingTranslation = i18n_translate(true,true);// Only find MISSING translations
```

You can use this object for merging existing `messages.json` files with an updated version of your HTML, for example. The `missing` property is `false`, when the i18n ID was found in the existing `messages.json` file, and `true`, when the translation is missing (the i18n API returned an empty string for the message ID).

In order to specify a value for the `description` property, use the `data-i18ninfo` attribute:


```html
<p 
	data-i18nhtml="messageId" 
	data-i18ninfo="Any usage description" 
	title="Title to translate"
><strong>Message</strong> to translate</p>
```

The resulting JSON object for this example:

```json
{
	"messageId": {
		"message": "<strong>Message</strong> to translate",
		"description": "Any usage description",
		"html": true,
		"attr": null,
		"missing": false
	},
	"messageIdTitle": {
		"message": "Title to translate",
		"description": "Any usage description (title)",
		"html": false,
		"attr": "title",
		"missing": true
	},
	...
}
```
