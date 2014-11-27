'use strict';

angular.module('abStorage', ['ngStorage'])

.service('$storage', $storage)

.service('$store', $store);

$storage.$inject = ['$localStorage','$q','$timeout'];
function $storage ($localStorage, $q, $timeout) {
    /**
     * Storage service extends $storage module by divided storage by the storage's name
     * @param name - name of the storage
     * @constructor
     */
    var Storage = function(name) {
        this.name = name;
    };
    /**
     * Data object of the storage
     * @type {Array}
     */
    Storage.prototype.data = null;
    /**
     * Pushing new data to storage
     * @param data - new item to the storage
     */
    Storage.prototype.push = function(data) {
        var arr = this.load(); //Loading data from the storage

        arr.push(data); // Pushing new data to array
        this.saveAs(arr); // Saving data to the storage

        return this.load(); // Return new data of the storage
    };
    Storage.prototype.deleteItem = function(item) {
        var arr = this.load(),
            idx = arr.indexOf(item);
        if (typeof idx === 'undefined' || idx === null || idx < 0) {
            console.log('Template was not found in the storage');
            return arr;
        }
        var newArr = arr.splice(idx, 1);
        console.log('Template',newArr,'was deleted');
        console.log('Result array is',arr);
        this.saveAs(arr);
        return newArr;
    };
    /**
     * Getting the data from the storage by id
     * @param itemId - item id for search in the storage
     * @param itemIdName - name of the field, that contain item id
     * @param multiple - returning array of the items with specified item ID or single object
     * @returns {$q.promise}
     */
    Storage.prototype.getById = function (itemId, itemIdName, multiple, model) {
        var defer = $q.defer(), // Init defer obj
            data = this.load(); //Loading data from the storage

        itemIdName = itemIdName || 'id'; // Default value of the itemName argument
        multiple = multiple || false; //Default value of the multiple argument

        $timeout(function(){
            // Undefined item id verifying
            if (typeof itemId === 'undefined') {
                return defer.reject({
                    errorText: 'Undefined itemID'
                });
            }
            // Empty data array for change verifying
            if (data.length === 0) {
                return defer.reject({
                    errorText: 'Empty data array'
                });
            }
            // Filtering data for items with itemID
            var filtered = data.filter(function (item) {
                return item[itemIdName] === itemId;
            });
            // Item with filter if was not found
            if (filtered.length === 0) {
                return defer.reject({
                    errorText: 'Not found data'
                });
            }
            // Returning multiple or single item based on multiple argument
            var result = (multiple) ? filtered : filtered[0];
            // Transformation into the model object
            if (typeof model !== 'undefined') {

                if (Array.isArray(result)) {
                    var res = [];
                    angular.forEach(result,function(item) {
                        this.push(new model(item));
                    }, res);
                    result = res;
                } else {
                    result = new model(result);
                }
            }

            defer.resolve(result);
        });

        return defer.promise;
    };
    /**
     * Setting item in the storage by itemID. Searching updating object for itemID is making by itemIDName property.
     * @param itemId - identification item value
     * @param item - item object
     * @param itemIdName - name of the item property of the object in the storage
     * @returns {$q.promise}
     */
    Storage.prototype.setById = function (itemId, item, itemIdName) {
        var defer = $q.defer(),
            _this = this;

        itemIdName = itemIdName || 'id'; // Default value of the itemName
        var data = this.load(); // Loading data from storage

        $timeout(function(){
            // Undefined item id verifying
            if (typeof itemId === 'undefined') {
                return defer.reject({
                    errorText: 'Undefined itemID'
                });
            }
            // Empty data array for change verifying
            if (data.length === 0) {
                return defer.reject({
                    errorText: 'Empty data array'
                });
            }
            // Searching in array and change item with itemID
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i][itemIdName] === itemId) {
                    data[i] = item;
                    break;
                }
            }
            _this.saveAs(data); // Saving the data in storage
            defer.resolve(data); // Returning new array on promise
        });
        return defer.promise;
    };
    /**
     * Loading data from the storage
     * @returns {Array}
     */
    Storage.prototype.load = function () {
        var arr = $localStorage[this.name]; //Getting data from the localstorage
        if (arr === null) { // Catch default NULL value
            arr = [];
        }
        if (!Array.isArray(arr)) { // Catch obj value of the storage array
            arr = [arr];
        }

        this.data = arr;
        return this.data;
    };
    /**
     * Saving data to the storage
     * @param data
     */
    Storage.prototype.saveAs = function (data) {
        $localStorage[this.name] = data;
    };
    /**
     * Saving current data of the storage to the localStorage
     */
    Storage.prototype.save = function () {
        $localStorage[this.name] = this.data;
    };
    /**
     * Resetting localStorage
     */
    Storage.prototype.reset = function () {
        $localStorage[this.name] = null;
    };

    return Storage;
}

$store.$inject = [];
function $store () {
    var data;
    return {
        load: function () {
            return data;
        },
        save: function (d) {
            data = d;
        },
        getById: function (itemId, itemIdName, multiple) {
            var data = this.all();

            if (typeof itemId === 'undefined' || data.length === 0) {
                return null;
            }
            itemIdName = itemIdName || 'id';
            multiple = multiple || false;
            var filtered = this.all().filter(function (item) {
                return item[itemIdName] === itemId;
            });
            if (filtered.length === 0) {
                return null;
            }
            return (multiple) ? filtered : filtered[0];
        },
        setById: function (itemId, item, itemIdName) {
            itemIdName = itemIdName || 'id';
            var data = this.all();
            if (typeof itemId === 'undefined' || data.length === 0) {
                return false;
            }
            for (var i = 0, len = data.length; i < len; i++) {
                if (data[i][itemIdName] === itemId) {
                    data[i] = item;
                    break;
                }
            }
            return true;
        }
    };
}