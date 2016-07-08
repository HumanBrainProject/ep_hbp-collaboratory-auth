var request = require('request');
var uuid4 = require('uuid4');

function has_collab_permission(token, ctx, permission, cb) {
  console.log('ep_hbp_collaboratory_auth.is_collab_member request', ctx);
  var url = 'https://services.humanbrainproject.eu/collab/v0/collab/context/' + ctx + /permissions/;
  console.log('request to', url);
  request.get({
    url: url,
    auth: {
      bearer: token
    },
    json: true
  }, function(err, res, data) {
    if (err) {
      console.log(data);
      return cb(err, false);
    }
    console.log('ep_hbp_collaboratory_auth.is_collab_member result', data, typeof(data));
    return cb(null, data[permission]);
  });
}

function authorizePadAccess(url, user, permission, cb) {
  var matches = url.match(/\/(p|r)\/([0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12})/);
  if (!matches) {
    console.log('ep_hbp_collaboratory_auth.authorize -> [false] invalid URL');
  }
  var ctx = matches[2]
  if (!uuid4.valid(ctx)) {
    console.log('ep_hbp_collaboratory_auth.authorize -> [false] invalid ctx', ctx);
    return cb([false]);
  }
  return has_collab_permission(user.token.accessToken, ctx, permission, function(err, isMember) {
    if (err) {
      console.log('ep_hbp_collaboratory_auth.authorize -> [false] request error', err);
      return cb([false]);
    } else {
      console.log('ep_hbp_collaboratory_auth.authorize result ->', isMember);
      return cb([isMember]);
    }
  });
}

exports.authorize = function(hook_name, context, cb) {
  console.log('ep_hbp_collaboratory_auth.authorize', context.req.url);

  // auth is authorized without having a user.
  if (context.req.url.indexOf('/auth/') === 0) {
    return cb([true]);
  }

  var user = context.req.session.user;
  if (!user) {
    console.warn('ep_hbp_collaboratory_auth.authorize -> [false] no user defined')
    return cb([false]);
  }

  if (context.req.url.indexOf('/r/') === 0) {
    return authorizePadAccess(context.req.url, user, 'VIEW', cb);
  }

  if (context.req.url.indexOf('/p/') === 0) {
    return authorizePadAccess(context.req.url, user, 'UPDATE', cb);
  }

  if (context.req.url.indexOf('/admin/') === 0) {
    return cb([false]);
  }

  return cb([true]);
}
