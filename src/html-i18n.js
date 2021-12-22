/*
 * Version: 1
 * License: MIT
 * GitHub page: https://github.com/nd1012/HTML-i18n
 */

// Translate i18n text node contents in the DOM
function i18n_translate(getInfoOnly,missingOnly){
		// Found texts
	const res={},
		// Browser extension API
		api=chrome||msBrowser||browser,
		// Attribute names
		attrs=api.i18n?['Title','Alt','Value']:null;
	if(!api.i18n) return res;// i18n API not supported by browser
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
		}
	}
	return res;
}
