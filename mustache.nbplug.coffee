###!
 * Mustache plugin for nBuild
 * Copyright(c) 2011-2012 vol4ok <admin@vol4ok.net>
 * MIT Licensed
###


###* Module dependencies ###

require "colors"
fs     = require 'fs'
_      = require 'underscore'
hogan  = require 'hogan.js'

{walkSync} = require 'fs.walker'
Filter = require 'path.filter'
{makeDir, setExt} = require 'fs.utils'

{join, dirname, basename, extname, normalize, relative, existsSync} = require 'path'


exports.initialize = (builder) -> new MustachePlugin(builder)

class MustachePlugin
  defaults:
    src: []
    dst: null
    params: null
    fileExts: [ 'mu', 'mustache' ]
      
  ###*
  * @public
  * @constructor
  * @param {Array}  src
  ###
  constructor: (@builder) ->
    @builder.registerType('mustache', @mustache, this)
    
  mustache: (name, options) ->
    @opt = _.defaults(options, @defaults)
    @opt.src = [ @opt.src ] unless _.isArray(@opt.src)
    
    
    @filter = new Filter().allow('ext', @opt.fileExts...)
    if @opt.filter?
      @filter.allowList(@opt.filter.allow) if _.isArray(@opt.filter.allow)
      @filter.denyList(@opt.filter.deny)   if _.isArray(@opt.filter.deby)
    @count = 0
    
    outExt = if @opt.params then '.html' else '.js'
    for target in @opt.src
      walkSync()
        .on 'file', (file, dir, base) => 
          return unless @filter.test(file)
          infile = join(base, dir, file)
          outdir = join(@opt.dst ? base, dir)
          outfile = join(outdir, setExt(file, outExt))
          makeDir(outdir)
          @_compile(infile, outfile)
        .walk(target)
    console.log "compile: #{@count} files successfully compiled".green
    
  _compile: (infile, outfile) ->
    data = fs.readFileSync(infile, 'utf-8')
    result = ''
    if @opt.params
      template = hogan.compile(data)
      result = template.render(@opt.params)
    else
      result = hogan.compile(data, asString: yes)
    fs.writeFileSync(outfile, result, 'utf-8')
    @count++
    console.log "compile #{infile}".green