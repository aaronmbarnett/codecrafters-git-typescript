import {
    splitInput,
    pipe,
    getRelativeBlobFilePath,
    splitDecompressedBlobFile,
    getBlobFilePath,
    getCompleteBlobFilePath,
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
});
