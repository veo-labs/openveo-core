OpenVeo requires and is tested on :

- [Node.js](https://nodejs.org/en/) (**&gt;7.4.0**) - The server side of OpenVeo is written in Node.js
- [Npm](https://www.npmjs.com/) (**&gt;=4.0.5**) - Npm will help you install all OpenVeo server dependencies
- [MongoDB](https://www.mongodb.org/) (**&gt;=3.0.0**) - OpenVeo stores all its datas inside a MongoDB database (users, roles, taxonomies etc.)
- [Bower](http://bower.io/) (**&gt;=1.5.2**) - Bower will help you install all OpenVeo client dependencies, such as AngularJS and Bootstrap massively used in client side.
- [ImageMagick](http://www.imagemagick.org/script/index.php) - Image Magick is used to dynamically generate derivated images (e.g. thumbs)
- [FFMPEG](https://ffmpeg.org/) - FFMPEG is used to extract information from incoming videos

**NB :** Moreover, for a Windows installation, Visual Studio Express is required as some OpenVeo dependencies are written in C and need to be compiled. For Linux you may have to install the package libkrb5-dev.