# HTML i18n

A JavaScript tool for browser extensions and normal websites that want to use the i18n API (or the emulation) with HTML.

- [Usage](#usage)
	- [Load the library](#load-the-library)
	- [Apply translations for HTML](#apply-translations-for-html)
		- [Attribute to translate the inner text](#attribute-to-translate-the-inner-text)
		- [Attribute to translate the inner HTML](#attribute-to-translate-the-inner-html)
		- [Translating title, alternative text and value](#translating-title-alternative-text-and-value)
	- [Translate in JavaScript](#translate-in-javascript)
		- [Just text or with variables](#just-text-or-with-variables)
		- [Get the translation for a message ID](#get-the-translation-for-a-message-id)
		- [Get the translations for a list of message IDs](#get-the-translations-for-a-list-of-message-ids)
		- [Translate a single HTML element](#translate-a-single-html-element)
- [Translation information](#translation-information)
- [Functionality for normal websites](#functionality-for-normal-websites)
	- [Change the current locale](#change-the-current-locale)
	- [Determine the locale](#determine-the-locale)
	- [Load messages of a locale](#load-messages-of-a-locale)
	- [Plural](#plural)
	- [Parse placeholders](#parse-placeholders)
	- [Global constants / variables](#global-constants-variables)

## Usage

### Load the library

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

**NOTE**: Please read the [Mozilla i18n reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n) and be sure to understand which folders and files, and which modifications in the manifest file of your browser extension are required in order to use the i18n API. You'll see that you can do many things already - but there's no support for HTML. This is where this JavaScript library comes into play.

In case you don't use this library within a browser extension, but with a normal website, you need to initialize first:

```html
<script type="application/javascript">
window.addEventListener('load',async ()=>await i18n_init());
</script>
```

The `i18n_init` method takes these optional arguments:

1. `uri`: The base URI to the locales (without trailing slash) (default: `/_locales`)
2. `hasLocalesInfo`: If the locales URI serves an array of available locales in the file `locales.json`
3. `warn`: Write a warning to the JavaScript console, if translations are missing?

Example for a `locales.json` file within the locales base URI:

```json
[
	"en",
	"en_AU",
	"en_CA",
	"en_EN",
	"en_US",
	"de",
	"de_AT",
	"de_CH",
	"fr",
	"fr_CA",
	"fr_CH",
	"es",
	"pt",
	"it",
	"it_CH",
	"zh",
	"hi_IN"
]
```

**NOTE**: The default locale is `en`!

See the [Online demonstration](https://nd1012.github.io/HTML-i18n/) for a live example.

### Apply translations for HTML

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

#### Attribute to translate the inner text

Use the `data-i18ntext` attribute to specify the i18n ID of the message that's going to be set to the `innerText` property of the HTML element.

#### Attribute to translate the inner HTML

Use the `data-i18nhtml` attribute to specify the i18n ID of the message that's going to be set to the `innerHTML` property of the HTML element. The `message` in the `messages.json` should contain valid HTML in this case.

#### Translating title, alternative text and value

If a HTML element has the `data-i18n*` attribute, and it has `title`, `alt` or `value` attributes, too, the `i18n_translate` function will translate their contents, if the `messages.js` contains a message ID having the ID from the `data-i18n*` attribute as prefix, and the capitalized attribute name (`Title`, `Alt` or `Value`) as postfix.

In case you want to translate the attribute values only, simply omit the message for the ID defined in the `data-i18n*` attribute.

### Translate in JavaScript

#### Just text or with variables

Just text:

```js
const text = i18n_text('messageId');
```

With variables:

```js
const text = i18n_text('messageId','value1','value2',...);
```

Example `messages.json` for variables:

```json
{
	"messageId": {
		"message": "Resulting text with $value1$ and $value2$",
		"placeholders": {
			"value1": {
				"content": "$1",
				"example": "Any value"
			},
			"value2": {
				"content": "$2",
				"example": "Any value"
			}
		}
	},
	...
}
```

See the [Mozilla reference](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/i18n/Locale-Specific_Message_reference) for details.

#### Get the translation for a message ID

```js
const translated = i18n_translate('messageId');
```

Or with warning and stack trace on missing translation:

```js
const translated = i18n_translate('messageId',true);
```

#### Get the translations for a list of message IDs


```js
const translated = i18n_translate(['messageId',...]);
```

Or with warning and stack trace on missing translations:

```js
const translated = i18n_translate(['messageId',...],true);
```

#### Translate a single HTML element

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

## Functionality for normal websites

Within a browser extension the i18n browser API method `getMessage` will be used, only. But if you use this library in a normal website context, you can do more:

### Change the current locale

```js
await i18n_setLocale('de');
```

This call will set the new current locale, load messages and translate the DOM.

### Determine the locale

```js
const locale = await i18n_determineLocale();
```

The returned locale may be a full locale string like `en_US`, or the language only (like `en`).

### Load messages of a locale

```js
const messages = await i18n_loadMessages('de',true);
```

This will load the messages of the given locale.

Both arguments are optional:

1. `locale`: The locale to use (default: the current or determined locale)
2. `fallBack`: Use the default locale as fallback?

If no messages for the used default locale were found on the server, the messages will be set from the DOM.

### Plural

Give the message ID and a number as parameters (and optional add variables as required):

```js
const text = i18n_plural('messageId',3);
```

Example `messages.json` for plural:

```json
{
	"messageId": {
		"message": "Resulting singular text",
		"plural": "Resulting text for a number greater than one"
	},
	...
}
```

Example `messages.json` for multiple plural:

```json
{
	"messageId": {
		"message": "Resulting singular text",
		"plural": {
			"2": "Resulting text for a number of a maximum of 2",
			"3": "Resulting text for a number of a maximum of 3",
			"": "Resulting text for a number greater than 3"
		}
	},
	...
}
```

Multiple plural forms may be required in some languages.

### Parse placeholders

In case you have a string and its message ID, the string contains variables, and you want to replace them with values:

```js
const text = i18n_var('messageId','Text with $placeholder$','placeholder value');
```

You may add any number of variables required.

### Global constants / variables

- `i18n_defaultLocale`: Default locale (`en`)
- `i18n_messages`: Loaded messages
- `i18n_locale`: Current locale
- `i18n_localeUri`: Base URI to the locales
- `i18n_localeInfo`: If having locales information, or the loaded locales information
