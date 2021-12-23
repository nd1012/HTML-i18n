/*
 * Version: 3
 * License: MIT
 * GitHub page: https://github.com/nd1012/HTML-i18n
 */

// Translate the DOM or a single message ID, or a list of message IDs, or a single HTML element
function i18n_translate(getInfoOnly,missingOnly,warn){
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
	var id,
		// If the translation is HTML
		html,
		// The translation description
		info,
		// The translation
		translation,
		// Attribute message ID
		attrId;
		// Browser extension API
	const api=(chrome||msBrowser||browser).i18n||null,
		// i18n HTML attribute
		i18nhtml='data-i18nhtml',
		// i18n text attribute
		i18ntext='data-i18ntext',
		// i18n info attribute
		i18ninfo='data-i18ninfo',
		// Empty string
		empty='',
		// Inner text property name
		innerText='innerText',
		// Inner HTML property name
		innerHTML='innerHTML',
		// Create an error message when missing a translation
		missingTranslation=(id)=>'Missing translation "'+id+'"',
		// Attribute names
		attrs=api?['Title','Alt','Value']:null,
		// Translate only?
		translate=typeof getInfoOnly=='string',
		// Log a warning on missing translation?
		warning=(translate&&missingOnly)||(!translate&&warn),
		// Message ID to use
		messageId=translate?getInfoOnly:null,
		// Found texts
		res=translate?null:{},
		// Handle a HTML element
		handleElement=(element)=>{
			html=element.hasAttribute(i18nhtml);
			info=element.getAttribute(i18ninfo);
			translation=api.getMessage(id=element.getAttribute(html?i18nhtml:i18ntext));
			if(translation==empty||!missingOnly) res[id]={
					message:element[html?innerHTML:innerText],
					description:info,
					html:html,
					attr:null,
					missing:translation==empty
				};
			if(translation!=empty&&!getInfoOnly) element[html?innerHTML:innerText]=translation;
			if(warning&&translation==empty) console.log(missingTranslation(id),element);
			for(const attr of attrs){
				if(!element.hasAttribute(attr)) continue;
				translation=api.getMessage(attrId=id+attr);
				if(translation==empty||!missingOnly) res[attrId]={
						message:element.getAttribute(attr),
						description:info==null?null:info+' ('+attr+')',
						html:false,
						attr:attr.toLowerCase(),
						missing:translation==empty
					};
				if(translation!=empty&&!getInfoOnly) element.setAttribute(attr,translation);
				if(warning&&translation==empty) console.log(missingTranslation(attrId),element);
			}
		};
	// Ensure the i18n API is useable
	if(!api) return translate?empty:res;// i18n API not supported by browser
	// Get the translation for a message ID
	if(translate){
		const translation=api.getMessage(messageId);
		if(warning&&translation==empty){
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
}
