#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require("readline");

const CWD = process.cwd();
const SELF = require.resolve('.');
const PACKAGE = path.resolve(CWD, 'package.json');
const CHANGELOG = path.resolve(CWD, 'CHANGELOG.md');
const CHANGELOG_TEMPLATE = path.resolve(__dirname, 'CHANGELOG.template.md');

function error(msg) {
    console.error(msg);
    process.exit(1);
}

function isLerna() {
    return fs.existsSync(path.resolve(CWD, 'lerna.json'));
}

function execLerna() {
    execSync('npx lerna exec --concurrency 1 -- ' + SELF, {
        stdio: 'inherit'
    });
}

function noEntriesWarning(cb) {
    const msg = 'No changelog entries found in the unreleased section. Continue anyway? [y/N] ';

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(msg, answer => {
        rl.close();

        if (![ 'y', 'yes' ].includes(answer.toLowerCase()))
            error('Aborted due to missing entries in unreleased section.');

        cb();
    });
}

function exec() {
    if (isLerna()) {
        execLerna();
        return;
    }

    if (!fs.existsSync(PACKAGE))
        error('No package.json found to determine current version.');

    const { version } = require(PACKAGE);
    const didExist = fs.existsSync(CHANGELOG);

    if (!version)
        error('package.json did not contain a version field.');

    if (!didExist)
        fs.writeFileSync(CHANGELOG, fs.readFileSync(CHANGELOG_TEMPLATE, 'utf-8'));

    let contents = fs.readFileSync(CHANGELOG, 'utf-8');

    if (contents.indexOf(`## ${version}`) > -1)
        error(`CHANGELOG.md already contains an entry for v${version}`);

    function update() {
        contents = contents.replace('## unreleased', `## unreleased\n\n## ${version}`);
        fs.writeFileSync(CHANGELOG, contents);
        execSync('git add CHANGELOG.md', { stdio: 'inherit' });
        console.log('CHANGELOG.md updated.');
    }

    if (!didExist || /## unreleased\s*($|(##\s))/.test(contents)) {
        noEntriesWarning(update);
    } else {
        update();
    }
}

exec();
