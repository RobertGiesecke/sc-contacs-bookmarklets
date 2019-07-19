(function(){
	const orgDiv = document.querySelector('#organization');
	const nickNamesAsJSon = orgDiv ? JSON.stringify(Array.from(orgDiv.querySelectorAll('.nick')).map(t => t.textContent)) : null;

	const searchBox=document.querySelector('.js-contacts-search-input');
	searchBox.value = nickNamesAsJSon;
	searchBox.focus();
	searchBox.select();
	document.execCommand('copy');
	return nickNamesAsJSon
})()