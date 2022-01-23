/*
 * Version: 5
 * License: MIT
 * GitHub page: https://github.com/nd1012/HTML-i18n
 */

	// Default locale
const i18n_defaultLocale='en',
	// Loaded messages
	i18n_messages={};

	// Current locale
var i18n_locale=null,
	// The base locale URI (without trailing slash)
	i18n_localeUri=null,
	// Does the server provide a locales.json file? If loaded, the value is the loaded array
	i18n_localeInfo=false;

// Translate the DOM or a single message ID, or a list of message IDs, or a single HTML element
const i18n_translate=(getInfoOnly,missingOnly,warn)=>{
	// Translate a list of message IDs
	if(typeof getInfoOnly=='array'){
			// Texts
		const translations=[];
		missingOnly=!!missingOnly;
		for(const id of getInfoOnly) translations.push(i18n_translate(id,missingOnly));
		return translations;
	}
	// Prepare
		// A found message ID
	let id,
		// If the translation is HTML
		html,
		// The translation description
		info,
		// The translation
		translation,
		// Attribute message ID
		attrId;
		// Browser extension i18n API
	const api=(chrome||msBrowser||browser)?.i18n,
		// i18n HTML attribute
		i18nhtml='data-i18nhtml',
		// i18n text attribute
		i18ntext='data-i18ntext',
		// i18n info attribute
		i18ninfo='data-i18ninfo',
		// Empty string
		empty='',
		// Undefined string
		undef='undefined',
		// Message string
		ms='message',
		// Inner text property name
		innerText='innerText',
		// Inner HTML property name
		innerHTML='innerHTML',
		// Create an error message when missing a translation
		missingTranslation=(id)=>'Missing translation "'+id+'"',
		// Attribute names
		attrs=['Title','Alt','Value'],
		// Translate only?
		translate=typeof getInfoOnly=='string',
		// Log a warning on missing translation?
		warning=(translate&&missingOnly)||(!translate&&warn),
		// Message ID to use
		messageId=translate?getInfoOnly:null,
		// Found texts
		res=translate?null:{},
		// Translate a message ID
		translateMessage=(id)=>{
			if(api) return api.getMessage(id);
			return i18n_locale==null||
				typeof i18n_messages[i18n_locale]==undef||
				typeof i18n_messages[i18n_locale][id]==undef||
				typeof i18n_messages[i18n_locale][id][ms]==undef
				?empty
				:i18n_messages[i18n_locale][id][ms];
		},
		// Handle a HTML element
		handleElement=(element)=>{
			html=element.hasAttribute(i18nhtml);
			info=element.getAttribute(i18ninfo);
			translation=translateMessage(id=element.getAttribute(html?i18nhtml:i18ntext));
			if(translation==empty||!missingOnly) res[id]={
					message:element[html?innerHTML:innerText],
					description:info,
					html,
					attr:null,
					missing:translation==empty
				};
			if(translation!=empty&&!getInfoOnly) element[html?innerHTML:innerText]=translation;
			if(warning&&translation==empty) console.warn(missingTranslation(id),element);
			for(const attr of attrs){
				if(!element.hasAttribute(attr)) continue;
				translation=translateMessage(attrId=id+attr);
				if(translation==empty||!missingOnly) res[attrId]={
						message:element.getAttribute(attr),
						description:info==null?null:info+' ('+attr+')',
						html:false,
						attr:attr.toLowerCase(),
						missing:translation==empty
					};
				if(translation!=empty&&!getInfoOnly) element.setAttribute(attr,translation);
				if(warning&&translation==empty) console.warn(missingTranslation(attrId),element);
			}
		};
	// Get the translation for a message ID
	if(translate){
			// Translation
		const translation=translateMessage(messageId);
		if(warning&&translation==empty){
			// Raise a warning, if a translation is missing
			console.warn(missingTranslation(messageId));
			console.trace();
		}
		return translation;
	}
	// Translate a single HTML element
	if(getInfoOnly instanceof HTMLElement){
			// HTML element
		const element=getInfoOnly;
		getInfoOnly=false;
		warn=!!missingOnly;
		missingOnly=false;
		handleElement(element);
		return res;
	}
	// Translate the DOM
	for(const element of document.querySelectorAll('*[data-i18ntext],*[data-i18nhtml]')) handleElement(element);
	return res;
};

// Translate a message ID with optional parameters
const i18n_text=(...param)=>{
	// Translate
		// Message ID
	const id=param.shift(),
		// Translation
		text=i18n_translate(id);
	if(text=='') return text;
	// Interpret variables
	param.unshift(text);
	param.unshift(id);
	return i18n_var(...param);
};

// Get a plural translation with optional parameters
const i18n_plural=(...param)=>{
	// Fallback to normal translation, if running in browser extension context
		// Browser extension i18n API
	const api=(chrome||msBrowser||browser)?.i18n,
		// Message ID
		id=param.shift(),
		// Count
		count=param.shift();
	if(api||count==1){
		param.unshift(id);
		return i18n_text(...param);
	}
	// Try the plural translation
		// Plural string
	const ps='plural',
		// Undefined string
		undef='undefined',
		// Plural
		plural=i18n_locale!=null&&
			typeof i18n_messages[i18n_locale]!=undef&&
			typeof i18n_messages[i18n_locale][id]!=undef&&
			typeof i18n_messages[i18n_locale][id][ps]!=undef
			?i18n_messages[i18n_locale][id][ps]
			:null,
		// Maximum counter values
		maxCounter=plural&&typeof plural!='string'?Object.keys(plural).sort((a,b)=>+a-+b):null;
	if(plural==null){
		// Raise a warning, if the translation doesn't define any plural information
		console.warn(
			'No plural available for "'+id+'"',
			i18n_locale!=null&&
				typeof i18n_messages[i18n_locale]!=undef&&
				typeof i18n_messages[i18n_locale][id]!=undef
				?i18n_messages[i18n_locale][id]
				:'(unknown message ID)'
			);
		console.trace();
		param.unshift(id);
		return i18n_text(...param);
	}
		// Plural value
	let text=maxCounter==null?plural:null;
	if(!maxCounter)
		for(const max in maxCounter){
			if(max==''||count>max) continue;
			text=plural[max];
			break;
		}
	// Use the default, if no plural was found
	if(text==null) text=typeof plural['']!=undefined?plural['']:i18n_translate(id);
	// Interpret variables
	param.unshift(text);
	param.unshift(id);
	return i18n_var(...param);
};

// Replace variables
const i18n_var=(...param)=>{
		// Browser extension i18n API
	const api=(chrome||msBrowser||browser)?.i18n,
		// Message ID
		id=param.shift(),
		// Undefined string
		undef='undefined';
		// Translation
	let text=param.shift();
	// Don't do anything, if in extension context
	if(api) return text;
	// Interpret variables
		// Placeholders string
	const phs='placeholders',
		// Placeholders 
		placeholders=i18n_locale!=null&&
			typeof i18n_messages[i18n_locale]!=undef&&
			typeof i18n_messages[i18n_locale][id]!=undef&&
			typeof i18n_messages[i18n_locale][id][phs]!=undef
			?i18n_messages[i18n_locale][id][phs]
			:null,
		// Regular expression to match a parameter number
		rx=/^\$\d+$/;
		// Placeholder value
	let value;
	if(!placeholders){
		// No variables defined
		if(param.length){
			// Raise a warning, if variables are given, but the translation doesn't define any placeholder
			console.warn(
				'No variables allowed for "'+id+'"',
				i18n_locale!=null&&
					typeof i18n_messages[i18n_locale]!=undef&&
					typeof i18n_messages[i18n_locale][id]!=undef
					?i18n_messages[i18n_locale][id]
					:'(unknown message ID)'
				);
			console.trace();
		}
		return text;
	}
	for(const [key,def] of Object.entries(placeholders)){
		value=rx.test(def.content)?param[parseInt(def.content.substring(1))-1]:def.content;
		text=text.replace('$'+key+'$',value);
	}
	return text;
};

// Determine the user locale
const i18n_determineLocale=async ()=>{
	// Use the current locale, if set
	if(i18n_locale!=null) return i18n_locale;
	// Determine the locale from the i18n API or the browser
		// Browser extension i18n API
	const api=(chrome||msBrowser||browser)?.i18n;
		// Determined locale
	let locale=api?(await api.getAcceptLanguages())[0]:navigator.language;
	// Normalize the locale
	if(locale.length>2&&locale.indexOf('-')==2) locale=locale.substring(0,2)+'_'+locale.substring(3);
	return locale;
};

// Load messages for a locale (if not given, the current locale will be used)
const i18n_loadMessages=async (locale,fallBack)=>{
		// Undefined string
	const undef='undefined',
		// Messages file URI
		msgs='/messages.json';
	// Ensure having a locale
	if(typeof locale==undef||locale==null) locale=await i18n_determineLocale();
	// Normalize the locale
	if(locale.length>2&&locale.indexOf('-')==2) locale=locale.substring(0,2)+'_'+locale.substring(3);
	// Return the already loaded messages
	if(typeof i18n_messages[locale]!=undef)
		return !i18n_messages[locale]&&fallBack?await i18n_loadMessages(i18n_defaultLocale):i18n_messages[locale];
	// Load the messages
		// Locales base URI
	const baseUri=i18n_localeUri==null?'/_locales':i18n_localeUri;
	if(i18n_localeInfo){
		// Determine from the locales information if the locale exists
		if(typeof i18n_localeInfo!='array') i18n_localeInfo=await (await fetch(baseUri+'/locales.json')).json();
		if(i18n_localeInfo&&typeof i18n_localeInfo[locale]==undef)
			// Return the default locale messages, if the locale doesn't exist
			if(locale.length>2){
				// Try the language of a locale, if the locale doesn't exist
				locale=locale.substring(0,2);
				if(typeof i18n_localeInfo[locale]==undef) return await i18n_loadMessages(i18n_defaultLocale);
			}else{
				return await i18n_loadMessages(i18n_defaultLocale);
			}
	}
		// Loaded messages
	let messages=await (await fetch(baseUri+'/'+locale+msgs)).json();
	// Try the language of a locale, if the messages couldn't be loaded from the locale
	if(!messages&&locale.lenght>2){
		locale=locale.substring(0,2);
		messages=await (await fetch(baseUri+'/'+locale+msgs)).json();
	}
	// If the default locale has no messages, get the messages from the DOM
	if(!messages&&locale==i18n_defaultLocale) i18n_messages[i18n_defaultLocale]=messages=i18n_translate(true);
	// Store and return the loaded messages, or apply the fallback
	if(fallBack&&!messages) return await i18n_loadMessages(i18n_defaultLocale);
	return i18n_messages[locale]=messages?messages:null;
};

// Set the current locale
const i18n_setLocale=async (locale,warn)=>{
	// Normalize the locale
	if(locale.length>2&&locale.indexOf('-')==2) locale=locale.substring(0,2)+'_'+locale.substring(3);
	// Set the current locale
	i18n_locale=locale;
	// Update the HTML lang attribute
		// Browser extension i18n API
	const api=(chrome||msBrowser||browser)?.i18n,
		// HTML tag
		html=document.querySelector('html'),
		// Locale language
		language=html?i18n_locale.substring(0,2):null;
	if(html&&html.getAttribute('lang')!=language) html.setAttribute('lang',language);
	// Translate the DOM
		// Loaded messages
	const messages=api?null:await i18n_loadMessages(null,true);
	i18n_translate(false,false,!!warn);
	return messages;
};

// Initialize
const i18n_init=async (uri,hasLocalesInfo,warn)=>{
	// Set if locales information file is available
	if(hasLocalesInfo&&!i18n_localeInfo) i18n_localeInfo=true;
	// Set the locales URI
	if(typeof uri!='undefined') i18n_localeUri=uri;
	// Set the current locale
	await i18n_setLocale(await i18n_determineLocale(),!!warn);
	// Return the current locale
	return i18n_locale;
};
