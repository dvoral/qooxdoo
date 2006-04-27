/**
 * The default filter. Has a minimum level and can be enabled or disabled.
 */
qx.OO.defineClass("qx.dev.log.DefaultFilter", qx.dev.log.Filter,
function() {
  qx.dev.log.Filter.call(this);
});


/**
 * Whether the filter should be enabled. If set to false all log events
 * will be denied.
 */
qx.OO.addProperty({ name:"enabled", type:qx.Const.TYPEOF_BOOLEAN, defaultValue:true, allowNull:false, getAlias:"isEnabled" });

/**
 * The minimum log level. If set only log messages with a level greater or equal
 * to the set level will be accepted.
 */
qx.OO.addProperty({ name:"minLevel", type:qx.Const.TYPEOF_NUMBER, defaultValue:null });


// overridden
qx.Proto.decide = function(evt) {
  var Filter = qx.dev.log.Filter;
  if (! this.isEnabled()) {
    return Filter.DENY;
  } else if (this.getMinLevel() == null) {
    return Filter.NEUTRAL;
  } else {
    return (evt.level >= this.getMinLevel()) ? Filter.ACCEPT : Filter.DENY;
  }
};
