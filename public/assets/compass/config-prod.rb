# Configuration production (exemple)

environment = :production

# Root of yout project
http_path = "/"

# Production Assets URL
http_images_path = "http://static.your-site.com/"

# Project Assets Location
css_dir = "/"
sass_dir = "sass"
images_dir = "img"
javascripts_dir = "js"
fonts_path = "fonts"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed
output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
line_comments = false

# sourcemap
sourcemap = true