import test from 'ava';
import m from '..';

test('Parse GitHub issue', t => {
  t.deepEqual(m('GitHub')('Fix #1 reSOLved gh-2 CLOSES Gh-3 fix o/r#4 #5 o/r#6 fixing #7 Duplicate OF #8 @user'), {
    actions: [
      {raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'},
      {raw: 'reSOLved gh-2', action: 'Resolved', slug: undefined, prefix: 'gh-', issue: '2'},
      {raw: 'CLOSES Gh-3', action: 'Closes', slug: undefined, prefix: 'Gh-', issue: '3'},
      {raw: 'fix o/r#4', action: 'Fix', slug: 'o/r', prefix: '#', issue: '4'},
    ],
    refs: [
      {raw: '#5', slug: undefined, prefix: '#', issue: '5'},
      {raw: 'o/r#6', slug: 'o/r', prefix: '#', issue: '6'},
      {raw: '#7', slug: undefined, prefix: '#', issue: '7'},
    ],
    duplicates: [{raw: 'Duplicate OF #8', action: 'Duplicate of', slug: undefined, prefix: '#', issue: '8'}],
    mentions: [{raw: '@user', prefix: '@', user: 'user'}],
  });
});

test('Parse Bitbucket issue', t => {
  t.deepEqual(m('Bitbucket')('Fix #1 reSOLved #2 CLOSES #3 fix o/r#4 #5 o/r#6 fixing #7 /duplicate #8 @user'), {
    actions: [
      {raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'},
      {raw: 'reSOLved #2', action: 'Resolved', slug: undefined, prefix: '#', issue: '2'},
      {raw: 'CLOSES #3', action: 'Closes', slug: undefined, prefix: '#', issue: '3'},
      {raw: 'fix o/r#4', action: 'Fix', slug: 'o/r', prefix: '#', issue: '4'},
      {raw: 'fixing #7', action: 'Fixing', slug: undefined, prefix: '#', issue: '7'},
    ],
    refs: [
      {raw: '#5', slug: undefined, prefix: '#', issue: '5'},
      {raw: 'o/r#6', slug: 'o/r', prefix: '#', issue: '6'},
      {raw: '#8', slug: undefined, prefix: '#', issue: '8'},
    ],
    duplicates: [],
    mentions: [{raw: '@user', prefix: '@', user: 'user'}],
  });
});

test('Parse GitLab issue', t => {
  t.deepEqual(m('GitLab')('Fix #1 reSOLved #2 IMPLEMENT #3 fix g/sg/o/r#4 #5 o/r#6 fixing #7 /duplicate #8 @user'), {
    actions: [
      {raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'},
      {raw: 'reSOLved #2', action: 'Resolved', slug: undefined, prefix: '#', issue: '2'},
      {raw: 'IMPLEMENT #3', action: 'Implement', slug: undefined, prefix: '#', issue: '3'},
      {raw: 'fix g/sg/o/r#4', action: 'Fix', slug: 'g/sg/o/r', prefix: '#', issue: '4'},
      {raw: 'fixing #7', action: 'Fixing', slug: undefined, prefix: '#', issue: '7'},
    ],
    refs: [{raw: '#5', slug: undefined, prefix: '#', issue: '5'}, {raw: 'o/r#6', slug: 'o/r', prefix: '#', issue: '6'}],
    duplicates: [{raw: '/duplicate #8', action: '/duplicate', slug: undefined, prefix: '#', issue: '8'}],
    mentions: [{raw: '@user', prefix: '@', user: 'user'}],
  });
});

test('Parse with default options', t => {
  t.deepEqual(m()('Fix #1 reSOLved gh-2 CLOSES Gh-3 fix o/r#4 #5 o/r#6 implementing #7 Duplicate OF #8 @user'), {
    actions: [
      {raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'},
      {raw: 'reSOLved gh-2', action: 'Resolved', slug: undefined, prefix: 'gh-', issue: '2'},
      {raw: 'CLOSES Gh-3', action: 'Closes', slug: undefined, prefix: 'Gh-', issue: '3'},
      {raw: 'fix o/r#4', action: 'Fix', slug: 'o/r', prefix: '#', issue: '4'},
      {raw: 'implementing #7', action: 'Implementing', slug: undefined, prefix: '#', issue: '7'},
    ],
    refs: [{raw: '#5', slug: undefined, prefix: '#', issue: '5'}, {raw: 'o/r#6', slug: 'o/r', prefix: '#', issue: '6'}],
    duplicates: [{raw: 'Duplicate OF #8', action: 'Duplicate of', slug: undefined, prefix: '#', issue: '8'}],
    mentions: [{raw: '@user', prefix: '@', user: 'user'}],
  });
});

test('Parse with custom options', t => {
  t.deepEqual(
    m({referenceActions: ['fix'], duplicateActions: [], mentionsPrefixes: '!', issuePrefixes: ['#']})(
      'Fix #1 reSOLved gh-2 CLOSES Gh-3 fixed o/r#4 #5 o/r#6 fixing #7 Duplicate OF #8 !user @other'
    ),
    {
      actions: [{raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'}],
      refs: [
        {raw: 'o/r#4', slug: 'o/r', prefix: '#', issue: '4'},
        {raw: '#5', slug: undefined, prefix: '#', issue: '5'},
        {raw: 'o/r#6', slug: 'o/r', prefix: '#', issue: '6'},
        {raw: '#7', slug: undefined, prefix: '#', issue: '7'},
        {raw: '#8', slug: undefined, prefix: '#', issue: '8'},
      ],
      duplicates: [],
      mentions: [{raw: '!user', prefix: '!', user: 'user'}],
    }
  );
});

test('"allRefs" returns "refs", "actions" and "duplicates"', t => {
  t.deepEqual(m('github')('Fix #1 #2 Duplicate of #3').allRefs, [
    {raw: 'Fix #1', action: 'Fix', slug: undefined, prefix: '#', issue: '1'},
    {raw: '#2', slug: undefined, prefix: '#', issue: '2'},
    {raw: 'Duplicate of #3', action: 'Duplicate of', slug: undefined, prefix: '#', issue: '3'},
  ]);
});

test('Ignore malformed references', t => {
  const empty = {actions: [], duplicates: [], mentions: [], refs: []};

  t.deepEqual(m('github')('Test#3'), empty);
  t.deepEqual(m('github')('Fix repo#3'), empty);
  t.deepEqual(m('github')('#3a'), empty);
  t.deepEqual(m('github')('Fix 3'), empty);
  t.deepEqual(m('github')('Fix #3a'), empty);
});

test('Parse references', t => {
  t.deepEqual(m('github')('#1,#2').refs, [
    {issue: '1', slug: undefined, prefix: '#', raw: '#1'},
    {issue: '2', slug: undefined, prefix: '#', raw: '#2'},
  ]);
  t.deepEqual(m('github')('test ##1').refs, [{issue: '1', slug: undefined, prefix: '#', raw: '##1'}]);
  t.deepEqual(m('github')('#1#2').refs, [{issue: '1', slug: undefined, prefix: '#', raw: '#1'}]);
  t.deepEqual(m('github')('Fix #1Fix #2').refs, [{issue: '2', slug: undefined, prefix: '#', raw: '#2'}]);
});

test('Parse actions', t => {
  t.deepEqual(m('github')('Fix #1, Fix #2').actions, [
    {issue: '1', action: 'Fix', slug: undefined, prefix: '#', raw: 'Fix #1'},
    {issue: '2', action: 'Fix', slug: undefined, prefix: '#', raw: 'Fix #2'},
  ]);
  t.deepEqual(m('github')('Fix #1,Fix #2').actions, [
    {issue: '1', action: 'Fix', slug: undefined, prefix: '#', raw: 'Fix #1'},
    {issue: '2', action: 'Fix', slug: undefined, prefix: '#', raw: 'Fix #2'},
  ]);
  t.deepEqual(m('github')('fix #1, CLOSE #2').actions, [
    {issue: '1', action: 'Fix', slug: undefined, prefix: '#', raw: 'fix #1'},
    {issue: '2', action: 'Close', slug: undefined, prefix: '#', raw: 'CLOSE #2'},
  ]);
});

test('Parse duplicates', t => {
  t.deepEqual(m('github')('Duplicate of #1, DUPLICATE of #2').duplicates, [
    {issue: '1', action: 'Duplicate of', slug: undefined, prefix: '#', raw: 'Duplicate of #1'},
    {issue: '2', action: 'Duplicate of', slug: undefined, prefix: '#', raw: 'DUPLICATE of #2'},
  ]);
  t.deepEqual(m('gitlab')('/duplicate #1, /DUPLICATE #2').duplicates, [
    {issue: '1', action: '/duplicate', slug: undefined, prefix: '#', raw: '/duplicate #1'},
    {issue: '2', action: '/duplicate', slug: undefined, prefix: '#', raw: '/DUPLICATE #2'},
  ]);
});

test('Parse mentions', t => {
  t.deepEqual(m('github')('@user@@user').mentions, [
    {raw: '@user', prefix: '@', user: 'user'},
    {raw: '@user', prefix: '@', user: 'user'},
  ]);
  t.deepEqual(m('github')('@user,@user').mentions, [
    {raw: '@user', prefix: '@', user: 'user'},
    {raw: '@user', prefix: '@', user: 'user'},
  ]);
  t.deepEqual(m('github')('@user, @user').mentions, [
    {raw: '@user', prefix: '@', user: 'user'},
    {raw: '@user', prefix: '@', user: 'user'},
  ]);
  t.deepEqual(m('github')('@user@user').mentions, [{raw: '@user', prefix: '@', user: 'user'}]);
});

test('Empty options', t => {
  const empty = {actions: [], duplicates: [], mentions: [], refs: []};

  t.deepEqual(m({referenceActions: [], issuePrefixes: [], mentionsPrefixes: []})('Fix #1, @user'), empty);
  t.deepEqual(
    m({referenceActions: ['', '', 'fix'], issuePrefixes: ['', '#'], mentionsPrefixes: ['@', '']})('Fix #1,@user'),
    {
      refs: [],
      actions: [{issue: '1', action: 'Fix', slug: undefined, prefix: '#', raw: 'Fix #1'}],
      mentions: [{raw: '@user', prefix: '@', user: 'user'}],
      duplicates: [],
    }
  );
});

test('Throw TypeError for invalid options', t => {
  t.throws(() => m([]), TypeError);
  t.throws(() => m(1), TypeError);
  t.throws(() => m({referenceActions: 1}), TypeError);
  t.throws(() => m({referenceActions: [1]}), TypeError);
});

test('Throw TypeError for invalid input', t => {
  t.throws(() => m()(), TypeError);
  t.throws(() => m()(1), TypeError);
  t.throws(() => m()({}), TypeError);
  t.throws(() => m()([]), TypeError);
  t.throws(() => m()(''), TypeError);
});
