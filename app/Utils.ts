// Type helper to infer the return type of a chain of functions
type PipeFunctions<T, R> = R extends [(arg: T) => infer U]
    ? U
    : R extends [(arg: T) => infer U, ...infer Rest]
      ? PipeFunctions<U, Rest>
      : T;

// The pipe function
export function pipe<T, Fns extends Array<(arg: any) => any>>(value: T, ...fns: Fns): PipeFunctions<T, Fns> {
    return fns.reduce((prev, fn) => fn(prev), value) as PipeFunctions<T, Fns>;
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

export function splitDecompressedBlobFile(decompressedBlob: Buffer): [Buffer, Buffer] {
    const headerEndIndex = decompressedBlob.indexOf(0);
    const header = decompressedBlob.subarray(0, headerEndIndex);
    const content = decompressedBlob.subarray(headerEndIndex + 1);
    return [header, content];
}
