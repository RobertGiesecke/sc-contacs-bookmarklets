/* this script expects a JSON array of nick names in the contacts search */
/* it will exclude all existing friends and will try to find and follow every remaining nick name */
(async () => {
	try {
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

		const followNickName = (() => {
			const addCall = makeRsiApiCallAsync(RSI.Api.Contacts.add);
			return async (nickName) => {
				const d = await addCall({ nickname: nickName });
				// tell the user if it worked
				if (d.success === 0) {
					switch (d.code) {
						case 'ErrNoAccountForNickname':
						case 'ErrContactRelationNotFound':
							console.info('user not found', nickName, 'message:', d.msg);
							break;
						default:
							console.warn('Could not add nick', nickName, 'error:', d.msg);
							console.debug(d);
							break;
					}
				}
				else {
					console.log("added nick " + nickName);
				}
			}
		})();

		const searchBox = document.querySelector('.js-contacts-search-input');

		const ownProfileHandleLink = document.querySelector('.c-account-sidebar__profile-info-handle');
		const ownProfileHandle = ownProfileHandleLink ? ownProfileHandleLink.textContent : null;
		const clearSearchBox = () => {
			searchBox.value = '';
		};
		const contactsDiv = document.querySelector('#sidebar-contacts-list');
		const userNicks = JSON.parse(searchBox.value);
		clearSearchBox();
		const alreadyFollowingNickNames = await getFriendNickNames();

		for (user of userNicks) {
			if (user == ownProfileHandle) {
				console.info('skip self: ' + user);
				continue;
			}
			if (alreadyFollowingNickNames.indexOf(user) > -1) {
				continue;
			}
			await followNickName(user)
		};
	} finally {
		if (window.scContactsBookmarklets && typeof window.scContactsBookmarklets.executeAfter === 'function') {
			window.scContactsBookmarklets.executeAfter();
		}
	}
})()