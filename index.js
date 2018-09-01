'use strict';

const escapeRegExp = require('lodash.escaperegexp');
const capitalize = require('lodash.capitalize');
const isString = require('lodash.isstring');
const isPlainObject = require('lodash.isplainobject');
const hostConfig = require('./lib/hosts-config');

const FENCE_BLOCK_REGEXP = /^(([ \t]*`{3,4})([^\n]*)([\s\S]+?)(^[ \t]*\2))/gm;
const CODE_BLOCK_REGEXP = /(`(?![\\]))((?:.(?!\1(?![\\])))*.?)\1/g;
const HTML_CODE_BLOCK_REGEXP = /(<code)+?((?!(<code|<\/code>)+?)[\S\s])*(<\/code>)+?/gim;
const LEADING_TRAILING_SLASH_REGEXP = /^\/?([^/]+(?:\/[^/]+)*)\/?$/;
const TRAILING_SLASH_REGEXP = /\/?$/;

function inverse(str) {
	return str
		.split('')
		.reverse()
		.join('');
}

function join(keywords) {
	return keywords
		.filter(Boolean)
		.map(escapeRegExp)
		.join('|');
}

function addLeadingAndTrailingSlash(value) {
	return value.replace(LEADING_TRAILING_SLASH_REGEXP, '/$1/');
}

function addTrailingSlash(value) {
	return value.replace(TRAILING_SLASH_REGEXP, '/');
}

function includesIgnoreCase(arr, value) {
	return arr.findIndex(val => val.toUpperCase() === value.toUpperCase()) > -1;
}

function buildMentionsRegexp({mentionsPrefixes}) {
	return `((?:(?:[^\\w\\n\\v\\r]|^)+(?:${join(mentionsPrefixes)})[\\w-\\.]+[^\\W])+)`;
}

function buildRefRegexp({
	referenceActions,
	blocksActions,
	requiresActions,
	parentOfActions,
	childOfActions,
	duplicateActions,
	issuePrefixes,
	issueURLSegments,
	hosts,
}) {
	return `(?:(?:[^\\w\\n\\v\\r]|^)+(${join(
		[].concat(referenceActions, blocksActions, requiresActions, parentOfActions, childOfActions, duplicateActions)
	)}))?(?:${['[^\\w\\n\\v\\r]|^'].concat(join(issuePrefixes.concat(issueURLSegments))).join('|')})+${
		hosts.length > 0 ? `(?:${join(hosts)})?` : ''
	}((?:(?:[\\w-\\.]+)\\/)+(?:[\\w-\\.]+))?(${join(issuePrefixes.concat(issueURLSegments))})(\\d+)(?!\\w)`;
}

function buildRegexp(opts) {
	return new RegExp(
		opts.mentionsPrefixes.length > 0
			? `(?:${buildRefRegexp(opts)}|${buildMentionsRegexp(opts)})`
			: buildMentionsRegexp(opts),
		'gim'
	);
}

function buildMentionRegexp({mentionsPrefixes}) {
	return new RegExp(`(${join(mentionsPrefixes)})([\\w-.]+)`, 'gim');
}

function parse(
	text,
	regexp,
	mentionRegexp,
	{
		issuePrefixes,
		hosts,
		referenceActions,
		blocksActions,
		requiresActions,
		parentOfActions,
		childOfActions,
		duplicateActions,
	}
) {
	let parsed;
	const results = {
		actions: [],
		blocks: [],
		requires: [],
		parentOf: [],
		childOf: [],
		duplicates: [],
		refs: [],
		mentions: [],
	};
	let noCodeBlock = inverse(inverse(text.replace(FENCE_BLOCK_REGEXP, '')).replace(CODE_BLOCK_REGEXP, ''));

	while (regexp.test(noCodeBlock)) {
		noCodeBlock = noCodeBlock.replace(HTML_CODE_BLOCK_REGEXP, '');
	}

	while ((parsed = regexp.exec(noCodeBlock)) !== null) {
		let [raw, action, slug, prefix, issue, mentions] = parsed;
		prefix =
			prefix && issuePrefixes.some(issuePrefix => issuePrefix.toUpperCase() === prefix.toUpperCase())
				? prefix
				: undefined;
		raw = parsed[0].substring(
			parsed[0].indexOf(
				parsed[1] || hosts.find(host => parsed[0].toUpperCase().includes(host.toUpperCase())) || parsed[2] || parsed[3]
			)
		);
		action = capitalize(parsed[1]);

		if (includesIgnoreCase(referenceActions, action)) {
			results.actions.push({raw, action, slug, prefix, issue});
		} else if (includesIgnoreCase(blocksActions, action)) {
			results.blocks.push({raw, action, slug, prefix, issue});
		} else if (includesIgnoreCase(requiresActions, action)) {
			results.requires.push({raw, action, slug, prefix, issue});
		} else if (includesIgnoreCase(parentOfActions, action)) {
			results.parentOf.push({raw, action, slug, prefix, issue});
		} else if (includesIgnoreCase(childOfActions, action)) {
			results.childOf.push({raw, action, slug, prefix, issue});
		} else if (includesIgnoreCase(duplicateActions, action)) {
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

module.exports = (options = 'default', overrides = {}) => {
	if (!isString(options) && !isPlainObject(options)) {
		throw new TypeError('Options must be a String or an Object');
	}

	if (isString(options) && !includesIgnoreCase(Object.keys(hostConfig), options)) {
		throw new TypeError(`The supported configuration are [${Object.keys(hostConfig).join(', ')}], got '${options}'`);
	}

	if (!isPlainObject(overrides)) {
		throw new TypeError('Override must be an Object');
	}

	const opts = Object.assign(
		{},
		hostConfig.default,
		isString(options) ? hostConfig[options.toLowerCase()] : options,
		overrides
	);

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

	opts.hosts = opts.hosts.map(addTrailingSlash);
	opts.issueURLSegments = opts.issueURLSegments.map(addLeadingAndTrailingSlash);

	const regexp = buildRegexp(opts);
	const mentionRegexp = buildMentionRegexp(opts);

	return text => {
		if (!isString(text)) {
			throw new TypeError('The issue text must be a String');
		}

		const results = parse(text, regexp, mentionRegexp, opts);

		Reflect.defineProperty(results, 'allRefs', {
			get() {
				return this.actions.concat(this.refs, this.duplicates, this.blocks, this.requires, this.parentOf, this.childOf);
			},
		});
		return results;
	};
};
