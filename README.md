# Pipe Extract File

## Description

Extracts a single file from a compressed file, supporting tar/unzip/gzip file formats

## Sample

```javascript
const { createWriteStream, createReadStream } = require('fs'),
      extract                                 = require('pipe-extract-file')

  ;

createReadStream( <source> )
  .pipe( extract( <file-format>, <file-to-extract> ) )
  .pipe( createWriteStream( <destination> ) )
```
