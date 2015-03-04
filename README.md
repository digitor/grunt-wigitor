# Grunt Wigitor

## Description
A demo builder for 'widgets' - a specific UI module setup

## Widget stucture
The folder structure of a Wigitor 'widget' should be:
- parent folder must be `widgets`
- widget folder must follow this naming convention: 
  - alphanumeric 
  - no uppercase characters
  - no special characters
  - no underscores or hyphens
  - must end in `wgt`
  - eg - `samplewgt`
- `js` folder should contain a 'main.js'
- `scss` folder should contain a `_module.scss` and follow SMACSS guidelines for `_state.scss` and `_layout.scss`. `_vars.scss` can also be used.
- `options.json` (see explanation below)
- `README.md` (see explanation below)
- `markup.hbs` or `markup.ejs`, depending on which template you're using. This is the default template for the widget.
- `another-template.hbs`. You may add more partials/includes as well, but they will be secondary to `markup.hbs`. (`.ejs` can also be used)
- `properties/example1.json`, which should contain a config object for your widget. Multiple json files allowed and doesn't have to be `example1.json`.

### options.json
There's also an `options.json` file in each widget, which contains options for the widget:

1. `configName` {string}: This is the name of the config object used when populating the template. It must be unique and should roughly folow the name of the widget with the suffix "Cnf". You can abbreviate if your have a long widget name.

2. `templateType` {string}: Either "ejs" or "hbs", depending which template you're using.


### README.md
Use these custom tags to determine where properties button and Github info goes.
```
<!--START_WIGITOR_ADDITIONS-->
<!--END_WIGITOR_ADDITIONS-->
```
This only applies if `options.json -> modifyReadMes` is set to `true`


## Grunt
### src
This should be the folder of the widget you're rendering.

### dest
This should be the output folder.

### options
- pluginDir {string}: path to the `grunt-wigitor` plugin directory. Defaults to `node_modules/wigitor`.
- host: {string}: If running on a server, put the url here. Defaults to an empty string.
- pathToRoot {string}: path to the project root. Defaults to an empty string. Used to normalise EJS includes. Defaults to an empty string.
- pathToWidgets {string}: path to the folder where you keep your widgets. The last folder must be called `widgets`. Defaults to `resources/widgets/`.
- gitHubMsg {string}: Github details to print on your readme. Make null or empty string to omit it. `modifyReadMes:false` will also stop this.
- cleanDest {boolean}: Clean the `dest` folder before running. Defaults to `false`. Careful with this.
- modifyReadMes {boolean}: make `true` to insert a bootstrap popover into your widget's `README.md`. Also inserts Github details if `gitHubMsg` set.
- justContent {boolean}: if `false`, will render with page template, otherwise will render just with the widget markup
- omitScriptTags {boolean}: if `true` will remove any `<script>` tags from the markup when rendering.
- deps {array or strings}: a list of widgets that this widget depends on. Their configs will be added to the global scope when rendering.
- multiProps {boolean}: If `true` will search through the widget's `properties` folder and make available all json files as configs.
- handlebarsPartials {array of objects}: Objects with details of additional handlebars partials needed for this widget. Partials in the widget's root folder will automatically be added, using the naming convention `samplewgt_my-other-file`. Objects must have 2 properties `name` {string} and `path` {string}.
- containerClasses {string}: Classes for the containing element. Useful for setting light background `wgtvwr-lightbg` or Bootstrap grid styles. Should be a single string, separated by spaces.
- pageTemplate {string}: Path to your own ejs template. Handlebars not yet supported.


Releases
- 0.1.2: Bug fixes around containerClasses after tested in the wild. Added options 'containerClasses' & 'pageTemplate'.
- 0.1.1: Minor changes to README.md. Still unstable.
- 0.1.0: Initial release. Not properly tested yet. Will probably break.