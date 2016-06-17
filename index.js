exports.authorize = function(hook, context, cb) {
  console.log('ep_hbp-collaboratory-auth.authorize');
  console.log('user', context.req.session.user);
  console.log('URL', context.req.url);
  if (context.req.session.user) {
    return cb[true];
  }
  return cb([false]);
}
