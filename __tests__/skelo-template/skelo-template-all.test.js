const {renderLiteral, renderTemplate} = require('../../lib/skelo-template');
const fs = require('fs');
const Handlebars = require('handlebars');
const {setExtensionIfMissing} = require('../../lib/skelo-files');

jest.mock('fs');
jest.mock('handlebars');
jest.mock('../../lib/skelo-files');

describe('skelo-template', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('renderLiteral', () => {
        it('should throw a TypeError if templateContent is not a string', () => {
            expect(() => renderLiteral(123, {})).toThrow('renderLiteral: templateContent must be a string');
        });

        it('should throw a TypeError if data is not an object', () => {
            expect(() => renderLiteral('template', null)).toThrow('renderLiteral: data must be a non-null object');
            expect(() => renderLiteral('template', 'string')).toThrow('renderLiteral: data must be a non-null object');
        });

        it('should render the template with the provided data', () => {
            const template = 'Hello, {{name}}!';
            const data = { name: 'World' };
            Handlebars.compile.mockReturnValue(jest.fn(data => `Hello, ${data.name}!`));

            expect(renderLiteral(template, data)).toBe('Hello, World!');
        });

        it('should re-throw Handlebars errors', () => {
            const template = 'Hello, {{name}}!';
            const data = { name: 'World' };
            const error = new Error('Handlebars error');

            Handlebars.compile.mockImplementation(() => {
                throw error;
            });
            expect(() => renderLiteral(template, data)).toThrow(error);
        });
    });

    describe('renderTemplate', () => {
        const mockOptions = {
            templates: '/path/to/templates',
            templateExtension: '.hbs',
        };

        it('should throw an error if options is null or undefined', () => {
            expect(() => renderTemplate('test', {}, null)).toThrow('renderTemplate: options was null or undefined.');
            expect(() => renderTemplate('test', {}, undefined)).toThrow('renderTemplate: options was null or undefined.');
        });

        it('should throw if required arguments are missing', () => {
            expect(() => renderTemplate(null, {}, mockOptions)).toThrow('Invalid arguments: templateName, data, options.templateExtension, and options.templates are required.');
            expect(() => renderTemplate('test', null, mockOptions)).toThrow('Invalid arguments: templateName, data, options.templateExtension, and options.templates are required.');
            expect(() => renderTemplate('test', {}, null)).toThrow('renderTemplate: options was null or undefined.');
            expect(() => renderTemplate('test', {}, { ...mockOptions, templates: null })).toThrow('Invalid arguments: templateName, data, options.templateExtension, and options.templates are required.');
            expect(() => renderTemplate('test', {}, { ...mockOptions, templateExtension: null })).toThrow('Invalid arguments: templateName, data, options.templateExtension, and options.templates are required.');
        });

        it('should throw a TypeError if templateName or templates is not a string', () => {
            expect(() => renderTemplate(123, {}, mockOptions)).toThrow('templateName, templates path, and templateExtension must be strings.');
            expect(() => renderTemplate('test', {}, { ...mockOptions, templates: 123 })).toThrow('templateName, templates path, and templateExtension must be strings.');
            expect(() => renderTemplate('test', {}, { ...mockOptions, templateExtension: 123 })).toThrow('templateName, templates path, and templateExtension must be strings.');
        });

        it('should throw an error if the template file does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            expect(() => renderTemplate('test', {}, mockOptions)).toThrow();
        });
    });
});
