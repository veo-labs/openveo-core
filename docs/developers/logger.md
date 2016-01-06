# Introduction

All server logs are performed by module [Winston](https://github.com/winstonjs/winston).

# Use OpenVeo logger

By default OpenVeo core creates one logger named **openveo**. You can get this logger using the following code :

```javascript
process.logger.silly('Silly log');
process.logger.debug('Debug log');
process.logger.verbose('Verbose log');
process.logger.info('Info log');
process.logger.warn('Warn log');
process.logger.error('Error log');
```