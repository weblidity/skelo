const fs = require('fs').promises;
const Handlebars = require('handlebars');
const path = require('path');
const { generateSidebarsFile } = require('../lib/skelo-utils');

jest.mock('fs/promises');
jest.mock('handlebars');

describe('generateSidebarsFile', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should throw an error if options is invalid', async () => {
        await expect(generateSidebarsFile({}, null)).rejects.toThrow('Invalid options object: `templates` and `sidebars` properties are required.');
        await expect(generateSidebarsFile({}, {})).rejects.toThrow('Invalid options object: `templates` and `sidebars` properties are required.');
        await expect(generateSidebarsFile({}, { templates: 'templates' })).rejects.toThrow('Invalid options object: `templates` and `sidebars` properties are required.');
        await expect(generateSidebarsFile({}, { sidebars: 'sidebars.js' })).rejects.toThrow('Invalid options object: `templates` and `sidebars` properties are required.');
    });

    // it('should throw an error if sidebars.hbs template file not found', async () => {
    //     const options = { templates: 'templates', sidebars: 'sidebars.js' };
    //     fs.readFile.mockRejectedValue({ code: 'ENOENT', path: 'templates/sidebars.hbs' });
    //     await expect(generateSidebarsFile({}, options)).rejects.toThrow('Error: sidebars.hbs template not found. Please ensure that a sidebars.hbs file exists in your templates directory.');
    // });

    // it('should throw an error if sidebars output directory does not exist', async () => {
    //     const options = { templates: 'templates', sidebars: 'nonexistent/sidebars.js' };
    //     fs.readFile.mockResolvedValueOnce('template content');

    //     fs.writeFile.mockRejectedValue({ code: 'ENOENT', path: 'nonexistent/sidebars.js' });

    //     await expect(generateSidebarsFile({}, options)).rejects.toThrow('Error: The specified sidebars output directory does not exist: nonexistent/sidebars.js');
    // });

    // it('should generate sidebars file successfully', async () => {
    //     const options = { templates: 'templates', sidebars: 'sidebars.js' };
    //     const documentationSidebars = { some: 'data' };

    //     fs.readFile.mockResolvedValueOnce('{{sidebars}}');
    //     Handlebars.compile.mockReturnValueOnce((data) => data.sidebars);
    //     fs.writeFile.mockResolvedValueOnce();

    //     await generateSidebarsFile(documentationSidebars, options);

    //     expect(fs.readFile).toHaveBeenCalledWith(path.join(options.templates, 'sidebars.hbs'), 'utf8');

    //     expect(Handlebars.compile).toHaveBeenCalledWith('{{sidebars}}');

    //     expect(fs.writeFile).toHaveBeenCalledWith(options.sidebars, JSON.stringify(documentationSidebars, null, 2));
    // });

    // it('should catch and re-throw unexpected errors', async () => {
    //     const options = { templates: 'templates', sidebars: 'sidebars.js' };
    //     fs.readFile.mockRejectedValue(new Error('Unexpected error'));
    //     await expect(generateSidebarsFile({}, options)).rejects.toThrow('An unexpected error occurred: Unexpected error');
    // });
});
