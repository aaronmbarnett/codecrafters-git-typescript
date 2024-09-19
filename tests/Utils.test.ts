import {
    splitInput,
    pipe,
    getRelativeBlobFilePath,
    splitDecompressedBlobFile,
    getBlobFilePath,
    getCompleteBlobFilePath,
    parseTreeContentLines,
    getNames,
    getNameFromTreeHeader,
} from '../app/Utils';

const GIT_OBJECT_ROOT = '.git/objects/';

describe('utils', () => {
    test('splits input', () => {
        expect(splitInput('abcdef')).toEqual(['ab', 'cdef']);
    });

    test('splits input <= 2', () => {
        expect(splitInput('ab')).toEqual(['ab', '']);
        expect(splitInput('a')).toEqual(['a', '']);
    });
    test('gets correct blob filepath from expected array', () => {
        expect(getRelativeBlobFilePath(['ab', 'cdef'])).toBe('ab/cdef');
    });

    test('gets correct blob filepath from input <= 2 chars', () => {
        expect(getRelativeBlobFilePath(['ab', ''])).toBe('ab');
        expect(getRelativeBlobFilePath(['a', ''])).toBe('a');
    });

    test('gets exact blob filepath', () => {
        expect(getBlobFilePath('ab/abc')).toBe('.git/objects/ab/abc');
    });

    test('gets content and header from git blob', () => {
        const buffer = Buffer.from('blob 11\0hello world');
        expect(splitDecompressedBlobFile(buffer)).toEqual([Buffer.from('blob 11'), Buffer.from('hello world')]);
    });

    test('gets the complete blob file path', () => {
        expect(getCompleteBlobFilePath('abcdef')).toBe(`${GIT_OBJECT_ROOT}ab/cdef`);
    });

    test('should parse git tree contents', () => {
        const contents = Buffer.from('100644 hello\0filefilefilefilefile040000 tree\0treetreetreetreetree');
        expect(parseTreeContentLines(contents)).toEqual([
            {
                mode: Buffer.from('100644'),
                name: Buffer.from('hello'),
                hash: Buffer.from('filefilefilefilefile'),
            },
            {
                mode: Buffer.from('040000'),
                name: Buffer.from('tree'),
                hash: Buffer.from('treetreetreetreetree'),
            },
        ]);
    });

    test('should get filename from git tree entry header', () => {
        expect(getNameFromTreeHeader('100644 test-name')).toBe('test-name');
    });
});
