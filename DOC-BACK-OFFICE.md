# OpenVeo back office client API code documentation
This is the API of the OpenVeo back office client which can be used by plugins developers.

# Usage
The API offers directives, services and filters.

## Directives
Directives can be used directly from plugin's template.

```html
 <ov-auto-complete ng-model="model"
                   ov-placeholder="placeholder"
                   ov-get-suggestions="getSuggestions">
 </ov-auto-complete>
```

## Services
Services can be injected.

```javascript
MyAngularObject.$inject = ['alertService'];
```

## Filters
Filters can be instanciated using AngularJS $filter.

```javascript
$filter('translate')('LOGIN.DESCRIPTION', 'login', {name: "John"});
```
