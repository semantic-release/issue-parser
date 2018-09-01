# issue-parser

Parser for [Github](https://github.com), [GitLab](https://gitlab.com), [Bitbucket](https://bitbucket.org) and [Waffle](https://waffle.io) issues actions, references and mentions

[![Travis](https://img.shields.io/travis/pvdlg/issue-parser.svg)](https://travis-ci.org/pvdlg/issue-parser)
[![Codecov](https://img.shields.io/codecov/c/github/pvdlg/issue-parser.svg)](https://codecov.io/gh/pvdlg/issue-parser)
[![Greenkeeper badge](https://badges.greenkeeper.io/pvdlg/issue-parser.svg)](https://greenkeeper.io)

The parser can identify:
- GitHub [closing keywords](https://help.github.com/articles/closing-issues-using-keywords), [duplicate keyword](https://help.github.com/articles/about-duplicate-issues-and-pull-requests), [issue references](https://guides.github.com/features/issues/#notifications) and [user mentions](https://guides.github.com/features/issues/#notifications)
- GitLab [closing keywords](https://docs.gitlab.com/ee/user/project/issues/automatic_issue_closing.html), [duplicate keyword](https://gitlab.com/gitlab-org/gitlab-ce/merge_requests/12845), [issue references](https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected) and [user mentions](https://about.gitlab.com/2016/03/08/gitlab-tutorial-its-all-connected)
- Bitbucket [closing keywords](https://confluence.atlassian.com/bitbucket/resolve-issues-automatically-when-users-push-code-221451126.html), [issue references](https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html) and [user mentions](https://confluence.atlassian.com/bitbucket/mark-up-comments-issues-and-commit-messages-321859781.html)
- Waffle.io [epics](https://help.waffle.io/epics/which-keywords-are-supported-with-epics) and [dependencies](https://help.waffle.io/dependencies/which-keywords-are-supported-with-dependencies) keywords

## Install

```bash
$ npm install --save issue-parser
```

## Usage

### GitHub format

```js
const issueParser = require('issue-parser');
const parse = issueParser('github');

parse('Issue description, ref user/package#1, Fix #2, Duplicate of #3 /cc @user');
/*
{
  refs: [{raw: 'user/package#1', slug: 'user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'Fix #2', action: 'Fix', prefix: '#', issue: '2'}],
  duplicates: [{raw: 'Duplicate of #3', action: 'Duplicate of', prefix: '#', issue: '3'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

### GitLab format

```js
const issueParser = require('issue-parser');
const parse = issueParser('gitlab');

parse('Issue description, ref group/user/package#1, !2, implement #3, /duplicate #4 /cc @user');
/*
{
  refs: [
    {raw: 'group/user/package#1', slug: 'group/user/package', prefix: '#', issue: '1'},
    {raw: '!2', slug: 'group/user/package', prefix: '!', issue: '2'},
  ],
  actions: [{raw: 'implement #3', action: 'Implement', prefix: '#', issue: '4'}],
  duplicates: [{raw: 'Duplicate of #4', action: 'Duplicate of', prefix: '#', issue: '4'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

### Bitbucket format

```js
const issueParser = require('issue-parser');
const parse = issueParser('bitbucket');

parse('Issue description, ref user/package#1, fixing #2. /cc @user');
/*
{
  refs: [{raw: 'user/package#1', slug: 'user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'fixing #2', action: 'Fixing', prefix: '#', issue: '2'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

### Waffle format

```js
const issueParser = require('issue-parser');
const parse = issueParser('waffle');

parse('Issue description, ref user/package#1, Fix #2, blocks user/package#3, Require #4, Parent of #5, Child of #6 /cc @user');
/*
{
  refs: [{raw: 'user/package#1', slug: 'user/package', prefix: '#', issue: '1'}],
  actions: [{raw: 'Fix #2', action: 'Fix', prefix: '#', issue: '2'}],
  blocks: [{raw: 'blocks user/package#3', action: 'Blocks', slug: 'user/package', prefix: '#', issue: '3'}],
  requires: [{raw: 'Require #4', action: 'Require', prefix: '#', issue: '4'}],
  parentOf: [{raw: 'Parent of #5', action: 'Parent of', prefix: '#', issue: '5'}],
  childOf: [{raw: 'Child of #6', action: 'Child of', prefix: '#', issue: '6'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}],
}
*/
```

### Custom format

```js
const issueParser = require('issue-parser');
const parse = issueParser({referenceActions: ['complete'], blocksActions: ['holds up'], issuePrefixes: ['🐛']});

parse('Issue description, related to user/package🐛1, Complete 🐛2, holds up 🐛3');
/*
{
  refs: [{raw: 'user/package🐛1', slug: 'user/package', prefix: '🐛', issue: '1'}],
  actions: [{raw: 'Complete 🐛2', action: 'Complete', prefix: '🐛', issue: '2'}],
  blocks: [{raw: 'holds up 🐛3', action: 'Holds up', prefix: '🐛', issue: '3'}],
}
*/
```

## Features

### Parse references

```text
#1
```
```js
{refs: [{raw: '#1', slug: undefined, prefix: '#', issue: '1'}]}
```

### Parse repository slug

```text
owner/repo#1
```
```js
{refs: [{raw: 'owner/repo#1', slug: 'owner/repo', prefix: '#', issue: '1'}]}
```

### Parse closing keywords

```text
Fix #1
```
```js
{actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}]}
```

### Parse duplicate keywords

```text
Duplicate of #1
```
```js
{duplicates: [{raw: 'Duplicate of #1', action: 'Duplicate of', slug: undefined, prefix: '#', issue: '1'}]}
```

### Parse user mentions

```text
@user
```
```js
{mentions: [{raw: '@user', prefix: '@', user: 'user'}]}
```

### Parse references with full issue URL

```text
https://github.com/owner/repo/pull/1

Fix https://github.com/owner/repo/issues/2
```
```js
{
  refs: [{raw: 'https://github.com/owner/repo/pull/1', slug: 'owner/repo', prefix: undefined, issue: '1'},]
  actions: [
    {raw: 'Fix https://github.com/owner/repo/issues/2', action: 'Fix', slug: 'owner/repo', prefix: undefined, issue: '2'}
  ]
}
```

### Ignore keywords case

```text
FIX #1
```
```js
{actions: [{raw: 'FIX #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}]}
```

### Ignore references in back-tick quotes

```text
Fix #1 `Fix #2` @user1 `@user2`
```
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user1', prefix: '@', user: 'user1'}]
}
```

### Include references in escaped back-tick quotes

```text
\`Fix #1\` \`@user\`
```
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user1', prefix: '@', user: 'user1'}]
}
```

### Ignore references in fenced blocks

````text
Fix #1

```js
console.log('Fix #2');
```

@user1

```js
console.log('@user2');
```
````
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user1', prefix: '@', user: 'user1'}]
}
```

### Include references in escaped fenced blocks

```text
\`\`\`
Fix #1
\`\`\`

\`\`\`
@user
\`\`\`
```
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}]
}
```

### Ignore references in &lt;code&gt; tags

```text
Fix #1
<code>Fix #2</code>
<code><code>Fix #3</code></code>
@user1
<code>@user2</code>
```
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user1', prefix: '@', user: 'user1'}]
}
```

### Include references in escaped &lt;code&gt; tags

```text
`<code>`Fix #1`</code>`
`<code>`@user`</code>`
```
```js
{
  actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
  mentions: [{raw: '@user', prefix: '@', user: 'user'}]
}
```

### Ignore malformed references

```text
Fix #1 Fix #2a Fix a#3
```
```js
{actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}]}
```

## API

### issueParser([options], [overrides]) => parse

Create a [parser](#parsetext--result).

#### options

Type: `Object` `String`<br>
Parser options. Can be `github`, `gitlab` or `bitbucket` for predefined options, or an object for custom options.

##### referenceActions

Type: `Array<String>` `String`<br>
Default: `['close', 'closes', 'closed', 'closing', 'fix', 'fixes', 'fixed', 'fixing', 'resolve', 'resolves', 'resolved', 'resolving', 'implement', 'implements', 'implemented', 'implementing']`

List of action keywords used to close issues and pull requests.

##### blocksActions

Type: `Array<String>` `String`<br>
Default: `['blocks', 'block', 'required by', 'needed by', 'dependency of']`

List of action keywords used to make an issue or pull request block another one.

##### requiresActions

Type: `Array<String>` `String`<br>
Default: `['blocked by', 'requires', 'require', 'need', 'needs', 'depends on']`

List of action keywords used to make an issue or pull request blocked by another one.

##### parentOfActions

Type: `Array<String>` `String`<br>
Default: `['parent of', 'parent to', 'parent']`

List of action keywords used to make an issue or pull request the parent of another one.

##### childOfActions

Type: `Array<String>` `String`<br>
Default: `['child of', 'child to', 'child']`

List of action keywords used to make an issue or pull request the child of another one.

##### duplicateActions

Type: `Array<String>` `String`<br>
Default: `['Duplicate of', '/duplicate']`

List of keywords used to identify duplicate issues and pull requests.

##### mentionsPrefixes

Type: `Array<String>` `String`<br>
Default: `['@']`

List of keywords used to identify user mentions.

##### issuePrefixes

Type: `Array<String>` `String`<br>
Default: `['#', 'gh-']`

List of keywords used to identify issues and pull requests.

##### hosts

Type: `Array<String>` `String`<br>
Default: `['https://github.com', 'https://gitlab.com']`

List of base URL used to identify issues and pull requests with [full URL](#parse-references-with-full-issue-url).

##### issueURLSegments

Type: `Array<String>` `String`<br>
Default: `['issues', 'pull', 'merge_requests']`

List of URL segment used to identify issues and pull requests with [full URL](#parse-references-with-full-issue-url).

#### overrides

Type: `Object`<br>
Option overrides. Useful when using predefined [`options`](#options) (such as `github`, `gitlab` or `bitbucket`). The `overrides` object can define the same properties as [`options`](#options).

For example, the following will use all the `github` predefined options but with a different `hosts` option:
```js
const issueParser = require('issue-parser');
const parse = issueParser('github', {hosts: ['https://custom-url.com']});
```

### parse(text) => Result

Parse an issue description and returns a [Result](#result) object.

#### text

Type: `String`

Issue text to parse.

### Result

#### actions

Type: `Array<Object>`

List of issues and pull requests closed.<br>
Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### blocks

Type: `Array<Object>`

List of issues and pull requests blocked.<br>
Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Blocks #1`.                                        |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### requires

Type: `Array<Object>`

List of issues and pull requests required.<br>
Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Requires #1`.                                      |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### parentOf

Type: `Array<Object>`

List of child issues and pull requests.<br>
Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Parent of #1`.                                     |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### childOf

Type: `Array<Object>`

List of parent issues and pull requests.<br>
Each action has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Child of #1`.                                      |
| action | `String` | The keyword used to identify the action, capitalized.                                 |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### duplicates

Type: `Array<Object>`

List of issues and pull requests marked as duplicate.<br>
Each duplicate has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Duplicate of #1`.                                  |
| action | `String` | The keyword used to identify the duplicate, capitalized.                              |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### refs

Type: `Array<Object>`

List of issues and pull requests referenced, but not closed or marked as duplicates.<br>
Each reference has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `#1`.                                               |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |

#### mentions

Type: `Array<Object>`

List of users mentioned.<br>
Each mention has the following properties:

| Name   | Type     | Description                                 |
|--------|----------|---------------------------------------------|
| raw    | `String` | The raw value parsed, for example `@user`.  |
| prefix | `String` | The prefix used to identify the mention.    |
| user   | `String` | The user name                               |

#### allRefs

Type: `Array<Object>`

List of all issues and pull requests [closed](#actions), [marked as duplicate](#duplicates) or [referenced](#refs).<br>
Each reference has the following properties:

| Name   | Type     | Description                                                                           |
|--------|----------|---------------------------------------------------------------------------------------|
| raw    | `String` | The raw value parsed, for example `Fix #1`.                                           |
| action | `String` | The keyword used to identify the action or the duplicate, capitalized.                |
| slug   | `String` | The repository owner and name, for issue referred as `<owner>/<repo>#<issue number>`. |
| prefix | `String` | The prefix used to identify the issue.                                                |
| issue  | `String` | The issue number.                                                                     |
