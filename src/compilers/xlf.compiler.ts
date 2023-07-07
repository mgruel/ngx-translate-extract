import { ValidationError, XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser';
import { TranslationCollection, TranslationType } from '../utils/translation.collection.js';
import { CompilerInterface } from './compiler.interface.js';

export interface TranslationUnit {
	'@_id': string;
	'@_datatype': string;
	source: {
		'#text': string;
	};
	target: {
		'#text': string;
		'@_state': string;
	};
	'context-group'?: {
		'@_purpose': string;
		context: Array<{
			'#text': string;
			'@_context-type': string;
		}>;
	};
}

export interface TranslationContext {
	source: string;
	target: string;
}

export class XlfCompiler implements CompilerInterface {
	private readonly sourceLanguage: string;
	private readonly parser: XMLParser;
	private readonly builder: XMLBuilder;

	public extension: string = 'xlf';

	constructor(options?: any) {
		this.sourceLanguage = options?.sourceLanguage ?? 'en';
		this.parser = new XMLParser({
			ignoreAttributes: false
		});

		this.builder = new XMLBuilder({
			ignoreAttributes: false,
			format: true,
			suppressEmptyNode: false
		});
	}

	parse(contents: string): TranslationCollection {
		const validationResult: boolean | ValidationError = XMLValidator.validate(contents);
		if (validationResult !== true) {
			throw new Error(`Invalid XML: ${validationResult.err.msg} at ${validationResult.err.line}:${validationResult.err.col}`);
		}
		const translations = this.parser.parse(contents);
		if (!translations.xliff?.file?.body) {
			throw new Error(`Invalid XLIFF: missing xliff / xlif.file / xliff.file.body element`);
		}
		const translationUnits: TranslationUnit[] | TranslationUnit = translations.xliff.file.body['trans-unit'];
		const translationType = (Array.isArray(translationUnits) ? translationUnits : [translationUnits])
			.filter((unit) => {
				const id = unit['@_id'];
				return id && unit.source && unit.target;
			})
			.reduce((acc, unit) => {
				return {
					...acc,
					[unit['@_id']]: unit.target['#text']
				};
			}, {} as TranslationType);
		return new TranslationCollection(translationType);
	}

	compile(collection: TranslationCollection): string {
		const target = {
			'?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
			xliff: {
				'@_xmlns': 'urn:oasis:names:tc:xliff:document:1.2',
				'@_version': '1.2',
				file: {
					'@_source-language': this.sourceLanguage,
					body: {
						'trans-unit': Object.keys(collection.values).map((key) => {
							const targetValue = collection.values[key];
							return {
								'@_id': key,
								'@_datatype': 'html',
								source: {
									'#text': key
								},
								target: {
									'#text': targetValue,
									'@_state': 'translated'
								}
							};
						})
					},
					'@_datatype': 'plaintext',
					'@_original': 'ng2.template'
				}
			}
		};
		return this.builder.build(target);
	}
}
