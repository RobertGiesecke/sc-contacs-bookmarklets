(function () {
	try {
		const orgDiv = document.querySelector('#organization');
		const nickNamesAsJSon = orgDiv ? JSON.stringify(Array.from(orgDiv.querySelectorAll('.nick')).map(t => t.textContent)) : null;

		const searchBox = document.querySelector('input[name=search]');

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

		return nickNamesAsJSon
	} finally {
		if (window.scContactsBookmarklets && typeof window.scContactsBookmarklets.executeAfter === 'function') {
			window.scContactsBookmarklets.executeAfter();
		}
	}
})()