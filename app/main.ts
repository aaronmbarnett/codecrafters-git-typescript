import * as fs from 'fs';
import * as zlib from 'zlib';
import { getBlobFilePath, getRelativeBlobFilePath, pipe, splitDecompressedBlobFile, splitInput } from './Utils';

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = 'init',
    CatFile = 'cat-file',
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
    default:
        throw new Error(`Unknown command ${command}`);
}
