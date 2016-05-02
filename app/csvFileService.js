'use strict';

angular.module('founders')
  .factory('csvFileService', ['$q', function($q) {
    function _firstToUpperCase(str) {
      return str.substr(0, 1).toLowerCase() + str.substr(1);
    }

    function _csvToJSON(content) {
      var lines=content.csv.split('\n');
      var result = [];
      var start = 0;
      var columnCount = lines[0].split(content.separator).length;

      var headers = [];
      if (content.header) {
        headers=lines[0].split(content.separator);
        start = 1;
      }

      for (var i=start; i<lines.length; i++) {
        var obj = {};
        var currentline=lines[i].split(new RegExp(content.separator+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
        if ( currentline.length === columnCount ) {
          if (content.header) {
            for (var j=0; j<headers.length; j++) {
              // To be remove in function
              headers[j] = _firstToUpperCase(headers[j].replace(/^[^0-9a-zA-Z]+|[^0-9a-zA-Z_-]+/g, ''));
              obj[headers[j]] = currentline[j];
            }
          } else {
            for (var k=0; k<currentline.length; k++) {
              obj[k] = currentline[k];
            }
          }
          result.push(obj);
        }
      }
      return result;
    }

    function _readFile(file, separator) {
      var deferred = $q.defer();
      var reader = new FileReader();
      var error = { hasError: false };
      var parsedResult;

      reader.onload = function() {
        try{
           var content = {
            csv: reader.result,
            header: true,
            separator: separator,
            result: null,
            encoding: 'ISO-8859-1'
          };

          parsedResult = _csvToJSON(content);
        }
        catch(e) {
          error.hasErrors = true;
          error.message = e;
        }

        if (error.hasErrors) {
          deferred.reject(error.message);
        } else {
          deferred.resolve(parsedResult);
        }
      };

      reader.readAsText(file);
      return deferred.promise;
    }

    return {
      readFile: _readFile
    };
  }]);