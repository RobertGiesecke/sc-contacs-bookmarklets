(async function () {
	try {
		/* scroll contacts to the end */
		const contactListElement = document.querySelector('.js-contacts-list');
		const contactListQuery = jQuery(contactListElement);
		await contactListQuery.stop().animate({
			scrollTop: contactListQuery[0].scrollHeight
		}, 2500).promise();
		const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
		//* wait 2.5 secs for things to settle */
		await sleep(2500)
		const nickNamesAsJSon = JSON.stringify(Array.from(document.querySelectorAll('.js-nickname')).map(t => t.textContent));
		/* put nicks into search box to copy it */
		await sleep(1500);
		const searchBox = document.querySelector('.js-contacts-search-input');
		searchBox.value = nickNamesAsJSon;
		searchBox.focus();
		searchBox.select();
		document.execCommand('copy');
	} finally {
		if (window.scContactsBookmarklets && typeof window.scContactsBookmarklets.executeAfter === 'function') {
			window.scContactsBookmarklets.executeAfter();
		}
	}
})()