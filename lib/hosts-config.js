module.exports = {
	github: {
		// https://help.github.com/articles/closing-issues-using-keywords
		referenceActions: ['close', 'closes', 'closed', 'fix', 'fixes', 'fixed', 'resolve', 'resolves', 'resolved'],
		// https://help.github.com/articles/about-duplicate-issues-and-pull-requests
		duplicateActions: ['Duplicate of'],
		// https://guides.github.com/features/issues/#notifications
		mentionsPrefixes: ['@'],
		issuePrefixes: ['#', 'gh-'],
		hosts: ['https://github.com'],
		issueURLSegments: ['issues', 'pull'],
	},
	bitbucket: {
		// https://confluence.atlassian.com/bitbucket/resolve-issues-automatically-when-users-push-code-221451126.html
		referenceActions: [
			'close',
			'closes',
			'closed',
			'closing',
			'fix',
			'fixes',
			'fixed',
			'fixing',
			'resolve',
			'resolves',
			'resolved',
			'resolving',
		],
		duplicateActions: [],
		// https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html
		mentionsPrefixes: ['@'],
		// https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html
		issuePrefixes: ['#'],
		hosts: [],
		issueURLSegments: [],
	},
	gitlab: {
		// https://docs.gitlab.com/ee/user/project/issues/automatic_issue_closing.html
		referenceActions: [
			'close',
			'closes',
			'closed',
			'closing',
			'fix',
			'fixes',
			'fixed',
			'fixing',
			'resolve',
			'resolves',
			'resolved',
			'resolving',
			'implement',
			'implements',
			'implemented',
			'implementing',
		],
		// https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/12845
		duplicateActions: ['/duplicate'],
		// https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected
		mentionsPrefixes: ['@'],
		// https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected
		issuePrefixes: ['#', '!'],
		hosts: ['https://gitlab.com'],
		issueURLSegments: ['issues', 'merge_requests'],
	},
	default: {
		referenceActions: [
			'close',
			'closes',
			'closed',
			'closing',
			'fix',
			'fixes',
			'fixed',
			'fixing',
			'resolve',
			'resolves',
			'resolved',
			'resolving',
			'implement',
			'implements',
			'implemented',
			'implementing',
		],
		duplicateActions: ['Duplicate of', '/duplicate'],
		mentionsPrefixes: ['@'],
		issuePrefixes: ['#', 'gh-'],
		hosts: ['https://github.com', 'https://gitlab.com'],
		issueURLSegments: ['issues', 'pull', 'merge_requests'],
	},
};
