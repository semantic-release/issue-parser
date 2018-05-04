'use strict';

const {escapeRegExp, capitalize, isUndefined, isString, isPlainObject} = require('lodash');
const hostConfig = require('./lib/hosts-config');

const FENCE_BLOCK_REGEXP = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
const CODE_BLOCK_REGEXP = /(`(?![\\]))((?:.(?!\1(?![\\])))*.?)\1/g;
const HTML_CODE_BLOCK_REGEXP = /(<code)+?((?!(<code|<\/code>)+?)[\S\s])*(<\/code>)+?/gim;

function inverse(str) {
	return str
		.split('')
		.reverse()
		.join('');
}

function join(keywords) {
	return keywords.map(escapeRegExp).join('|');
}

function buildMentionsRegexp(opts) {
	return `((?:(?:[^\\w\\n\\v\\r]|^)+(?:${join(opts.mentionsPrefixes)})[\\w-\\.]+[^\\W])+)`;
}

function buildRefRegexp(opts) {
	return `(?:(?:[^\\w\\n\\v\\r]|^)+(${join([].concat(opts.referenceActions, opts.duplicateActions))}))?(?:${[
		'[^\\w\\n\\v\\r]|^',
	]
		.concat(join(opts.issuePrefixes))
		.join('|')})+((?:(?:[\\w-\\.]+)\\/)+(?:[\\w-\\.]+))?(${join(opts.issuePrefixes)})(\\d+)(?!\\w)`;
}

function buildRegexp(opts) {
	return new RegExp(
		opts.mentionsPrefixes.length > 0
			? `(?:${buildRefRegexp(opts)}|${buildMentionsRegexp(opts)})`
			: buildMentionsRegexp(opts),
		'gim'
	);
}

function buildMentionRegexp(opts) {
	return new RegExp(`(${join(opts.mentionsPrefixes)})([\\w-.]+)`, 'gim');
}

function parse(text, regexp, mentionRegexp, opts) {
	let parsed;
	const results = {actions: [], refs: [], duplicates: [], mentions: []};
	let noCodeBlock = inverse(inverse(text.replace(FENCE_BLOCK_REGEXP, '')).replace(CODE_BLOCK_REGEXP, ''));

	while (regexp.test(noCodeBlock)) {
		noCodeBlock = noCodeBlock.replace(HTML_CODE_BLOCK_REGEXP, '');
	}

	while ((parsed = regexp.exec(noCodeBlock)) !== null) {
		let [raw, action, slug, prefix, issue, mentions] = parsed;
		raw = parsed[0].substring(parsed[0].indexOf(parsed[1] || parsed[2] || parsed[3]));
		action = capitalize(parsed[1]);

		if (opts.referenceActions.findIndex(fix => fix.toUpperCase() === action.toUpperCase()) > -1) {
			results.actions.push({raw, action, slug, prefix, issue});
		} else if (opts.duplicateActions.findIndex(duplicate => duplicate.toUpperCase() === action.toUpperCase()) > -1) {
			results.duplicates.push({raw, action, slug, prefix, issue});
		} else if (issue) {
			results.refs.push({raw, slug, prefix, issue});
		} else if (mentions) {
			let parsedMention;
			while ((parsedMention = mentionRegexp.exec(mentions)) !== null) {
				const [rawMention, prefixMention, user] = parsedMention;

				results.mentions.push({raw: rawMention.trim(), prefix: prefixMention, user});
			}
		}
	}
	return results;
}

module.exports = options => {
	if (!isUndefined(options) && !isString(options) && !isPlainObject(options)) {
		throw new TypeError('Options must be a String or an Object');
	}

	const opts = Object.assign({}, hostConfig.default, isString(options) ? hostConfig[options.toLowerCase()] : options);

	for (const opt of Object.keys(opts)) {
		if (isString(opts[opt])) {
			opts[opt] = [opts[opt]];
		} else if (!Array.isArray(opts[opt])) {
			throw new TypeError(`The ${opt} option must be a string or an array of strings`);
		}
		if (opts[opt].length !== 0 && !opts[opt].every(opt => isString(opt))) {
			throw new TypeError(`The ${opt} option must be a string or an array of strings`);
		}
		opts[opt] = opts[opt].filter(Boolean);
	}

	const regexp = buildRegexp(opts);
	const mentionRegexp = buildMentionRegexp(opts);

	return text => {
		if (!isString(text) || !text.trim()) {
			throw new TypeError('The issue text must be a String');
		}

		const results = parse(text, regexp, mentionRegexp, opts);

		Reflect.defineProperty(results, 'allRefs', {
			get() {
				return this.actions.concat(this.refs, this.duplicates);
			},
		});
		return results;
	};
};
