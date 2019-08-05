(async function () {
	try {
		const alertAndReturn = function (text) {
			alert(text);
			return text;
		};

		/* try to open account sidebar panel, if it isn't already */
		const crossBrandHeader = document.querySelector('#cross-brand-header');
		if (crossBrandHeader) {
			var isAccountOpen = crossBrandHeader.classList.contains('is-account-open');
			if (!isAccountOpen) {
				const openSettingsDiv = document.querySelector('.c-platform-logged--account');
				if (openSettingsDiv) {
					openSettingsDiv.click();
					isAccountOpen = crossBrandHeader.classList.contains('is-account-open');
					if (!isAccountOpen) {
						throw alertAndReturn('account sidebar panel has to be open');
					}
				}
			}
		}

		const searchBox = document.querySelector('.js-contacts-search-input');
		if (!searchBox) {
			throw alertAndReturn('cannot find contact search box');
		}
		if (window.getComputedStyle(searchBox).display === 'none') {
			throw alertAndReturn('contact search box is not visible');
		}

		const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

		/* scroll contacts to the end to get existing friends */
		const getExistingNickNames = async (maxRetry, linkSelector) => {
			const contactListElement = document.querySelector('.js-contacts-list');
			const contactListQuery = jQuery(contactListElement);
			await contactListQuery.stop().animate({
				scrollTop: contactListQuery[0].scrollHeight
			}, 2500).promise();

			/* if there's unloaded nicks, retry scrolling until all are loaded */
			var rescrollRetries = 0;
			var unloadedNickCount = 0;
			const getUnloadedNickCount = function () {
				return unloadedNickCount = document.querySelectorAll('.isnt-loaded').length;
			}
			while (rescrollRetries++ < maxRetry && getUnloadedNickCount() > 0) {
				console.log("found " + unloadedNickCount + "unloaded nick names, retry scolling...");
				await contactListQuery.stop().animate({
					scrollTop: 0
				}, 500).promise();

				await contactListQuery.stop().animate({
					scrollTop: contactListQuery[0].scrollHeight
				}, 1500).promise();
			}

			if (unloadedNickCount) {
				console.log('there\'re still unloaded nick names, will continue with what I have...');
			}

			/* wait 0.5 secs for things to settle */
			await sleep(500);

			return Array.from(document.querySelectorAll('.js-nickname'))
				.filter(t => {
					/* only return nicks without visible (un)follow link */
					const followLink = t.parentElement.querySelector(linkSelector);
					return followLink && window.getComputedStyle(followLink).display != 'none';
				})
				.map(t => t.textContent);
		}

		const nickNames = await getExistingNickNames(10, '.js-unfollow');
		console.log("found " + nickNames.length + " nick names");

		const nickNamesAsJSon = JSON.stringify(nickNames);
		await sleep(1500);

		const getSelection = window.documentOrShadowRootInstance && documentOrShadowRootInstance.getSelection
			? documentOrShadowRootInstance.getSelection
			: (window.getSelection
				? window.getSelection
				: null);
		const previousSelection = getSelection
			? getSelection()
			: null;
		const previousSelectionRange = previousSelection && previousSelection.getRangeAt && previousSelection.rangeCount
			? previousSelection.getRangeAt(0)
			: null;

		try {
			/* put nicks into search box to copy it */
			searchBox.value = nickNamesAsJSon;

			searchBox.focus();
			searchBox.select();
			searchBox.scrollIntoView();
			document.execCommand('copy');

		} finally {
			/* restore previous selection */
			if (previousSelectionRange) {
				const currentSelection = getSelection();
				currentSelection.removeAllRanges();
				currentSelection.addRange(previousSelectionRange);
			}
		}
	} finally {
		if (window.scContactsBookmarklets && typeof window.scContactsBookmarklets.executeAfter === 'function') {
			window.scContactsBookmarklets.executeAfter();
		}
	}
})()