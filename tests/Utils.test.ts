import { splitInput, pipe, getRelativeBlobFilePath, splitDecompressedBlobFile } from '../app/Utils';

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

    test('gets content and header from git blob', () => {
        const buffer = Buffer.from('blob 11\0hello world');
        expect(splitDecompressedBlobFile(buffer)).toEqual([Buffer.from('blob 11'), Buffer.from('hello world')]);
    });
});
