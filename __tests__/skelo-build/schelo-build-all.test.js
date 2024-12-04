const { buildCategory, buildLink, buildSidebarItems, buildTopic, getItemType, SIDEBAR_ITEM_TYPE } = require('../../lib/skelo-build');
const { getParentPath } = require('../../lib/skelo-files');
const { saveTopic, slugify } = require('../../lib/skelo-utils');


jest.mock('../../lib/skelo-files');
jest.mock('../../lib/skelo-utils');


describe('skelo-build', () => {

    describe('getItemType', () => {
        it('should return INVALID_ITEM for invalid input', () => {
            expect(getItemType(null)).toBe('INVALID_ITEM');
            expect(getItemType(undefined)).toBe('INVALID_ITEM');
            expect(getItemType([])).toBe('INVALID_ITEM');
            expect(getItemType(123)).toBe('INVALID_ITEM');
            expect(getItemType('string')).toBe('INVALID_ITEM');
        });


        it('should return LINK for item with href', () => {
            expect(getItemType({ href: 'test' })).toBe(SIDEBAR_ITEM_TYPE.LINK);
        });

        it('should return CATEGORY for item with items array', () => {
            expect(getItemType({ items: [{ label: 'Subitem' }] })).toBe(SIDEBAR_ITEM_TYPE.CATEGORY);
        });

        it('should return TOPIC for item with label but without href or items', () => {
            expect(getItemType({ label: 'test' })).toBe(SIDEBAR_ITEM_TYPE.TOPIC);
        });

        it('should return UNKNOWN for other objects', () => {
            expect(getItemType({})).toBe('UNKNOWN');
        });

    });

    describe('buildLink', () => {
        it('should build a link object', () => {
            const result = buildLink({
                label: 'Link Label',
                href: 'https://example.com',
                title: 'Link Title',
            });
            expect(result).toEqual({
                type: 'link',
                label: 'Link Label',
                href: 'https://example.com',
                title: 'Link Title',
            });
        });
    });

    describe('buildCategory', () => {

        it('should build a category object', () => {
            const result = buildCategory({
                label: 'Category Label',
                items: [
                    { label: 'Item 1', href: '/item1' },
                    { label: 'Item 2', href: '/item2' },
                ],
            }, {});
            expect(result).toEqual({
                type: 'category',
                label: 'Category Label',
                items: [
                    {
                        type: 'link',
                        label: 'Item 1',
                        href: '/item1',
                    },
                    {
                        type: 'link',
                        label: 'Item 2',
                        href: '/item2',
                    },
                ],
            });
        });

        it('should recursively build nested categories and items', () => {
            const options = {};
            const result = buildCategory({
                label: "Main Category",
                items: [
                    {
                        label: "Subcategory",
                        items: [{ label: "Sub-item", href: "sub-item" }],
                    },
                ],
            }, options);

            expect(result).toEqual({
                type: "category",
                label: "Main Category",
                items: [
                    {
                        type: "category",
                        label: "Subcategory",
                        items: [{ type: "link", label: "Sub-item", href: "sub-item" }],
                    },
                ],
            });
        });


        it('should handle topic items within a category', () => {
            const options = { parentPath: 'parent', docs: 'docs' };
            const result = buildCategory({ label: 'Category Label', items: [{ label: 'Topic Item' }] }, options);
            expect(saveTopic).toHaveBeenCalledWith({ label: 'Topic Item' }, 'parent/topic-item', options);
        });


        it('should build a link object if `href` exists', () => {
            const options = {};
            const item = { label: 'Link Item', href: '/link' };
            const result = buildCategory(item, options);
            expect(result).toEqual({ type: 'link', label: 'Link Item', href: '/link' });
        });


    });

    describe('buildSidebarItems', () => {
        it('should build an array of sidebar items', () => {
            const items = [
                { label: 'Category 1', items: [{ label: 'Item 1' }] },
                { label: 'Link 1', href: '/link1' },
                { label: 'Category 2', items: [{ label: 'Item 2' }] },
            ];
            const options = { parentPath: "test" };
            buildSidebarItems(items, options);

            expect(buildCategory).toHaveBeenCalledWith(items[0], options);
            expect(buildCategory).toHaveBeenCalledWith(items[2], options);
        });


        it('should filter out invalid items', () => {
            const items = [
                { label: 'Category 1', items: [{ label: 'Item 1' }] },
                null, // Invalid item
                { label: 'Category 2', items: [{ label: 'Item 2' }] },
            ];
            const options = {};

            const builtItems = buildSidebarItems(items, options);
            expect(builtItems.length).toBe(2);
        });

    });




    describe('buildTopic', () => {
        it('should build a topic correctly and save it', () => {

            getParentPath.mockReturnValue('parent/path/to/topic');
            slugify.mockReturnValue('topic-item');

            const options = { parentPath: 'parent', docs: 'docs' };
            const item = {
                label: 'Topic Item',
                path: 'path/to/topic',
            };

            buildTopic(item, options);


            expect(getParentPath).toHaveBeenCalledWith(options.parentPath, item.path);
            expect(saveTopic).toHaveBeenCalledWith(item, 'parent/path/to/topic/topic-item', options);
        });

        it('should use item.id or slug if present', () => {

            getParentPath.mockReturnValue('parent/path');
            const options = { parentPath: 'parent', docs: 'docs' };
            const itemWithId = { label: 'Topic Item', path: 'path', id: 'topic-id' };
            const itemWithSlug = { label: 'Topic Item', path: 'path', slug: 'topic-slug' };


            buildTopic(itemWithId, options);
            buildTopic(itemWithSlug, options);

            expect(saveTopic).toHaveBeenCalledWith(itemWithId, 'parent/path/topic-id', options);
            expect(saveTopic).toHaveBeenCalledWith(itemWithSlug, 'parent/path/topic-slug', options);

        });
    });
});
