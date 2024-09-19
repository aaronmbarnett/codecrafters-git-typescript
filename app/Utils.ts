import { createHash } from 'crypto';
import { promises, createReadStream } from 'fs';

// Type helper to infer the return type of a chain of functions
type PipeFunctions<T, R> = R extends [(arg: T) => infer U]
    ? U
    : R extends [(arg: T) => infer U, ...infer Rest]
      ? PipeFunctions<U, Rest>
      : T;

type Mode = '100644' | '100755' | '120000' | '040000';
type TreeEntryHeader = `${Mode} ${string}`;

export function pipe<T, Fns extends Array<(arg: any) => any>>(value: T, ...fns: Fns): PipeFunctions<T, Fns> {
    return fns.reduce((prev, fn) => fn(prev), value) as PipeFunctions<T, Fns>;
}

export function tap<T>(fn: (value: T) => void): (value: T) => T {
    return (value: T): T => {
        fn(value);
        return value;
    };
}
export function splitInput(input: string): [string, string] {
    if (input.length <= 2) {
        return [input, '']; // If the string has 2 or fewer characters, return the whole string and an empty string
    }
    return [input.slice(0, 2), input.slice(2)];
}

export function getRelativeBlobFilePath([prefix, rest]: [string, string]): string {
    if (rest === '') {
        return prefix;
    } else {
        return `${prefix}/${rest}`;
    }
}

export function getBlobFilePath(input: string): string {
    return `.git/objects/${input}`;
}

export function getCompleteBlobFilePath(input: string): string {
    return pipe(input, splitInput, getRelativeBlobFilePath, getBlobFilePath);
}

export function splitDecompressedBlobFile(decompressedBlob: Buffer): [Buffer, Buffer] {
    const headerEndIndex = decompressedBlob.indexOf(0);
    const header = decompressedBlob.subarray(0, headerEndIndex);
    const content = decompressedBlob.subarray(headerEndIndex + 1);
    return [header, content];
}
export async function getUncompressedGitObject(filePath: string): Promise<Buffer> {
    const fileBuffer = await promises.readFile(filePath);
    const header = `blob ${fileBuffer.length}\0`;
    return Buffer.concat([Buffer.from(header), Buffer.from(fileBuffer)]);
}

export async function getGitObjectHash(filePath: string): Promise<string> {
    const contentBuffer = await getUncompressedGitObject(filePath);
    const hash = createHash('sha1');
    hash.update(contentBuffer);
    return hash.digest('hex');
}
export function parseTreeContentLines(content: Buffer): { mode: Buffer; name: Buffer; hash: Buffer }[] {
    let offset = 0;
    const entries: ReturnType<typeof parseTreeContentLines> = [];
    while (offset < content.length) {
        let modeEnd = offset;
        while (content[modeEnd] !== 0x20) {
            modeEnd++;
        }
        const mode = content.subarray(offset, modeEnd);
        offset = modeEnd + 1;

        let nameEnd = offset;
        while (content[nameEnd] !== 0x00) {
            nameEnd++;
        }
        const name = content.subarray(offset, nameEnd);
        offset = nameEnd + 1;

        const hash = content.subarray(offset, offset + 20);
        offset += 20;

        entries.push({ mode, name, hash });
    }
    return entries;
}
export function getNameFromTreeHeader(treeHeader: TreeEntryHeader) {
    return treeHeader.split(' ')[1];
}
export function getNames(contents: string[]): string[] {
    const result = [];
    for (let index = 0; index < contents.length; index++) {
        if (index % 2 === 0) {
            result.push(contents[index].split(' ')[0]);
        }
    }

    return result;
}
