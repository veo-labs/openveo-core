# Introduction

OpenVeo back end is written using AngularJS and SASS / Compass. SASS files need to be compiled to generate the CSS and JavaScript files can be minified and aggregated for better performance.

# Compiling SASS files

You can compile the back end SASS files using the following command :

    grunt compass:dist

Or you can watch SASS files changes using the following command :

    grunt

You'll find compiled CSS files in **assets/be/css**.

# Compiling JavaScript files

You'll probably want to compile AngularJS files, in production, for better performance. You can do it using :

    grunt prod

You'll find compiled JavaScript files in **assets/be/js**.
