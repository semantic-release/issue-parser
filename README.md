# issue-parser

Parser for Github, GitLab and Bitbucket issues actions, references and user

[![Travis](https://img.shields.io/travis/pvdlg/issue-parser.svg)](https://travis-ci.org/pvdlg/issue-parser)
[![Codecov](https://img.shields.io/codecov/c/github/pvdlg/issue-parser.svg)](https://codecov.io/gh/pvdlg/issue-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/pvdlg/issue-parser.svg)](https://greenkeeper.io)

The parser can identify:
- GitHub [closing keywords](https://help.github.com/articles/closing-issues-using-keywords), [duplicate keyword](https://help.github.com/articles/about-duplicate-issues-and-pull-requests), [issue references](https://guides.github.com/features/issues/#notifications) and [user mentions](https://guides.github.com/features/issues/#notifications)
- GitLab [closing keywords](https://docs.gitlab.com/ee/user/project/issues/automatic_issue_closing.html), [duplicate keyword](https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/12845), [issue references](https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected) and [user mentions](https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected)
- Bitbucket [closing keywords](https://confluence.atlassian.com/bitbucket/resolve-issues-automatically-when-users-push-code-221451126.html), [issue references](https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html) and [user mentions](https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html)

## Install

```bash
$ npm install --save issue-parser
```

## Usage

```js
const issueParser = require('issue-parser');
const parse = issueParser('github');

issueParser('Issue description, ref user/package#1, Fix #2, Duplicate of #3 /cc @user');
/*
{
  refs: [{raw: 'user/package#1', slug: 'user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'Fix #2', action: 'Fix', prefix: '#', issue: '2'}],
  duplicates: [{raw: 'Duplicate of #3', action: 'Duplicate of', prefix: '#', issue: '3'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

```js
const issueParser = require('issue-parser');
const parse = issueParser('gitlab');

issueParser('Issue description, ref group/user/package#1, implement #2, /duplicate #3 /cc @user');
/*
{
  refs: [{raw: 'group/user/package#1', slug: 'group/user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'implement #2', action: 'Implement', prefix: '#', issue: '2'}],
  duplicates: [{raw: 'Duplicate of #3', action: 'Duplicate of', prefix: '#', issue: '3'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

```js
const issueParser = require('issue-parser')
const parse = issueParser('bitbucket');

issueParser('Issue description, ref user/package#1, fixing #2. /cc @user');
/*
{
  refs: [{raw: 'user/package#1', slug: 'user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'fixing #2', action: 'Fixing', prefix: '#', issue: '2'}],
  duplicates: [],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

```js
const issueParser = require('issue-parser')
const parse = issueParser({referenceActions: ['complete'], issuePrefixes: ['🐛']});

issueParser('Issue description, related to user/package🐛1, Complete 🐛2');
/*
{
  refs: [{raw: 'user/package🐛1', slug: 'user/package', prefix: '🐛', issue: '1'}],
  actions: [{raw: 'Complete 🐛2', action: 'Complete', prefix: '🐛', issue: '2'}],
  duplicates: [],
  mentions: [],
}
*/
```

## API

### issueParser([options]) => parse

Create a [parser](#parsetext--result).

#### options

Type: `Object` `String`

Parser options. Can be `github`, `gitlab` or `bitbucket` for predefined options, or an object for custom options.

##### referenceActions

Type: `Array<String>` `String`
Default: `['close', 'closes', 'closed', 'closing', 'fix', 'fixes', 'fixed', 'fixing', 'resolve', 'resolves', 'resolved', 'resolving', 'implement', 'implements', 'implemented', 'implementing']`

List of action keywords used to close issues and pull requests.

##### duplicateActions

Type: `Array<String>` `String`
Default: `['Duplicate of', '/duplicate']`

List of keywords used to identify duplicate issues and pull requests.

##### mentionsPrefixes

Type: `Array<String>` `String`
Default: `['@']`

List of keywords used to identify user mentions.

##### issuePrefixes

Type: `Array<String>` `String`
Default: `['#', 'gh-']`

List of keywords used to identify issues and pull requests.

### parse(text) => Result

Parse an issue description and returns a [Result](#result) object.

#### text

Type: `String`

Issue text to parse.

### Result

#### actions

Type: `Array<Object>`

List of issues and pull requests closed. Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### duplicates

Type: `Array<Object>`

List of issues and pull requests marked as duplicate. Each duplicate has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| action | `String` | The keyword used to identify the duplicate, capitalized.                              |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### refs

Type: `Array<Object>`

List of issues and pull requests referenced, but not closed or marked as duplicates. Each reference has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### mentions

Type: `Array<Object>`

List of users mentioned. Each mention has the following properties:

| Name   | Type     | Description                                 |
|--------|----------|---------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`. |
| prefix | `String` | The prefix used to identify the mention.    |
| user   | `String` | The user name                               |

#### allRefs

Type: `Array<Object>`

List of all issues and pull requests [closed](#actions), [marked as duplicate](#duplicates) or [referenced](#refs). Each reference has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| action | `String` | The keyword used to identify the action or the duplicate, capitalized.                |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |
