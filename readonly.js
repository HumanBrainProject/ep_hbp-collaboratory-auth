var async = require('async');
var ERR = require('async-stacktrace');
var exporthtml = require('ep_etherpad-lite/node/utils/ExportHtml');

exports.expressCreateServer = function (hook_name, args) {
  console.log('Add /r/:id handler', args);
  //serve read only pad
  args.app.get('/r/:id', function(req, res)
  {
    console.log('ep_hbp_collaboratory_auth /r/' + req.params.id);
    var html;

    async.series([
      //render the html document
      function(callback)
      {
        //render the html document
        exporthtml.getPadHTMLDocument(req.params.id, null, false, function(err, _html)
        {
          if(ERR(err, callback)) return;
          html = _html;
          callback();
        });
      }
    ], function(err)
    {
      //throw any unexpected error
      if(err && err != "notfound")
        ERR(err);

      if(err == "notfound")
        res.status(404).send('404 - Not Found');
      else
        res.send(html);
    });
  });

}
