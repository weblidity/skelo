const fs = require('fs');
const yamljs = require('yamljs');
const getSidebars = require('../../lib/skelo-utils').getSidebars;

describe('getSidebars', () => {
  it('throws an error when the yamlFilename is null or undefined', () => {
    expect(() => getSidebars(null)).toThrowError('Invalid yamlFilename: expected a non-empty string.');
    expect(() => getSidebars(undefined)).toThrowError('Invalid yamlFilename: expected a non-empty string.');
  });

  it('throws an error when the yamlFilename is not a string', () => {
    expect(() => getSidebars(123)).toThrowError('Invalid yamlFilename: expected a non-empty string.');
    expect(() => getSidebars(true)).toThrowError('Invalid yamlFilename: expected a non-empty string.');
  });

  it('returns a normalized object with sidebars and other properties', () => {
    const yamlFilename = 'test.yaml';
    const yamlContent = `
      sidebars:
        - label: Foo
          items:
            - label: Bar
            - label: Baz
      otherProperty: value
    `;
    fs.writeFileSync(yamlFilename, yamlContent);
    const result = getSidebars(yamlFilename);
    expect(result).toEqual({
      sidebars: [
        { label: 'Foo', items: [{ label: 'Bar' }, { label: 'Baz' }] }
      ],
      otherProperty: 'value'
    });
    fs.unlinkSync(yamlFilename);
  });

  // it('recursively normalizes sidebars', () => {
  //   const yamlFilename = 'test.yaml';
  //   const yamlContent = `
  //     sidebars:
  //       - label: Foo
  //         items:
  //           - label: Bar
  //             items:
  //               - label: Baz
  //   `;
  //   fs.writeFileSync(yamlFilename, yamlContent);
  //   const result = getSidebars(yamlFilename);
  //   expect(result).toEqual({
  //     sidebars: [
  //       { label: 'Foo', items: [{ label: 'Bar', items: [{ label: 'Baz' }] }] }
  //     ]
  //   });
  //   fs.unlinkSync(yamlFilename);
  // });
});