# snip CLI

Zero-dependency Node.js CLI for the [Snip](https://github.com/your-org/snip) URL shortener.  
Requires **Node ≥ 18** (uses the built-in `fetch` and `child_process` modules).

## Installation

```sh
# from this directory
npm link          # creates a global "snip" symlink via package.json#bin
# or run directly
node cli.js <command>
```

## Usage

```
snip add <url>    Shorten a URL and print the short link
snip ls           List all shortened links (code / hits / url table)
snip open <code>  Open a short link in the default OS browser
snip help         Show usage
```

## Configuration

| Variable   | Default                   | Purpose              |
|------------|---------------------------|----------------------|
| `SNIP_API` | `http://localhost:3000`   | Backend base URL     |

```sh
SNIP_API=https://snip.example.com snip ls
```

## Examples

```sh
$ snip add https://www.example.com/a/very/long/path
http://localhost:3000/aB3xY9

$ snip ls
CODE    HITS  ORIGINAL URL
-----------------------------------------
aB3xY9     2  https://www.example.com/a/very/long/path

$ snip open aB3xY9
Opening: https://www.example.com/a/very/long/path
```

## Wrappers

| File        | Platform        |
|-------------|-----------------|
| `snip`      | Unix / macOS    |
| `snip.cmd`  | Windows CMD     |
| `snip.ps1`  | PowerShell      |

## Errors

Bad input, unknown codes, and unreachable backends are printed to **stderr** with exit code **1**.
