/*!
 * Mustache plugin for nBuild
 * Copyright(c) 2011-2012 vol4ok <admin@vol4ok.net>
 * MIT Licensed
*/
/** Module dependencies
*/
var Filter, MustachePlugin, basename, dirname, existsSync, extname, fs, hogan, join, makeDir, normalize, relative, setExt, walkSync, _, _ref, _ref2,
  __slice = Array.prototype.slice;

require("colors");

fs = require('fs');

_ = require('underscore');

hogan = require('hogan.js');

walkSync = require('fs.walker').walkSync;

Filter = require('path.filter');

_ref = require('fs.utils'), makeDir = _ref.makeDir, setExt = _ref.setExt;

_ref2 = require('path'), join = _ref2.join, dirname = _ref2.dirname, basename = _ref2.basename, extname = _ref2.extname, normalize = _ref2.normalize, relative = _ref2.relative, existsSync = _ref2.existsSync;

exports.initialize = function(builder) {
  return new MustachePlugin(builder);
};

MustachePlugin = (function() {

  MustachePlugin.prototype.defaults = {
    src: [],
    dst: null,
    params: null,
    fileExts: ['mu', 'mustache']
  };

  /**
  * @public
  * @constructor
  * @param {Array}  src
  */

  function MustachePlugin(builder) {
    this.builder = builder;
    this.builder.registerType('mustache', this.mustache, this);
  }

  MustachePlugin.prototype.mustache = function(name, options) {
    var outExt, target, _i, _len, _ref3, _ref4,
      _this = this;
    this.opt = _.defaults(options, this.defaults);
    if (!_.isArray(this.opt.src)) this.opt.src = [this.opt.src];
    this.filter = (_ref3 = new Filter()).allow.apply(_ref3, ['ext'].concat(__slice.call(this.opt.fileExts)));
    if (this.opt.filter != null) {
      if (_.isArray(this.opt.filter.allow)) {
        this.filter.allowList(this.opt.filter.allow);
      }
      if (_.isArray(this.opt.filter.deby)) {
        this.filter.denyList(this.opt.filter.deny);
      }
    }
    this.count = 0;
    outExt = this.opt.params ? '.html' : '.js';
    _ref4 = this.opt.src;
    for (_i = 0, _len = _ref4.length; _i < _len; _i++) {
      target = _ref4[_i];
      walkSync().on('file', function(file, dir, base) {
        var infile, outdir, outfile, _ref5;
        if (!_this.filter.test(file)) return;
        infile = join(base, dir, file);
        outdir = join((_ref5 = _this.opt.dst) != null ? _ref5 : base, dir);
        outfile = join(outdir, setExt(file, outExt));
        makeDir(outdir);
        return _this._compile(infile, outfile);
      }).walk(target);
    }
    return console.log(("compile: " + this.count + " files successfully compiled").green);
  };

  MustachePlugin.prototype._compile = function(infile, outfile) {
    var data, result, template;
    data = fs.readFileSync(infile, 'utf-8');
    result = '';
    if (this.opt.params) {
      template = hogan.compile(data);
      result = template.render(this.opt.params);
    } else {
      result = hogan.compile(data, {
        asString: true
      });
    }
    fs.writeFileSync(outfile, result, 'utf-8');
    this.count++;
    return console.log(("compile " + infile).green);
  };

  return MustachePlugin;

})();
