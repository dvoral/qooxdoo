/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/* ************************************************************************

#asset(qx/test/*)

************************************************************************ */

qx.Class.define("qx.test.bom.request.XhrWithBackend",
{
  extend : qx.dev.unit.TestCase,

  include : [qx.test.io.MRemoteTest,
             qx.dev.unit.MMock],

  construct : function()
  {
    this.base(arguments);
  },

  members :
  {

    req : null,

    setUp: function() {
      // All tests in this case require PHP
      this.needsPHPWarning();

      this.req = new qx.bom.request.Xhr();
    },

    //
    // Basic
    //

    "test: should GET": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      url = url + "?affe=true";
      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertEquals('{"affe":"true"}', req.responseText);
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should GET XML": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/sample.xml");

      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            var document = req.responseXML;
            var monkeys = document.getElementsByTagName("monkey");
            that.assertEquals(1, monkeys.length, "Must find one monkey");
          });
        }
      }
      req.send();

      this.wait();
    },

    "test: should POST": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("POST", url);
      req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            that.assertEquals('{"affe":"true"}', req.responseText);
          });
        }
      }
      req.send("affe=true");

      this.wait();
    },

    "test: should have readyState UNSENT": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      this.assertIdentical(0, req.readyState);
    },

    "test: should have readyState OPENED": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("GET", url);

      this.assertIdentical(1, req.readyState);
    },

    // BUGFIX
    // This is a mess, see
    // http://www.quirksmode.org/blog/archives/2005/09/xmlhttp_notes_r_2.html.
    "test: should progress to readyState DONE": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req,
          states = [],
          that = this;

      req.onreadystatechange = function() {
        states.push(req.readyState);
        that.resume(function() {
          if (req.readyState < 4) {
            that.wait();
          } else {
            that.assertArrayEquals([1, 2, 3, 4], states);
          }
        })
      }

      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("GET", url);
      req.send();

      this.wait();
    },

    "test: should progress to readyState DONE synchronously": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req,
          states = [];

      req.onreadystatechange = function() {
        states.push(req.readyState);
      }

      var url = this.getUrl("qx/test/xmlhttp/echo_post_request.php");
      req.open("GET", url, false);
      req.send();
      this.assertArrayEquals([1, 2, 3, 4], states);
    },

    "test: should allow many requests with same object": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      var count = 0;

      function request() {
        req.open("GET", url + "?1");
        req.send();
      }

      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          count++;
          if (count < 3) {
            request();
          }
        }
      };
      request();

      var that = this;
      this.wait(500, function() {
        that.assertEquals(3, count);
      });
    },

    "test: should abort pending request": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");

      req.open("GET", url + "?sleep=1");
      req.send();
      req.abort();

      var that = this;
      this.wait(function() {
        that.assertNotEquals(4, req.readyState, "Request must not complete");
      }, 1500);
    },

    //
    // onreadystatechange()
    //

    "test: should call onreadystatechange once for OPEN": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");

      var that = this;
      var count = 0;
      req.onreadystatechange = function() {
        // Count call for state OPENED
        if (req.readyState == 1) {
          count = count + 1;
        }

        // Assert when DONE
        if (req.readyState == 4) {
          that.resume(function() {
            // onreadystatechange should have only be called
            // once for state OPENED
            that.assertEquals(1, count);
          });
        }
      };

      req.open("GET", url);
      req.send();

      this.wait();
    },

    "test: should not call onreadystatechange when aborting OPENED": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;

      // OPENED, without send flag
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", url);

      this.spy(req, "onreadystatechange");
      req.abort();

      this.wait(500, function() {
        this.assertNotCalled(req.onreadystatechange);
      }, this);
    },

    "test: should call onreadystatechange when aborting OPENED with send flag": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume();
        }
      }

      // Will "never" complete
      // OPENED, with send flag
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", url + "?duration=100");
      req.send();

      window.setTimeout(function() {
        req.abort();
      }, 500);

      this.wait();
    },

    "test: should call onreadystatechange when aborting LOADING": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var that = this;

      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume();
        }
      }

      // Will "never" complete
      // OPENED, finally LOADING
      var url = this.getUrl("qx/test/xmlhttp/loading.php");
      req.open("GET", url + "?duration=100");
      req.send();

      window.setTimeout(function() {
        req.abort();
      }, 500);

      this.wait();
    },

    //
    // Disposing
    //

    // BUGFIX
    "test: should dispose hard-working": function() {
      if (this.isLocal()) {
        return;
      }

      var req = this.req;
      var url = this.getUrl("qx/test/xmlhttp/echo_get_request.php");
      req.open("GET", url);

      var that = this;
      req.onreadystatechange = function() {
        if (req.readyState == 4) {
          that.resume(function() {
            // Must not throw error
            req.dispose();
          });
        }
      }
      req.send();

      this.wait();
    }

  }
});
