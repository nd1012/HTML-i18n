/*
 * Version: 2
 * License: MIT
 * GitHub page: https://github.com/nd1012/HTML-i18n
 */

// Translate i18n text node contents in the DOM or a single text
function i18n_translate(getInfoOnly,missingOnly,warn){
	// Prepare
		// Browser extension API
	const api=chrome||msBrowser||browser,
		// Attribute names
		attrs=api.i18n?['Title','Alt','Value']:null,
		// Translate only?
		translate=typeof getInfoOnly=='string',
		// Log a warning on missing translation?
		warning=(translate&&missingOnly)||(!translate&&warn),
		// Message ID to use
		messageId=translate?getInfoOnly:null,
		// Found texts
		res=translate?null:{};
	// Ensure the i18n API is useable
	if(!api.i18n) return translate?'':res;// i18n API not supported by browser
	// Get the translation for a message ID
	if(translate){
		let translation=api.i18n.getMessage(messageId);
		if(warning&&translation==''){
			console.warn('Missing translation for "'+messageId+'"');
			console.trace();
		}
		return translation;
	}
	// Translate the DOM
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
	for(const element of document.querySelectorAll('*[data-i18ntext],*[data-i18nhtml]')){
		html=element.hasAttribute('data-i18nhtml');
		id=element.getAttribute(html?'data-i18nhtml':'data-i18ntext');
		info=element.hasAttribute('data-i18ninfo')?element.getAttribute('data-i18ninfo'):null;
		translation=api.i18n.getMessage(id);
		if(translation==''||!missingOnly) res[id]={
				message:html?element.innerHTML:element.innerText,
				description:info,
				html:html,
				attr:null,
				missing:translation==''
			};
		if(translation!=''&&!getInfoOnly)
			if(html){
				element.innerHTML=translation;
			}else{
				element.innerText=translation;
			}
		if(warning&&translation=='')
			console.log('Missing translation "'+id+'"',element);
		for(const attr of attrs){
			if(!element.hasAttribute(attr)) continue;
			attrId=id+attr;
			translation=api.i18n.getMessage(attrId);
			if(translation==''||!missingOnly) res[attrId]={
					message:element.getAttribute(attr),
					description:info==null?null:info+' ('+attr+')',
					html:false,
					attr:attr.toLowerCase(),
					missing:translation==''
				};
			if(translation!=''&&!getInfoOnly)
				element.setAttribute(attr,translation);
			if(warning&&translation=='')
				console.log('Missing translation "'+attrId+'"',element);
		}
	}
	return res;
}
