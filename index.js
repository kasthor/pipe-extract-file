const
      unzipper                          = require( 'unzipper' ),
      tar                               = require( 'tar-stream' ),
      { createGunzip }                  = require( 'zlib' ),
      { Duplex,Transform,PassThrough }  = require( 'stream' ),

      ;

function extract( type, filename ){
  return( extractFn( type )( filename ) );
}
function extractFn( type ) {
  switch( type ){
    case 'zip':
      return unzip;
    case 'tar':
      return untar;
    case 'tgz':
    case 'tar.gz':
      return untargz;
    case 'gz':
    case 'gzip':
      return gunzip;
  }
}

function untargz( filename ){
  let stream = new PassThrough();

  stream.on('pipe', function(src){
    src.unpipe( this )
    this.transformStream = src.pipe( gunzip() ).pipe( untar( filename ) )
  })
  stream.pipe = function( dst, opts ){
    return this.transformStream.pipe( dst, opts );
  }

  return stream;
}

function unzip( filename ){
  let stream = new Transform();

  stream.on('pipe', function(src){
    src.unpipe( this )
    this.transformStream = src.pipe( unzipper.Parse() ).pipe( Transform({
      writableObjectMode: true,
      transform: ( obj, enc, cb ) => {
        if( filename == obj.path ){
          obj
            .on( 'data', this.push.bind( this ) )
            .on( 'end', cb )
        } else {
          obj.autodrain();
          cb()
        }
      }
    })
    )
  })

  return stream
}

function untar( filename ){
  let stream = Transform()

  stream.on('pipe', function(source){
    source.unpipe(this)
    this.transformStream = source.pipe( tar.extract() )
      .on( 'entry', ( header, stream, next ) => {
        stream.on( 'end', next )
        if( header.name == filename ) {
          stream.on( 'data', this.push.bind( this ) )
        } else {
          stream.resume()
        }
      })
  })

  return stream;
}

function gunzip( file_name ){
  return createGunzip();
}

module.exports = extract;
