# wigitor

## Description
A demo builder for 'widgets' - a specific UI module setup

### options.json
There's also a "options.json" file in each widget, which contains options for the widget :


1. `configName` {string}: This is the name of the config object used when populating the template. It must be unique and should roughly folow the name of the widget with the suffix "Cnf". You can abbreviate if your have a long widget name.

2. `templateType` {string}: Either "ejs" or "hbs", depending which template you're using.

3. `wigitor` {false || true/object}: Most of the time this will be a boolean, but instead of true, you can pass an object with the following optional properties:

i) `deps` {array}: An array of widget names that it depends on. `deps` should be defined for any widget that uses a json file from the 'properties' directory of another widget.

ii) `multi-props` {boolean}: Should be `true` if you want the properties of more than one `properties/*.json` file to be available in the widget template during render. 

iii) `container-classes` {string}: Classes for the containing element. Useful for setting light background `wgtvwr-lightbg` or Bootstrap grid styles.