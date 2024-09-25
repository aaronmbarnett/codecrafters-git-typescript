import * as fs from 'fs';
import * as zlib from 'zlib';
import {
    getBlobFilePath,
    getCompleteBlobFilePath,
    getBlobObjectHash,
    getNames,
    getRelativeBlobFilePath,
    getUncompressedBlobObject,
    parseTreeContentLines,
    pipe,
    splitDecompressedBlobFile,
    splitInput,
    writeTree,
    getSha1Hash,
} from './Utils';
import path from 'path';

const args = process.argv.slice(2);
const command = args[0];

enum Commands {
    Init = 'init',
    CatFile = 'cat-file',
    HashObject = 'hash-object',
    ListTree = 'ls-tree',
    WriteTree = 'write-tree',
    CommitTree = 'commit-tree',
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
            const [_header, content] = splitDecompressedBlobFile(decompressedBlob);
            process.stdout.write(content.toString());
        } catch (error) {
            console.error(error);
        }
        break;
    case Commands.HashObject:
        const hoFlag = args[1];
        const filepathArg = args[2];
        const sha1Hash = getBlobObjectHash(filepathArg);
        const uncompressedGitObject = getUncompressedBlobObject(filepathArg);
        const destinationFilePath = getCompleteBlobFilePath(sha1Hash);

        process.stdout.write(sha1Hash);
        if (hoFlag === '-w') {
            fs.mkdirSync(getBlobFilePath(splitInput(sha1Hash)[0]), { recursive: true });
            fs.writeFileSync(destinationFilePath, zlib.deflateSync(uncompressedGitObject));
        }
        break;
    case Commands.ListTree:
        const [_command, lsTreeFlag, treeSha1Hash] = args;
        const [header, content] = pipe(
            getCompleteBlobFilePath(treeSha1Hash),
            fs.readFileSync,
            zlib.inflateSync,
            splitDecompressedBlobFile
        );
        if (!header.toString().includes('tree')) throw new Error('Not a tree.');
        const treeContents = parseTreeContentLines(content);
        if (lsTreeFlag === '--name-only') {
            for (const entry of treeContents) {
                process.stdout.write(entry.name + '\n');
            }
        }
        break;
    case Commands.WriteTree:
        const treeHash = writeTree(process.cwd());
        process.stdout.write(treeHash);
        break;
    case Commands.CommitTree:
        const [_a, treeSha1, parentCommitFlag, parentCommitSha1, messageFlag, commitMessage] = args;
        let commitContent = `tree ${treeSha1}\n`;
        commitContent += 'parent ' + parentCommitSha1 + '\n';
        commitContent += `author Bob <bob@example.com> ${Date.now() / 1000} +0000\n`;
        commitContent += `committer Ross <ross@example.com> ${Date.now() / 1000} +0000\n\n`;
        commitContent += commitMessage + '\n';
        const commit = `commit ${commitContent.length}\0${commitContent}`;
        const commitHash = getSha1Hash(commit);
        const compressedCommit = zlib.deflateSync(commit);

        const commitPath = path.join('.git', 'objects', commitHash.substring(0, 2));
        if (!fs.existsSync(commitPath)) {
            fs.mkdirSync(commitPath, { recursive: true });
        }
        fs.writeFileSync(path.join(commitPath, commitHash.substring(2)), compressedCommit);
        process.stdout.write(commitHash);
        break;
    default:
        throw new Error(`Unknown command ${command}`);
}
