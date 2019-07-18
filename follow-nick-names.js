/* this script expects a JSON array of nick names in the contacts search */
/* it will exclude all existing friends and will try to find and follow every remaining nick name */
(async () => {
	const searchBox = document.querySelector('.js-contacts-search-input');
	const ownProfileHandleLink = document.querySelector('.c-account-sidebar__profile-info-handle');
	const ownProfileHandle = ownProfileHandleLink ? ownProfileHandleLink.textContent : null;

	const contactsDiv = document.querySelector('#sidebar-contacts-list');
	const resultsText = document.querySelector('.c-account-sidebar-contacts__results-title');
	const userNicks = JSON.parse(searchBox.value);
	const searchSubmit = document.querySelector('.js-submit-contacts-search');
	const clearSearchBox = () => {
		//const searchSubmit = document.querySelector('.js-submit-contacts-search');
		if(contactsDiv.classList.contains('is-searching')) {
			searchSubmit.click();
		}
	};
	const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
	const getNickOfFollowLink = a => a.parentElement.parentElement.querySelector('.js-nickname');

	/* scroll contacts to the end to get existing friends */
	const contactListElement = document.querySelector('.js-contacts-list');
	const contactListQuery = jQuery(contactListElement);
	contactListQuery.stop().animate({
		scrollTop: contactListQuery[0].scrollHeight
	}, 2500);
	/* wait for things to settle */
	await sleep(2500);

	const alreadyFollowingNickNames = Array.from(document.querySelectorAll('.js-nickname')).map(t => t.textContent);

	for(user of userNicks) {
		if(user == ownProfileHandle) {
			console.log('skip self: ' + user);
			continue;
		}
		if(alreadyFollowingNickNames.indexOf(user) > -1) {
			console.log('already following ' + user);
			continue;
		}
		clearSearchBox();
		searchBox.focus();
		searchBox.value = user;
		if(searchBox.value != user) {
			clearSearchBox();
			await sleep(200);
			searchBox.value = user;
		}
		searchSubmit.click();

		await sleep(400);

		const followLinks = Array.from(contactsDiv.querySelectorAll('.js-follow'));
		const followLinksWithNick = followLinks.filter(a => {
			var nickLink = getNickOfFollowLink(a);
			return nickLink && nickLink.textContent == user;
		});

		if(followLinksWithNick.length == 1) {
			const followLink = followLinksWithNick[0];
			const linkStyle = window.getComputedStyle(followLink);
			if(linkStyle.display == 'none') {
				console.log('already following ' + user);
			} else {
				followLinksWithNick[0].click();
				console.log('clicked follow ' + user);
			}
		} else {
			/* if you already follow the user, the result will be displayed twice, */
			/* both with hidden follow link */
			if(followLinksWithNick.length == 2) {
				if(followLinksWithNick.filter(t => window.getComputedStyle(t).display == 'none').length) {
					console.log('already following ' + user);
					continue;
				}
			}
			console.log('couldn\'t find ' + user);
		}
	};
})()