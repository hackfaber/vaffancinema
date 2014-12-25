Gulp Angular Skeleton &#9760;
=====================

A basic Angular app structure, with Gulp, Bower, and Express.

Dependencies
----
Node (which includes npm), Bower, and SASS.

Setup/Use
-------
1. Run `npm install`
2. Run `bower install`
3. Run the webserver in one terminal tab `nodemon app/server.js` and open up `localhost:3000`.
4. Run `gulp watch` in another terminal tab to run JS Lint and compile CSS.
5. To create a build of your app for deployment, run `gulp build`. This will create a /dist folder containing your app.
6. You can then test the build using `nodemon dist/server.js`.

File Structure
-------
The entire app is in `app/`, which includes a `server.js` file for the webserver and a `public/` folder with the entire front end. Inside of `public` there's `index.html`, the root page for a single page app. There's `scss/` for the SCSS, which gets compiled into `css/main.min.css`. `bower_components/` also lives here, and houses bower dependencies. `js/` houses `main.js`, the main JavaScript file for the app, and then you can include subfolders for various Angular pieces; included is `/controllers`. Finally, there's `partials` for Angular html views.

The Server
-----
This is a very basic Express server. I like to separate front end watchers from the server side, so I chose to have you run the server from outside of the Gulpfile.

The Gulpfile
---------
If you are interested in looking through an annotated version of this gulpfile, check out [my gist](https://gist.github.com/hannaliebl/0a4fa4ff39445649452e)

In the Future...
--------
Tests, image minification