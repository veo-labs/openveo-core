# OpenVeo server API code documentation
This is the API of the OpenVeo server which can be used by plugins developers.

# Usage
```javascript
const coreApi = process.api.getCoreApi();
console.log(coreApi.getDatabase());
console.log(coreApi.getSuperAdminId());
console.log(coreApi.getEntities());
console.log(coreApi.getPermissions());
[...]
```
