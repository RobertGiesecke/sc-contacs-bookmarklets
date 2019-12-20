(async () => {
	try {
		const orgDiv = document.querySelector('#organization');
		if (!orgDiv) {
			return;
		}
		const orgSymbols = Array.from(orgDiv.querySelectorAll('.symbol'));

		if (!orgSymbols.length) {
			return;
		}
		const orgName = orgSymbols[0].textContent;

		const makeRsiApiCallAsync = (rsiCall) => {
			return (data) => new Promise((resolve) => rsiCall(resolve, data));
		};

		const getAllOrgNickNames = (() => {
			const getOrgMembersAsync = makeRsiApiCallAsync(RSI.Api.Org.getOrgMembers);

			return async (orgName) => {
				const nickNames = [];
				var result = await getOrgMembersAsync({ symbol: orgName });
				var currentPage = 1;
				while (result && result.success && result.data && result.data.html) {
					const detachedDiv = document.createElement('div');
					detachedDiv.innerHTML = result.data.html;
					const orgChunkNickNames = Array.from(detachedDiv.querySelectorAll('.nick')).
						map(t => t.textContent).
						filter(n => n && n.trim());
					nickNames.push(...orgChunkNickNames);
					currentPage += 1;

					result = await getOrgMembersAsync({
						symbol: orgName,
						page: currentPage
					});
				}
				return nickNames;
			};
		})();


		const orgNickNames = await getAllOrgNickNames(orgName);
		const nickNamesAsJSon = JSON.stringify(orgNickNames);


		var searchBox = document.querySelector('input[name=search]');
		const removeSearchBox = !searchBox;
		if (removeSearchBox) {
			searchBox = document.createElement('input');
			document.body.appendChild(searchBox);
		}


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
			if (removeSearchBox) {
				searchBox.remove();
			}
		}

		return nickNamesAsJSon
	} finally {
		if (window.scContactsBookmarklets && typeof window.scContactsBookmarklets.executeAfter === 'function') {
			window.scContactsBookmarklets.executeAfter();
		}
	}
})()