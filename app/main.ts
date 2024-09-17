import * as fs from 'fs';
import * as zlib from 'zlib';
import {
    getBlobFilePath,
    getCompleteBlobFilePath,
    getGitObjectHash,
    getRelativeBlobFilePath,
    getUncompressedGitObject,
    pipe,
    splitDecompressedBlobFile,
    splitInput,
} from './Utils';

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = 'init',
    CatFile = 'cat-file',
    HashObject = 'hash-object',
}

switch (command) {
    case Commands.Init:
        // You can use print statements as follows for debugging, they'll be visible when running tests.
        console.log('Logs from your program will appear here!');

        // Uncomment this block to pass the first stage
        fs.mkdirSync('.git', { recursive: true });
        fs.mkdirSync('.git/objects', { recursive: true });
        fs.mkdirSync('.git/refs', { recursive: true });
        fs.writeFileSync('.git/HEAD', 'ref: refs/heads/main\n');
        console.log('Initialized git directory');
        break;
    case Commands.CatFile:
        const blobString: string = args[2];
        try {
            const blob = fs.readFileSync(pipe(blobString, splitInput, getRelativeBlobFilePath, getBlobFilePath));
            const decompressedBlob = zlib.inflateSync(blob);
            const [header, content] = splitDecompressedBlobFile(decompressedBlob);
            process.stdout.write(content.toString());
        } catch (error) {
            console.error(error);
        }
        break;
    case Commands.HashObject:
        const flag: string = args[1];
        const filepath = args[2];
        getGitObjectHash(filepath).then(async (result) => {
            const uncompressedGitObject = await getUncompressedGitObject(filepath);
            const destinationFilePath = getCompleteBlobFilePath(result);

            process.stdout.write(result);
            if (flag === '-w') {
                fs.mkdirSync(getBlobFilePath(splitInput(result)[0]), { recursive: true });
                fs.writeFileSync(destinationFilePath, zlib.deflateSync(uncompressedGitObject));
            }
        });
        break;
    default:
        throw new Error(`Unknown command ${command}`);
}
