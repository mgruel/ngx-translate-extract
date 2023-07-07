import { expect } from 'chai';

import { TranslationCollection } from '../../src/utils/translation.collection.js';
import { XlfCompiler } from '../../src/compilers/xlf.compiler.js';

describe('XlfCompiler', () => {
	let compiler: XlfCompiler;

	beforeEach(() => {
		compiler = new XlfCompiler();
	});

	it('should parse the angular xliff file with a single trans-unit', () => {
		const xlf = `<?xml version="1.0" encoding="UTF-8"?>
    <xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
      <file source-language="en" datatype="plaintext" original="ng2.template">
        <body>
          <trans-unit id="greeting" datatype="html">
            <source>Hello</source>
            <target state="translated">Hello</target>
          </trans-unit>
        </body>
      </file>
    </xliff>`;
		const collection = compiler.parse(xlf);
		expect(collection).to.be.instanceOf(TranslationCollection);
		expect(collection.count()).to.equal(1);
		expect(collection.has('greeting')).to.be.true;
		expect(collection.get('greeting')).to.equal('Hello');
	});

	it('should parse the angular xliff file with a multiple trans-units', () => {
		const xlf = `<?xml version="1.0" encoding="UTF-8"?>
    <xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
      <file source-language="en" datatype="plaintext" original="ng2.template">
        <body>
          <trans-unit id="greeting" datatype="html">
            <source>Hello</source>
            <target state="translated">Hello</target>
          </trans-unit>
          <trans-unit id="genderMale" datatype="html">
            <source>Male</source>
            <target state="translated">Male</target>
          </trans-unit>
        </body>
      </file>
    </xliff>`;
		const collection = compiler.parse(xlf);
		expect(collection).to.be.instanceOf(TranslationCollection);
		expect(collection.count()).to.equal(2);
		expect(collection.has('greeting')).to.be.true;
		expect(collection.get('greeting')).to.equal('Hello');
		expect(collection.has('genderMale')).to.be.true;
		expect(collection.get('genderMale')).to.equal('Male');
	});

	it('should parse the angular xliff file with empty target', () => {
		const xlf = `<?xml version="1.0" encoding="UTF-8"?>
    <xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
      <file source-language="en" datatype="plaintext" original="ng2.template">
        <body>
          <trans-unit id="greeting" datatype="html">
            <source>Hello</source>
            <target state="translated"></target>
          </trans-unit>
        </body>
      </file>
    </xliff>`;
		const collection = compiler.parse(xlf);
		expect(collection).to.be.instanceOf(TranslationCollection);
		expect(collection.count()).to.equal(1);
		expect(collection.has('greeting')).to.be.true;
		expect(collection.get('greeting')).to.equal(undefined);
	});

	it('should compile the collection to xliff with a single trans-unit', () => {
		const collection = new TranslationCollection({
			salutation: 'Hello'
		});
		const result: string = compiler.compile(collection);
		expect(result).to.equal(
			`<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="salutation" datatype="html">
        <source>salutation</source>
        <target state="translated">Hello</target>
      </trans-unit>
    </body>
  </file>
</xliff>
`
		);
	});

	it('should compile the collection to xliff with multiple trans-units', () => {
		const collection = new TranslationCollection({
			salutation: 'Hello',
			'Keine Übersetzung': 'No translation'
		});
		const result: string = compiler.compile(collection);
		expect(result).to.equal(
			`<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="salutation" datatype="html">
        <source>salutation</source>
        <target state="translated">Hello</target>
      </trans-unit>
      <trans-unit id="Keine Übersetzung" datatype="html">
        <source>Keine Übersetzung</source>
        <target state="translated">No translation</target>
      </trans-unit>
    </body>
  </file>
</xliff>
`
		);
	});

	it('should compile the collection to xliff with a single trans-unit', () => {
		const collection = new TranslationCollection({
			salutation: undefined as any
		});
		const result: string = compiler.compile(collection);
		expect(result).to.equal(
			`<?xml version="1.0" encoding="UTF-8"?>
<xliff xmlns="urn:oasis:names:tc:xliff:document:1.2" version="1.2">
  <file source-language="en" datatype="plaintext" original="ng2.template">
    <body>
      <trans-unit id="salutation" datatype="html">
        <source>salutation</source>
        <target state="translated"></target>
      </trans-unit>
    </body>
  </file>
</xliff>
`
		);
	});
});
