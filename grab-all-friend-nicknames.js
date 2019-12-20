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

		const makeRsiApiCallAsync = (rsiCall) => {
			return (data) => new Promise((resolve) => rsiCall(resolve, data));
		};

		const getFriendNickNames = async () => {

			var foundNickNames = [];

			const listCall = makeRsiApiCallAsync(RSI.Api.Contacts.list);
			var result = await listCall();

			while (result && result.data) {
				foundNickNames.push(...result.data.resultset.map(c => c.nickname));

				if (!result.data.pagecount) {
					result = null;
					break;
				}
				const nextData = {
					page: result.data.page + 1,
					cursor: result.data.cursor
				}
				result = await listCall(nextData);
			}
			return foundNickNames;
		}

		const nickNames = await getFriendNickNames();

		console.log("found " + nickNames.length + " nick names");

		const nickNamesAsJSon = JSON.stringify(nickNames);

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