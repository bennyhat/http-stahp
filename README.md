# http-stahp #

This is a very simple http module wrapper that adds in a following nice extras (believe it or not, there is nothing on NPM that meets meets this criteria):
* Ability to choose host, port and folder to serve static content out of.
* Basic socket tracking.
* The ability to shut down the server, even in cases where the http.close() method doesn't work (and in some cases, it simply doesn't).

## Example Setup ##
Pretty straightforward. The main additional function is the stop method.

``` javascript
var httpStahp = require('http-stahp');
httpStahp.start({host:'localhost',port:'8080',root:'/tmp'}, function (eError) { 
    if (eError) throw eError;
    ...
});
...
httpStahp.stop(function (eError) { 
    if (eError) throw eError;
});
```